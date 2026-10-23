/**
 * Standalone Cloudflare Worker for UCO Central Database
 * Deploy to: api.yourdomain.com or your-worker.workers.dev
 * Bind a KV namespace called: UCO_KV
 */

export default {
  async fetch(request, env) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // GET / — Return all records
    if (request.method === 'GET') {
      const data = env.UCO_KV ? await env.UCO_KV.get('records') : null;
      const records = data ? JSON.parse(data) : [];
      return new Response(JSON.stringify(records), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // POST / — Append a new pickup record
    if (request.method === 'POST') {
      try {
        const newRecord = await request.json();
        const data = env.UCO_KV ? await env.UCO_KV.get('records') : null;
        const records = data ? JSON.parse(data) : [];
        records.push(newRecord);
        if (env.UCO_KV) {
          await env.UCO_KV.put('records', JSON.stringify(records));
        }
        return new Response(JSON.stringify({ success: true, total: records.length }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    return new Response('Not Found', { status: 404, headers: corsHeaders });
  }
};
