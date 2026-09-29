import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import session from "express-session";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import connectDB from "./config/database.js";
import passport from "./config/passport.js";
import authRoutes from "./routes/authRoutes.js";
import oauthRoutes from "./routes/oauthRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import pipelineRoutes from "./routes/pipelineRoutes.js";
import securityRoutes from "./routes/securityRoutes.js";
import collectionRoutes from "./routes/collectionRoutes.js";
import billingRoutes from "./routes/billingRoutes.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";
import { securityHeaders } from "./middleware/securityMiddleware.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow all localhost variants in development
      if (process.env.NODE_ENV !== "production") {
        return callback(null, true);
      }
      // In production, only allow configured CLIENT_URL
      const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
      if (origin === clientUrl) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

// Apply security headers globally
app.use(securityHeaders);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

// Session middleware for Passport
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your_session_secret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === "production", httpOnly: true },
  }),
);

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", apiLimiter);

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Documind Ai backend is running",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/auth", oauthRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/pipeline", pipelineRoutes);
app.use("/api/users", userRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/security", securityRoutes);
app.use("/api/collections", collectionRoutes);
app.use("/api/billing", billingRoutes);

app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running`);
    console.log(
      `🔒 Security features enabled: AES-256 Encryption, GDPR/CCPA Compliance`,
    );
  });
};

startServer();

export default app;
