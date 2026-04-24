import { getBackendOrigin } from '../config/apiBaseUrl';

/**
 * Full URL for files served by Express at `/uploads/...` (not under `/api`).
 * `REACT_APP_API_URL` is often `http://host:3001/api` — using it for images wrongly yields `/api/uploads/...` (404).
 */
export function resolvePublicUploadUrl(pathOrUrl) {
  if (pathOrUrl == null || pathOrUrl === '') return null;
  const s = String(pathOrUrl).trim();
  if (!s) return null;
  if (s.startsWith('http://') || s.startsWith('https://')) return s;
  const origin = getBackendOrigin();
  const path = s.startsWith('/') ? s : `/${s}`;
  return `${origin}${path}`;
}
