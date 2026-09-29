import User from "../models/User.js";
import jwt from "jsonwebtoken";

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || "your_secret_key", {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

export const googleCallback = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication failed" });
    }

    const token = generateToken(user._id);

    const frontendUrl = process.env.CLIENT_URL || "http://localhost:5173";
    return res.redirect(
      `${frontendUrl}/auth-callback?token=${token}&userId=${user._id}&provider=google`,
    );
  } catch (error) {
    console.error("Google callback error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const githubCallback = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication failed" });
    }

    const token = generateToken(user._id);

    const frontendUrl = process.env.CLIENT_URL || "http://localhost:5173";
    return res.redirect(
      `${frontendUrl}/auth-callback?token=${token}&userId=${user._id}&provider=github`,
    );
  } catch (error) {
    console.error("GitHub callback error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getOAuthUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    return res.status(200).json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const logoutOAuth = async (req, res) => {
  try {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ success: false, message: err.message });
      }
      return res
        .status(200)
        .json({ success: true, message: "Logged out successfully" });
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
