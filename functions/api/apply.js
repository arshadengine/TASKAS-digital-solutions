import { dispatchRecruitmentEmail } from '../_email.js';

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
    const now = new Date().toISOString();

    // 1. Store in Cloudflare D1 database if binding exists
    if (env && env.DB) {
      try {
        await env.DB.prepare(
          `INSERT INTO applications (id, name, email, phone, city, position, experience, is_internship, status, data, created_at, updated_at) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT(id) DO UPDATE SET 
             name=excluded.name, 
             email=excluded.email, 
             phone=excluded.phone, 
             city=excluded.city,
             position=excluded.position,
             experience=excluded.experience,
             status=excluded.status, 
             data=excluded.data, 
             updated_at=excluded.updated_at`
        ).bind(
          appId,
          data.name || '',
          data.email || '',
          data.phone || '',
          data.city || '',
          data.position || '',
          data.experience || '',
          data.isInternship ? 1 : 0,
          data.status,
          JSON.stringify(data),
          now,
          now
        ).run();
      } catch (dbErr) {
        console.warn('D1 write warning:', dbErr);
      }
    }

    // 2. Dispatch automated "Application Received" email to candidate
    let emailResult = null;
    if (data.email) {
      try {
        emailResult = await dispatchRecruitmentEmail({
          stage: 'New',
          name: data.name || 'Candidate',
          email: data.email,
          position: data.position || 'Open Position',
          applicationId: appId,
          env: env
        });
      } catch (mailErr) {
        console.warn('Recruitment email trigger error:', mailErr);
      }
    }

    return new Response(JSON.stringify({
      status: 'success',
      applicationId: appId,
      message: 'Candidate application received and recorded.',
      emailDispatched: !!(emailResult && emailResult.success)
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

