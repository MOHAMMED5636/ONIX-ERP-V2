import { getToken } from './authAPI';
import { getApiBaseUrl } from '../config/apiBaseUrl';

/**
 * Submit ERP system feedback (multipart). Any authenticated role.
 * @param {{ message: string, category?: string, pageUrl?: string, screenshotFile?: File | null }} payload
 */
export async function submitSystemFeedback(payload) {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');

  const fd = new FormData();
  fd.append('message', payload.message);
  if (payload.category) fd.append('category', payload.category);
  if (payload.pageUrl) fd.append('pageUrl', payload.pageUrl);
  if (payload.screenshotFile) fd.append('screenshot', payload.screenshotFile);

  const base = getApiBaseUrl();
  const res = await fetch(`${base}/system-feedback`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: fd,
    credentials: 'include',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
  return data;
}

/** ADMIN only */
export async function listSystemFeedbackAdmin({ status, page = 1, limit = 20 } = {}) {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');
  const q = new URLSearchParams();
  if (status) q.append('status', status);
  q.append('page', String(page));
  q.append('limit', String(limit));
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/system-feedback?${q}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
  return data;
}

/** ADMIN only */
export async function updateSystemFeedbackAdmin(id, body) {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/system-feedback/${id}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    credentials: 'include',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
  return data;
}
