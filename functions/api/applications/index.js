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

export async function onRequestGet(context) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  try {
    const { env } = context;
    let list = [];

    if (env && env.DB) {
      try {
        const { results } = await env.DB.prepare(
          'SELECT * FROM applications ORDER BY created_at DESC'
        ).all();

        if (results && Array.isArray(results)) {
          list = results.map(row => {
            let parsedData = {};
            try {
              parsedData = JSON.parse(row.data || '{}');
            } catch (e) {
              parsedData = {};
            }
            return {
              applicationId: row.id,
              name: row.name || parsedData.name,
              email: row.email || parsedData.email,
              phone: row.phone || parsedData.phone,
              city: row.city || parsedData.city,
              position: row.position || parsedData.position,
              experience: row.experience || parsedData.experience,
              status: row.status || parsedData.status || 'New',
              isInternship: !!row.is_internship,
              appliedAt: row.created_at,
              updatedAt: row.updated_at,
              ...parsedData
            };
          });
        }
      } catch (dbErr) {
        console.warn('D1 applications query warning:', dbErr);
      }
    }

    return new Response(JSON.stringify(list), {
      status: 200,
      headers: corsHeaders
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: corsHeaders
    });
  }
}
