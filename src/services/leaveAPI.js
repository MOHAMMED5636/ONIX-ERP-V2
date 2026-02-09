import { apiClient } from '../utils/apiClient';

export const getLeaveBalance = () => apiClient.get('/leaves/balance');

export const listLeaves = (params = {}) => {
  const q = new URLSearchParams(params).toString();
  return apiClient.get(`/leaves${q ? `?${q}` : ''}`);
};

export const getLeaveById = (id) => apiClient.get(`/leaves/${id}`);

export const createLeave = (data) =>
  apiClient.post('/leaves', {
    type: data.type,
    startDate: data.startDate,
    endDate: data.endDate,
    reason: data.reason,
    attachments: data.attachments || null,
  });

export const approveLeave = (id) => apiClient.post(`/leaves/${id}/approve`);
export const rejectLeave = (id, reason) =>
  apiClient.post(`/leaves/${id}/reject`, reason ? { reason } : {});
