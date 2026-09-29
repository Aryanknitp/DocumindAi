import { useState, useEffect } from "react";
import { useSecurity } from "../context/SecurityContext";
import {
  Shield,
  Lock,
  FileText,
  CheckCircle,
  AlertCircle,
  Download,
  Trash2,
} from "lucide-react";

export default function SecurityFeatures() {
  const {
    compliance,
    securityPosture,
    consent,
    isLoading,
    updateConsent,
    exportData,
    deleteAccount,
  } = useSecurity();

  const [showConsentModal, setShowConsentModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleConsentChange = async (category, value) => {
    try {
      const newConsent = { ...consent, [category]: value };
      await updateConsent(newConsent);
      setSuccess(`Consent updated for ${category}`);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleExportData = async () => {
    try {
      setError("");
      const data = await exportData();
      // Trigger download
      const element = document.createElement("a");
      element.setAttribute(
        "href",
        "data:text/json;charset=utf-8," +
          encodeURIComponent(JSON.stringify(data, null, 2)),
      );
      element.setAttribute("download", "my-data.json");
      element.style.display = "none";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      setSuccess("Data exported successfully");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setError("");
      if (!password) {
        setError("Password is required");
        return;
      }
      await deleteAccount(password);
      setSuccess("Account scheduled for deletion in 30 days");
      setShowDeleteModal(false);
      setPassword("");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-blue-500" />
            <h1 className="text-4xl font-bold text-white">
              Enterprise Security
            </h1>
          </div>
          <p className="text-gray-400">Your documents are safe with us</p>
        </div>

        {/* Main Security Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Left Column */}
          <div className="space-y-6">
            {/* AES-256 Encryption */}
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 hover:border-blue-500 transition">
              <div className="flex items-start gap-3 mb-3">
                <Lock className="w-6 h-6 text-blue-400 shrink-0 mt-1" />
                <h2 className="text-xl font-bold text-white">
                  AES-256 Encryption
                </h2>
              </div>
              <p className="text-gray-400 ml-9">
                {securityPosture?.encryption?.status === "ACTIVE"
                  ? "Active encryption protects sensitive data"
                  : "Encryption status unavailable"}
              </p>
            </div>

            {/* Zero-Knowledge Storage */}
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 hover:border-purple-500 transition">
              <div className="flex items-start gap-3 mb-3">
                <Shield className="w-6 h-6 text-purple-400 shrink-0 mt-1" />
                <h2 className="text-xl font-bold text-white">
                  Zero-Knowledge Storage
                </h2>
              </div>
              <p className="text-gray-400 ml-9">
                {securityPosture?.dataProtection?.status === "ACTIVE"
                  ? "Protected data storage and access controls are active"
                  : "Protection status unavailable"}
              </p>
            </div>

            {/* GDPR & CCPA Compliance */}
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 hover:border-green-500 transition">
              <div className="flex items-start gap-3 mb-3">
                <FileText className="w-6 h-6 text-green-400 shrink-0 mt-1" />
                <h2 className="text-xl font-bold text-white">
                  GDPR & CCPA Compliant
                </h2>
              </div>
              <p className="text-gray-400 ml-9">
                Full regulatory compliance globally
              </p>
            </div>
          </div>

          {/* Right Column - Compliance Badges */}
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-8">
            <div className="flex justify-center mb-6">
              <div className="relative w-24 h-24 bg-linear-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/50">
                <Shield className="w-12 h-12 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-center text-white mb-6">
              Security Posture
            </h3>
            <p className="text-gray-400 text-center mb-8">
              Current controls and compliance configuration
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-700 rounded px-3 py-2 text-center">
                <p className="text-xs text-gray-400 mb-1">GDPR</p>
                {securityPosture?.compliance?.gdpr?.compliant ? (
                  <CheckCircle className="w-5 h-5 text-green-400 mx-auto" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-400 mx-auto" />
                )}
              </div>
              <div className="bg-slate-700 rounded px-3 py-2 text-center">
                <p className="text-xs text-gray-400 mb-1">CCPA</p>
                {securityPosture?.compliance?.ccpa?.compliant ? (
                  <CheckCircle className="w-5 h-5 text-green-400 mx-auto" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-400 mx-auto" />
                )}
              </div>
              <div className="bg-slate-700 rounded px-3 py-2 text-center">
                <p className="text-xs text-gray-400 mb-1">HIPAA Ready</p>
                {securityPosture?.compliance?.hipaa?.ready ? (
                  <CheckCircle className="w-5 h-5 text-green-400 mx-auto" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-400 mx-auto" />
                )}
              </div>
              <div className="bg-slate-700 rounded px-3 py-2 text-center">
                <p className="text-xs text-gray-400 mb-1">ISO 27001</p>
                {securityPosture?.compliance?.iso27001?.features ? (
                  <CheckCircle className="w-5 h-5 text-green-400 mx-auto" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-400 mx-auto" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Consent Management */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-500" />
            Privacy & Consent
          </h2>

          <div className="space-y-4">
            {Object.entries(consent).map(([category, isGranted]) => (
              <div
                key={category}
                className="flex items-center justify-between p-4 bg-slate-700 rounded-lg"
              >
                <div>
                  <p className="font-medium text-white capitalize">
                    {category}
                  </p>
                  <p className="text-sm text-gray-400">
                    {category === "essential" &&
                      "Required for platform functionality"}
                    {category === "marketing" &&
                      "Help us improve with personalized content"}
                    {category === "analytics" &&
                      "Understand how you use our platform"}
                    {category === "preferences" &&
                      "Save your preferences and settings"}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isGranted}
                    disabled={category === "essential"}
                    onChange={(e) =>
                      handleConsentChange(category, e.target.checked)
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Data Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Export Data */}
          <button
            onClick={handleExportData}
            disabled={isLoading}
            className="bg-linear-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:opacity-50 text-white font-bold py-4 px-6 rounded-lg flex items-center justify-center gap-2 transition"
          >
            <Download className="w-5 h-5" />
            Export My Data (GDPR)
          </button>

          {/* Delete Account */}
          <button
            onClick={() => setShowDeleteModal(true)}
            className="bg-linear-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-4 px-6 rounded-lg flex items-center justify-center gap-2 transition"
          >
            <Trash2 className="w-5 h-5" />
            Delete My Account (GDPR)
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-500 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-900/30 border border-green-500 rounded-lg flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
            <p className="text-green-200">{success}</p>
          </div>
        )}

        {/* Compliance Info */}
        {compliance && (
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
            <h3 className="text-xl font-bold text-white mb-4">
              Compliance Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-700 rounded p-3">
                <p className="text-xs text-gray-400 mb-1">Encryption</p>
                <p className="text-sm font-medium text-white">
                  {compliance.dataEncryption}
                </p>
              </div>
              <div className="bg-slate-700 rounded p-3">
                <p className="text-xs text-gray-400 mb-1">Key Derivation</p>
                <p className="text-sm font-medium text-white">
                  {compliance.keyDerivation}
                </p>
              </div>
              <div className="bg-slate-700 rounded p-3">
                <p className="text-xs text-gray-400 mb-1">Audit Logging</p>
                <p className="text-sm font-medium text-white">
                  {compliance.auditLogging ? "Enabled" : "Disabled"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-lg border border-slate-700 max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-white mb-4">
              Delete Account
            </h3>
            <p className="text-gray-400 mb-4">
              This action will schedule your account for deletion in 30 days.
              You can cancel this within the 30-day period.
            </p>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                placeholder="Enter your password"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setPassword("");
                  setError("");
                }}
                className="flex-1 px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 transition"
              >
                {isLoading ? "Processing..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
