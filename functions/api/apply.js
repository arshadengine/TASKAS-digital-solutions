export async function onRequestOptions(context) {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    }
  });
}

export async function onRequestPost(context) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  try {
    const { request, env } = context;
    const data = await request.json();

    const appId = data.applicationId || `APP-${Date.now()}`;
    data.applicationId = appId;
    if (!data.status) data.status = 'New';

    // If D1 or KV binding exists, store it
    if (env && env.DB) {
      try {
        await env.DB.prepare(
          'INSERT INTO applications (id, name, email, phone, position, status, data, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        ).bind(
          appId,
          data.name || '',
          data.email || '',
          data.phone || '',
          data.position || '',
          data.status,
          JSON.stringify(data),
          new Date().toISOString()
        ).run();
      } catch (dbErr) {
        console.warn('D1 write skipped or table not migrated:', dbErr);
      }
    }

    return new Response(JSON.stringify({
      status: 'success',
      applicationId: appId,
      message: 'Candidate application received and logged.'
    }), {
      status: 200,
      headers: corsHeaders
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: corsHeaders
    });
  }
}
