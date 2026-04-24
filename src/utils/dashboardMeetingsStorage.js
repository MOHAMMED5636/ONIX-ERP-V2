/**
 * Persist dashboard meetings per user in localStorage.
 * Shape: { [yyyy-mm-dd]: Meeting[] }
 */

const STORAGE_PREFIX = 'erp-dashboard-meetings-v1';

export function formatDateKey(date) {
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function getMeetingsStorageKey(userId) {
  if (!userId) return null;
  return `${STORAGE_PREFIX}:${userId}`;
}

/**
 * @param {string} userId
 * @returns {Record<string, Array<{ id: string, date: string, title: string, description: string, time?: string|null }>>}
 */
export function loadMeetingsMap(userId) {
  const key = getMeetingsStorageKey(userId);
  if (!key) return {};
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed;
    }
    return {};
  } catch {
    return {};
  }
}

/**
 * @param {string} userId
 * @param {Record<string, Array<{ id: string, date: string, title: string, description: string, time?: string|null }>>} map
 * @returns {{ success: boolean, error?: string }}
 */
export function saveMeetingsMap(userId, map) {
  const key = getMeetingsStorageKey(userId);
  if (!key) {
    return { success: false, error: 'No user' };
  }
  try {
    const payload = JSON.stringify(map);
    localStorage.setItem(key, payload);
    return { success: true };
  } catch (e) {
    return { success: false, error: e?.message || 'Storage failed' };
  }
}
