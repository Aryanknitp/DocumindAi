import express from "express";
import securityController from "../controllers/securityController.js";
import { protect } from "../middleware/auth.js";
import {
  securityHeaders,
  auditLog,
  sanitizeInputs,
  rateLimitSecurity,
} from "../middleware/securityMiddleware.js";

const router = express.Router();

// Apply security headers and input sanitization to all routes
router.use(securityHeaders);
router.use(sanitizeInputs);

// Public compliance endpoints
router.get("/compliance/status", securityController.getComplianceStatus);
router.get("/posture", protect, securityController.getSecurityPosture);

// Protected GDPR/CCPA endpoints
router.get(
  "/data/export",
  protect,
  auditLog("EXPORT", "user_data"),
  securityController.exportUserData,
);

router.post(
  "/data/delete",
  protect,
  auditLog("DELETE", "user_account"),
  securityController.deleteUserData,
);

router.post(
  "/consent",
  protect,
  rateLimitSecurity,
  auditLog("UPDATE", "user_consent"),
  securityController.updateConsent,
);

router.get("/consent", protect, securityController.getConsent);

// Encryption/Decryption endpoints
router.post(
  "/encrypt",
  protect,
  rateLimitSecurity,
  securityController.encryptDocument,
);
router.post(
  "/decrypt",
  protect,
  rateLimitSecurity,
  securityController.decryptDocument,
);

// Audit logs (admin only)
router.get("/audit-logs", protect, securityController.getAuditLogs);

// Data anonymization utilities
router.get("/anonymize", protect, securityController.anonymizeData);

export default router;
