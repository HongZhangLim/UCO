// Vercel Serverless Function: /api/vendors
// Shared cafe vendor directory, stored in Upstash / Vercel KV.
//
// Storage layout:
//   HASH uco:vendors          field = vendor id, value = vendor JSON
//   SET  uco:vendors_deleted  ids deleted (stops other phones re-uploading them)
//   STR  uco:vendors_seeded   set once the seed / legacy list has been imported
import { resolveKv, cmd, hgetallParsed, setCors, parseBody, health } from './_kv.js';

const HASH = 'uco:vendors';
const DELETED = 'uco:vendors_deleted';
const SEEDED = 'uco:vendors_seeded';
const LEGACY_KEY = 'uco_vendors';

const SEED_VENDORS = [
  { id: 'v-kk2-1', locationId: 'kk2', name: 'Western Food', status: 'Paid', requirement: 'Offer ~RM 2.50/kg (normally sell RM 3.00/kg). Need to confirm with boss first', contact: '018-3557751', updatedAt: 1730300000000 },
  { id: 'v-kk2-2', locationId: 'kk2', name: 'Nasi Campur', status: 'Free', requirement: 'Can collect this Friday', contact: '', updatedAt: 1730300000000 },
  { id: 'v-kk3-1', locationId: 'kk3', name: 'Cafe Vendor (Bulk Supplier)', status: 'Follow Up', requirement: 'Contact boss, he might sell us many kg', contact: '019-6769527', updatedAt: 1730300000000 },
  { id: 'v-kk4-1', locationId: 'kk4', name: 'Ayam Gunting 4K', status: 'Paid', requirement: 'Purchase arrangement', contact: '', updatedAt: 1730300000000 },
  { id: 'v-kk5-1', locationId: 'kk5', name: 'Shawarma', status: 'Free', requirement: '', contact: '', updatedAt: 1730300000000 },
  { id: 'v-kk6-1', locationId: 'kk6', name: 'Nasi Ayam', status: 'Free', requirement: 'Needs container replacement. Collect anytime (told them Friday)', contact: '', updatedAt: 1730300000000 },
  { id: 'v-kk6-2', locationId: 'kk6', name: 'Nasi Campur', status: 'Follow Up', requirement: 'Need to ask their boss', contact: '019-2234282', updatedAt: 1730300000000 },
  { id: 'v-kk6-3', locationId: 'kk6', name: 'Ayam Gunting', status: 'Follow Up', requirement: 'Closed today — follow up next visit', contact: '', updatedAt: 1730300000000 },
  { id: 'v-kk7-1', locationId: 'kk7', name: 'Nasi Kukus', status: 'Paid', requirement: 'Needs container replacement — Purchase', contact: '', updatedAt: 1730300000000 },
  { id: 'v-kk7-2', locationId: 'kk7', name: 'Ayam Gunting', status: 'Follow Up', requirement: 'Tak sure, need to ask boss at night', contact: '', updatedAt: 1730300000000 },
  { id: 'v-kk8-1', locationId: 'kk8', name: 'Right-side Nasi Campur', status: 'Paid', requirement: 'Come pick up at November', contact: '010-2292690 / 018-3819914', updatedAt: 1730300000000 },
  { id: 'v-kk8-2', locationId: 'kk8', name: 'Chicken Cutlet', status: 'Paid', requirement: 'Pick up Friday', contact: '', updatedAt: 1730300000000 },
  { id: 'v-kk11-1', locationId: 'kk11', name: 'Nasi Campur', status: 'Free', requirement: 'Requires clean containers', contact: '', updatedAt: 1730300000000 },
  { id: 'v-kk11-2', locationId: 'kk11', name: 'Shawarma', status: 'Free', requirement: 'Available next Friday', contact: '', updatedAt: 1730300000000 },
  { id: 'v-kk11-3', locationId: 'kk11', name: 'Ayam Gunting Store', status: 'Free', requirement: 'Free collection (only if boss is absent)', contact: '', updatedAt: 1730300000000 },
  { id: 'v-kk12-1', locationId: 'kk12', name: 'Nasi Kandar', status: 'Paid', requirement: 'End of the month — Purchase', contact: '', updatedAt: 1730300000000 }
];

