import mongoose from "mongoose";

const collectionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    documentIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Document" }],
  },
  { timestamps: true },
);

export default mongoose.model("Collection", collectionSchema);
