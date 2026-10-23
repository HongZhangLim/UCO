// Cloudflare Pages Function: /api/records
// Works automatically when deploying to Cloudflare Pages!
// Bind a KV namespace named 'UCO_KV' in Cloudflare dashboard, or falls back to in-memory store.

let memoryStore = [];

export async function onRequestGet({ env }) {
  let records = [];
  if (env && env.UCO_KV) {
    const data = await env.UCO_KV.get('records');
    records = data ? JSON.parse(data) : [];
  } else {
    records = memoryStore;
  }

  return new Response(JSON.stringify(records), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache'
    }
  });
}

export async function onRequestPost({ request, env }) {
  try {
    const newRecord = await request.json();
    let records = [];

    if (env && env.UCO_KV) {
      const data = await env.UCO_KV.get('records');
      records = data ? JSON.parse(data) : [];
      records.push(newRecord);
      await env.UCO_KV.put('records', JSON.stringify(records));
    } else {
      memoryStore.push(newRecord);
      records = memoryStore;
    }

    return new Response(JSON.stringify({ success: true, count: records.length }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
