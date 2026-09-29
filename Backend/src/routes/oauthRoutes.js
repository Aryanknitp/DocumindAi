import express from "express";
import passport from "passport";
import {
  googleCallback,
  githubCallback,
  getOAuthUser,
  logoutOAuth,
} from "../controllers/oauthController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();
const clientLoginUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/login`;

// Google OAuth
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: clientLoginUrl }),
  googleCallback,
);

// GitHub OAuth
router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] }),
);

router.get(
  "/github/callback",
  passport.authenticate("github", { failureRedirect: clientLoginUrl }),
  githubCallback,
);

// Get current OAuth user
router.get("/oauth/user", authenticateToken, getOAuthUser);

// Logout
router.post("/oauth/logout", authenticateToken, logoutOAuth);

export default router;
