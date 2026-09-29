# Centralized constants for Documind Ai
# This file is shared between Node.js and Python services

# NLP Processing
STOP_WORDS = {
    "the",
    "and",
    "for",
    "with",
    "that",
    "this",
    "from",
    "into",
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
    "have",
    "been",
    "would",
    "could",
}

# API Limits
API_LIMITS = {
    "MAX_KEYWORDS": 8,
    "MAX_SENTENCES": 25,
    "MAX_FLASHCARDS": 6,
    "MAX_QUIZ_QUESTIONS": 5,
    "SUMMARY_PREVIEW_LENGTH": 1800,
}

# Compliance Standards
COMPLIANCE_STANDARDS = ["GDPR", "CCPA", "HIPAA", "SOC2 Type II", "ISO 27001"]

# Data Retention (in days)
DATA_RETENTION = {
    "AUDIT_LOGS": 90,
    "ACTIVITY_LOGS": 180,
    "DELETED_USER_DATA": 30,
    "DOCUMENTS": 365,
}

# Language Support
LANGUAGE_MAP = {
    "english": "English",
    "spanish": "Spanish",
    "french": "Français",
    "german": "Deutsch",
    "portuguese": "Português",
    "italian": "Italiano",
    "dutch": "Nederlands",
    "russian": "Русский",
    "japanese": "日本語",
    "korean": "한국어",
    "chinese": "中文",
}
