import { getToken } from './authAPI';
import { getApiBaseUrl } from '../config/apiBaseUrl';

/**
 * Policy API base (no trailing slash) — same as main ERP `/api`.
 * Company policies are served by the Onix backend at `/api/policies` (no separate port 3010 server).
 * Override only if needed: REACT_APP_POLICIES_USE_DIRECT=1 and REACT_APP_POLICIES_API_URL=https://host/api
 */
function getPoliciesApiBase() {
  const useDirect = process.env.REACT_APP_POLICIES_USE_DIRECT === '1';
  const direct = process.env.REACT_APP_POLICIES_API_URL;
  if (useDirect && direct) {
    return direct.replace(/\/$/, '');
  }
  if (process.env.NODE_ENV === 'development') {
    return getApiBaseUrl();
  }
  const explicit = process.env.REACT_APP_POLICIES_API_URL;
  if (explicit) return explicit.replace(/\/$/, '');
  return getApiBaseUrl();
}

const API_BASE_URL = getPoliciesApiBase();

function authHeaders() {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/**
 * GET /policies — all active policies; each includes per-user acknowledgment status.
 * @returns {Promise<{ success: boolean, data?: { policies: object[] }, message?: string }>}
 */
export async function fetchPolicies() {
  const response = await fetch(`${API_BASE_URL}/policies`, {
    method: 'GET',
    headers: authHeaders(),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    let msg = data.message || `Failed to load policies (${response.status})`;
    if (
      process.env.NODE_ENV === 'development' &&
      (response.status === 404 || response.status === 502 || response.status === 504)
    ) {
      msg +=
        ' Ensure the Onix backend is running and `npx prisma migrate deploy` applied (company_policies tables). REACT_APP_API_URL must point at your API (e.g. http://192.168.x.x:3001/api).';
    }
    throw new Error(msg);
  }
  return data;
}

export async function createPolicy(body) {
  const hasFile = body && body.file instanceof File;
  const payload = hasFile ? new FormData() : JSON.stringify(body);
  if (hasFile) {
    payload.append('title', body.title || '');
    payload.append('description', body.description || '');
    payload.append('department', body.department || '');
    payload.append('fileType', body.fileType || '');
    payload.append('fileSize', body.fileSize || '');
    payload.append('file', body.file);
  }

  const response = await fetch(`${API_BASE_URL}/policies`, {
    method: 'POST',
    headers: hasFile ? { ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}) } : authHeaders(),
    body: payload,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    let msg = data.message || `Create failed (${response.status})`;
    if (
      process.env.NODE_ENV === 'development' &&
      (response.status === 404 || response.status === 502 || response.status === 504)
    ) {
      msg +=
        ' Check REACT_APP_API_URL matches your backend and that /api/policies exists (run DB migrations on the backend).';
    }
    throw new Error(msg);
  }
  return data;
}

/**
 * Fetch the attached policy file as a Blob (authenticated).
 * @returns {Promise<{ blob: Blob, filename: string }>}
 */
export async function fetchPolicyFileBlob(id) {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/policies/${encodeURIComponent(id)}/download`, {
    method: 'GET',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || `Download failed (${response.status})`);
  }
  const blob = await response.blob();
  const dispo = response.headers.get('content-disposition') || '';
  const match = dispo.match(/filename=\"?([^\";]+)\"?/i);
  const filename = match?.[1] || `policy-${id}.pdf`;
  return { blob, filename };
}

/** Download attached policy file (if present). */
export async function downloadPolicyFile(id) {
  const { blob, filename } = await fetchPolicyFileBlob(id);
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

export async function updatePolicy(id, body) {
  const response = await fetch(`${API_BASE_URL}/policies/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || `Update failed (${response.status})`);
  }
  return data;
}

export async function deletePolicy(id) {
  const response = await fetch(`${API_BASE_URL}/policies/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || `Delete failed (${response.status})`);
  }
  return data;
}

export async function acknowledgePolicy(id) {
  const response = await fetch(`${API_BASE_URL}/policies/${encodeURIComponent(id)}/acknowledge`, {
    method: 'POST',
    headers: authHeaders(),
    body: '{}',
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || `Acknowledge failed (${response.status})`);
  }
  return data;
}
