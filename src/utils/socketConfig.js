/**
 * Real-time Socket.IO is optional. The main API (Express on :3001) does not mount socket.io,
 * so connecting by default causes endless 404s on /socket.io/* in the Network tab.
 *
 * To enable: add to .env
 *   REACT_APP_ENABLE_SOCKET=true
 * Optionally:
 *   REACT_APP_SOCKET_URL=http://192.168.x.x:3002
 * If SOCKET_URL is unset, the origin matches getBackendOrigin() (same as REST).
 */
import { getBackendOrigin } from '../config/apiBaseUrl';

export function isSocketClientEnabled() {
  return String(process.env.REACT_APP_ENABLE_SOCKET || '').toLowerCase() === 'true';
}

export function getSocketBaseUrl() {
  const explicit = (process.env.REACT_APP_SOCKET_URL || '').trim();
  if (explicit) return explicit.replace(/\/$/, '');
  return getBackendOrigin();
}
