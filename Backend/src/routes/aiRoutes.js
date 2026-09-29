import express from "express";
import { protect } from "../middleware/auth.js";
import {
  generateSummary,
  chatWithDocument,
  getChatSessions,
  getDashboardStats,
  deleteChatSession,
} from "../controllers/aiController.js";

const router = express.Router();

router.use(protect);
router.get("/dashboard", getDashboardStats);
router.post("/summary", generateSummary);
router.post("/chat", chatWithDocument);
router.get("/chat/sessions", getChatSessions);
router.delete("/chat/sessions/:id", deleteChatSession);

export default router;
