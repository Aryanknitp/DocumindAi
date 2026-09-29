import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "documind_secret",
    );

    const user = await User.findById(decoded.userId || decoded.id).select(
      "-password",
    );

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    if (!token) {
      return next();
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "documind_secret",
    );
    const user = await User.findById(decoded.userId || decoded.id).select(
      "-password",
    );
    req.user = user || null;
    return next();
  } catch (error) {
    req.user = null;
    return next();
  }
};
