// Vercel Serverless Function: /api/records
// Shared pickup database for the whole team, stored in Upstash / Vercel KV.
//
// Storage layout (atomic per record, no read-modify-write races):
//   HASH uco:records         field = record id, value = record JSON
//   SET  uco:records_deleted ids that were deleted (stops other phones re-uploading them)
//
// There is deliberately NO in-memory fallback: serverless memory is wiped on every
// cold start, so "saving" there silently loses data. If storage is unavailable the
// API returns an error and the client keeps the record queued locally.
import { resolveKv, cmd, hgetallParsed, setCors, parseBody, health, parseLegacyList } from './_kv.js';

const HASH = 'uco:records';
const DELETED = 'uco:records_deleted';
const LEGACY_KEY = 'uco_records';
const MAX_RECORD_BYTES = 1_500_000;

let migrated = false;

// One-time import of the old single-string `uco_records` key into the hash.
async function migrateLegacy(kv) {
  if (migrated) return;
  const legacy = await cmd(kv, 'GET', LEGACY_KEY).catch(() => null);
  if (typeof legacy === 'string' && legacy) {
    for (const r of parseLegacyList(legacy)) {
      if (r && r.id && r.id !== 'seed-1') await cmd(kv, 'HSETNX', HASH, r.id, JSON.stringify(r));
    }
    await cmd(kv, 'RENAME', LEGACY_KEY, `${LEGACY_KEY}_legacy_backup`);
  }
  migrated = true;
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
    await migrateLegacy(kv);

    // GET /api/records          -> [records]                (legacy shape)
    // GET /api/records?v=2      -> { records, deleted }
    if (req.method === 'GET') {
      const records = (await hgetallParsed(kv, HASH))
        .filter(r => r && r.id && r.id !== 'seed-1')
        .sort((a, b) => a.timestamp - b.timestamp);
      if (req.query && req.query.v === '2') {
        const deleted = (await cmd(kv, 'SMEMBERS', DELETED)) || [];
        return res.status(200).json({ records, deleted });
      }
      return res.status(200).json(records);
    }

    if (req.method === 'POST') {
      const body = parseBody(req);
      if (!body || !body.id) return res.status(400).json({ error: 'Missing record id' });
      const id = String(body.id);

      // Delete (requires Team PIN)
      if (body._deleted || body.action === 'delete') {
        const ADMIN_PIN = process.env.ADMIN_PIN || '2026';
        if (String(body.pin || '') !== ADMIN_PIN) {
          return res.status(401).json({ error: 'Unauthorized: Invalid Security PIN' });
        }
        await cmd(kv, 'SADD', DELETED, id);
        await cmd(kv, 'HDEL', HASH, id);
        return res.status(200).json({ success: true, deleted: id });
      }

      // Create
      if (!body.locationId || !body.kg) return res.status(400).json({ error: 'Invalid record data' });
      const kgNum = parseFloat(body.kg);
      if (isNaN(kgNum) || kgNum <= 0 || kgNum > 500) {
        return res.status(400).json({ error: 'Weight must be between 0.1 and 500 kg' });
      }

      if (await cmd(kv, 'SISMEMBER', DELETED, id)) {
        return res.status(410).json({ error: 'Record was deleted', deleted: id });
      }

      const record = {
        id,
        locationId: String(body.locationId),
        vendorId: body.vendorId || null,
        vendorName: body.vendorName || '',
        kg: Math.round(kgNum * 10) / 10,
        collector: body.collector || '',
        tag: body.tag || '',
        notes: body.notes || '',
        photo: body.photo || '',
        timestamp: Number(body.timestamp) || Date.now()
      };
      const json = JSON.stringify(record);
      if (json.length > MAX_RECORD_BYTES) {
        return res.status(413).json({ error: 'Record too large (photo too big)' });
      }

      // HSETNX = idempotent: re-uploading the same id from several phones is harmless
      const created = await cmd(kv, 'HSETNX', HASH, id, json);
      return res.status(200).json({ success: true, id, created: created === 1 });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (err) {
    console.error('[api/records]', err);
    return res.status(500).json({ error: err.message });
  }
}
