import express from "express";
import { protect } from "../middleware/auth.js";
import {
  getDocumentInsights,
  generateFlashcardsForDocument,
  generateQuizForDocument,
  generateMindMapForDocument,
  generateSmartNotesForDocument,
  getDocumentHighlights,
  saveDocumentHighlight,
  getDocumentBookmarks,
  saveDocumentBookmark,
  semanticSearchDocuments,
  translateDocumentText,
} from "../controllers/pipelineController.js";

const router = express.Router();

router.use(protect);
router.get("/insights/:documentId", getDocumentInsights);
router.post("/flashcards", generateFlashcardsForDocument);
router.post("/quiz", generateQuizForDocument);
router.post("/mindmap", generateMindMapForDocument);
router.post("/notes", generateSmartNotesForDocument);
router.get("/highlights/:documentId", getDocumentHighlights);
router.post("/highlights", saveDocumentHighlight);
router.get("/bookmarks/:documentId", getDocumentBookmarks);
router.post("/bookmarks", saveDocumentBookmark);
router.post("/search", semanticSearchDocuments);
router.post("/translate", translateDocumentText);

export default router;
