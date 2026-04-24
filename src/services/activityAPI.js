import { getToken } from './authAPI';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

function getAuthHeaders() {
  const token = getToken();
  if (!token) throw new Error('No token found. Please login again.');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

/**
 * @param {{ from: string, to: string, userId?: string }} params - ISO range
 */
export async function listActivityEvents(params) {
  const q = new URLSearchParams();
  q.set('from', params.from);
  q.set('to', params.to);
  if (params.userId) q.set('userId', params.userId);
  const response = await fetch(`${API_BASE_URL}/activity/events?${q.toString()}`, {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'include',
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to load activity');
  }
  return { success: true, data: data.data || [] };
}

/**
 * @param {{ module?: string, action?: string, eventType?: 'PAGE_VIEW'|'ACTION', metadata?: object, durationSeconds?: number }} body
 */
export async function trackActivity(body = {}) {
  const token = getToken();
  if (!token) return { success: false };
  const response = await fetch(`${API_BASE_URL}/activity/track`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      eventType: body.eventType || 'PAGE_VIEW',
      module: body.module,
      action: body.action,
      metadata: body.metadata,
      durationSeconds: body.durationSeconds,
    }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return { success: false, message: data.message };
  }
  return { success: true };
}
