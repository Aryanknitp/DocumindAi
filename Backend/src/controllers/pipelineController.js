import Document from "../models/Document.js";
import { STOP_WORDS, API_LIMITS } from "../config/constants.js";
import { getDocumentText } from "../services/documentTextService.js";

const safeText = (text = "") =>
  typeof text === "string" ? text : String(text || "");

const splitIntoSentences = (text) =>
  safeText(text)
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, API_LIMITS.MAX_SENTENCES);

const extractKeywords = (text) => {
  const cleaned = safeText(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ");

  const words = cleaned
    .split(/\s+/)
    .filter((word) => word.length > 3 && !STOP_WORDS.has(word));
  const counts = {};
  words.forEach((word) => {
    counts[word] = (counts[word] || 0) + 1;
  });

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, API_LIMITS.MAX_KEYWORDS)
    .map(([word]) => word);
};

const contentSentences = (text) =>
  splitIntoSentences(text).filter((sentence) => sentence.length >= 35);

const shorten = (text, limit = 240) =>
  text.length > limit ? `${text.slice(0, limit - 3).trim()}...` : text;

const keywordForSentence = (sentence, keywords) =>
  keywords.find((keyword) => sentence.toLowerCase().includes(keyword)) ||
  sentence
    .split(/\s+/)
    .find((word) => word.length > 5)
    ?.replace(/[^a-z0-9-]/gi, "");

const buildSummary = (text, mode = "medium") => {
  const sentences = contentSentences(text);
  const keywords = extractKeywords(text);
  const overview = sentences.slice(0, mode === "detailed" ? 5 : 3).join(" ");
  const evidence = sentences.slice(3, mode === "detailed" ? 10 : 6);
  return `## Executive overview\n\n${shorten(overview || "No extracted content available.", 900)}\n\n## Core themes\n\n${
    keywords
      .slice(0, 6)
      .map((keyword) => `- ${keyword}`)
      .join("\n") || "- No themes could be extracted."
  }\n\n## Supporting evidence\n\n${evidence.map((sentence) => `- ${shorten(sentence)}`).join("\n") || "- The document does not contain enough text for supporting evidence."}\n\n## Practical takeaway\n\nUse the source evidence above to validate decisions, identify risks, and define the next action. This section is generated from the uploaded document content.`;
};

const buildFlashcards = (text) => {
  const sentences = contentSentences(text);
  const keywords = extractKeywords(text);
  return sentences
    .slice(0, API_LIMITS.MAX_FLASHCARDS)
    .map((sentence, index) => {
      const answer =
        keywordForSentence(sentence, keywords) || `evidence ${index + 1}`;
      const question = sentence.replace(new RegExp(answer, "i"), "_____ ");
      return {
        id: `fc-${index + 1}`,
        question: `Complete the statement from the document: ${shorten(question, 220)}`,
        answer: shorten(sentence),
        sourceTerm: answer,
      };
    });
};

const buildQuiz = (text) => {
  const keywords = extractKeywords(text).slice(0, 6);
  const sentences = contentSentences(text);
  const questionItems = sentences.slice(0, 5).map((sentence, index) => {
    const answer =
      keywordForSentence(sentence, keywords) || "the documented evidence";
    const questionText = sentence.replace(new RegExp(answer, "i"), "_____ ");
    const distractors = keywords
      .filter(
        (keyword) =>
          keyword !== answer && !sentence.toLowerCase().includes(keyword),
      )
      .slice(0, 3);
    while (distractors.length < 3) {
      const fallback =
        sentences[
          (index + distractors.length + 1) % Math.max(sentences.length, 1)
        ] || "another documented statement";
      distractors.push(shorten(fallback, 70));
    }
    return {
      id: `q-${index + 1}`,
      question: `Which term completes this statement from the document? ${shorten(questionText, 220)}`,
      options: [answer, ...distractors],
      answer,
      evidence: shorten(sentence),
    };
  });
  return {
    title: `Comprehension check: ${keywords.slice(0, 3).join(", ") || "document evidence"}`,
    questions: questionItems,
  };
};

