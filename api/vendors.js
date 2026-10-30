// Vercel Serverless Function: /api/vendors
// Shared database for cafe vendor directory across teammates.

let memoryVendors = null;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const kvUrl = process.env.KV_REST_API_URL;
  const kvToken = process.env.KV_REST_API_TOKEN;

  // GET /api/vendors
  if (req.method === 'GET') {
    try {
      if (kvUrl && kvToken) {
        const kvRes = await fetch(`${kvUrl}/get/uco_vendors`, {
          headers: { Authorization: `Bearer ${kvToken}` }
        });
        const kvData = await kvRes.json();
        const vendors = kvData.result ? JSON.parse(kvData.result) : (memoryVendors || []);
        return res.status(200).json(vendors);
      }
      return res.status(200).json(memoryVendors || []);
    } catch (e) {
      return res.status(200).json(memoryVendors || []);
    }
  }

  // POST /api/vendors (Sync or update vendor)
  if (req.method === 'POST') {
    try {
      const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      let updatedVendors = [];

      if (Array.isArray(payload)) {
        updatedVendors = payload;
      } else if (payload && payload.id) {
        let current = memoryVendors || [];
        if (kvUrl && kvToken) {
          const kvRes = await fetch(`${kvUrl}/get/uco_vendors`, {
            headers: { Authorization: `Bearer ${kvToken}` }
          });
          const kvData = await kvRes.json();
          current = kvData.result ? JSON.parse(kvData.result) : current;
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
