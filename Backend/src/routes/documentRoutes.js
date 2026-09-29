import express from "express";
import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { protect } from "../middleware/auth.js";
import {
  uploadDocument,
  getDocuments,
  getDocumentById,
  extractDocumentText,
  deleteDocument,
  getFavoriteDocuments,
  getSharedDocuments,
  getTrashedDocuments,
  toggleFavorite,
  toggleShared,
  createShareLink,
  getSharedDocument,
  restoreDocument,
} from "../controllers/documentController.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), "uploads"));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
  ];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
    return;
  }
  cb(new Error("Unsupported file type"), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: Number(process.env.MAX_FILE_SIZE || 52428800) },
});

router.get("/shared/:token", getSharedDocument);
router.use(protect);
router.post("/upload", upload.single("file"), uploadDocument);
router.get("/favorites", getFavoriteDocuments);
router.get("/shared", getSharedDocuments);
router.get("/trash", getTrashedDocuments);
router.get("/", getDocuments);
router.patch("/:id/favorite", toggleFavorite);
router.patch("/:id/share", toggleShared);
router.post("/:id/share-link", createShareLink);
router.patch("/:id/restore", restoreDocument);
router.get("/:id", getDocumentById);
router.get("/:id/extract", extractDocumentText);
router.delete("/:id", deleteDocument);

export default router;
