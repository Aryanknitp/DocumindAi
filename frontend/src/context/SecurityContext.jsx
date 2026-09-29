import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { securityApi } from "../lib/api";

const SecurityContext = createContext(null);

export function SecurityProvider({ children }) {
  const [compliance, setCompliance] = useState(null);
  const [securityPosture, setSecurityPosture] = useState(null);
  const [consent, setConsent] = useState({
    essential: true,
    marketing: false,
    analytics: false,
    preferences: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);

  // Fetch compliance status
  const fetchCompliance = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await securityApi.getComplianceStatus();
      setCompliance(response.compliance);
    } catch (error) {
      console.error("Failed to fetch compliance status:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch security posture
  const fetchSecurityPosture = useCallback(async () => {
    if (!localStorage.getItem("documind_token")) return;
    try {
      setIsLoading(true);
      const response = await securityApi.getSecurityPosture();
      setSecurityPosture(response.posture);
    } catch (error) {
      console.error("Failed to fetch security posture:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch user consent
  const fetchConsent = useCallback(async () => {
    if (!localStorage.getItem("documind_token")) return;
    try {
      const response = await securityApi.getConsent();
      setConsent(response.consent || {});
    } catch (error) {
      console.error("Failed to fetch consent:", error);
    }
  }, []);

  // Update consent
  const updateConsent = useCallback(async (newConsent) => {
    try {
      setIsLoading(true);
      const response = await securityApi.updateConsent(newConsent);
      setConsent(response.consent);
      return response;
    } catch (error) {
      console.error("Failed to update consent:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Export user data (GDPR)
  const exportData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await securityApi.exportUserData();
      return response.data;
    } catch (error) {
      console.error("Failed to export data:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Delete user account (GDPR)
  const deleteAccount = useCallback(async (password) => {
    try {
      setIsLoading(true);
      const response = await securityApi.deleteUserData(password);
      return response;
    } catch (error) {
      console.error("Failed to delete account:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Encrypt data
  const encryptData = useCallback(async (data) => {
    try {
      const response = await securityApi.encryptDocument(data);
      return response.encrypted;
    } catch (error) {
      console.error("Failed to encrypt data:", error);
      throw error;
    }
  }, []);

  // Decrypt data
  const decryptData = useCallback(async (encrypted) => {
    try {
      const response = await securityApi.decryptDocument(encrypted);
      return response.data;
    } catch (error) {
      console.error("Failed to decrypt data:", error);
      throw error;
    }
  }, []);

  // Fetch audit logs
  const fetchAuditLogs = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await securityApi.getAuditLogs();
      setAuditLogs(response.logs || []);
    } catch (error) {
      console.error("Failed to fetch audit logs:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load initial data on mount
  useEffect(() => {
    fetchCompliance();
    fetchSecurityPosture();
    fetchConsent();
  }, [fetchCompliance, fetchSecurityPosture, fetchConsent]);

  const value = {
    compliance,
    securityPosture,
    consent,
    isLoading,
    auditLogs,
    fetchCompliance,
    fetchSecurityPosture,
    fetchConsent,
    updateConsent,
    exportData,
    deleteAccount,
    encryptData,
    decryptData,
    fetchAuditLogs,
  };

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
}

export const useSecurity = () => {
  const ctx = useContext(SecurityContext);
  if (!ctx) throw new Error("useSecurity must be inside SecurityProvider");
  return ctx;
};
