/**
 * Absolute URL for profile / uploaded images.
 * Rewrites /uploads/* to REACT_APP_API_URL origin so LAN clients (e.g. :3000 → :8000) load files correctly.
 */
export function resolveProfilePhotoUrl(photo) {
  if (!photo) return null;

  const backendOrigin =
    process.env.REACT_APP_BACKEND_URL ||
    (process.env.REACT_APP_API_URL || "http://localhost:3001/api").replace(/\/api\/?$/, "") ||
    "http://localhost:3001";

  if (photo.startsWith("http://") || photo.startsWith("https://")) {
    try {
      const u = new URL(photo);
      if (u.pathname.includes("/uploads/")) {
        return `${backendOrigin}${u.pathname}${u.search}`;
      }
      return photo;
    } catch {
      return photo;
    }
  }

  if (photo.startsWith("/uploads/")) {
    return `${backendOrigin}${photo}`;
  }

  return `${backendOrigin}/uploads/photos/${photo}`;
}
