// Shared Upstash / Vercel KV REST helper.
// Files prefixed with "_" are not exposed as routes by Vercel.
//
// Every call checks the HTTP status and the Upstash `error` field and THROWS on
// failure, so callers can never report a write as successful when it wasn't.

// Resolve REST credentials. URL and token are always taken as a matched pair
// (same prefix), and read-only tokens / unrelated *_TOKEN vars (e.g.
// VERCEL_OIDC_TOKEN) are never picked up.
export function resolveKv() {
  const env = process.env;
  const known = [
    ['KV_REST_API_URL', 'KV_REST_API_TOKEN'],
    ['UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN'],
    ['STORAGE_REST_API_URL', 'STORAGE_REST_API_TOKEN']
  ];
  for (const [u, t] of known) {
    if (isHttp(env[u]) && env[t]) return { url: trim(env[u]), token: env[t], source: u };
  }
  // Custom prefixes, e.g. MYDB_KV_REST_API_URL / MYDB_KV_REST_API_TOKEN
  for (const k of Object.keys(env).sort()) {
    if (!/(_REST_API_URL|_REDIS_REST_URL)$/.test(k) || !isHttp(env[k])) continue;
    const tk = k.replace(/URL$/, 'TOKEN');
    if (env[tk]) return { url: trim(env[k]), token: env[tk], source: k };
  }
  return null;
}

function isHttp(v) { return typeof v === 'string' && /^https?:\/\//.test(v); }
function trim(u) { return u.replace(/\/+$/, ''); }

export class StorageError extends Error {}

// Run one Redis command, e.g. cmd(kv, 'HSET', 'key', 'field', 'value')
export async function cmd(kv, ...args) {
  const res = await fetch(kv.url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${kv.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(args.map(String)),
    cache: 'no-store'
  });
  let data;
  try { data = await res.json(); } catch (_) { data = {}; }
  if (!res.ok || data.error) {
    throw new StorageError(`Redis ${args[0]} failed (${res.status}): ${data.error || res.statusText}`);
  }
  return data.result;
}

// HGETALL returns a flat [field, value, field, value, ...] array
export async function hgetallParsed(kv, key) {
  const flat = (await cmd(kv, 'HGETALL', key)) || [];
  const out = [];
  for (let i = 1; i < flat.length; i += 2) {
    try { out.push(JSON.parse(flat[i])); } catch (_) {}
  }
  return out;
}

// Parse a legacy single-key blob. The old code saved with
// JSON.stringify(JSON.stringify(list)), and Upstash stores the raw body, so the value
// is double-encoded (a JSON string containing JSON). Unwrap until we reach an array.
export function parseLegacyList(raw) {
  let v = raw;
  for (let i = 0; i < 4 && typeof v === 'string'; i++) {
    try { v = JSON.parse(v); } catch (_) { return []; }
  }
  return Array.isArray(v) ? v : [];
}

export function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');
}

export function parseBody(req) {
  return typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
}

// Health info for ?health=1 (never exposes secret values, only the env var name)
export async function health(kv, countKey) {
  if (!kv) {
    return { ok: false, configured: false, error: 'No Upstash/KV REST env vars found in this deployment' };
  }
  try {
    const pong = await cmd(kv, 'PING');
    const count = await cmd(kv, 'HLEN', countKey);
    return { ok: pong === 'PONG', configured: true, source: kv.source, count };
  } catch (e) {
    return { ok: false, configured: true, source: kv.source, error: e.message };
  }
}