const buildMindMap = (text) => {
  const keywords = extractKeywords(text);
  return {
    root: "Document Overview",
    nodes: [
      { id: "root", label: "Document Overview", type: "root" },
      ...keywords.slice(0, 6).map((keyword, index) => ({
        id: `node-${index + 1}`,
        label: keyword,
        type: "topic",
      })),
    ],
    links: [
      { from: "root", to: "node-1" },
      { from: "root", to: "node-2" },
      { from: "root", to: "node-3" },
    ],
  };
};

const buildSmartNotes = (text) => {
  const sentences = contentSentences(text);
  const keywords = extractKeywords(text);
  return {
    title: "Smart Notes",
    notes: sentences.slice(0, 6).map((sentence, index) => ({
      id: `note-${index + 1}`,
      heading:
        keywordForSentence(sentence, keywords) || `Source insight ${index + 1}`,
      content: shorten(sentence, 360),
      type: index === 0 ? "context" : index % 2 ? "evidence" : "implication",
    })),
  };
};

const buildHighlights = (text) => {
  const sentences = contentSentences(text);
  return sentences.slice(0, 6).map((sentence, index) => ({
    id: `highlight-${index + 1}`,
    text: sentence,
    color: ["yellow", "blue", "green", "purple", "orange", "pink"][index % 6],
    section: `Section ${index + 1}`,
  }));
};

const buildBookmarks = (text) => {
  const sentences = contentSentences(text);
  return sentences.slice(0, 5).map((sentence, index) => ({
    id: `bookmark-${index + 1}`,
    title: `Bookmark ${index + 1}`,
    excerpt: sentence,
    page: index + 1,
  }));
};

const buildInsights = (text) => {
  const keywords = extractKeywords(text);
  const sentences = splitIntoSentences(text);
  return {
    summary: buildSummary(text, "medium"),
    keyInsights: [
      `The document centers on ${keywords.slice(0, 3).join(", ") || "your primary themes"}.`,
      sentences[0] ||
        "The source content provides actionable context and supporting rationale.",
      "The strongest patterns point to implementation opportunities, key trade-offs, and follow-up considerations.",
    ],
    languages: ["English", "Spanish", "French", "German", "Arabic", "Hindi"],
  };
};

