import fs from "fs";
import path from "path";
import Document from "../models/Document.js";
import Activity from "../models/Activity.js";
import { extractFileText } from "../services/documentTextService.js";
import crypto from "crypto";

const ensureUploadFolder = (folderPath) => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
};

export const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    const uploadDir = path.join(process.cwd(), "uploads");
    ensureUploadFolder(uploadDir);

    const fileExt = path.extname(req.file.originalname).toLowerCase();
    const fileType =
      fileExt === ".pdf" ? "pdf" : fileExt === ".docx" ? "docx" : "txt";
    const extractedText = await extractFileText(
      req.file.path,
      req.file.originalname,
    );

    const document = await Document.create({
      userId: req.user._id,
      title: req.file.originalname.replace(
        path.extname(req.file.originalname),
        "",
      ),
      filename: req.file.filename,
      originalName: req.file.originalname,
      fileType,
      mimeType: req.file.mimetype,
      filePath: req.file.path,
      size: req.file.size,
      extractedText,
      status: extractedText ? "ready" : "uploaded",
    });

    await Activity.create({
      userId: req.user._id,
      type: "upload",
      title: "Document uploaded",
      description: `Uploaded ${req.file.originalname}`,
      metadata: { documentId: document._id },
    });

    return res.status(201).json({
      success: true,
      message: "File uploaded successfully",
      document,
    });
  } catch (error) {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      await fs.promises.unlink(req.file.path).catch(() => {});
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getDocuments = async (req, res) => {
  try {
    const documents = await Document.find({
      userId: req.user._id,
      deletedAt: null,
    }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, documents });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getFavoriteDocuments = async (req, res) => {
  try {
    const documents = await Document.find({
      userId: req.user._id,
      isFavorite: true,
      deletedAt: null,
    }).sort({ updatedAt: -1 });
    return res.status(200).json({ success: true, documents });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getSharedDocuments = async (req, res) => {
  try {
    const documents = await Document.find({
      userId: req.user._id,
      isShared: true,
      deletedAt: null,
    }).sort({ updatedAt: -1 });
    return res.status(200).json({ success: true, documents });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getTrashedDocuments = async (req, res) => {
  try {
    const documents = await Document.find({
      userId: req.user._id,
      deletedAt: { $ne: null },
    }).sort({ deletedAt: -1 });
    return res.status(200).json({ success: true, documents });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleFavorite = async (req, res) => {
  const document = await Document.findOne({
    _id: req.params.id,
    userId: req.user._id,
    deletedAt: null,
  });
  if (!document)
    return res
      .status(404)
      .json({ success: false, message: "Document not found" });
  document.isFavorite = !document.isFavorite;
  await document.save();
  return res
    .status(200)
    .json({ success: true, isFavorite: document.isFavorite });
};

export const toggleShared = async (req, res) => {
  const document = await Document.findOne({
    _id: req.params.id,
    userId: req.user._id,
    deletedAt: null,
  });
  if (!document)
    return res
      .status(404)
      .json({ success: false, message: "Document not found" });
  document.isShared = !document.isShared;
  await document.save();
  return res.status(200).json({ success: true, isShared: document.isShared });
};

export const createShareLink = async (req, res) => {
  const document = await Document.findOne({
    _id: req.params.id,
    userId: req.user._id,
    deletedAt: null,
  });
  if (!document)
    return res
      .status(404)
      .json({ success: false, message: "Document not found" });

  const token = crypto.randomBytes(24).toString("hex");
  document.isShared = true;
  document.metadata = document.metadata || {};
  document.metadata.shareToken = token;
  await document.save();
  return res.status(200).json({
    success: true,
    shareUrl: `${process.env.CLIENT_URL || "http://localhost:5173"}/shared/${token}`,
  });
};

export const getSharedDocument = async (req, res) => {
  const document = await Document.findOne({
    "metadata.shareToken": req.params.token,
    isShared: true,
    deletedAt: null,
  }).select("title originalName fileType size summary extractedText createdAt");
  if (!document)
    return res
      .status(404)
      .json({ success: false, message: "Shared document not found" });
  return res.status(200).json({ success: true, document });
};

export const restoreDocument = async (req, res) => {
  const document = await Document.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });
  if (!document)
    return res
      .status(404)
      .json({ success: false, message: "Document not found" });
  document.deletedAt = null;
  document.status = "ready";
  await document.save();
  return res.status(200).json({ success: true, document });
};

export const getDocumentById = async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!document) {
      return res
        .status(404)
        .json({ success: false, message: "Document not found" });
    }

    return res.status(200).json({ success: true, document });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const extractDocumentText = async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!document) {
      return res
        .status(404)
        .json({ success: false, message: "Document not found" });
    }

    if (document.extractedText) {
      return res
        .status(200)
        .json({ success: true, text: document.extractedText });
    }

    if (!fs.existsSync(document.filePath)) {
      return res
        .status(404)
        .json({ success: false, message: "File missing on disk" });
    }

    const extractedText = await extractFileText(
      document.filePath,
      document.originalName,
    );

    document.extractedText = extractedText;
    document.status = "ready";
    await document.save();

    return res.status(200).json({ success: true, text: extractedText });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!document) {
      return res
        .status(404)
        .json({ success: false, message: "Document not found" });
    }

    document.deletedAt = new Date();
    document.status = "failed";
    await document.save();

    return res
      .status(200)
      .json({ success: true, message: "Document moved to trash" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
