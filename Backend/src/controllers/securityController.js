import User from "../models/User.js";
import Document from "../models/Document.js";
import Activity from "../models/Activity.js";
import AuditLog from "../models/AuditLog.js";
import securityService from "../services/securityService.js";

/**
 * Security & Compliance Controller
 * Handles:
 * - Compliance status checks
 * - GDPR data export
 * - Data deletion (right to be forgotten)
 * - Consent management
 * - Security audit trails
 */

export const getComplianceStatus = async (req, res) => {
  try {
    const status = securityService.getComplianceStatus();
    res.status(200).json({
      success: true,
      message: "Compliance status retrieved",
      compliance: status,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get security posture for the platform
 */
export const getSecurityPosture = async (req, res) => {
  try {
    const posture = {
      encryption: {
        algorithm: "AES-256-GCM",
        keyDerivation: "PBKDF2-SHA256",
        saltLength: 16,
        iterations: 100000,
        status: "ACTIVE",
      },
      dataProtection: {
        zeroKnowledge: false,
        endToEndEncryption: false,
        clientSideEncryption: false,
        status: "ACTIVE",
        note: "Server-side encryption is available for protected payloads; transport security must be enabled in production.",
      },
      compliance: {
        gdpr: {
          compliant: false,
          features: [
            "Data portability",
            "Right to erasure",
            "Data access requests",
            "Consent management",
          ],
        },
        ccpa: {
          compliant: false,
          features: [
            "Opt-out mechanism",
            "Data access",
            "Deletion requests",
            "Privacy disclosure",
          ],
        },
        hipaa: {
          ready: true,
          features: ["Audit logs", "Access controls", "Data encryption"],
        },
        soc2TypeII: {
          compliant: false,
          lastAudit: new Date().toISOString(),
        },
        iso27001: {
          compliant: false,
          features: ["Information security management", "Risk assessment"],
        },
      },
      authentication: {
        method: "JWT + Passport OAuth",
        mfa: "Supported",
        oauth: ["Google", "GitHub"],
      },
      auditLogging: {
        enabled: true,
        retentionDays: 365,
        logged: ["READ", "CREATE", "UPDATE", "DELETE"],
      },
    };

    res.status(200).json({
      success: true,
      message: "Security posture retrieved",
      posture,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Export user data (GDPR Article 20 - Right to Data Portability)
 */
export const exportUserData = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const [user, documents, activities] = await Promise.all([
      User.findById(req.user._id).select("-password").lean(),
      Document.find({ userId: req.user._id }).select("-__v").lean(),
      Activity.find({ userId: req.user._id }).select("-__v").lean(),
    ]);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    user.documents = documents;
    user.activities = activities;

    const exportData = securityService.generateDataExport(user);

    res.status(200).json({
      success: true,
      message: "Data export successful",
      data: exportData,
      exportedAt: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Delete user data (GDPR Article 17 - Right to Erasure / CCPA - Deletion)
 */
export const deleteUserData = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { confirmPassword } = req.body;
    if (!confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password confirmation required",
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    const isPasswordValid = await user.comparePassword(confirmPassword);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    // Schedule deletion for 30 days later (GDPR grace period)
    user.scheduledForDeletion = true;
    user.deletionScheduledAt = new Date();
    user.deletionDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Account scheduled for deletion in 30 days",
      deletionDate: user.deletionDate,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Update user consent preferences
 */
export const updateConsent = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { consent } = req.body;

    if (!consent || typeof consent !== "object") {
      return res.status(400).json({
        success: false,
        message: "Invalid consent object",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        consent: {
          essential: consent.essential !== false, // Always true
          marketing: consent.marketing || false,
          analytics: consent.analytics || false,
          preferences: consent.preferences || false,
          consentUpdatedAt: new Date(),
        },
      },
      { new: true },
    ).select("-password");

    res.status(200).json({
      success: true,
      message: "Consent preferences updated",
      consent: user.consent,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get user consent preferences
 */
export const getConsent = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const user = await User.findById(req.user._id).select("consent");

    res.status(200).json({
      success: true,
      consent: user.consent || {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Encrypt sensitive document
 */
export const encryptDocument = async (req, res) => {
  try {
    const { documentId, data } = req.body;

    if (!data) {
      return res.status(400).json({
        success: false,
        message: "No data to encrypt",
      });
    }

    const encrypted = securityService.encrypt(data);

    res.status(200).json({
      success: true,
      message: "Data encrypted successfully",
      encrypted,
      algorithm: "AES-256-GCM",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Decrypt sensitive document
 */
export const decryptDocument = async (req, res) => {
  try {
    const { encrypted } = req.body;

    if (!encrypted) {
      return res.status(400).json({
        success: false,
        message: "No encrypted data provided",
      });
    }

    const decrypted = securityService.decrypt(encrypted);

    res.status(200).json({
      success: true,
      message: "Data decrypted successfully",
      data: decrypted,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get audit logs (admin only)
 */
export const getAuditLogs = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const auditLogs = await AuditLog.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    res.status(200).json({
      success: true,
      message: "Audit logs retrieved",
      logs: auditLogs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Anonymize user data in reports
 */
export const anonymizeData = async (req, res) => {
  try {
    const { type, value } = req.query;

    if (!type || !value) {
      return res.status(400).json({
        success: false,
        message: "Type and value required",
      });
    }

    let anonymized;
    switch (type) {
      case "email":
        anonymized = securityService.anonymizeEmail(value);
        break;
      case "phone":
        anonymized = securityService.anonymizePhone(value);
        break;
      case "ssn":
        anonymized = securityService.anonymizeSSN(value);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: "Unknown anonymization type",
        });
    }

    res.status(200).json({
      success: true,
      original: `${type}:***`,
      anonymized,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export default {
  getComplianceStatus,
  getSecurityPosture,
  exportUserData,
  deleteUserData,
  updateConsent,
  getConsent,
  encryptDocument,
  decryptDocument,
  getAuditLogs,
  anonymizeData,
};
