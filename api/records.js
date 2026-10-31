// Vercel Serverless Function: /api/records
// Handles real-time shared database for all 9 team members.
// Uses Vercel KV / Upstash Redis if configured, otherwise falls back to memory.

let memoryStore = [
  {
    id: 'seed-1',
    locationId: 'kk11',
    vendorId: 'v-kk11-1',
    vendorName: 'Nasi Campur',
    kg: 18.5,
    collector: 'Mingdao',
    tag: 'Free Donation',
    notes: 'Nasi Campur donation with swapped clean container',
    photo: '',
    timestamp: 1730100000000
  }
];

export default async function handler(req, res) {
  // Global CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  // GET /api/records — Retrieve all pickups
  if (req.method === 'GET') {
    try {
      if (kvUrl && kvToken) {
        const kvRes = await fetch(`${kvUrl}/get/uco_records`, {
          headers: { Authorization: `Bearer ${kvToken}` },
          cache: 'no-store'
        });
        const kvData = await kvRes.json();
        const records = kvData.result ? JSON.parse(kvData.result) : memoryStore;
        return res.status(200).json(records);
      }
      return res.status(200).json(memoryStore);
    } catch (e) {
      return res.status(200).json(memoryStore);
    }
  }

  // POST /api/records — Append a new pickup
  if (req.method === 'POST') {
    try {
      const newRecord = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (!newRecord || !newRecord.locationId || !newRecord.kg) {
        return res.status(400).json({ error: 'Invalid record data' });
      }

      // Validate weight range
      const kgNum = parseFloat(newRecord.kg);
      if (isNaN(kgNum) || kgNum <= 0 || kgNum > 500) {
        return res.status(400).json({ error: 'Weight must be between 0.1 and 500 kg' });
      }
      newRecord.kg = Math.round(kgNum * 10) / 10;

      if (kvUrl && kvToken) {
        // Fetch current records with fresh un-cached read
        const kvRes = await fetch(`${kvUrl}/get/uco_records`, {
          headers: { Authorization: `Bearer ${kvToken}` },
          cache: 'no-store'
        });
        const kvData = await kvRes.json();
        let records = kvData.result ? JSON.parse(kvData.result) : [...memoryStore];

        // Deduplicate and append
        const exists = records.some(r => r.id === newRecord.id);
        if (!exists) records.push(newRecord);

        // Save back to KV
        await fetch(`${kvUrl}/set/uco_records`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${kvToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(JSON.stringify(records))
        });

        return res.status(200).json({ success: true, count: records.length });
      } else {
        const exists = memoryStore.some(r => r.id === newRecord.id);
        if (!exists) memoryStore.push(newRecord);
        return res.status(200).json({ success: true, count: memoryStore.length });
      }
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
