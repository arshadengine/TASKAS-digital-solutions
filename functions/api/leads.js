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
          'SELECT * FROM inquiries ORDER BY created_at DESC'
        ).all();

        if (results && Array.isArray(results)) {
          list = results.map(row => ({
            inquiryId: row.inquiry_id,
            email: row.email,
            phone: row.phone,
            devType: row.dev_type,
            minPrice: row.min_price,
            maxPrice: row.max_price,
            description: row.description,
            breakdown: row.breakdown,
            createdAt: row.created_at
          }));
        }
      } catch (dbErr) {
        console.warn('D1 leads query warning:', dbErr);
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
