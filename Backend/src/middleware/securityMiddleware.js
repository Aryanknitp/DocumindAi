import securityService from "../services/securityService.js";
import rateLimit from "express-rate-limit";
import AuditLog from "../models/AuditLog.js";

/**
 * Compliance & Security Middleware
 */

// Middleware to add security headers
export const securityHeaders = (req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  if (process.env.NODE_ENV === "production") {
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains",
    );
  }
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
  );
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader(
    "Permissions-Policy",
    "geolocation=(), microphone=(), camera=(), payment=()",
  );
  next();
};

// Middleware to create audit logs
export const auditLog = (action, resourceType) => {
  return (req, res, next) => {
    res.on("finish", () => {
      if (res.statusCode < 400 && req.user) {
        AuditLog.create({
          action,
          userId: req.user._id,
          resourceType,
          resourceId: req.params.id || req.body?.id || "unknown",
          ipAddress: req.ip || req.socket.remoteAddress || "unknown",
          userAgent: req.headers["user-agent"] || "unknown",
          status: "success",
        }).catch((error) => console.error("Audit log failed:", error.message));
      }
    });

    next();
  };
};

// Middleware to enforce GDPR/CCPA consent
export const requireConsent = (consentType) => {
  return (req, res, next) => {
    const userConsent = req.user?.consent || {};

    if (!userConsent[consentType]) {
      return res.status(403).json({
        success: false,
        message: `User consent required for ${consentType}`,
        requiredConsent: consentType,
      });
    }

    next();
  };
};

// Middleware to sanitize inputs
export const sanitizeInputs = (req, res, next) => {
  if (req.body) {
    Object.keys(req.body).forEach((key) => {
      if (typeof req.body[key] === "string") {
        req.body[key] = securityService.sanitizeInput(req.body[key]);
      }
    });
  }

  if (req.query) {
    Object.keys(req.query).forEach((key) => {
      if (typeof req.query[key] === "string") {
        req.query[key] = securityService.sanitizeInput(req.query[key]);
      }
    });
  }

  next();
};

// Middleware to encrypt sensitive response data
export const encryptSensitiveData = (req, res, next) => {
  const originalSend = res.send;

  res.send = function (data) {
    if (
      req.query.encrypted === "true" &&
      res.statusCode === 200 &&
      typeof data === "string"
    ) {
      try {
        const parsed = JSON.parse(data);
        const encrypted = {
          data: securityService.encrypt(parsed),
          encrypted: true,
          algorithm: "aes-256-gcm",
        };
        res.setHeader("Content-Type", "application/json");
        return originalSend.call(this, JSON.stringify(encrypted));
      } catch (error) {
        console.error("Encryption failed:", error);
      }
    }

    return originalSend.call(this, data);
  };

  next();
};

/**
 * Rate limiting for security-sensitive endpoints
 */
const securityRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many security requests. Try again later.",
  },
});

export const rateLimitSecurity = (req, res, next) =>
  securityRateLimiter(req, res, next);

export default {
  securityHeaders,
  auditLog,
  requireConsent,
  sanitizeInputs,
  encryptSensitiveData,
  rateLimitSecurity,
};
