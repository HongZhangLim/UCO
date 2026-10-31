// Vercel Serverless Function: /api/vendors
// Shared database for cafe vendor directory across teammates.

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

let memoryVendors = null;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Universal KV / Upstash Credential Resolver (supports KV, UPSTASH, STORAGE or custom prefix)
  const kvUrl = process.env.KV_REST_API_URL ||
                process.env.UPSTASH_REDIS_REST_URL ||
                process.env.STORAGE_REST_API_URL ||
                process.env.KV_URL ||
                process.env.STORAGE_URL ||
                Object.entries(process.env).find(([k, v]) => (k.endsWith('_URL') || k.endsWith('_REST_API_URL')) && typeof v === 'string' && v.startsWith('http'))?.[1];

  const kvToken = process.env.KV_REST_API_TOKEN ||
                  process.env.UPSTASH_REDIS_REST_TOKEN ||
                  process.env.STORAGE_REST_API_TOKEN ||
                  process.env.STORAGE_TOKEN ||
                  Object.entries(process.env).find(([k, v]) => (k.endsWith('_TOKEN') || k.endsWith('_REST_API_TOKEN')) && typeof v === 'string' && v.length > 15)?.[1];

  // GET /api/vendors
  if (req.method === 'GET') {
    try {
      if (kvUrl && kvToken) {
        const kvRes = await fetch(`${kvUrl}/get/uco_vendors`, {
          headers: { Authorization: `Bearer ${kvToken}` },
          cache: 'no-store'
        });
        const kvData = await kvRes.json();
        let vendors = SEED_VENDORS;
        if (kvData.result) {
          try {
            const parsed = JSON.parse(kvData.result);
            if (Array.isArray(parsed) && parsed.length > 0) vendors = parsed;
          } catch (_) {}
        }
        return res.status(200).json(vendors);
      }
      return res.status(200).json(memoryVendors && memoryVendors.length > 0 ? memoryVendors : SEED_VENDORS);
    } catch (e) {
      return res.status(200).json(SEED_VENDORS);
    }
  }

  // POST /api/vendors (Sync or update vendor)
  if (req.method === 'POST') {
    try {
      const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      let updatedVendors = [];

      if (Array.isArray(payload)) {
        updatedVendors = payload.length > 0 ? payload : SEED_VENDORS;
      } else if (payload && payload.id) {
        let current = memoryVendors && memoryVendors.length > 0 ? memoryVendors : [...SEED_VENDORS];
        if (kvUrl && kvToken) {
          const kvRes = await fetch(`${kvUrl}/get/uco_vendors`, {
            headers: { Authorization: `Bearer ${kvToken}` },
            cache: 'no-store'
          });
          const kvData = await kvRes.json();
          if (kvData.result) {
            try {
              const parsed = JSON.parse(kvData.result);
              if (Array.isArray(parsed) && parsed.length > 0) current = parsed;
            } catch (_) {}
          }
        }

        if (payload._deleted) {
          updatedVendors = current.filter(v => v.id !== payload.id);
        } else {
          const idx = current.findIndex(v => v.id === payload.id);
          if (idx >= 0) {
            current[idx] = payload;
          } else {
            current.push(payload);
          }
          updatedVendors = current;
        }
      } else {
        return res.status(400).json({ error: 'Invalid payload' });
      }

      memoryVendors = updatedVendors;

      if (kvUrl && kvToken) {
        await fetch(`${kvUrl}/set/uco_vendors`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${kvToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(JSON.stringify(updatedVendors))
        });
      }

      return res.status(200).json({ success: true, count: updatedVendors.length });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
