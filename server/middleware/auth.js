const jwt = require('jsonwebtoken');

const MANAGE_ROLES = ['ADMIN', 'HR'];

function normalizeUser(payload) {
  const id = String(payload.sub ?? payload.id ?? payload.userId ?? payload.employeeId ?? '');
  const role = String(payload.role || '').toUpperCase();
  const name =
    payload.name ||
    [payload.firstName, payload.lastName].filter(Boolean).join(' ').trim() ||
    payload.email ||
    'User';
  return { id, role, name, email: payload.email || null };
}

function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  const token = header.slice(7).trim();
  if (!token) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const secret = process.env.JWT_SECRET;
  const devInsecure = process.env.POLICY_DEV_INSECURE === '1';

  try {
    if (secret) {
      const decoded = jwt.verify(token, secret);
      req.user = normalizeUser(decoded);
    } else if (devInsecure) {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return res.status(401).json({ success: false, message: 'Invalid token' });
      }
      let payload;
      try {
        payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
      } catch {
        payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
      }
      req.user = normalizeUser(payload);
    } else {
      return res.status(500).json({
        success: false,
        message: 'Server misconfiguration: set JWT_SECRET (same as main auth API) or POLICY_DEV_INSECURE=1 for local demo only',
      });
    }

    if (!req.user.id) {
      return res.status(401).json({ success: false, message: 'Invalid token: missing user id' });
    }
    return next();
  } catch (e) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

function requirePolicyManager(req, res, next) {
  if (!MANAGE_ROLES.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Forbidden: only Admin and HR can modify policies' });
  }
  return next();
}

module.exports = {
  authenticate,
  requirePolicyManager,
  MANAGE_ROLES,
};
