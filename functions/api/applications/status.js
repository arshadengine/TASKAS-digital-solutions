import { dispatchRecruitmentEmail } from '../../_email.js';

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
    const body = await request.json();

    const appId = body.applicationId;
    const newStatus = body.status;
    const newNote = body.note;
    const author = body.author || 'HR Leader';
    const date = body.date || new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (!appId) {
      return new Response(JSON.stringify({ error: 'Missing applicationId' }), {
        status: 400,
        headers: corsHeaders
      });
    }

    let updated = false;
    let candidateData = null;
    let emailDispatched = false;

    if (env && env.DB) {
      try {
        const row = await env.DB.prepare(
          'SELECT * FROM applications WHERE id = ?'
        ).bind(appId).first();

        if (row) {
          let data = {};
          try {
            data = JSON.parse(row.data || '{}');
          } catch (e) {
            data = {};
          }

          if (newStatus) {
            data.status = newStatus;
          }

          if (newNote) {
            if (!data.hrNotes || !Array.isArray(data.hrNotes)) {
              data.hrNotes = [];
            }
            data.hrNotes.push({ date, author, text: newNote });
          }

          const now = new Date().toISOString();
          await env.DB.prepare(
            'UPDATE applications SET status = ?, data = ?, updated_at = ? WHERE id = ?'
          ).bind(data.status || row.status, JSON.stringify(data), now, appId).run();

          updated = true;
          candidateData = {
            name: data.name || row.name,
            email: data.email || row.email,
            position: data.position || row.position,
            applicationId: appId,
            status: data.status
          };

          // If status changed and email exists, dispatch lifecycle email!
          if (newStatus && candidateData.email) {
            try {
              const mailRes = await dispatchRecruitmentEmail({
                stage: newStatus,
                name: candidateData.name || 'Candidate',
                email: candidateData.email,
                position: candidateData.position || 'Open Position',
                applicationId: appId,
                hrNotes: newNote || '',
                env: env
              });
              emailDispatched = !!(mailRes && mailRes.success);
            } catch (mailErr) {
              console.warn('Status change email dispatch warning:', mailErr);
            }
          }
        }
      } catch (dbErr) {
        console.warn('D1 update status warning:', dbErr);
      }
    }

    return new Response(JSON.stringify({
      status: updated ? 'success' : 'not_found',
      applicationId: appId,
      updatedStatus: newStatus,
      emailDispatched: emailDispatched,
      message: updated 
        ? `Status updated to ${newStatus}${emailDispatched ? ' and candidate notification email dispatched' : ''}` 
        : 'Application not found in database.'
    }), {
      status: updated ? 200 : 404,
      headers: corsHeaders
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: corsHeaders
    });
  }
}
