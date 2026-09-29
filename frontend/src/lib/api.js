const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const getAuthHeaders = (withJson = true) => {
  const token = localStorage.getItem("documind_token");
  const headers = {};

  if (withJson) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

export async function apiRequest(endpoint, options = {}) {
  const { body, method = "GET", headers = {}, ...rest } = options;

  const isFormData =
    typeof FormData !== "undefined" && body instanceof FormData;

  const response = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers: isFormData
      ? { ...(headers || {}), ...getAuthHeaders(false) }
      : { ...getAuthHeaders(), ...headers },
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include",
    ...rest,
  });

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof payload === "string"
        ? payload
        : payload?.message || "Request failed";
    throw new Error(message);
  }

  return payload;
}

export const authApi = {
  register: (data) =>
    apiRequest("/auth/register", { method: "POST", body: data }),
  login: (data) => apiRequest("/auth/login", { method: "POST", body: data }),
  verifyEmail: (data) =>
    apiRequest("/auth/verify-email", { method: "POST", body: data }),
  resendVerification: (email) =>
    apiRequest("/auth/resend-verification", {
      method: "POST",
      body: { email },
    }),
  forgotPassword: (email) =>
    apiRequest("/auth/forgot-password", { method: "POST", body: { email } }),
  resetPassword: (data) =>
    apiRequest("/auth/reset-password", { method: "POST", body: data }),
  me: () => apiRequest("/auth/me"),
  updateProfile: (data) =>
    apiRequest("/auth/profile", { method: "PUT", body: data }),
  changePassword: (data) =>
    apiRequest("/auth/password", { method: "PUT", body: data }),
};

export const documentApi = {
  list: (scope = "") => apiRequest(`/documents${scope ? `/${scope}` : ""}`),
  upload: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return fetch(`${API_BASE}/documents/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("documind_token") || ""}`,
      },
      body: formData,
      credentials: "include",
    }).then(async (response) => {
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.message || "Upload failed");
      return payload;
    });
  },
  getById: (id) => apiRequest(`/documents/${id}`),
  extractText: (id) => apiRequest(`/documents/${id}/extract`),
  remove: (id) => apiRequest(`/documents/${id}`, { method: "DELETE" }),
  toggleFavorite: (id) =>
    apiRequest(`/documents/${id}/favorite`, { method: "PATCH" }),
  toggleShared: (id) =>
    apiRequest(`/documents/${id}/share`, { method: "PATCH" }),
  createShareLink: (id) =>
    apiRequest(`/documents/${id}/share-link`, { method: "POST" }),
  restore: (id) => apiRequest(`/documents/${id}/restore`, { method: "PATCH" }),
};

export const aiApi = {
  dashboard: () => apiRequest("/ai/dashboard"),
  generateSummary: (documentId, mode) =>
    apiRequest("/ai/summary", { method: "POST", body: { documentId, mode } }),
  sendChat: (payload) =>
    apiRequest("/ai/chat", { method: "POST", body: payload }),
  listSessions: () => apiRequest("/ai/chat/sessions"),
  deleteSession: (id) =>
    apiRequest(`/ai/chat/sessions/${id}`, { method: "DELETE" }),
  insights: (documentId) => apiRequest(`/pipeline/insights/${documentId}`),
  flashcards: (documentId) =>
    apiRequest("/pipeline/flashcards", {
      method: "POST",
      body: { documentId },
    }),
  quiz: (documentId) =>
    apiRequest("/pipeline/quiz", { method: "POST", body: { documentId } }),
  mindmap: (documentId) =>
    apiRequest("/pipeline/mindmap", { method: "POST", body: { documentId } }),
  notes: (documentId) =>
    apiRequest("/pipeline/notes", { method: "POST", body: { documentId } }),
  highlights: (documentId) => apiRequest(`/pipeline/highlights/${documentId}`),
  saveHighlight: (payload) =>
    apiRequest("/pipeline/highlights", { method: "POST", body: payload }),
  bookmarks: (documentId) => apiRequest(`/pipeline/bookmarks/${documentId}`),
  saveBookmark: (payload) =>
    apiRequest("/pipeline/bookmarks", { method: "POST", body: payload }),
  search: (query) =>
    apiRequest("/pipeline/search", { method: "POST", body: { query } }),
  translate: (documentId, language) =>
    apiRequest("/pipeline/translate", {
      method: "POST",
      body: { documentId, language },
    }),
};

export const userApi = {
  overview: () => apiRequest("/users/overview"),
  profile: () => apiRequest("/users/profile"),
  storage: () => apiRequest("/users/storage"),
  updateProfile: (data) =>
    apiRequest("/auth/profile", { method: "PUT", body: data }),
};

export const collectionApi = {
  list: () => apiRequest("/collections"),
  create: (data) => apiRequest("/collections", { method: "POST", body: data }),
  addDocument: (id, documentId) =>
    apiRequest(`/collections/${id}/documents`, {
      method: "POST",
      body: { documentId },
    }),
};

export const billingApi = {
  config: () => apiRequest("/billing/config"),
  createOrder: () => apiRequest("/billing/orders", { method: "POST" }),
  verify: (data) =>
    apiRequest("/billing/verify", { method: "POST", body: data }),
};

export const securityApi = {
  getComplianceStatus: () => apiRequest("/security/compliance/status"),
  getSecurityPosture: () => apiRequest("/security/posture"),
  exportUserData: () => apiRequest("/security/data/export"),
  deleteUserData: (password) =>
    apiRequest("/security/data/delete", {
      method: "POST",
      body: { confirmPassword: password },
    }),
  updateConsent: (consent) =>
    apiRequest("/security/consent", { method: "POST", body: { consent } }),
  getConsent: () => apiRequest("/security/consent"),
  encryptDocument: (data) =>
    apiRequest("/security/encrypt", { method: "POST", body: { data } }),
  decryptDocument: (encrypted) =>
    apiRequest("/security/decrypt", { method: "POST", body: { encrypted } }),
  getAuditLogs: () => apiRequest("/security/audit-logs"),
  anonymizeData: (type, value) =>
    apiRequest(`/security/anonymize?type=${type}&value=${value}`),
};
