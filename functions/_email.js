// functions/_email.js
// TASKAS Automated Recruitment Email Templates & Edge Dispatcher (Light Theme)

export function getRecruitmentEmail({ stage, name, position, applicationId, hrNotes = '' }) {
  const brandColor = '#e67e22'; // TASKAS Amber
  const darkNavy = '#0f172a';
  const lightBg = '#f8fafc';
  const borderCol = '#e2e8f0';

  let subject = '';
  let badgeText = '';
  let badgeBg = '#eff6ff';
  let badgeColor = '#1d4ed8';
  let headline = '';
  let mainBody = '';
  let nextStepsHtml = '';

  switch (stage) {
    case 'Reviewing':
      subject = `Your Application is Under Review — ${position} at TASKAS`;
      badgeText = 'Under Review';
      badgeBg = '#fffbeb';
      badgeColor = '#b45309';
      headline = `Your profile is being reviewed, ${name}`;
      mainBody = `
        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #334155;">
          Thank you for applying for the <strong>${position}</strong> role at TASKAS. We are pleased to let you know that our recruitment team and practice leads are actively evaluating your profile, experience, and submitted portfolio.
        </p>
        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #334155;">
          At TASKAS, we value craftsmanship, technical curiosity, and practical problem-solving. We take time to review each candidate\'s genuine work rather than relying on automated filters.
        </p>
      `;
      nextStepsHtml = `
        <div style="background-color: #f8fafc; border-left: 4px solid #e67e22; border-radius: 6px; padding: 16px; margin: 20px 0;">
          <strong style="color: #0f172a; font-size: 14px; display: block; margin-bottom: 6px;">Next Steps:</strong>
          <span style="color: #475569; font-size: 14px; line-height: 1.5;">
            Our evaluation cycle typically takes 3–5 business days. If your profile matches our active project needs, you will receive an invitation for an introductory technical / creative discussion.
          </span>
        </div>
      `;
      break;

    case 'Shortlisted':
      subject = `Great News: You\'re Shortlisted for ${position} at TASKAS!`;
      badgeText = 'Profile Shortlisted';
      badgeBg = '#faf5ff';
      badgeColor = '#7e22ce';
      headline = `Congratulations ${name}, you\'re shortlisted!`;
      mainBody = `
        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #334155;">
          We are delighted to inform you that your application for the <strong>${position}</strong> position has been <strong>shortlisted</strong> by our hiring team.
        </p>
        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #334155;">
          Your background, project work, and aspirations stood out among our applicant pool. We see strong potential for you to make a meaningful impact across our digital solutions initiatives.
        </p>
      `;
      nextStepsHtml = `
        <div style="background-color: #f8fafc; border-left: 4px solid #8b5cf6; border-radius: 6px; padding: 16px; margin: 20px 0;">
          <strong style="color: #0f172a; font-size: 14px; display: block; margin-bottom: 6px;">Preparation Advice:</strong>
          <span style="color: #475569; font-size: 14px; line-height: 1.5;">
            Our HR coordinator will contact you shortly via Email and WhatsApp to confirm your availability for an interview discussion. Please keep your portfolio highlights and repository links handy.
          </span>
        </div>
      `;
      break;

    case 'Interview':
      subject = `Interview Invitation — ${position} at TASKAS`;
      badgeText = 'Interview Scheduled';
      badgeBg = '#f0fdfa';
      badgeColor = '#0f766e';
      headline = `Interview Invitation for ${position}`;
      mainBody = `
        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #334155;">
          Hi ${name}, based on your shortlisted application, we would like to invite you for an <strong>interview discussion</strong> for the <strong>${position}</strong> role at TASKAS.
        </p>
        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #334155;">
          This session will be an open conversation about your experience, past project architecture, problem-solving approach, and how you envision collaborating with our engineering and design leads.
        </p>
        ${hrNotes ? `
        <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 14px 18px; margin: 18px 0;">
          <strong style="color: #92400e; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 4px;">Note from HR &amp; Interview Panel:</strong>
          <p style="margin: 0; color: #78350f; font-size: 14px; line-height: 1.5;">${hrNotes}</p>
        </div>` : ''}
      `;
      nextStepsHtml = `
        <div style="background-color: #f8fafc; border-left: 4px solid #0d9488; border-radius: 6px; padding: 16px; margin: 20px 0;">
          <strong style="color: #0f172a; font-size: 14px; display: block; margin-bottom: 6px;">Session Format:</strong>
          <span style="color: #475569; font-size: 14px; line-height: 1.5;">
            Format: Video Call (Google Meet)<br>
            Duration: 30–45 minutes<br>
            Our team will coordinate the exact calendar invite with you shortly. If you have any scheduling constraints, feel free to reply directly to this email or reach us on WhatsApp.
          </span>
        </div>
      `;
      break;

    case 'Selected':
      subject = `Congratulations! Offer & Next Steps — ${position} at TASKAS`;
      badgeText = 'Offer Extended';
      badgeBg = '#f0fdf4';
      badgeColor = '#15803d';
      headline = `Welcome to TASKAS, ${name}! 🎉`;
      mainBody = `
        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #334155;">
          On behalf of the founders and the entire TASKAS team, we are thrilled to formally congratulate you! Following your performance throughout our evaluation and interview rounds, <strong>you have been selected</strong> for the <strong>${position}</strong> role at TASKAS.
        </p>
        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #334155;">
          We were thoroughly impressed by your skills, energy, and perspective. We believe you will be a remarkable addition to our team as we continue to craft world-class digital solutions.
        </p>
      `;
      nextStepsHtml = `
        <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; border-radius: 6px; padding: 16px; margin: 20px 0;">
          <strong style="color: #166534; font-size: 14px; display: block; margin-bottom: 6px;">Onboarding &amp; Documentation:</strong>
          <span style="color: #14532d; font-size: 14px; line-height: 1.5;">
            Our HR team will reach out with your formal offer documentation, role details, compensation/stipend breakdown, and onboarding timeline.
          </span>
        </div>
      `;
      break;

    case 'Rejected':
      subject = `Update on your application for ${position} — TASKAS`;
      badgeText = 'Application Update';
      badgeBg = '#f1f5f9';
      badgeColor = '#475569';
      headline = `Update on your application, ${name}`;
      mainBody = `
        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #334155;">
          Thank you for giving us the opportunity to consider your profile for the <strong>${position}</strong> role at TASKAS. We genuinely appreciate the time, effort, and care you invested in your application.
        </p>
        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #334155;">
          After careful consideration of our current project deliverables and immediate requirements, we have decided to move forward with candidates whose current skill profile more closely aligns with this particular role.
        </p>
      `;
      nextStepsHtml = `
        <div style="background-color: #f8fafc; border-left: 4px solid #94a3b8; border-radius: 6px; padding: 16px; margin: 20px 0;">
          <strong style="color: #0f172a; font-size: 14px; display: block; margin-bottom: 6px;">Staying Connected in Our Talent Pool:</strong>
          <span style="color: #475569; font-size: 14px; line-height: 1.5;">
            Our team expands rapidly and we often have new client projects and specialized positions opening up. We have retained your portfolio and resume in our talent network, and will reach out directly if a fitting opportunity arises.
          </span>
        </div>
      `;
      break;

    case 'New':
    default:
      subject = `Application Received — ${position} at TASKAS`;
      badgeText = 'Application Received';
      badgeBg = '#eff6ff';
      badgeColor = '#1d4ed8';
      headline = `Hi ${name}, thank you for applying!`;
      mainBody = `
        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #334155;">
          Thank you for your interest in joining <strong>TASKAS</strong>. We have safely received your application for the <strong>${position}</strong> role.
        </p>
        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #334155;">
          Our leadership and recruitment team reviews submissions on a weekly rolling basis. We evaluate every portfolio, code sample, and design system to find creators who take true pride in their craft.
        </p>
      `;
      nextStepsHtml = `
        <div style="background-color: #f8fafc; border-left: 4px solid #e67e22; border-radius: 6px; padding: 16px; margin: 20px 0;">
          <strong style="color: #0f172a; font-size: 14px; display: block; margin-bottom: 6px;">Review Timeline:</strong>
          <span style="color: #475569; font-size: 14px; line-height: 1.5;">
            If your experience and creative portfolio align with what we are looking for, our team will reach out via Email and WhatsApp to arrange an introductory discussion.
          </span>
        </div>
      `;
      break;
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${lightBg}; font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #334155;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: ${lightBg}; padding: 36px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; background-color: #ffffff; border: 1px solid ${borderCol}; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);">
          
          <!-- Brand Header -->
          <tr>
            <td style="padding: 28px 32px 20px; border-bottom: 1px solid #f1f5f9; background-color: #ffffff;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td>
                    <span style="font-size: 22px; font-weight: 800; letter-spacing: -0.02em; color: ${darkNavy}; display: inline-block;">
                      TASKAS<span style="color: ${brandColor};">.</span>
                    </span>
                    <span style="display: block; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: #94a3b8; margin-top: 2px;">
                      Digital Solutions &amp; Technologies
                    </span>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; background-color: ${badgeBg}; color: ${badgeColor}; font-size: 12px; font-weight: 600; padding: 5px 12px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.04em;">
                      ${badgeText}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Application ID Banner -->
          <tr>
            <td style="background-color: #fafbfc; padding: 12px 32px; border-bottom: 1px solid #f1f5f9;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="font-size: 12px; color: #64748b; font-weight: 500;">
                    Role: <strong style="color: ${darkNavy};">${position}</strong>
                  </td>
                  <td align="right" style="font-size: 12px; color: #64748b;">
                    Tracking ID: <strong style="color: #e67e22; font-family: monospace; font-size: 13px;">${applicationId}</strong>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 32px 32px 24px;">
              <h1 style="margin: 0 0 16px; font-size: 20px; font-weight: 700; color: ${darkNavy}; line-height: 1.3;">
                ${headline}
              </h1>

              ${mainBody}

              ${nextStepsHtml}

              <!-- Action button -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 28px 0 10px;">
                <tr>
                  <td align="center" style="border-radius: 8px; background-color: ${darkNavy};">
                    <a href="https://wa.me/918180818416?text=Hi%20TASKAS%20Team%2C%20regarding%20my%20application%20${applicationId}" target="_blank" style="display: inline-block; padding: 12px 24px; font-size: 14px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 8px;">
                      Chat with Team on WhatsApp &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Signoff -->
              <div style="border-top: 1px solid #f1f5f9; padding-top: 20px; margin-top: 24px;">
                <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #64748b;">
                  Warm regards,<br>
                  <strong style="color: ${darkNavy};">TASKAS People &amp; Culture Team</strong><br>
                  <a href="mailto:team@taskas.tech" style="color: ${brandColor}; text-decoration: none; font-size: 13px;">team@taskas.tech</a> &bull;
                  <a href="https://taskas.tech" style="color: #64748b; text-decoration: none; font-size: 13px;">taskas.tech</a>
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 32px; border-top: 1px solid ${borderCol}; text-align: center; font-size: 12px; color: #94a3b8; line-height: 1.5;">
              &copy; 2026 TASKAS Digital Solutions. All rights reserved.<br>
              Pune &bull; Mumbai &bull; Maharashtra &bull; India<br>
              <span style="font-size: 11px; color: #cbd5e1;">This is an automated notification regarding your career application at TASKAS.</span>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, html };
}

export async function dispatchRecruitmentEmail({ stage, name, email, position, applicationId, hrNotes = '', env = {} }) {
  if (!email) return { success: false, reason: 'No recipient email' };

  const { subject, html } = getRecruitmentEmail({ stage, name, position, applicationId, hrNotes });

  const appsScriptUrl = (env && env.GOOGLE_SCRIPT_URL) || "https://script.google.com/macros/s/AKfycbxVAvc7CaEZ0MV-trOIIquoT6sJJAKm-89rqeOfPA_PjJtZrtzCGkBOX5Rh6vUG5A2L/exec";
  try {
    const res = await fetch(appsScriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'send_applicant_email',
        to: email,
        subject: subject,
        htmlBody: html,
        candidateName: name,
        position: position,
        applicationId: applicationId,
        stage: stage
      })
    });
    const result = await res.json().catch(() => ({}));
    return { success: true, method: 'google_apps_script', result };
  } catch (err) {
    console.warn('Email dispatch warning:', err);
    return { success: false, error: err.message };
  }
}
