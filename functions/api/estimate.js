export async function onRequestOptions(context) {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
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
    const { request } = context;
    const data = await request.json();
    
    const lastMsg = data.prompt || 'Hello';
    const systemPrompt = data.system || '';
    
    const encodedPrompt = encodeURIComponent(lastMsg);
    const encodedSystem = encodeURIComponent(systemPrompt);
    const url = `https://text.pollinations.ai/${encodedPrompt}?system=${encodedSystem}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) TASKAS/1.0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Pollinations API returned status: ${response.status}`);
    }
    
    const replyText = await response.text();
    
    return new Response(JSON.stringify({ response: replyText }), {
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
