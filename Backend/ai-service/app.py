
"""
DocuMind AI - grounded document intelligence service

Drop-in replacement for the original FastAPI AI pipeline.

Main improvements:
- Retrieval-Augmented Generation (RAG) instead of sending arbitrary/full context.
- Page-aware document chunks and citations.
- Session-aware chat history.
- LLM-powered summary, chat, flashcards, quiz, mind map, notes, insights and translation.
- Deterministic fallbacks when OPENAI_API_KEY is missing.
- Better semantic retrieval using OpenAI embeddings when available, with lexical fallback.
- Long-document hierarchical summarization.
- Strict anti-hallucination prompts: answer only from supplied document evidence.

This file keeps the original endpoint names for frontend compatibility.
"""

from __future__ import annotations

import json
import math
import os
import re
import sys
from dataclasses import dataclass, field
from io import BytesIO
from typing import Any, Dict, Iterable, List, Optional, Sequence, Tuple

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

try:
    from pyDocument import DocumentReader
except Exception:  # pragma: no cover - optional until PDF extraction is used
    DocumentReader = None

try:
    from constants import STOP_WORDS, LANGUAGE_MAP
except Exception:
    STOP_WORDS = {
        "about", "after", "again", "against", "also", "because", "before", "being", "between",
        "could", "from", "have", "into", "more", "other", "should", "their", "there", "these",
        "those", "through", "under", "very", "what", "when", "where", "which", "while", "with",
        "would", "your", "this", "that", "they", "them", "then", "than", "were", "been", "will",
        "shall", "does", "did", "for", "and", "the", "you", "are", "was", "not", "but", "can",
    }
    LANGUAGE_MAP = {
        "english": "English", "spanish": "Spanish", "french": "French", "german": "German",
        "arabic": "Arabic", "hindi": "Hindi", "portuguese": "Portuguese", "italian": "Italian",
    }

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env"))

# -----------------------------------------------------------------------------
# Configuration
# -----------------------------------------------------------------------------

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "").strip()
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-5-mini").strip()
OPENAI_REASONING_EFFORT = os.getenv("AI_REASONING_EFFORT", "medium").strip().lower()
OPENAI_EMBEDDING_MODEL = os.getenv("OPENAI_EMBEDDING_MODEL", "text-embedding-3-small").strip()
MAX_CONTEXT_CHARS = int(os.getenv("MAX_CONTEXT_CHARS", "48000"))
MAX_DOC_CHARS = int(os.getenv("MAX_DOC_CHARS", "2000000"))
CHUNK_CHARS = int(os.getenv("CHUNK_CHARS", "4500"))
CHUNK_OVERLAP = int(os.getenv("CHUNK_OVERLAP", "600"))
TOP_K = int(os.getenv("RAG_TOP_K", "8"))
REQUEST_TIMEOUT = float(os.getenv("OPENAI_TIMEOUT", "90"))

if OPENAI_REASONING_EFFORT not in {"low", "medium", "high"}:
    OPENAI_REASONING_EFFORT = "medium"