let seeded = false;

async function ensureSeeded(kv) {
  if (seeded) return;
  if (!(await cmd(kv, 'EXISTS', SEEDED))) {
    let list = SEED_VENDORS;
    const legacy = await cmd(kv, 'GET', LEGACY_KEY).catch(() => null);
    if (typeof legacy === 'string' && legacy) {
      try {
        const parsed = JSON.parse(legacy);
        if (Array.isArray(parsed) && parsed.length > 0) list = parsed;
      } catch (_) {}
    }
    for (const v of list) {
      if (v && v.id) await cmd(kv, 'HSETNX', HASH, v.id, JSON.stringify(v));
    }
    await cmd(kv, 'SET', SEEDED, '1');
  }
  seeded = true;
}

// Last-write-wins by updatedAt. Returns 'deleted' | 'stale' | 'saved'
async function upsertVendor(kv, v) {
  const id = String(v.id);
  if (await cmd(kv, 'SISMEMBER', DELETED, id)) return 'deleted';
  const existingRaw = await cmd(kv, 'HGET', HASH, id);
  if (existingRaw) {
    try {
      const existing = JSON.parse(existingRaw);
      if ((existing.updatedAt || 0) > (v.updatedAt || 0)) return 'stale';
    } catch (_) {}
  }
  const clean = {
    id,
    locationId: String(v.locationId || ''),
    name: String(v.name || ''),
    status: v.status || '',
    requirement: v.requirement || '',
    contact: v.contact || '',
    updatedAt: Number(v.updatedAt) || Date.now()
  };
  await cmd(kv, 'HSET', HASH, id, JSON.stringify(clean));
  return 'saved';
}

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const kv = resolveKv();

  if (req.method === 'GET' && req.query && req.query.health) {
    const h = await health(kv, HASH);
    return res.status(h.ok ? 200 : 503).json(h);
  }

  if (!kv) {
    return res.status(503).json({ error: 'Cloud storage not configured on this deployment (no Upstash/KV env vars)' });
  }

  try {
    await ensureSeeded(kv);

    // GET /api/vendors       -> [vendors]
    // GET /api/vendors?v=2   -> { vendors, deleted }
    if (req.method === 'GET') {
      const vendors = await hgetallParsed(kv, HASH);
      if (req.query && req.query.v === '2') {
        const deleted = (await cmd(kv, 'SMEMBERS', DELETED)) || [];
        return res.status(200).json({ vendors, deleted });
      }
      return res.status(200).json(vendors);
    }

    if (req.method === 'POST') {
      const payload = parseBody(req);

      if (Array.isArray(payload)) {
        const results = {};
        for (const v of payload) if (v && v.id) results[v.id] = await upsertVendor(kv, v);
        return res.status(200).json({ success: true, results });
      }

      if (!payload || !payload.id) return res.status(400).json({ error: 'Invalid payload' });

      if (payload._deleted) {
        const ADMIN_PIN = process.env.ADMIN_PIN || '2026';
        if (String(payload.pin || '') !== ADMIN_PIN) {
          return res.status(401).json({ error: 'Unauthorized: Invalid Security PIN' });
        }
        await cmd(kv, 'SADD', DELETED, String(payload.id));
        await cmd(kv, 'HDEL', HASH, String(payload.id));
        return res.status(200).json({ success: true, deleted: payload.id });
      }

      const result = await upsertVendor(kv, payload);
      if (result === 'deleted') return res.status(410).json({ error: 'Vendor was deleted', deleted: payload.id });
      return res.status(200).json({ success: true, result });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (err) {
    console.error('[api/vendors]', err);
    return res.status(500).json({ error: err.message });
  }
}
