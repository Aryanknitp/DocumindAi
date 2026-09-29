import { AI_SERVICE_URL } from "../config/constants.js";

const normalizeResponse = async (response) => {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }
  return response.text();
};

const fallbackSummary = (mode, text) => {
  const source = text?.trim() || "";
  const sentences = source.split(/(?<=[.!?])\s+/).filter(Boolean);
  const preview = sentences.slice(0, mode === "detailed" ? 6 : 3).join(" ");
  return `## Executive overview\n\n${preview || "No document content is available yet."}\n\n## Supporting evidence\n\n${
    sentences
      .slice(3, 7)
      .map((sentence) => `- ${sentence}`)
      .join("\n") || "- No supporting evidence was extracted."
  }\n\n## Practical takeaway\n\nReview the source evidence above and validate important decisions against the original document.`;
};

const fallbackChat = (message, context) => {
  const question = message?.trim() || "your question";
  const source = context?.trim() || "";
  const ignored = new Set([
    "what",
    "when",
    "where",
    "which",
    "who",
    "why",
    "how",
    "does",
    "do",
    "did",
    "is",
    "are",
    "the",
    "this",
    "that",
    "my",
    "your",
    "about",
    "project",
    "document",
    "please",
    "can",
    "could",
  ]);
  const keywords = (question.toLowerCase().match(/[a-z0-9]+/g) || []).filter(
    (word) => word.length > 2 && !ignored.has(word),
  );
  const sentences = source.split(/(?<=[.!?])\s+/).filter(Boolean);
  const matches = sentences
    .map((sentence, index) => ({
      sentence,
      index,
      score: keywords.reduce(
        (total, word) =>
          total + (sentence.toLowerCase().includes(word) ? 1 : 0),
        0,
      ),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, 3)
    .map((item) => item.sentence.trim());
  return `## Answer\n\n${matches.join(" ") || "The document does not contain enough information to answer this question."}\n\n## Question\n\n${question}`;
};

export const searchWebSources = async (query) => {
  try {
    const response = await fetch(
      `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`,
    );
    if (!response.ok) return [];
    const payload = await response.json();
    const sources = [];
    if (payload.AbstractText && payload.AbstractURL) {
      sources.push({
        title: payload.Heading || "Web result",
        url: payload.AbstractURL,
        snippet: payload.AbstractText,
      });
    }
    for (const topic of payload.RelatedTopics || []) {
      if (topic.Text && topic.FirstURL) {
        sources.push({
          title: topic.Text.split(" - ")[0],
          url: topic.FirstURL,
          snippet: topic.Text,
        });
      }
      if (sources.length >= 3) break;
    }
    return sources;
  } catch {
    return [];
  }
};

export const generateInsightSummary = async (text, mode = "medium") => {
  const endpoint = `${AI_SERVICE_URL.replace(/\/$/, "")}/summary`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: text || "", mode }),
    });

    if (!response.ok) {
      throw new Error(`AI service responded with ${response.status}`);
    }

    const payload = await normalizeResponse(response);
    if (payload && typeof payload === "object" && payload.summary) {
      return payload.summary;
    }

    return fallbackSummary(mode, text);
  } catch (error) {
    console.warn("AI summary fallback triggered:", error.message);
    return fallbackSummary(mode, text);
  }
};

export const generateChatReply = async (message, context = "") => {
  const endpoint = `${AI_SERVICE_URL.replace(/\/$/, "")}/chat`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: message || "",
        context: context || "No document context available.",
      }),
    });

    if (!response.ok) {
      throw new Error(`AI service responded with ${response.status}`);
    }

    const payload = await normalizeResponse(response);
    if (payload && typeof payload === "object" && payload.message) {
      return payload.message;
    }

    return fallbackChat(message, context);
  } catch (error) {
    console.warn("AI chat fallback triggered:", error.message);
    return fallbackChat(message, context);
  }
};
