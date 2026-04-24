// Leave API service for backend connection
import { getToken } from './authAPI';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

function getAuthHeaders() {
  const token = getToken();
  if (!token) throw new Error('No token found. Please login again.');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

/**
 * Get current user's leave balance
 * @returns {Promise} { success, data: { annual, sick, unpaid, ... } }
 */
export async function getLeaveBalance() {
  try {
    const response = await fetch(`${API_BASE_URL}/leaves/balance`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch leave balance');
    return { success: true, data: data.data || data };
  } catch (error) {
    console.error('getLeaveBalance error:', error);
    return { success: false, message: error.message, data: null };
  }
}

/**
 * List leave requests (with optional filters)
 * @param {Object} params - { page, limit, status, type, userId }
 * @returns {Promise} { success, data: array }
 */
export async function listLeaves(params = {}) {
  try {
    const sp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') sp.append(k, String(v));
    });
    const url = `${API_BASE_URL}/leaves${sp.toString() ? `?${sp.toString()}` : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to list leaves');
    const list = data.data?.leaves ?? data.data ?? (Array.isArray(data.data) ? data.data : []);
    return { success: true, data: Array.isArray(list) ? list : [], pagination: data.pagination };
  } catch (error) {
    console.error('listLeaves error:', error);
    return { success: false, data: [], message: error.message };
  }
}

/**
 * Create a leave request
 * @param {Object} body - { type, startDate, endDate, reason, ... }
 * @returns {Promise} { success, data }
 */
export async function createLeave(body) {
  try {
    const response = await fetch(`${API_BASE_URL}/leaves`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(body),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to create leave request');
    return { success: true, data: data.data || data };
  } catch (error) {
    console.error('createLeave error:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Approve a leave request
 * @param {string} leaveId - Leave request ID
 * @returns {Promise} { success, data }
 */
export async function approveLeave(leaveId) {
  try {
    const response = await fetch(`${API_BASE_URL}/leaves/${leaveId}/approve`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to approve leave');
    return { success: true, data: data.data || data };
  } catch (error) {
    console.error('approveLeave error:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Reject a leave request
 * @param {string} leaveId - Leave request ID
 * @param {string} reason - Rejection reason
 * @returns {Promise} { success, data }
 */
export async function rejectLeave(leaveId, reason) {
  try {
    const response = await fetch(`${API_BASE_URL}/leaves/${leaveId}/reject`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ reason: reason || '' }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to reject leave');
    return { success: true, data: data.data || data };
  } catch (error) {
    console.error('rejectLeave error:', error);
    return { success: false, message: error.message };
  }
}

/** Line manager: list direct reports’ leave requests */
export async function listTeamLeaves(params = {}) {
  try {
    const sp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') sp.append(k, String(v));
    });
    const url = `${API_BASE_URL}/leaves/team${sp.toString() ? `?${sp.toString()}` : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to list team leaves');
    const list = data.data?.leaves ?? data.data ?? (Array.isArray(data.data) ? data.data : []);
    return { success: true, data: Array.isArray(list) ? list : [], pagination: data.pagination };
  } catch (error) {
    console.error('listTeamLeaves error:', error);
    return { success: false, data: [], message: error.message };
  }
}

export async function managerApproveLeave(leaveId) {
  try {
    const response = await fetch(`${API_BASE_URL}/leaves/${leaveId}/manager-approve`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to approve leave');
    return { success: true, data: data.data || data };
  } catch (error) {
    console.error('managerApproveLeave error:', error);
    return { success: false, message: error.message };
  }
}

export async function managerRejectLeave(leaveId, reason) {
  try {
    const response = await fetch(`${API_BASE_URL}/leaves/${leaveId}/manager-reject`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ reason: reason || '' }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to reject leave');
    return { success: true, data: data.data || data };
  } catch (error) {
    console.error('managerRejectLeave error:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Get leave policies (for UI and leave type options)
 * @returns {Promise} { success, data: policies[] }
 */
export async function getLeavePolicies() {
  try {
    const response = await fetch(`${API_BASE_URL}/leaves/policies`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch policies');
    return { success: true, data: data.data || data };
  } catch (error) {
    console.error('getLeavePolicies error:', error);
    return { success: false, data: [], message: error.message };
  }
}

/**
 * Upload documents (e.g. medical certificate) to a leave request
 * @param {string} leaveId - Leave request ID
 * @param {FormData} formData - formData with 'documents' file(s)
 * @returns {Promise} { success, data }
 */
export async function uploadLeaveDocuments(leaveId, formData) {
  try {
    const token = getToken();
    if (!token) throw new Error('No token found. Please login again.');
    const response = await fetch(`${API_BASE_URL}/leaves/${leaveId}/documents`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      credentials: 'include',
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to upload documents');
    return { success: true, data: data.data || data };
  } catch (error) {
    console.error('uploadLeaveDocuments error:', error);
    return { success: false, message: error.message };
  }
}

/**
 * List documents for a leave request
 * @param {string} leaveId - Leave request ID
 * @returns {Promise} { success, data: { documents } }
 */
export async function getLeaveDocuments(leaveId) {
  try {
    const response = await fetch(`${API_BASE_URL}/leaves/${leaveId}/documents`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch documents');
    return { success: true, data: data.data || data };
  } catch (error) {
    console.error('getLeaveDocuments error:', error);
    return { success: false, data: { documents: [] }, message: error.message };
  }
}

/**
 * Get download URL for a leave document (use in new tab or anchor download)
 * @param {string} leaveId - Leave request ID
 * @param {string} filename - Document filename
 * @returns {string} URL with auth (use with fetch + Bearer for actual download)
 */
export function getLeaveDocumentDownloadUrl(leaveId, filename) {
  const base = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
  return `${base}/leaves/${leaveId}/documents/download/${encodeURIComponent(filename)}`;
}

/**
 * Download a leave document (opens in new tab; user must be logged in / cookie)
 * @param {string} leaveId - Leave request ID
 * @param {string} filename - Document filename
 * @param {string} displayName - Optional display name for file
 */
export async function downloadLeaveDocument(leaveId, filename, displayName) {
  const token = getToken();
  if (!token) throw new Error('No token found. Please login again.');
  const url = getLeaveDocumentDownloadUrl(leaveId, filename);
  const res = await fetch(url, {
    headers: { 'Authorization': `Bearer ${token}` },
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Download failed');
  const blob = await res.blob();
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = displayName || filename || 'document';
  a.click();
  URL.revokeObjectURL(a.href);
}

/**
 * HR/Admin: list all leaves with documents (certificates)
 * @returns {Promise} { success, data: array }
 */
export async function listCertificatesForHR() {
  try {
    const response = await fetch(`${API_BASE_URL}/leaves/documents/certificates`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch certificates');
    return { success: true, data: data.data || data };
  } catch (error) {
    console.error('listCertificatesForHR error:', error);
    return { success: false, data: [], message: error.message };
  }
}

/**
 * Leave reports summary for HR (by year)
 * @param {number} year - Year for report
 * @returns {Promise} { success, data }
 */
export async function getLeaveReportsSummary(year) {
  try {
    const y = year || new Date().getFullYear();
    const response = await fetch(`${API_BASE_URL}/leaves/reports/summary?year=${y}`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch report');
    return { success: true, data: data.data || data };
  } catch (error) {
    console.error('getLeaveReportsSummary error:', error);
    return { success: false, data: null, message: error.message };
  }
}

/**
 * Reschedule a pending leave (HR/Admin/Manager)
 * @param {string} leaveId - Leave request ID
 * @param {string} startDate - New start date (YYYY-MM-DD)
 * @param {string} endDate - New end date (YYYY-MM-DD)
 * @returns {Promise} { success, data }
 */
export async function rescheduleLeave(leaveId, startDate, endDate) {
  try {
    const response = await fetch(`${API_BASE_URL}/leaves/${leaveId}/reschedule`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ startDate, endDate }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to reschedule leave');
    return { success: true, data: data.data || data };
  } catch (error) {
    console.error('rescheduleLeave error:', error);
    return { success: false, message: error.message };
  }
}

/**
 * HR dashboard: total employees, stats, employee balances
 * @returns {Promise} { success, data }
 */
export async function getHRDashboard() {
  try {
    const response = await fetch(`${API_BASE_URL}/leaves/hr/dashboard`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch HR dashboard');
    return { success: true, data: data.data || data };
  } catch (error) {
    console.error('getHRDashboard error:', error);
    return { success: false, data: null, message: error.message };
  }
}

/**
 * HR: paginated employee leave balances
 * @param {number} page - Page number
 * @param {number} limit - Page size
 * @returns {Promise} { success, data, pagination }
 */
export async function getEmployeeBalances(page = 1, limit = 20) {
  try {
    const response = await fetch(`${API_BASE_URL}/leaves/hr/employee-balances?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch employee balances');
    return { success: true, data: data.data || [], pagination: data.pagination };
  } catch (error) {
    console.error('getEmployeeBalances error:', error);
    return { success: false, data: [], message: error.message };
  }
}

/**
 * HR: download leave report (CSV or JSON)
 * @param {number} year - Year
 * @param {string} format - 'csv' | 'json'
 * @returns {Promise} blob for CSV or { success, data } for JSON
 */
export async function getLeaveReportExport(year, format = 'csv') {
  const token = getToken();
  if (!token) throw new Error('No token found. Please login again.');
  const y = year || new Date().getFullYear();
  const url = `${process.env.REACT_APP_API_URL || 'http://localhost:3001/api'}/leaves/reports/export?year=${y}&format=${format}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` },
    credentials: 'include',
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || 'Export failed');
  }
  if (format === 'csv') {
    const blob = await response.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `leave-report-${y}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
    return { success: true };
  }
  const data = await response.json();
  return { success: true, data: data.data || data };
}
