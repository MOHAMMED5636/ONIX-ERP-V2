/**
 * Per-tab auth storage using sessionStorage.
 * Each browser tab has its own session; multiple users can be logged in
 * in different tabs without overwriting each other's token.
 */
const AUTH_KEYS = ['token', 'user', 'currentUser', 'isAuthenticated', 'userRole'];
const storage = typeof sessionStorage !== 'undefined' ? sessionStorage : {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

export const getAuthItem = (key) => storage.getItem(key);
export const setAuthItem = (key, value) => {
  if (value != null && value !== undefined) {
    storage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
  } else {
    storage.removeItem(key);
  }
};

/** Get parsed object for keys that store JSON (e.g. currentUser) */
export const getAuthItemJson = (key) => {
  const raw = storage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};
export const removeAuthItem = (key) => storage.removeItem(key);

export const getToken = () => storage.getItem('token');
export const setToken = (token) => {
  if (token) storage.setItem('token', token);
  else storage.removeItem('token');
};

export const clearAuth = () => {
  AUTH_KEYS.forEach((k) => storage.removeItem(k));
};

export const isAuthStorage = true;
