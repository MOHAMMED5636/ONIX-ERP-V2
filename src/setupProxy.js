/**
 * Dev proxy:
 * - All `/api/*` → Onix Node backend (default http://127.0.0.1:3001) so `getApiBaseUrl()` can be `/api`.
 * - Optional: REACT_APP_POLICIES_PROXY_LEGACY=1 forwards `/api/policies` first to a legacy server (3010).
 */
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function setupProxy(app) {
  if (process.env.NODE_ENV !== 'development') return;

  const nodeTarget = process.env.REACT_APP_DEV_PROXY_TARGET || 'http://127.0.0.1:3001';

  if (process.env.REACT_APP_POLICIES_PROXY_LEGACY === '1') {
    const legacyTarget =
      process.env.REACT_APP_POLICIES_PROXY_TARGET || 'http://127.0.0.1:3010';

    app.use(
      '/api/policies',
      createProxyMiddleware({
        target: legacyTarget,
        changeOrigin: true,
        pathRewrite: (path, req) => req.originalUrl,
      })
    );
  }

  app.use(
    '/api',
    createProxyMiddleware({
      target: nodeTarget,
      changeOrigin: true,
    })
  );

  // Static uploads (company logos, documents) — same Express app as API, not under /api
  app.use(
    '/uploads',
    createProxyMiddleware({
      target: nodeTarget,
      changeOrigin: true,
    })
  );
};
