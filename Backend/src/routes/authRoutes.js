import express from "express";
import {
  loginUser,
  registerUser,
  getMe,
  updateProfile,
  requestPasswordReset,
  resetPassword,
  verifyEmail,
  resendVerificationCode,
  changePassword,
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";
import rateLimit from "express-rate-limit";

const authAttemptLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => `${req.ip}:${req.path}`,
  message: {
    success: false,
    message: "Too many attempts. Try again in 15 minutes.",
  },
});

const router = express.Router();

router.post("/register", authAttemptLimiter, registerUser);
router.post("/login", authAttemptLimiter, loginUser);
router.post("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerificationCode);
router.post("/forgot-password", requestPasswordReset);
router.post("/reset-password", resetPassword);
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);
router.put("/password", protect, changePassword);

export default router;