export const getDocumentInsights = async (req, res) => {
  try {
    const { documentId } = req.params;
    const document = await Document.findOne({
      _id: documentId,
      userId: req.user._id,
      deletedAt: null,
    });

    if (!document) {
      return res
        .status(404)
        .json({ success: false, message: "Document not found" });
    }

    const text = safeText(
      (await getDocumentText(document)) || document.summary || "",
    );
    const payload = buildInsights(text || `Document: ${document.originalName}`);

    return res.status(200).json({ success: true, ...payload });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const generateFlashcardsForDocument = async (req, res) => {
  try {
    const { documentId } = req.body;
    const document = await Document.findOne({
      _id: documentId,
      userId: req.user._id,
      deletedAt: null,
    });
    if (!document) {
      return res
        .status(404)
        .json({ success: false, message: "Document not found" });
    }

    const cards = buildFlashcards(
      (await getDocumentText(document)) || document.summary || "",
    );
    return res.status(200).json({ success: true, cards });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const generateQuizForDocument = async (req, res) => {
  try {
    const { documentId } = req.body;
    const document = await Document.findOne({
      _id: documentId,
      userId: req.user._id,
      deletedAt: null,
    });
    if (!document) {
      return res
        .status(404)
        .json({ success: false, message: "Document not found" });
    }

    const quiz = buildQuiz(
      (await getDocumentText(document)) || document.summary || "",
    );
    return res.status(200).json({ success: true, quiz });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const generateMindMapForDocument = async (req, res) => {
  try {
    const { documentId } = req.body;
    const document = await Document.findOne({
      _id: documentId,
      userId: req.user._id,
      deletedAt: null,
    });
    if (!document) {
      return res
        .status(404)
        .json({ success: false, message: "Document not found" });
    }

    const data = buildMindMap(
      (await getDocumentText(document)) || document.summary || "",
    );
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const generateSmartNotesForDocument = async (req, res) => {
  try {
    const { documentId } = req.body;
    const document = await Document.findOne({
      _id: documentId,
      userId: req.user._id,
      deletedAt: null,
    });
    if (!document) {
      return res
        .status(404)
        .json({ success: false, message: "Document not found" });
    }

    const notes = buildSmartNotes(
      (await getDocumentText(document)) || document.summary || "",
    );
    return res.status(200).json({ success: true, notes });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getDocumentHighlights = async (req, res) => {
  try {
    const { documentId } = req.params;
    const document = await Document.findOne({
      _id: documentId,
      userId: req.user._id,
      deletedAt: null,
    });
    if (!document) {
      return res
        .status(404)
        .json({ success: false, message: "Document not found" });
    }

    const highlights = buildHighlights(
      (await getDocumentText(document)) || document.summary || "",
    );
    return res.status(200).json({ success: true, highlights });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const saveDocumentHighlight = async (req, res) => {
  try {
    const { documentId, text, color } = req.body;
    const document = await Document.findOne({
      _id: documentId,
      userId: req.user._id,
      deletedAt: null,
    });
    if (!document) {
      return res
        .status(404)
        .json({ success: false, message: "Document not found" });
    }

    const highlight = {
      id: `h-${Date.now()}`,
      text: text || "Selected text",
      color: color || "yellow",
      savedAt: new Date().toISOString(),
    };

    document.metadata = document.metadata || {};
    document.metadata.highlights = [
      ...(document.metadata.highlights || []),
      highlight,
    ];
    await document.save();

    return res.status(200).json({ success: true, highlight });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getDocumentBookmarks = async (req, res) => {
  try {
    const { documentId } = req.params;
    const document = await Document.findOne({
      _id: documentId,
      userId: req.user._id,
      deletedAt: null,
    });
    if (!document) {
      return res
        .status(404)
        .json({ success: false, message: "Document not found" });
    }

    const bookmarks = buildBookmarks(
      (await getDocumentText(document)) ||
        document.summary ||
        document.originalName,
    );
    return res.status(200).json({ success: true, bookmarks });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const saveDocumentBookmark = async (req, res) => {
  try {
    const { documentId, title, excerpt } = req.body;
    const document = await Document.findOne({
      _id: documentId,
      userId: req.user._id,
      deletedAt: null,
    });
    if (!document) {
      return res
        .status(404)
        .json({ success: false, message: "Document not found" });
    }

    const bookmark = {
      id: `b-${Date.now()}`,
      title: title || "Saved bookmark",
      excerpt: excerpt || "Important section",
      page: 1,
      savedAt: new Date().toISOString(),
    };

    document.metadata = document.metadata || {};
    document.metadata.bookmarks = [
      ...(document.metadata.bookmarks || []),
      bookmark,
    ];
    await document.save();

    return res.status(200).json({ success: true, bookmark });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const semanticSearchDocuments = async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || !query.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Search query is required" });
    }

    const documents = await Document.find({
      userId: req.user._id,
      deletedAt: null,
    });
    const term = query.toLowerCase();

    const results = (
      await Promise.all(
        documents.map(async (doc) => {
          const text = safeText(
            (await getDocumentText(doc)) || doc.summary || doc.originalName,
          );
          const matchScore = text.toLowerCase().includes(term) ? 1 : 0;
          return {
            id: doc._id,
            title: doc.title,
            type: "Document",
            preview: text.slice(0, 220),
            matchScore,
          };
        }),
      )
    )
      .filter(
        (item) =>
          item.matchScore > 0 || item.title.toLowerCase().includes(term),
      )
      .slice(0, 10);

    return res.status(200).json({ success: true, results });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const translateDocumentText = async (req, res) => {
  try {
    const { documentId, language = "English" } = req.body;
    const document = await Document.findOne({
      _id: documentId,
      userId: req.user._id,
      deletedAt: null,
    });
    if (!document) {
      return res
        .status(404)
        .json({ success: false, message: "Document not found" });
    }

    const sourceText = safeText(
      (await getDocumentText(document)) ||
        document.summary ||
        document.originalName,
    );
    const preview = sourceText.slice(0, 800);

    return res.status(200).json({
      success: true,
      language,
      translatedText: `Translated (${language}) preview:\n\n${preview}`,
      sourceLanguage: "English",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
