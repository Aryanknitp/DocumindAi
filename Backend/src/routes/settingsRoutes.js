import express from "express";
import { protect } from "../middleware/auth.js";
import {
  getPreferences,
  updatePreferences,
} from "../controllers/settingsController.js";

const router = express.Router();

router.use(protect);
router.get("/", getPreferences);
router.put("/", updatePreferences);

export default router;
