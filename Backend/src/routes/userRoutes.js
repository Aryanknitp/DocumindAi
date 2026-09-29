import express from "express";
import { protect } from "../middleware/auth.js";
import {
  getProfile,
  getUserOverview,
  getStorageStats,
} from "../controllers/userController.js";

const router = express.Router();

router.use(protect);
router.get("/profile", getProfile);
router.get("/overview", getUserOverview);
router.get("/storage", getStorageStats);

export default router;
