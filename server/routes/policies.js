const express = require('express');
const crypto = require('crypto');
const { readStore, withStore } = require('../store');
const { authenticate, requirePolicyManager } = require('../middleware/auth');

const router = express.Router();

function toDateOnly(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().split('T')[0];
}

function shapePolicyForClient(row, userId, acknowledgements) {
  const acks = acknowledgements || readStore().acknowledgements;
  const ack = acks.find((a) => a.policyId === row.id && String(a.userId) === String(userId));
  const lastUpdated = toDateOnly(row.updatedAt) || toDateOnly(row.createdAt);
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    department: row.department || 'General',
    fileType: row.fileType || 'PDF',
    fileSize: row.fileSize || '—',
    lastUpdated,
    status: ack ? 'acknowledged' : 'pending',
    acknowledgedAt: ack ? toDateOnly(ack.acknowledgedAt) : null,
    createdBy: {
      id: row.createdByUserId,
      name: row.createdByName || '—',
    },
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    isActive: row.isActive !== false,
  };
}

/** GET /api/policies — all active policies for current user (ack status per user) */
router.get('/', authenticate, (req, res) => {
  const store = readStore();
  const active = store.policies.filter((p) => p.isActive !== false);
  const policies = active.map((p) => shapePolicyForClient(p, req.user.id, store.acknowledgements));
  return res.json({ success: true, data: { policies } });
});

/** POST /api/policies — create (Admin/HR only) */
router.post('/', authenticate, requirePolicyManager, (req, res) => {
  const { title, description, department, fileName, fileType, fileSize } = req.body || {};
  if (!title || !String(title).trim()) {
    return res.status(400).json({ success: false, message: 'Title is required' });
  }
  if (!description || !String(description).trim()) {
    return res.status(400).json({ success: false, message: 'Description is required' });
  }

  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  const row = {
    id,
    title: String(title).trim(),
    description: String(description).trim(),
    department: department ? String(department).trim() : 'General',
    fileName: fileName ? String(fileName) : null,
    fileType: fileType ? String(fileType).toUpperCase() : 'PDF',
    fileSize: fileSize ? String(fileSize) : '—',
    createdByUserId: req.user.id,
    createdByName: req.user.name,
    createdAt: now,
    updatedAt: now,
    isActive: true,
  };

  withStore((store) => {
    store.policies.push(row);
  });

  const created = shapePolicyForClient(row, req.user.id);
  return res.status(201).json({ success: true, data: { policy: created } });
});

/** PUT /api/policies/:id — update (Admin/HR only) */
router.put('/:id', authenticate, requirePolicyManager, (req, res) => {
  const { id } = req.params;
  const { title, description, department, fileName, fileType, fileSize, isActive } = req.body || {};

  let updated = null;
  withStore((store) => {
    const idx = store.policies.findIndex((p) => p.id === id);
    if (idx === -1) {
      return;
    }
    const p = store.policies[idx];
    if (title != null) p.title = String(title).trim();
    if (description != null) p.description = String(description).trim();
    if (department != null) p.department = String(department).trim();
    if (fileName !== undefined) p.fileName = fileName ? String(fileName) : null;
    if (fileType != null) p.fileType = String(fileType).toUpperCase();
    if (fileSize != null) p.fileSize = String(fileSize);
    if (typeof isActive === 'boolean') p.isActive = isActive;
    p.updatedAt = new Date().toISOString();
    updated = { ...p };
  });

  if (!updated) {
    return res.status(404).json({ success: false, message: 'Policy not found' });
  }
  const policy = shapePolicyForClient(updated, req.user.id);
  return res.json({ success: true, data: { policy } });
});

/** DELETE /api/policies/:id — soft delete (Admin/HR only) */
router.delete('/:id', authenticate, requirePolicyManager, (req, res) => {
  const { id } = req.params;
  let ok = false;
  withStore((store) => {
    const p = store.policies.find((x) => x.id === id);
    if (p) {
      p.isActive = false;
      p.updatedAt = new Date().toISOString();
      ok = true;
    }
  });
  if (!ok) {
    return res.status(404).json({ success: false, message: 'Policy not found' });
  }
  return res.json({ success: true, data: { id, isActive: false } });
});

/** POST /api/policies/:id/acknowledge — current user acknowledges */
router.post('/:id/acknowledge', authenticate, (req, res) => {
  const { id } = req.params;
  const store = readStore();
  const policy = store.policies.find((p) => p.id === id && p.isActive !== false);
  if (!policy) {
    return res.status(404).json({ success: false, message: 'Policy not found' });
  }
  const userId = String(req.user.id);
  const existing = store.acknowledgements.find((a) => a.policyId === id && String(a.userId) === userId);
  if (existing) {
    const policyOut = shapePolicyForClient(policy, userId);
    return res.json({ success: true, data: { policy: policyOut } });
  }
  const acknowledgedAt = new Date().toISOString();
  withStore((s) => {
    s.acknowledgements.push({ policyId: id, userId, acknowledgedAt });
  });
  const fresh = readStore().policies.find((p) => p.id === id);
  const policyOut = shapePolicyForClient(fresh, userId);
  return res.json({ success: true, data: { policy: policyOut } });
});

module.exports = router;
