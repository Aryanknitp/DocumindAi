export const APP_NAME = "Documind Ai";
export const API_VERSION = "v1";
export const MAX_FILE_SIZE = Number(process.env.MAX_FILE_SIZE || 52428800);
export const UPLOAD_DIR = process.env.UPLOAD_DIR || "uploads";
export const AI_SERVICE_URL =
  process.env.AI_SERVICE_URL || "http://localhost:8001";

/**
 * Shared stopwords for NLP processing
 * Centralized to ensure consistency across all modules
 */
export const STOP_WORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "that",
  "this",
  "from",
  "into",
  "have",
  "your",
  "about",
  "their",
  "there",
  "they",
  "them",
  "then",
  "than",
  "these",
  "those",
  "over",
  "under",
  "after",
  "before",
  "while",
  "through",
  "what",
  "when",
  "where",
  "which",
  "will",
  "using",
  "based",
  "also",
  "been",
  "would",
  "could",
]);

export const LANGUAGE_MAP = {
  english: "English",
  spanish: "Spanish",
  french: "French",
  german: "German",
  arabic: "Arabic",
  hindi: "Hindi",
  portuguese: "Portuguese",
  italian: "Italian",
};

export const API_LIMITS = {
  MAX_KEYWORDS: 8,
  MAX_SENTENCES: 25,
  MAX_FLASHCARDS: 6,
  MAX_QUIZ_QUESTIONS: 5,
  SUMMARY_PREVIEW_LENGTH: 1800,
};

export const COMPLIANCE_STANDARDS = [
  "GDPR",
  "CCPA",
  "HIPAA",
  "SOC2 Type II",
  "ISO 27001",
];

export const DATA_RETENTION_DAYS = {
  default: 365,
  audit_logs: 730,
  deleted_users: 30,
  temporary_uploads: 7,
};
