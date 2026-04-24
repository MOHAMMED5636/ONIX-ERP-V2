/**
 * Single place for the ERP REST base (`.../api`, no trailing slash).
 *
 * Onix Node API default: PORT=3001 (see backend `config/env.ts`). Do not point this at port 8000/8080
 * unless you intentionally run the API there — that often causes login 404 (nothing listening on /api).
 *
 * Local dev: leave `REACT_APP_API_URL` unset to use same-origin `/api` (proxied to 127.0.0.1:3001).
 * LAN: `REACT_APP_API_URL=http://192.168.x.x:3001/api` (IP of the machine running `npm run dev` on backend).
 *
 * If you set only `http://host:3001` (no path), requests would hit `/employees/...` on the API host and
 * return 404 — we append `/api` when the URL path is empty or `/`.
 */

function normalizeAbsoluteApiBase(raw) {
  const trimmed = raw.replace(/\/$/, '');
  try {
    const u = new URL(trimmed);
    const pathOnly = (u.pathname || '/').replace(/\/$/, '') || '/';
    if (pathOnly === '/' || pathOnly === '') {
      const fixed = `${trimmed}/api`;
      if (typeof console !== 'undefined' && console.warn) {
        console.warn(
          '[Onix ERP] REACT_APP_API_URL must include /api (e.g. http://192.168.x.x:3001/api). Using:',
          fixed
        );
      }
      return fixed;
    }
    return trimmed;
  } catch {
    return trimmed;
  }
}

export function getApiBaseUrl() {
  let raw = (process.env.REACT_APP_API_URL || '').trim().replace(/\/$/, '');

  if (
    process.env.NODE_ENV === 'development' &&
    raw &&
    /:(8000|8080)(\/|$)/.test(raw)
  ) {
    // Common misconfiguration (copy-paste); backend is almost always 3001 in this project.
    console.warn(
      '[Onix ERP] REACT_APP_API_URL uses :8000 or :8080. The Onix API uses port 3001 by default. Using dev proxy /api → http://127.0.0.1:3001. Set REACT_APP_API_URL=http://YOUR_HOST:3001/api or remove it for local proxy.'
    );
    raw = '';
  }

  if (
    process.env.NODE_ENV === 'development' &&
    raw &&
    /:3000(\/|$)/.test(raw)
  ) {
    // Common LAN misconfiguration: pointing API base to the React dev server (3000) instead of Node API (3001).
    // We automatically switch to 3001 to prevent template/import/export endpoints from 404'ing on the frontend server.
    try {
      const u = new URL(raw);
      const host = u.hostname;
      const fixed = `http://${host}:3001/api`;
      console.warn(
        '[Onix ERP] REACT_APP_API_URL points to :3000 (frontend). Using backend API:',
        fixed
      );
      raw = fixed;
    } catch {
      raw = '';
    }
  }

  if (raw) {
    if (/^https?:\/\//i.test(raw)) {
      return normalizeAbsoluteApiBase(raw);
    }
    return raw;
  }
  if (process.env.NODE_ENV === 'development') {
    return '/api';
  }
  return 'http://localhost:3001/api';
}

/** Origin for static files (/uploads/...) when API base is absolute; in dev with /api proxy, use current page origin. */
export function getBackendOrigin() {
  const base = getApiBaseUrl();
  if (base.startsWith('/')) {
    if (typeof window !== 'undefined' && window.location?.origin) {
      return window.location.origin;
    }
    return 'http://localhost:3001';
  }
  return base.replace(/\/api\/?$/i, '') || 'http://localhost:3001';
}
