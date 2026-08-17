import { connect } from 'cloudflare:sockets';

// SMTP Client for Cloudflare Workers using secure TCP sockets
async function sendSMTPEmail({ host, port, username, password, from, to, subject, html }) {
  const socket = connect({ hostname: host, port: port }, { secureTransport: 'on' });
  const writer = socket.writable.getWriter();
  const reader = socket.readable.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  let buffer = '';

  async function readLine() {
    while (!buffer.includes('\n')) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value);
    }
    const idx = buffer.indexOf('\n');
    if (idx === -1) {
      const line = buffer;
      buffer = '';
      return line;
    }
    const line = buffer.slice(0, idx + 1);
    buffer = buffer.slice(idx + 1);
    return line;
  }

  async function expectCode(expectedCode) {
    const line = await readLine();
    if (!line.startsWith(expectedCode.toString())) {
      throw new Error(`SMTP Error: Expected code ${expectedCode}, got: ${line.trim()}`);
    }
    return line;
  }

  async function sendLine(line) {
    await writer.write(encoder.encode(line + '\r\n'));
  }

  // Handshake
  await expectCode(220);
  await sendLine(`EHLO ${host}`);
  
  let line = '';
  do {
    line = await readLine();
  } while (line.startsWith('250-'));

  // Auth Login
  await sendLine('AUTH LOGIN');
  await expectCode(334);
  await sendLine(btoa(username));
  await expectCode(334);
  await sendLine(btoa(password));
  await expectCode(235);

  // Mail flow
  await sendLine(`MAIL FROM:<${from}>`);
  await expectCode(250);
  await sendLine(`RCPT TO:<${to}>`);
  await expectCode(250);
  await sendLine(`RCPT TO:<${username}>`);
  await expectCode(250);

  await sendLine('DATA');
  await expectCode(354);

  // Headers and Content
  const mailData = [
    `From: TASKAS Agency <${from}>`,
    `To: ${to}`,
    `Cc: ${username}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
    '',
    html,
    '.'
  ].join('\r\n');

  await sendLine(mailData);
  await expectCode(250);

  await sendLine('QUIT');
  await expectCode(221);

  await writer.close();
  await reader.cancel();
}

function getEmailTemplate(email, phone, devType, minPrice, maxPrice, breakdownText) {
  const formattedMin = typeof minPrice === 'number' ? minPrice.toLocaleString('en-IN') : minPrice;
  const formattedMax = typeof maxPrice === 'number' ? maxPrice.toLocaleString('en-IN') : maxPrice;
  const htmlBreakdown = breakdownText.replace(/\n/g, '<br/>');
  
  return `
  <!DOCTYPE html>
  <html>
  <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your TASKAS Estimate</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; color: #374151; margin: 0; padding: 0; -webkit-font-smoothing: antialiased;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f9fafb; padding: 40px 20px;">
          <tr>
              <td align="center">
                  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
                      <!-- Header -->
                      <tr>
                          <td style="padding-bottom: 24px; border-bottom: 1px solid #f3f4f6;">
                              <span style="font-size: 20px; font-weight: 700; color: #111827; letter-spacing: -0.02em;">TASKAS</span>
                          </td>
                      </tr>
                      <!-- Content -->
                      <tr>
                          <td style="padding-top: 30px;">
                              <h1 style="font-size: 20px; font-weight: 600; color: #111827; margin-top: 0; margin-bottom: 16px;">Hi there,</h1>
                              <p style="font-size: 15px; line-height: 1.6; color: #4b5563; margin-top: 0; margin-bottom: 24px;">Thanks for checking out our price estimator. We've compiled your preliminary project estimate based on our chat.</p>
                              
                              <!-- Estimate Card -->
                              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f3f4f6; border-radius: 8px; margin-bottom: 28px;">
                                  <tr>
                                      <td style="padding: 20px; text-align: center;">
                                          <div style="font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; margin-bottom: 6px;">Estimated Investment Range</div>
                                          <div style="font-size: 26px; font-weight: 700; color: #111827;">Rs. ${formattedMin} - Rs. ${formattedMax}</div>
                                      </td>
                                  </tr>
                              </table>
                              
                              <!-- Details Table -->
                              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 24px; font-size: 14px;">
                                  <tr>
                                      <td style="padding: 6px 0; color: #6b7280; width: 140px;">Service Type</td>
                                      <td style="padding: 6px 0; color: #111827; font-weight: 500;">${devType}</td>
                                  </tr>
                                  <tr>
                                      <td style="padding: 6px 0; color: #6b7280;">Email Address</td>
                                      <td style="padding: 6px 0; color: #111827; font-weight: 500;">${email}</td>
                                  </tr>
                                  <tr>
                                      <td style="padding: 6px 0; color: #6b7280;">WhatsApp / Phone</td>
                                      <td style="padding: 6px 0; color: #111827; font-weight: 500;">${phone}</td>
                                  </tr>
                              </table>
                              
                              <!-- Breakdown -->
                              <h2 style="font-size: 15px; font-weight: 600; color: #111827; margin-top: 0; margin-bottom: 12px;">Scope & Timeline</h2>
                              <div style="background-color: #fafafa; border-left: 3px solid #d1d5db; padding: 16px; border-radius: 0 8px 8px 0; font-size: 14px; line-height: 1.6; color: #4b5563; margin-bottom: 30px; font-family: inherit;">
                                  ${htmlBreakdown}
                              </div>
                              
                              <p style="font-size: 15px; line-height: 1.6; color: #4b5563; margin-top: 0; margin-bottom: 24px;">Our team is reviewing this information and will reach out to you shortly to discuss your project in detail. In the meantime, if you'd like to get started or have any questions, you can jump straight into a chat with us on WhatsApp.</p>
                              
                              <!-- CTA -->
                              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                  <tr>
                                      <td align="center" style="padding-bottom: 10px;">
                                          <a href="https://wa.me/918180818416" style="display: inline-block; background-color: #111827; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: 500; font-size: 14px;">Chat on WhatsApp</a>
                                      </td>
                                  </tr>
                              </table>
                          </td>
                      </tr>
                      <!-- Footer -->
                      <tr>
                          <td style="padding-top: 30px; border-top: 1px solid #f3f4f6; text-align: center; font-size: 12px; color: #9ca3af; line-height: 1.5;">
                              &copy; 2026 TASKAS. All rights reserved.<br>
                              This is an automated estimate summary requested via our website.
                          </td>
                      </tr>
                  </table>
              </td>
          </tr>
      </table>
  </body>
  </html>
  `;
}

async function submitToGoogleSheet(email, phone, devType, minPrice, maxPrice, description, inquiryId) {
  const scriptUrl = "https://script.google.com/macros/s/AKfycbxVAvc7CaEZ0MV-trOIIquoT6sJJAKm-89rqeOfPA_PjJtZrtzCGkBOX5Rh6vUG5A2L/exec";
  const formattedMin = typeof minPrice === 'number' ? minPrice.toLocaleString('en-IN') : minPrice;
  const formattedMax = typeof maxPrice === 'number' ? maxPrice.toLocaleString('en-IN') : maxPrice;
  const estRange = `Rs. ${formattedMin} - Rs. ${formattedMax}`;
  
  const payload = {
    sheetName: "ESTIMATOR INQUIRY ",
    inquiryId: inquiryId,
    inquiryFor: devType,
    inquiryDescription: description,
    estRange: estRange,
    emailId: email,
    wpNumber: phone,
    connectStatus: "Pending",
    
    name: email,
    email: email,
    service: devType,
    message: `Inquiry ID: ${inquiryId}\nEst. Range: ${estRange}\n\nDescription:\n${description}`,
    
    "INQUIRY ID": inquiryId,
    "INQUIRY FOR": devType,
    "INQUIRY DESCRIPTION": description,
    "EST. RANGE": estRange,
    "EMAIL ID": email,
    "WP NUMBER": phone,
    "CONNECT STATUS": "Pending"
  };
  
  try {
    const res = await fetch(scriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) TASKAS/1.0'
      },
      body: JSON.stringify(payload)
    });
    return res.ok;
  } catch (ex) {
    console.error("Google Sheet Submission Error:", ex);
    return false;
  }
}

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
    const { request, env } = context;
    const data = await request.json();
    
    const email = data.email || '';
    const phone = data.phone || '';
    const devType = data.devType || '';
    const minPrice = data.minPrice || 0;
    const maxPrice = data.maxPrice || 0;
    const breakdown = data.breakdown || '';
    const description = data.description || '';
    let inquiryId = data.inquiryId || '';
    
    if (!inquiryId) {
      inquiryId = `TS-${Math.floor(10000 + Math.random() * 90000)}`;
    }

    // 1. Insert into Cloudflare D1 SQL database
    let dbSuccess = false;
    if (env.DB) {
      try {
        await env.DB.prepare(
          "INSERT INTO inquiries (inquiry_id, email, phone, dev_type, min_price, max_price, description, breakdown) VALUES (?, ?, ?, ?, ?, ?, ?, ?);"
        ).bind(
          inquiryId, email, phone, devType, minPrice, maxPrice, description, breakdown
        ).run();
        dbSuccess = true;
      } catch (dbErr) {
        console.error("Database Insert Error:", dbErr);
      }
    } else {
      console.warn("DB binding not found. Skipping D1 insertion.");
    }

    // 2. Submit to Google Sheet script
    const sheetSubmitted = await submitToGoogleSheet(email, phone, devType, minPrice, maxPrice, description, inquiryId);

    // 3. Send email via SMTP (Gmail)
    let emailSent = false;
    const smtpEmail = env.SMTP_EMAIL;
    const smtpPassword = env.SMTP_PASSWORD;

    if (smtpEmail && smtpPassword) {
      try {
        const cleanPassword = smtpPassword.replace(/\s+/g, '');
        const emailHtml = getEmailTemplate(email, phone, devType, minPrice, maxPrice, breakdown);
        
        await sendSMTPEmail({
          host: 'smtp.gmail.com',
          port: 465,
          username: smtpEmail,
          password: cleanPassword,
          from: smtpEmail,
          to: email,
          subject: "Your TASKAS Project Estimate & Greeting",
          html: emailHtml
        });
        emailSent = true;
      } catch (emailErr) {
        console.error("SMTP Email Error:", emailErr);
      }
    } else {
      console.warn("SMTP credentials missing. Skipping email sending.");
    }

    return new Response(JSON.stringify({
      status: 'success',
      message: 'Lead automation triggered.',
      db_saved: dbSuccess,
      email_sent: emailSent,
      sheet_submitted: sheetSubmitted
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
