import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    filename: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      enum: ["pdf", "docx", "txt", "Document"],
      default: "pdf",
    },
    mimeType: {
      type: String,
      default: "application/pdf",
    },
    filePath: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["uploaded", "processing", "ready", "failed"],
      default: "uploaded",
    },
    extractedText: {
      type: String,
      default: "",
    },
    summary: {
      type: String,
      default: "",
    },
    pageCount: {
      type: Number,
      default: 0,
    },
    tags: [{ type: String }],
    isFavorite: { type: Boolean, default: false },
    isShared: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  },
);

const Document = mongoose.model("Document", documentSchema);

export default Document;
