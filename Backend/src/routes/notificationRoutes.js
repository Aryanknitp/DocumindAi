import express from "express";
import { protect } from "../middleware/auth.js";
import {
  listNotifications,
  markNotificationsRead,
} from "../controllers/notificationController.js";

const router = express.Router();

router.use(protect);
router.get("/", listNotifications);
router.patch("/read", markNotificationsRead);

export default router;