app = FastAPI(title="DocuMind AI Service", version="2.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -----------------------------------------------------------------------------
# Models
# -----------------------------------------------------------------------------

class SummaryRequest(BaseModel):
    text: str = Field(default="", min_length=0)
    mode: str = "medium"
    documentId: Optional[str] = None


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    context: Optional[str] = ""
    documentId: Optional[str] = None
    history: List[ChatMessage] = Field(default_factory=list)


class SearchRequest(BaseModel):
    query: str
    text: Optional[str] = ""
    context: Optional[str] = ""
    documentId: Optional[str] = None
    topK: int = TOP_K


class TranslateRequest(BaseModel):
    text: str
    language: str = "English"
    documentId: Optional[str] = None


class PipelineRequest(BaseModel):
    text: str = ""
    documentId: Optional[str] = None
    query: Optional[str] = None
    language: str = "English"
    mode: str = "medium"


class IndexRequest(BaseModel):
    text: str = ""
    documentId: str
    title: Optional[str] = None


# -----------------------------------------------------------------------------
# In-memory index
# -----------------------------------------------------------------------------

@dataclass
class Chunk:
    id: str
    document_id: str
    text: str
    page: Optional[int] = None
    index: int = 0
    heading: Optional[str] = None
    embedding: Optional[List[float]] = None


@dataclass
class DocumentIndex:
    document_id: str
    title: str = "Document"
    chunks: List[Chunk] = field(default_factory=list)


DOCUMENTS: Dict[str, DocumentIndex] = {}


# -----------------------------------------------------------------------------
# Text / retrieval utilities
# -----------------------------------------------------------------------------

TOKEN_RE = re.compile(r"[A-Za-z0-9][A-Za-z0-9_'-]*")
SENTENCE_RE = re.compile(r"(?<=[.!?])\s+(?=[A-Z0-9\"'([€$₹-])")


def normalize_text(text: str) -> str:
    if not text:
        return ""
    text = text.replace("\x00", " ").replace("\r\n", "\n").replace("\r", "\n")
    text = re.sub(r"[\t ]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def tokens(text: str) -> List[str]:
    return [t.lower() for t in TOKEN_RE.findall(text or "")]


def content_words(text: str) -> List[str]:
    return [w for w in tokens(text) if len(w) >= 3 and w not in STOP_WORDS]


def shorten(text: str, limit: int = 500) -> str:
    if len(text) <= limit:
        return text
    return text[: max(0, limit - 3)].rstrip() + "..."


def split_sentences(text: str) -> List[str]:
    cleaned = normalize_text(text)
    if not cleaned:
        return []
    # First split on blank lines because PDFs often contain headings/lists.
    paragraphs = re.split(r"\n{2,}", cleaned)
    sentences: List[str] = []
    for paragraph in paragraphs:
        paragraph = paragraph.strip()
        if not paragraph:
            continue
        pieces = SENTENCE_RE.split(paragraph)
        for piece in pieces:
            piece = piece.strip(" \n•-")
            if piece:
                sentences.append(piece)
    return sentences


def chunk_text(text: str, document_id: str = "local") -> List[Chunk]:
    """Create overlapping chunks while respecting paragraph/sentence boundaries."""
    text = normalize_text(text)
    if not text:
        return []
    if len(text) > MAX_DOC_CHARS:
        text = text[:MAX_DOC_CHARS]

    paragraphs = [p.strip() for p in re.split(r"\n{2,}", text) if p.strip()]
    raw_chunks: List[str] = []
    current = ""

    def flush() -> None:
        nonlocal current
        current = current.strip()
        if current:
            raw_chunks.append(current)
        current = ""

    for paragraph in paragraphs:
        candidate = f"{current}\n\n{paragraph}" if current else paragraph
        if len(candidate) <= CHUNK_CHARS:
            current = candidate
            continue
        if current:
            flush()
        # Oversized paragraphs: split them by sentences, then hard-split only as a last resort.
        if len(paragraph) <= CHUNK_CHARS:
            current = paragraph
            continue
        sentences = split_sentences(paragraph)
        if not sentences:
            for start in range(0, len(paragraph), CHUNK_CHARS - CHUNK_OVERLAP):
                raw_chunks.append(paragraph[start:start + CHUNK_CHARS])
            continue
        buf = ""
        for sentence in sentences:
            proposed = f"{buf} {sentence}".strip()
            if buf and len(proposed) > CHUNK_CHARS:
                raw_chunks.append(buf)
                overlap_seed = buf[-CHUNK_OVERLAP:]
                buf = f"{overlap_seed} {sentence}".strip()
            else:
                buf = proposed
        if buf:
            raw_chunks.append(buf)

    flush()

    chunks: List[Chunk] = []
    for idx, raw in enumerate(raw_chunks):
        clean = normalize_text(raw)
        if not clean:
            continue
        chunks.append(
            Chunk(
                id=f"{document_id}-chunk-{idx + 1}",
                document_id=document_id,
                text=clean,
                index=idx,
            )
        )
    return chunks


def make_page_chunks(pages: Sequence[str], document_id: str) -> List[Chunk]:
    """Page-aware chunking for extracted PDFs."""
    result: List[Chunk] = []
    global_index = 0
    for page_number, page_text in enumerate(pages, start=1):
        page_text = normalize_text(page_text)
        if not page_text:
            continue
        local = chunk_text(page_text, document_id=f"{document_id}-p{page_number}")
        for c in local:
            global_index += 1
            c.document_id = document_id
            c.id = f"{document_id}-chunk-{global_index}"
            c.page = page_number
            c.index = global_index - 1
            result.append(c)
    return result


def index_document(text: str, document_id: str, title: Optional[str] = None,
                   pages: Optional[Sequence[str]] = None) -> DocumentIndex:
    if pages:
        chunks = make_page_chunks(pages, document_id)
    else:
        chunks = chunk_text(text, document_id)
    doc = DocumentIndex(document_id=document_id, title=title or "Document", chunks=chunks)
    DOCUMENTS[document_id] = doc
    return doc


def get_document_chunks(document_id: Optional[str], text: str) -> List[Chunk]:
    if document_id and document_id in DOCUMENTS and DOCUMENTS[document_id].chunks:
        return DOCUMENTS[document_id].chunks
    return chunk_text(text, document_id or "local")


def cosine(a: Sequence[float], b: Sequence[float]) -> float:
    if not a or not b or len(a) != len(b):
        return 0.0
    dot = sum(x * y for x, y in zip(a, b))
    na = math.sqrt(sum(x * x for x in a))
    nb = math.sqrt(sum(y * y for y in b))
    return dot / (na * nb) if na and nb else 0.0


# -----------------------------------------------------------------------------
# OpenAI HTTP helpers
# -----------------------------------------------------------------------------


def _headers() -> Dict[str, str]:
    return {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "Content-Type": "application/json",
    }


def _extract_output_text(data: Dict[str, Any]) -> Optional[str]:
    output_text = data.get("output_text")
    if isinstance(output_text, str) and output_text.strip():
        return output_text.strip()

    texts: List[str] = []
    for item in data.get("output", []) or []:
        for content in item.get("content", []) or []:
            if content.get("type") == "output_text" and content.get("text"):
                texts.append(content["text"])
    if texts:
        return "\n".join(texts).strip()
    return None


async def call_openai(instructions: str, user_input: str,
                      *, reasoning: bool = True,
                      timeout: Optional[float] = None) -> Optional[str]:
    if not OPENAI_API_KEY:
        return None

    payload: Dict[str, Any] = {
        "model": OPENAI_MODEL,
        "input": [
            {"role": "system", "content": [{"type": "input_text", "text": instructions}]},
            {"role": "user", "content": [{"type": "input_text", "text": user_input}]},
        ],
    }

    # Reasoning models use reasoning.effort. For ordinary GPT models, this field may be rejected,
    # so only add it for the models that conventionally support it.
    model_lower = OPENAI_MODEL.lower()
    if reasoning and (model_lower.startswith("gpt-5") or model_lower.startswith("o1")
                      or model_lower.startswith("o3") or model_lower.startswith("o4")):
        payload["reasoning"] = {"effort": OPENAI_REASONING_EFFORT}

    try:
        async with httpx.AsyncClient(timeout=timeout or REQUEST_TIMEOUT) as client:
            response = await client.post(
                "https://api.openai.com/v1/responses",
                headers=_headers(),
                json=payload,
            )
            response.raise_for_status()
            return _extract_output_text(response.json())
    except httpx.HTTPStatusError:
        # Keep the service alive; routes can use grounded deterministic fallbacks.
        return None
    except Exception:
        return None


async def embed_texts(texts: Sequence[str]) -> Optional[List[List[float]]]:
    if not OPENAI_API_KEY or not texts:
        return None
    try:
        async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT) as client:
            response = await client.post(
                "https://api.openai.com/v1/embeddings",
                headers=_headers(),
                json={"model": OPENAI_EMBEDDING_MODEL, "input": list(texts)},
            )
            response.raise_for_status()
            data = response.json()
            return [item["embedding"] for item in sorted(data["data"], key=lambda x: x["index"])]
    except Exception:
        return None


async def ensure_embeddings(chunks: List[Chunk]) -> None:
    missing = [c for c in chunks if c.embedding is None]
    if not missing or not OPENAI_API_KEY:
        return
    # Batch conservatively to avoid very large HTTP bodies.
    for start in range(0, len(missing), 64):
        batch = missing[start:start + 64]
        embeddings = await embed_texts([c.text for c in batch])
        if not embeddings:
            return
        for chunk, embedding in zip(batch, embeddings):
            chunk.embedding = embedding


async def retrieve(query: str, chunks: List[Chunk], top_k: int = TOP_K) -> List[Tuple[Chunk, float]]:
    query = normalize_text(query)
    if not query or not chunks:
        return []

    query_terms = set(content_words(query))
    lexical: List[Tuple[Chunk, float]] = []
    for chunk in chunks:
        words = set(content_words(chunk.text))
        if not words:
            continue
        overlap = len(query_terms & words) / max(len(query_terms), 1)
        phrase = 1.0 if query.lower() in chunk.text.lower() else 0.0
        # Slight bonus when several query terms occur close together.
        lexical_score = 0.75 * overlap + 0.25 * phrase
        lexical.append((chunk, lexical_score))

    if OPENAI_API_KEY:
        await ensure_embeddings(chunks)
        q_embedding = await embed_texts([query])
        if q_embedding and q_embedding[0]:
            scored = []
            for chunk, lex in lexical:
                sem = cosine(q_embedding[0], chunk.embedding or [])
                score = 0.70 * sem + 0.30 * lex
                scored.append((chunk, score))
            scored.sort(key=lambda item: item[1], reverse=True)
            return scored[:max(1, top_k)]

    lexical.sort(key=lambda item: item[1], reverse=True)
    return [(c, s) for c, s in lexical[:max(1, top_k)] if s > 0]


def format_evidence(results: Sequence[Tuple[Chunk, float]]) -> str:
    blocks: List[str] = []
    for rank, (chunk, score) in enumerate(results, start=1):
        source = f"chunk={chunk.id}"
        if chunk.page is not None:
            source += f", page={chunk.page}"
        if chunk.heading:
            source += f", heading={chunk.heading}"
        blocks.append(
            f"[EVIDENCE {rank} | {source} | relevance={score:.3f}]\n{chunk.text}"
        )
    return "\n\n".join(blocks)


def citation_for_chunk(chunk: Chunk) -> str:
    return f"[p. {chunk.page}]" if chunk.page is not None else f"[{chunk.id}]"


def clean_llm_markdown(text: str) -> str:
    text = (text or "").strip()
    text = re.sub(r"^```(?:markdown|md)?\s*", "", text, flags=re.IGNORECASE)
    text = re.sub(r"\s*```$", "", text)
    return text.strip()


def parse_json_safely(text: Optional[str]) -> Optional[Any]:
    if not text:
        return None
    raw = text.strip()
    raw = re.sub(r"^```json\s*", "", raw, flags=re.IGNORECASE)
    raw = re.sub(r"\s*```$", "", raw)
    try:
        return json.loads(raw)
    except Exception:
        pass
    match = re.search(r"(\{.*\}|\[.*\])", raw, flags=re.DOTALL)
    if match:
        try:
            return json.loads(match.group(1))
        except Exception:
            return None
    return None


# -----------------------------------------------------------------------------
# Deterministic, source-grounded fallback functions
# -----------------------------------------------------------------------------


def extract_keywords(text: str, limit: int = 10) -> List[str]:
    words = content_words(text)
    freq: Dict[str, int] = {}
    for word in words:
        freq[word] = freq.get(word, 0) + 1
    return [w for w, _ in sorted(freq.items(), key=lambda kv: (-kv[1], kv[0]))[:limit]]


def fallback_summary(text: str, mode: str = "medium") -> str:
    sentences = split_sentences(text)
    if not sentences:
        return "## Summary\n\nNo readable content was extracted from this document."
    target = {
        "short": 3,
        "medium": 7,
        "detailed": 12,
        "executive": 7,
        "academic": 9,
        "research": 10,
        "technical": 10,
        "business": 8,
        "legal": 8,
        "medical": 8,
        "bullets": 8,
    }.get(mode.lower(), 7)
    selected = sentences[:target]
    lines = ["## Summary", "", "### Overview", selected[0], "", "### Key points"]
    lines.extend(f"- {s}" for s in selected[1:])
    return "\n".join(lines)


def fallback_answer(message: str, results: Sequence[Tuple[Chunk, float]]) -> Tuple[str, List[Dict[str, Any]]]:
    if not results or results[0][1] <= 0:
        return (
            "## Answer\n\nThe document evidence provided to DocuMind does not contain enough information to answer that question reliably.\n\n"
            "### What is missing\nPlease ask about a topic that appears in the selected document, or select/re-index the correct document.",
            [],
        )
    evidence = []
    for chunk, _ in results[:3]:
        evidence.append(f"- {chunk.text} {citation_for_chunk(chunk)}")
    answer = (
        "## Answer\n\nBased on the most relevant passages in the document:\n\n"
        + "\n".join(evidence)
    )
    citations = [
        {"chunkId": c.id, "page": c.page, "score": round(s, 4), "excerpt": shorten(c.text, 300)}
        for c, s in results[:5]
    ]
    return answer, citations


def fallback_flashcards(text: str) -> List[Dict[str, Any]]:
    sentences = [s for s in split_sentences(text) if len(s) >= 35]
    cards: List[Dict[str, Any]] = []
    for i, sentence in enumerate(sentences[:10], start=1):
        words = [w.strip(".,:;()[]{}\"") for w in sentence.split() if len(w.strip(".,:;()[]{}\"")) >= 6]
        answer = max(words, key=len) if words else "main idea"
        question = re.sub(re.escape(answer), "_____", sentence, count=1, flags=re.IGNORECASE)
        cards.append({
            "id": f"fc-{i}",
            "question": f"Complete the statement: {shorten(question, 260)}",
            "answer": sentence,
            "sourceTerm": answer,
        })
    return cards


def fallback_quiz(text: str) -> Dict[str, Any]:
    cards = fallback_flashcards(text)[:6]
    questions: List[Dict[str, Any]] = []
    all_keywords = extract_keywords(text, 12)
    for i, card in enumerate(cards, start=1):
        answer = card["sourceTerm"]
        distractors = [w for w in all_keywords if w.lower() != answer.lower()]
        options = [answer] + distractors[:3]
        while len(options) < 4:
            options.append(f"Not stated in the document {len(options)}")
        questions.append({
            "id": f"q{i}",
            "question": card["question"],
            "options": options,
            "answer": answer,
            "evidence": card["answer"],
        })
    return {
        "title": "Document comprehension quiz",
        "questions": questions,
    }


def fallback_mindmap(text: str) -> Dict[str, Any]:
    keywords = extract_keywords(text, 7)
    nodes = [{"id": "root", "label": "Document Overview", "type": "root"}]
    links = []
    for i, word in enumerate(keywords, start=1):
        nodes.append({"id": f"node-{i}", "label": word, "type": "topic"})
        links.append({"from": "root", "to": f"node-{i}"})
    return {"root": "Document Overview", "nodes": nodes, "links": links}


def fallback_notes(text: str) -> Dict[str, Any]:
    sentences = [s for s in split_sentences(text) if len(s) >= 35][:12]
    notes = []
    keywords = extract_keywords(text, 12)
    for i, sentence in enumerate(sentences, start=1):
        heading = next((k for k in keywords if k.lower() in sentence.lower()), f"Source point {i}")
        notes.append({
            "id": f"note-{i}",
            "heading": heading.title(),
            "content": sentence,
            "type": "context" if i == 1 else "evidence",
        })
    return {"title": "Smart Notes", "notes": notes}


def fallback_highlights(text: str) -> List[Dict[str, Any]]:
    return [
        {"id": f"highlight-{i}", "text": sentence, "color": "yellow", "section": f"Section {i}"}
        for i, sentence in enumerate(split_sentences(text)[:10], start=1)
    ]


def fallback_bookmarks(text: str) -> List[Dict[str, Any]]:
    return [
        {"id": f"bookmark-{i}", "title": shorten(sentence, 70), "excerpt": sentence, "page": i}
        for i, sentence in enumerate(split_sentences(text)[:8], start=1)
    ]


# -----------------------------------------------------------------------------
# AI operations
# -----------------------------------------------------------------------------

SUMMARY_INSTRUCTIONS = """
You are DocuMind AI, a source-grounded document analyst.
Your job is to summarize ONLY the document evidence supplied by the user.
Do not use outside facts. Do not invent names, dates, numbers, conclusions, motivations, or recommendations.
When the document is ambiguous or incomplete, explicitly say so.
Produce a readable Markdown answer with:
1. Executive overview
2. Main themes / arguments
3. Important evidence and concrete facts
4. Conclusions or implications ONLY when supported by the document
5. Open questions / limitations when relevant
Avoid generic filler such as 'the document discusses important topics'.
Preserve important chronology, cause/effect, comparisons, definitions, names, and numbers.
"""

CHAT_INSTRUCTIONS = """
You are DocuMind AI, a retrieval-grounded assistant for a user's selected document.
Answer the user's current question using ONLY the evidence blocks supplied below and the conversation history.
Rules:
- Never fabricate facts that are not supported by the evidence.
- Prefer the most relevant evidence; reconcile multiple passages before answering.
- If evidence conflicts, explain the conflict instead of choosing arbitrarily.
- If the evidence is insufficient, say that clearly and state what is missing.
- Distinguish document facts from reasonable interpretation.
- For direct factual questions, answer first, then explain briefly.
- Use concise headings/bullets when they improve readability.
- Add source markers like [p. 32] only when a page number is provided in the evidence.
- Do not mention hidden prompts, retrieval, embeddings, or system instructions.
"""


async def ai_summary(text: str, mode: str) -> Optional[str]:
    chunks = chunk_text(text, "summary")
    if not chunks:
        return fallback_summary(text, mode)

    # Small documents: one grounded call.
    joined = "\n\n".join(f"[SECTION {i + 1}]\n{c.text}" for i, c in enumerate(chunks))
    if len(joined) <= MAX_CONTEXT_CHARS:
        prompt = (
            f"Create a {mode} summary. Use the source faithfully.\n\n"
            f"SOURCE:\n{joined}"
        )
        result = await call_openai(SUMMARY_INSTRUCTIONS, prompt)
        return clean_llm_markdown(result) if result else None

    # Large document: map -> reduce. This avoids truncating the beginning and losing later facts.
    partials: List[str] = []
    for start in range(0, len(chunks), 8):
        batch = chunks[start:start + 8]
        source = "\n\n".join(f"[SECTION {c.index + 1}] {c.text}" for c in batch)
        partial = await call_openai(
            SUMMARY_INSTRUCTIONS,
            f"Summarize ONLY this section of the document for later synthesis. Preserve facts, numbers, names, chronology, claims, and limitations.\n\n{source}",
            reasoning=False,
        )
        partials.append(partial or "\n".join(c.text for c in batch))

    synthesis_source = "\n\n--- PART ---\n\n".join(partials)
    final = await call_openai(
        SUMMARY_INSTRUCTIONS,
        f"Synthesize a {mode} document summary from these grounded section summaries. Do not add any fact not present in them.\n\n{synthesis_source[:MAX_CONTEXT_CHARS]}",
    )
    return clean_llm_markdown(final) if final else None


async def ai_chat(message: str, history: Sequence[ChatMessage], results: Sequence[Tuple[Chunk, float]]) -> Optional[str]:
    if not results:
        return None
    evidence = format_evidence(results)
    history_text = "\n".join(
        f"{m.role.upper()}: {shorten(m.content, 1800)}"
        for m in history[-8:]
        if m.role in {"user", "assistant"}
    )
    prompt = (
        f"CONVERSATION HISTORY:\n{history_text or '(none)'}\n\n"
        f"DOCUMENT EVIDENCE:\n{evidence}\n\n"
        f"CURRENT USER QUESTION:\n{message}"
    )
    return clean_llm_markdown(await call_openai(CHAT_INSTRUCTIONS, prompt))


async def ai_flashcards(text: str) -> Optional[List[Dict[str, Any]]]:
    chunks = chunk_text(text, "flashcards")
    source = "\n\n".join(c.text for c in chunks[:12])
    raw = await call_openai(
        """
You create study flashcards strictly from the supplied document.
Return ONLY valid JSON array. Each item must contain: id, question, answer, sourceTerm, evidence.
Create 8-12 useful cards. Questions must test concepts, definitions, relationships, dates, or important facts—not trivial wording.
Answers must be fully supported by the document. Never invent information.
""",
        source,
        reasoning=False,
    )
    data = parse_json_safely(raw)
    if isinstance(data, list):
        return data
    return None


async def ai_quiz(text: str) -> Optional[Dict[str, Any]]:
    chunks = chunk_text(text, "quiz")
    source = "\n\n".join(c.text for c in chunks[:14])
    raw = await call_openai(
        """
Create a high-quality comprehension quiz strictly from the supplied document.
Return ONLY valid JSON object with keys: title, questions.
questions is an array of 6-10 objects with: id, question, options, answer, explanation, evidence.
Every question has exactly 4 options and exactly one correct answer.
Distractors must be plausible but clearly unsupported or incorrect according to the document.
Do not use outside knowledge. Avoid questions whose answer cannot be established from the source.
""",
        source,
        reasoning=False,
    )
    data = parse_json_safely(raw)
    if isinstance(data, dict) and isinstance(data.get("questions"), list):
        return data
    return None


async def ai_mindmap(text: str) -> Optional[Dict[str, Any]]:
    chunks = chunk_text(text, "mindmap")
    source = "\n\n".join(c.text for c in chunks[:16])
    raw = await call_openai(
        """
Build a concept mind map from the supplied document only.
Return ONLY valid JSON object with keys root, nodes, links.
root is a string. nodes is an array of {id,label,type} where type is root/topic/subtopic/concept.
links is an array of {from,to,relation}.
Use meaningful concepts and relationships, not random word frequency.
Do not invent concepts not supported by the document.
""",
        source,
        reasoning=False,
    )
    data = parse_json_safely(raw)
    if isinstance(data, dict) and isinstance(data.get("nodes"), list) and isinstance(data.get("links"), list):
        return data
    return None


async def ai_notes(text: str) -> Optional[Dict[str, Any]]:
    chunks = chunk_text(text, "notes")
    source = "\n\n".join(c.text for c in chunks[:14])
    raw = await call_openai(
        """
Create organized study notes strictly from the source document.
Return ONLY valid JSON object with keys title and notes.
notes is an array of 8-14 objects with: id, heading, content, type, evidence.
type must be one of context, concept, evidence, implication, definition.
Group related information and avoid repetitive one-sentence notes.
""",
        source,
        reasoning=False,
    )
    data = parse_json_safely(raw)
    if isinstance(data, dict) and isinstance(data.get("notes"), list):
        return data
    return None


async def ai_insights(text: str) -> Optional[Dict[str, Any]]:
    chunks = chunk_text(text, "insights")
    source = "\n\n".join(c.text for c in chunks[:16])
    raw = await call_openai(
        """
Analyze the document strictly from its content.
Return ONLY valid JSON object with keys: keyInsights, keyEntities, importantNumbers, openQuestions.
keyInsights: 4-7 concise insights that connect related facts or explain significance.
keyEntities: important named people, organizations, places, products, etc. with role/context.
importantNumbers: important dates, amounts, percentages, measurements, or counts exactly as stated.
openQuestions: 0-5 questions that the document leaves unresolved.
Do not add outside knowledge or generic advice.
""",
        source,
        reasoning=True,
    )
    data = parse_json_safely(raw)
    return data if isinstance(data, dict) else None




async def ai_highlights(text: str) -> Optional[List[Dict[str, Any]]]:
    chunks = chunk_text(text, "highlights")
    source = "\n\n".join(c.text for c in chunks[:16])
    raw = await call_openai(
        """
Select the most important passages from the supplied document.
Return ONLY valid JSON array. Each item must contain: id, text, reason, importance, section.
Return 5-10 passages. Prefer claims, definitions, important evidence, conclusions, dates, numbers, and turning points.
Never invent text; `text` must be copied or faithfully shortened from the supplied source.
`importance` must be one of high, medium.
""",
        source,
        reasoning=False,
    )
    data = parse_json_safely(raw)
    return data if isinstance(data, list) else None


async def ai_bookmarks(text: str) -> Optional[List[Dict[str, Any]]]:
    chunks = chunk_text(text, "bookmarks")
    source = "\n\n".join(c.text for c in chunks[:18])
    raw = await call_openai(
        """
Identify useful sections/bookmarks in the document.
Return ONLY valid JSON array. Each item must contain: id, title, excerpt, reason, sectionNumber.
Create 5-10 bookmarks covering distinct topics/sections.
Titles should be concise and specific to the source. Do not invent sections.
""",
        source,
        reasoning=False,
    )
    data = parse_json_safely(raw)
    return data if isinstance(data, list) else None


async def ai_translate(text: str, language: str) -> Optional[str]:
    target = LANGUAGE_MAP.get((language or "English").strip().lower(), language)
    return await call_openai(
        f"""
Translate the supplied text into {target}.
Preserve the original meaning, facts, names, numbers, formatting structure, and uncertainty.
Do not summarize, explain, add, remove, or correct content.
Return only the translation.
""",
        text[:MAX_CONTEXT_CHARS],
        reasoning=False,
    )


# -----------------------------------------------------------------------------
# API routes
# -----------------------------------------------------------------------------

@app.get("/health")
def health() -> Dict[str, Any]:
    return {
        "success": True,
        "message": "AI service is healthy",
        "openaiConfigured": bool(OPENAI_API_KEY),
        "model": OPENAI_MODEL,
        "indexedDocuments": len(DOCUMENTS),
    }


@app.post("/index-document")
async def index_document_route(payload: IndexRequest) -> Dict[str, Any]:
    text = normalize_text(payload.text)
    if not text:
        raise HTTPException(status_code=400, detail="Document text cannot be empty")
    doc = index_document(text, payload.documentId, payload.title)
    # Do not block frontend if embeddings fail; lexical retrieval remains available.
    await ensure_embeddings(doc.chunks)
    return {
        "success": True,
        "documentId": doc.document_id,
        "title": doc.title,
        "chunkCount": len(doc.chunks),
    }


@app.post("/summary")
async def generate_summary_route(payload: SummaryRequest) -> Dict[str, Any]:
    text = normalize_text(payload.text)
    if payload.documentId and payload.documentId in DOCUMENTS:
        text = "\n\n".join(c.text for c in DOCUMENTS[payload.documentId].chunks)
    if not text:
        raise HTTPException(status_code=400, detail="No document text supplied")

    result = await ai_summary(text, payload.mode or "medium")
    summary = result or fallback_summary(text, payload.mode)
    return {
        "success": True,
        "summary": summary,
        "mode": payload.mode,
        "grounded": bool(result),
    }


@app.post("/chat")
async def chat_with_document(payload: ChatRequest) -> Dict[str, Any]:
    message = normalize_text(payload.message)
    if not message:
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    source_text = normalize_text(payload.context or "")
    chunks = get_document_chunks(payload.documentId, source_text)
    if not chunks:
        raise HTTPException(status_code=400, detail="No document content is available")

    results = await retrieve(message, chunks, TOP_K)
    llm_answer = await ai_chat(message, payload.history, results)
    if llm_answer:
        response = llm_answer
    else:
        response, _ = fallback_answer(message, results)

    citations = [
        {
            "chunkId": chunk.id,
            "page": chunk.page,
            "score": round(score, 4),
            "excerpt": shorten(chunk.text, 320),
        }
        for chunk, score in results[:6]
    ]

    return {
        "success": True,
        "message": response,
        "citations": citations,
        "retrievedChunks": len(results),
        "grounded": bool(llm_answer),
    }


@app.post("/analyze")
async def analyze_document(payload: PipelineRequest) -> Dict[str, Any]:
    text = normalize_text(payload.text)
    if payload.documentId and payload.documentId in DOCUMENTS:
        text = "\n\n".join(c.text for c in DOCUMENTS[payload.documentId].chunks)
    if not text:
        raise HTTPException(status_code=400, detail="No document text supplied")

    summary_result = await ai_summary(text, payload.mode or "medium")
    cards_result = await ai_flashcards(text)
    quiz_result = await ai_quiz(text)
    mindmap_result = await ai_mindmap(text)
    notes_result = await ai_notes(text)
    insights_result = await ai_insights(text)

    highlights_result = await ai_highlights(text)
    bookmarks_result = await ai_bookmarks(text)

    return {
        "success": True,
        "summary": summary_result or fallback_summary(text, payload.mode),
        "flashcards": cards_result or fallback_flashcards(text),
        "quiz": quiz_result or fallback_quiz(text),
        "mindmap": mindmap_result or fallback_mindmap(text),
        "notes": notes_result or fallback_notes(text),
        "highlights": highlights_result or fallback_highlights(text),
        "bookmarks": bookmarks_result or fallback_bookmarks(text),
        "keywords": extract_keywords(text),
        "insights": insights_result or {
            "keyInsights": [f"Main themes: {', '.join(extract_keywords(text, 5))}"],
            "keyEntities": [],
            "importantNumbers": [],
            "openQuestions": [],
        },
    }


@app.post("/flashcards")
async def flashcards_route(payload: PipelineRequest) -> Dict[str, Any]:
    text = normalize_text(payload.text)
    result = await ai_flashcards(text) if text else None
    return {"success": True, "cards": result or fallback_flashcards(text)}


@app.post("/quiz")
async def quiz_route(payload: PipelineRequest) -> Dict[str, Any]:
    text = normalize_text(payload.text)
    result = await ai_quiz(text) if text else None
    return {"success": True, "quiz": result or fallback_quiz(text)}


@app.post("/mindmap")
async def mindmap_route(payload: PipelineRequest) -> Dict[str, Any]:
    text = normalize_text(payload.text)
    result = await ai_mindmap(text) if text else None
    return {"success": True, "data": result or fallback_mindmap(text)}


@app.post("/notes")
async def notes_route(payload: PipelineRequest) -> Dict[str, Any]:
    text = normalize_text(payload.text)
    result = await ai_notes(text) if text else None
    return {"success": True, "notes": result or fallback_notes(text)}


@app.post("/highlights")
async def highlights_route(payload: PipelineRequest) -> Dict[str, Any]:
    text = normalize_text(payload.text)
    result = await ai_highlights(text) if text else None
    return {"success": True, "highlights": result or fallback_highlights(text)}


@app.post("/bookmarks")
async def bookmarks_route(payload: PipelineRequest) -> Dict[str, Any]:
    text = normalize_text(payload.text)
    result = await ai_bookmarks(text) if text else None
    return {"success": True, "bookmarks": result or fallback_bookmarks(text)}


@app.post("/search")
async def search_route(payload: SearchRequest) -> Dict[str, Any]:
    source_text = normalize_text(payload.text or payload.context or "")
    chunks = get_document_chunks(payload.documentId, source_text)
    results = await retrieve(payload.query, chunks, min(max(payload.topK, 1), 20))
    return {
        "success": True,
        "results": [
            {
                "id": chunk.id,
                "title": f"Relevant section {chunk.index + 1}",
                "preview": chunk.text,
                "score": round(score, 4),
                "page": chunk.page,
                "documentId": chunk.document_id,
            }
            for chunk, score in results
        ],
    }


@app.post("/translate")
async def translate_route(payload: TranslateRequest) -> Dict[str, Any]:
    text = payload.text or ""
    if not text:
        return {"success": True, "language": payload.language, "translatedText": ""}
    translated = await ai_translate(text, payload.language)
    if not translated:
        # Safe fallback: return original text instead of pretending an English prefix is a translation.
        translated = text
    return {
        "success": True,
        "language": payload.language,
        "translatedText": translated,
        "grounded": bool(translated and translated != text),
    }


@app.post("/insights")
async def insights_route(payload: PipelineRequest) -> Dict[str, Any]:
    text = normalize_text(payload.text)
    result = await ai_insights(text) if text else None
    if not result:
        result = {
            "keyInsights": [f"Main themes: {', '.join(extract_keywords(text, 5))}"],
            "keyEntities": [],
            "importantNumbers": [],
            "openQuestions": [],
        }
    return {
        "success": True,
        "summary": (await ai_summary(text, payload.mode or "medium")) or fallback_summary(text, payload.mode),
        **result,
        "languages": list(dict.fromkeys(LANGUAGE_MAP.values())),
    }


# -----------------------------------------------------------------------------
# File extraction
# -----------------------------------------------------------------------------

async def extract_uploaded_file(raw: bytes, suffix: str) -> Tuple[str, List[str]]:
    suffix = suffix.lower()

    if suffix == ".pdf":
        if DocumentReader is None:
            raise HTTPException(status_code=500, detail="PDF reader dependency is not installed")
        try:
            reader = DocumentReader(BytesIO(raw))
            pages = [normalize_text(page.extract_text() or "") for page in reader.pages]
            return "\n\n".join(p for p in pages if p), pages
        except Exception as exc:
            raise HTTPException(status_code=400, detail=f"Unable to read PDF: {exc}") from exc

    if suffix == ".docx":
        try:
            from docx import Document  # type: ignore
            doc = Document(BytesIO(raw))
            paragraphs = [p.text.strip() for p in doc.paragraphs if p.text.strip()]
            text = "\n\n".join(paragraphs)
            return text, [text]
        except Exception as exc:
            raise HTTPException(status_code=400, detail=f"Unable to read DOCX: {exc}") from exc

    try:
        text = raw.decode("utf-8")
    except UnicodeDecodeError:
        try:
            text = raw.decode("latin-1")
        except Exception as exc:
            raise HTTPException(status_code=400, detail=f"Unable to decode text file: {exc}") from exc
    return normalize_text(text), [normalize_text(text)]


@app.post("/extract-text")
async def extract_text_from_uploaded_file(file: UploadFile = File(...)) -> Dict[str, Any]:
    if not file.filename:
        raise HTTPException(status_code=400, detail="A file is required")

    suffix = os.path.splitext(file.filename.lower())[1]
    allowed = {".pdf", ".txt", ".md", ".csv", ".json", ".docx"}
    if suffix not in allowed:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {suffix}")

    raw = await file.read()
    if len(raw) > 25 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File is too large. Maximum supported size is 25 MB.")

    text, pages = await extract_uploaded_file(raw, suffix)
    if not text:
        raise HTTPException(status_code=400, detail="No readable text was extracted from the file")

    # Generate a stable server-side ID for an upload. Frontend may later pass its own documentId
    # through /index-document, but this makes /extract-text immediately usable too.
    document_id = re.sub(r"[^a-zA-Z0-9_-]+", "-", os.path.splitext(file.filename)[0]).strip("-") or "document"
    document_id = f"{document_id}-{abs(hash(file.filename)) % 100000}"
    doc = index_document(text, document_id, file.filename, pages=pages if suffix == ".pdf" else None)
    await ensure_embeddings(doc.chunks)

    return {
        "success": True,
        "text": text,
        "wordCount": len(re.findall(r"\b\w+\b", text)),
        "documentId": document_id,
        "pageCount": len([p for p in pages if p]),
        "chunkCount": len(doc.chunks),
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app_fixed:app", host="0.0.0.0", port=8001, reload=True)
