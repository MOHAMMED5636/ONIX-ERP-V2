import { apiClient } from "../utils/apiClient";

export const EmailManagementAPI = {
  // Templates
  listTemplates: async () => apiClient.get("/emails/templates"),
  createTemplate: async (payload) => apiClient.post("/emails/templates", payload),
  updateTemplate: async (id, payload) => apiClient.patch(`/emails/templates/${encodeURIComponent(id)}`, payload),
  deleteTemplate: async (id) => apiClient.delete(`/emails/templates/${encodeURIComponent(id)}`),
  testTemplate: async (id, payload) => apiClient.post(`/emails/templates/${encodeURIComponent(id)}/test`, payload),

  // Triggers
  listTriggers: async () => apiClient.get("/emails/triggers"),
  createTrigger: async (payload) => apiClient.post("/emails/triggers", payload),
  updateTrigger: async (id, payload) => apiClient.patch(`/emails/triggers/${encodeURIComponent(id)}`, payload),
  deleteTrigger: async (id) => apiClient.delete(`/emails/triggers/${encodeURIComponent(id)}`),

  // Logs
  listLogs: async (params = {}) => {
    const q = new URLSearchParams();
    if (params.page != null) q.set("page", String(params.page));
    if (params.limit != null) q.set("limit", String(params.limit));
    if (params.status) q.set("status", String(params.status));
    if (params.q) q.set("q", String(params.q));
    return apiClient.get(`/emails/logs${q.toString() ? `?${q.toString()}` : ""}`);
  },

  // Queue
  listQueue: async (params = {}) => {
    const q = new URLSearchParams();
    if (params.status) q.set("status", String(params.status));
    return apiClient.get(`/emails/queue${q.toString() ? `?${q.toString()}` : ""}`);
  },
  retryQueueItem: async (id) => apiClient.post(`/emails/queue/${encodeURIComponent(id)}/retry`, {}),
};

