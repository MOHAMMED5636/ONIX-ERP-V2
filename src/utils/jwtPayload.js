/**
 * Decode JWT payload (no verification) — used to recover id/email/role when /auth/me fails cross-origin.
 */
export function decodeJwtPayload(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length < 2) return null;
  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const json = atob(padded);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/** Merge login API user with claims from token so snapshot always has role for AuthContext. */
export function enrichUserFromToken(user, token) {
  const payload = decodeJwtPayload(token);
  if (!payload) return user || null;
  const base = user && typeof user === 'object' ? { ...user } : {};
  if (base.role == null && payload.role != null) base.role = payload.role;
  if (base.id == null && payload.id != null) base.id = payload.id;
  if (base.email == null && payload.email != null) base.email = payload.email;
  return Object.keys(base).length ? base : null;
}
