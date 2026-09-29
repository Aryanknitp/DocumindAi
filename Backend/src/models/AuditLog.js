import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    action: { type: String, required: true },
    resourceType: { type: String, required: true },
    resourceId: { type: String, default: "unknown" },
    ipAddress: { type: String, default: "unknown" },
    userAgent: { type: String, default: "unknown" },
    status: { type: String, default: "success" },
    details: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

export default mongoose.model("AuditLog", auditLogSchema);
