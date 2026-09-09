import http.server
import json
import urllib.request
import urllib.parse
import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

def load_env():
    env_file = '.env'
    if os.path.exists(env_file):
        with open(env_file, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, val = line.split('=', 1)
                    os.environ[key.strip()] = val.strip()

def send_smtp_email(to_email, subject, html_content):
    smtp_email = os.environ.get('SMTP_EMAIL')
    smtp_password = os.environ.get('SMTP_PASSWORD')
    if smtp_password:
        smtp_password = smtp_password.replace(' ', '')
    
    if not smtp_email or not smtp_password:
        print("\n" + "="*50)
        print("WARNING: No SMTP credentials set. Real email sending is skipped.")
        print("To enable real emails, create a '.env' file in the TASKAS folder with:")
        print("SMTP_EMAIL=your-email@gmail.com")
        print("SMTP_PASSWORD=your-app-password")
        print("="*50 + "\n")
        return False
        
    try:
        # Standard connection for smtp.gmail.com (port 587)
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(smtp_email, smtp_password)
        
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = f"TASKAS Agency <{smtp_email}>"
        msg['To'] = to_email
        
        msg.attach(MIMEText(html_content, 'html'))
        
        # BCC the admin (smtp_email) by adding it to the sendmail recipient list
        recipients = [to_email, smtp_email]
        server.sendmail(smtp_email, recipients, msg.as_string())
        server.quit()
        print(f"SMTP Success: Sent greeting email to {to_email} (BCC'd {smtp_email})")
        return True
    except Exception as ex:
        print(f"SMTP Error: Failed to send email to {to_email} - {str(ex)}")
        return False

def get_email_template(email, phone, dev_type, min_price, max_price, breakdown_text):
    formatted_min = f"{min_price:,}" if isinstance(min_price, int) else min_price
    formatted_max = f"{max_price:,}" if isinstance(max_price, int) else max_price
    
    html_breakdown = breakdown_text.replace('\n', '<br/>')
    
    html = f"""
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
                                            <div style="font-size: 26px; font-weight: 700; color: #111827;">Rs. {formatted_min} - Rs. {formatted_max}</div>
                                        </td>
                                    </tr>
                                </table>
                                
                                <!-- Details Table -->
                                <h2 style="font-size: 15px; font-weight: 600; color: #111827; margin-top: 0; margin-bottom: 12px;">Project Details</h2>
                                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 24px; font-size: 14px;">
                                    <tr>
                                        <td style="padding: 6px 0; color: #6b7280; width: 140px;">Service Type</td>
                                        <td style="padding: 6px 0; color: #111827; font-weight: 500;">{dev_type}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 6px 0; color: #6b7280;">Email Address</td>
                                        <td style="padding: 6px 0; color: #111827; font-weight: 500;">{email}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 6px 0; color: #6b7280;">WhatsApp / Phone</td>
                                        <td style="padding: 6px 0; color: #111827; font-weight: 500;">{phone}</td>
                                    </tr>
                                </table>
                                
                                <!-- Breakdown -->
                                <h2 style="font-size: 15px; font-weight: 600; color: #111827; margin-top: 0; margin-bottom: 12px;">Scope & Timeline</h2>
                                <div style="background-color: #fafafa; border-left: 3px solid #d1d5db; padding: 16px; border-radius: 0 8px 8px 0; font-size: 14px; line-height: 1.6; color: #4b5563; margin-bottom: 30px; font-family: inherit;">
                                    {html_breakdown}
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
    """
    return html

def get_recruitment_email_template(stage, name, position, application_id, hr_notes=""):
    brand_color = '#e67e22'
    dark_navy = '#0f172a'
    light_bg = '#f8fafc'
    border_col = '#e2e8f0'

    if stage == 'Reviewing':
        subject = f"Your Application is Under Review — {position} at TASKAS"
        badge_text = "Under Review"
        badge_bg = "#fffbeb"
        badge_color = "#b45309"
        headline = f"Your profile is being reviewed, {name}"
        main_body = f"""
        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #334155;">
          Thank you for applying for the <strong>{position}</strong> role at TASKAS. We are pleased to let you know that our recruitment team and practice leads are actively evaluating your profile, experience, and submitted portfolio.
        </p>
        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #334155;">
          At TASKAS, we value craftsmanship, technical curiosity, and practical problem-solving. We take time to review each candidate's genuine work rather than relying on automated filters.
        </p>"""
        next_steps = """
        <div style="background-color: #f8fafc; border-left: 4px solid #e67e22; border-radius: 6px; padding: 16px; margin: 20px 0;">
          <strong style="color: #0f172a; font-size: 14px; display: block; margin-bottom: 6px;">Next Steps:</strong>
          <span style="color: #475569; font-size: 14px; line-height: 1.5;">
            Our evaluation cycle typically takes 3–5 business days. If your profile matches our active project needs, you will receive an invitation for an introductory technical / creative discussion.
          </span>
        </div>"""
    elif stage == 'Shortlisted':
        subject = f"Great News: You're Shortlisted for {position} at TASKAS!"
        badge_text = "Profile Shortlisted"
        badge_bg = "#faf5ff"
        badge_color = "#7e22ce"
        headline = f"Congratulations {name}, you're shortlisted!"
        main_body = f"""
        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #334155;">
          We are delighted to inform you that your application for the <strong>{position}</strong> position has been <strong>shortlisted</strong> by our hiring team.
        </p>
        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #334155;">
          Your background, project work, and aspirations stood out among our applicant pool. We see strong potential for you to make a meaningful impact across our digital solutions initiatives.
        </p>"""
        next_steps = """
        <div style="background-color: #f8fafc; border-left: 4px solid #8b5cf6; border-radius: 6px; padding: 16px; margin: 20px 0;">
          <strong style="color: #0f172a; font-size: 14px; display: block; margin-bottom: 6px;">Preparation Advice:</strong>
          <span style="color: #475569; font-size: 14px; line-height: 1.5;">
            Our HR coordinator will contact you shortly via Email and WhatsApp to confirm your availability for an interview discussion. Please keep your portfolio highlights and repository links handy.
          </span>
        </div>"""
    elif stage == 'Interview':
        subject = f"Interview Invitation — {position} at TASKAS"
        badge_text = "Interview Scheduled"
        badge_bg = "#f0fdfa"
        badge_color = "#0f766e"
        headline = f"Interview Invitation for {position}"
        notes_box = f"""
        <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 14px 18px; margin: 18px 0;">
          <strong style="color: #92400e; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 4px;">Note from HR &amp; Interview Panel:</strong>
          <p style="margin: 0; color: #78350f; font-size: 14px; line-height: 1.5;">{hr_notes}</p>
        </div>""" if hr_notes else ""
        main_body = f"""
        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #334155;">
          Hi {name}, based on your shortlisted application, we would like to invite you for an <strong>interview discussion</strong> for the <strong>{position}</strong> role at TASKAS.
        </p>
        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #334155;">
          This session will be an open conversation about your experience, past project architecture, problem-solving approach, and how you envision collaborating with our engineering and design leads.
        </p>
        {notes_box}"""
        next_steps = """
        <div style="background-color: #f8fafc; border-left: 4px solid #0d9488; border-radius: 6px; padding: 16px; margin: 20px 0;">
          <strong style="color: #0f172a; font-size: 14px; display: block; margin-bottom: 6px;">Session Format:</strong>
          <span style="color: #475569; font-size: 14px; line-height: 1.5;">
            Format: Video Call (Google Meet)<br>
            Duration: 30–45 minutes<br>
            Our team will coordinate the exact calendar invite with you shortly. If you have any scheduling constraints, feel free to reply directly to this email or ping us on WhatsApp.
          </span>
        </div>"""
    elif stage == 'Selected':
        subject = f"Congratulations! Offer & Next Steps — {position} at TASKAS"
        badge_text = "Offer Extended"
        badge_bg = "#f0fdf4"
        badge_color = "#15803d"
        headline = f"Welcome to TASKAS, {name}! 🎉"
        main_body = f"""
        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #334155;">
          On behalf of the founders and the entire TASKAS team, we are thrilled to formally congratulate you! Following your performance throughout our evaluation and interview rounds, <strong>you have been selected</strong> for the <strong>{position}</strong> role at TASKAS.
        </p>
        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #334155;">
          We were thoroughly impressed by your skills, energy, and perspective. We believe you will be a remarkable addition to our team as we continue to craft world-class digital solutions.
        </p>"""
        next_steps = """
        <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; border-radius: 6px; padding: 16px; margin: 20px 0;">
          <strong style="color: #166534; font-size: 14px; display: block; margin-bottom: 6px;">Onboarding &amp; Formal Documentation:</strong>
          <span style="color: #14532d; font-size: 14px; line-height: 1.5;">
            Our HR team will reach out with your formal offer documentation, role details, compensation/stipend breakdown, and onboarding timeline.
          </span>
        </div>"""
    elif stage == 'Rejected':
        subject = f"Update on your application for {position} — TASKAS"
        badge_text = "Application Update"
        badge_bg = "#f1f5f9"
        badge_color = "#475569"
        headline = f"Update on your application, {name}"
        main_body = f"""
        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #334155;">
          Thank you for giving us the opportunity to consider your profile for the <strong>{position}</strong> role at TASKAS. We genuinely appreciate the time, effort, and care you invested in your application.
        </p>
        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #334155;">
          After careful consideration of our current team requirements and immediate project deliverables, we have decided to move forward with candidates whose current skill profile more closely aligns with this particular role.
        </p>"""
        next_steps = """
        <div style="background-color: #f8fafc; border-left: 4px solid #94a3b8; border-radius: 6px; padding: 16px; margin: 20px 0;">
          <strong style="color: #0f172a; font-size: 14px; display: block; margin-bottom: 6px;">Staying Connected in Our Talent Pool:</strong>
          <span style="color: #475569; font-size: 14px; line-height: 1.5;">
            Our team expands rapidly and we often have new client projects and specialized positions opening up. We have retained your portfolio and resume in our talent network, and will reach out directly if a fitting opportunity arises.
          </span>
        </div>"""
    else:
        # New / Received
        subject = f"Application Received — {position} at TASKAS"
        badge_text = "Application Received"
        badge_bg = "#eff6ff"
        badge_color = "#1d4ed8"
        headline = f"Hi {name}, thank you for applying!"
        main_body = f"""
        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #334155;">
          Thank you for your interest in joining <strong>TASKAS</strong>. We have safely received your application for the <strong>{position}</strong> role.
        </p>
        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #334155;">
          Our leadership and recruitment team reviews submissions on a weekly rolling basis. We evaluate every portfolio, code sample, and design system to find creators who take true pride in their craft.
        </p>"""
        next_steps = f"""
        <div style="background-color: #f8fafc; border-left: 4px solid #e67e22; border-radius: 6px; padding: 16px; margin: 20px 0;">
          <strong style="color: #0f172a; font-size: 14px; display: block; margin-bottom: 6px;">Review Timeline:</strong>
          <span style="color: #475569; font-size: 14px; line-height: 1.5;">
            If your experience and creative portfolio align with what we are looking for, our team will reach out via Email and WhatsApp to arrange an introductory discussion.
          </span>
        </div>"""

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: {light_bg}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #334155;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: {light_bg}; padding: 36px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; background-color: #ffffff; border: 1px solid {border_col}; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);">
          
          <!-- Brand Header -->
          <tr>
            <td style="padding: 28px 32px 20px; border-bottom: 1px solid #f1f5f9; background-color: #ffffff;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td>
                    <span style="font-size: 22px; font-weight: 800; letter-spacing: -0.02em; color: {dark_navy}; display: inline-block;">
                      TASKAS<span style="color: {brand_color};">.</span>
                    </span>
                    <span style="display: block; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: #94a3b8; margin-top: 2px;">
                      Digital Solutions &amp; Technologies
                    </span>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; background-color: {badge_bg}; color: {badge_color}; font-size: 12px; font-weight: 600; padding: 5px 12px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.04em;">
                      {badge_text}
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
                    Role: <strong style="color: {dark_navy};">{position}</strong>
                  </td>
                  <td align="right" style="font-size: 12px; color: #64748b;">
                    Tracking ID: <strong style="color: #e67e22; font-family: monospace; font-size: 13px;">{application_id}</strong>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 32px 32px 24px;">
              <h1 style="margin: 0 0 16px; font-size: 20px; font-weight: 700; color: {dark_navy}; line-height: 1.3;">
                {headline}
              </h1>

              {main_body}

              {next_steps}

              <!-- Action button -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 28px 0 10px;">
                <tr>
                  <td align="center" style="border-radius: 8px; background-color: {dark_navy};">
                    <a href="https://wa.me/918180818416?text=Hi%20TASKAS%20Team%2C%20regarding%20my%20application%20{application_id}" target="_blank" style="display: inline-block; padding: 12px 24px; font-size: 14px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 8px;">
                      Chat with Team on WhatsApp &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Signoff -->
              <div style="border-top: 1px solid #f1f5f9; padding-top: 20px; margin-top: 24px;">
                <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #64748b;">
                  Warm regards,<br>
                  <strong style="color: {dark_navy};">TASKAS People &amp; Culture Team</strong><br>
                  <a href="mailto:team@taskas.tech" style="color: {brand_color}; text-decoration: none; font-size: 13px;">team@taskas.tech</a> &bull;
                  <a href="https://taskas.tech" style="color: #64748b; text-decoration: none; font-size: 13px;">taskas.tech</a>
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 32px; border-top: 1px solid {border_col}; text-align: center; font-size: 12px; color: #94a3b8; line-height: 1.5;">
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
</html>"""
    return subject, html

def get_career_email_template(name, position, application_id):
    subj, html = get_recruitment_email_template('New', name, position, application_id)
    return html

def submit_to_google_sheet(email, phone, dev_type, min_price, max_price, description, inquiry_id=None):
    script_url = "https://script.google.com/macros/s/AKfycbxVAvc7CaEZ0MV-trOIIquoT6sJJAKm-89rqeOfPA_PjJtZrtzCGkBOX5Rh6vUG5A2L/exec"
    
    if not inquiry_id:
        import random
        inquiry_id = f"TS-{random.randint(10000, 99999)}"
    
    # Format Est. Range
    formatted_min = f"{min_price:,}" if isinstance(min_price, int) else min_price
    formatted_max = f"{max_price:,}" if isinstance(max_price, int) else max_price
    est_range = f"Rs. {formatted_min} - Rs. {formatted_max}"
    
    # Payload matching the column headers of "ESTIMATOR INQUIRY"
    payload = {
        "sheetName": "ESTIMATOR INQUIRY ",
        "inquiryId": inquiry_id,
        "inquiryFor": dev_type,
        "inquiryDescription": description,
        "estRange": est_range,
        "emailId": email,
        "wpNumber": phone,
        "connectStatus": "Pending",
        
        # Standard contact form keys for fallback
        "name": email,
        "email": email,
        "service": dev_type,
        "message": f"Inquiry ID: {inquiry_id}\nEst. Range: {est_range}\n\nDescription:\n{description}",
        
        # Case-insensitive / Exact matches for sheet headers
        "INQUIRY ID": inquiry_id,
        "INQUIRY FOR": dev_type,
        "INQUIRY DESCRIPTION": description,
        "EST. RANGE": est_range,
        "EMAIL ID": email,
        "WP NUMBER": phone,
        "CONNECT STATUS": "Pending"
    }
    
    try:
        req = urllib.request.Request(
            script_url,
            data=json.dumps(payload).encode('utf-8'),
            headers={
                'Content-Type': 'text/plain;charset=utf-8',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) TASKAS/1.0'
            },
            method='POST'
        )
        with urllib.request.urlopen(req, timeout=10) as response:
            res_data = response.read().decode('utf-8')
            print(f"Google Sheet Submission Success: {res_data}")
            return True
    except Exception as ex:
        print(f"Google Sheet Submission Error: {str(ex)}")
        return False

class ProxyHandler(http.server.SimpleHTTPRequestHandler):
    def do_POST(self):
        # Log request to a local file for debugging
        with open('request_log.txt', 'a') as f:
            f.write(f"Method: POST, Path: {self.path}\n")
        
        if self.path == '/api/estimate' or self.path.endswith('/api/estimate'):
            try:
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                data = json.loads(post_data.decode('utf-8'))
                
                last_msg = data.get('prompt', 'Hello')
                system_prompt = data.get('system', '')
                
                encoded_prompt = urllib.parse.quote(last_msg)
                encoded_system = urllib.parse.quote(system_prompt)
                url = f"https://text.pollinations.ai/{encoded_prompt}?system={encoded_system}"
                
                # Setup Python server-side request (bypasses Cloudflare Turnstile)
                req = urllib.request.Request(
                    url,
                    headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) TASKAS/1.0'}
                )
                with urllib.request.urlopen(req, timeout=12) as response:
                    reply_text = response.read().decode('utf-8')
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({'response': reply_text}).encode('utf-8'))
            except Exception as e:
                with open('request_log.txt', 'a') as f:
                    f.write(f"Exception: {str(e)}\n")
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({'error': str(e)}).encode('utf-8'))
        elif self.path == '/api/inquiry' or self.path.endswith('/api/inquiry'):
            try:
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                data = json.loads(post_data.decode('utf-8'))
                
                email = data.get('email', '')
                phone = data.get('phone', '')
                dev_type = data.get('devType', '')
                min_price = data.get('minPrice', 0)
                max_price = data.get('maxPrice', 0)
                
                leads_file = 'leads.json'
                leads_list = []
                if os.path.exists(leads_file):
                    try:
                        with open(leads_file, 'r', encoding='utf-8') as lf:
                            leads_list = json.load(lf)
                    except Exception:
                        leads_list = []
                
                leads_list.append(data)
                with open(leads_file, 'w', encoding='utf-8') as lf:
                    json.dump(leads_list, lf, indent=2)
                
                # Generate email template and send email greeting
                breakdown = data.get('breakdown', '')
                description = data.get('description', '')
                email_html = get_email_template(email, phone, dev_type, min_price, max_price, breakdown)
                email_sent = send_smtp_email(email, "Your TASKAS Project Estimate & Greeting", email_html)
                
                inquiry_id = data.get('inquiryId', '')
                
                # Submit to Google Sheets (ESTIMATOR INQUIRY tab)
                sheet_submitted = submit_to_google_sheet(email, phone, dev_type, min_price, max_price, description, inquiry_id)
                
                print("\n" + "="*50)
                print(f"LEAD AUTOMATION TRIGGERED")
                print(f"Client Email: {email}")
                print(f"Client Phone: {phone}")
                print(f"Project Type: {dev_type}")
                print(f"Est. Range : Rs. {min_price} - Rs. {max_price}")
                print(f"Action: Sent real onboarding email to client: {'YES' if email_sent else 'NO (credentials missing/skipped)'}")
                print(f"Action: Submitted inquiry to Google Sheet: {'YES' if sheet_submitted else 'NO (failed)'}")
                print("Action: Created new record in CRM leads.json.")
                print("="*50 + "\n")
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({
                    'status': 'success', 
                    'message': 'Lead automation triggered.', 
                    'email_sent': email_sent,
                    'sheet_submitted': sheet_submitted
                }).encode('utf-8'))
            except Exception as e:
                import traceback
                traceback.print_exc()
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({'error': str(e)}).encode('utf-8'))
        elif self.path == '/api/apply' or self.path.endswith('/api/apply'):
            try:
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                data = json.loads(post_data.decode('utf-8'))
                
                app_id = data.get('applicationId') or f"APP-{int(urllib.request.time.time()) if hasattr(urllib.request, 'time') else 10490}"
                data['applicationId'] = app_id
                if 'status' not in data:
                    data['status'] = 'New'
                
                apps_file = 'applications.json'
                apps_list = []
                if os.path.exists(apps_file):
                    try:
                        with open(apps_file, 'r', encoding='utf-8') as af:
                            apps_list = json.load(af)
                    except Exception:
                        apps_list = []
                
                apps_list.insert(0, data)
                with open(apps_file, 'w', encoding='utf-8') as af:
                    json.dump(apps_list, af, indent=2)
                
                # Send confirmation email to applicant
                name = data.get('name', 'Applicant')
                email = data.get('email', '')
                position = data.get('position', 'Open Position')
                email_sent = False
                if email:
                    email_html = get_career_email_template(name, position, app_id)
                    email_sent = send_smtp_email(email, f"Application Received — {position} at TASKAS", email_html)
                
                print("\n" + "="*50)
                print(f"CANDIDATE APPLICATION RECEIVED")
                print(f"Candidate: {name} ({email})")
                print(f"Position : {position}")
                print(f"App ID   : {app_id}")
                print(f"Action   : Saved to CRM applications.json")
                print(f"Email    : {'Sent confirmation email' if email_sent else 'Skipped/No SMTP'}")
                print("="*50 + "\n")
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({
                    'status': 'success',
                    'applicationId': app_id,
                    'message': 'Application submitted successfully.',
                    'email_sent': email_sent
                }).encode('utf-8'))
            except Exception as e:
                import traceback
                traceback.print_exc()
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({'error': str(e)}).encode('utf-8'))
        elif self.path == '/api/applications/status' or self.path.endswith('/api/applications/status'):
            try:
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                data = json.loads(post_data.decode('utf-8'))
                
                app_id = data.get('applicationId')
                new_status = data.get('status')
                new_note = data.get('note')
                
                apps_file = 'applications.json'
                apps_list = []
                if os.path.exists(apps_file):
                    try:
                        with open(apps_file, 'r', encoding='utf-8') as af:
                            apps_list = json.load(af)
                    except Exception:
                        apps_list = []
                
                updated = False
                for app in apps_list:
                    if app.get('applicationId') == app_id:
                        if new_status:
                            app['status'] = new_status
                        if new_note:
                            if 'hrNotes' not in app or not isinstance(app['hrNotes'], list):
                                app['hrNotes'] = []
                            app['hrNotes'].append({
                                'date': data.get('date') or 'Just now',
                                'author': data.get('author') or 'HR',
                                'text': new_note
                            })
                        updated = True
                        break
                
                email_dispatched = False
                if updated:
                    with open(apps_file, 'w', encoding='utf-8') as af:
                        json.dump(apps_list, af, indent=2)
                    
                    # Dispatch status email if new_status is set
                    if new_status:
                        target_app = next((a for a in apps_list if a.get('applicationId') == app_id), None)
                        if target_app and target_app.get('email'):
                            candidate_name = target_app.get('name', 'Candidate')
                            candidate_email = target_app.get('email')
                            pos = target_app.get('position', 'Open Position')
                            subj, body_html = get_recruitment_email_template(new_status, candidate_name, pos, app_id, new_note or '')
                            email_dispatched = send_smtp_email(candidate_email, subj, body_html)
                            print(f"[STATUS EMAIL] Sent {new_status} email to {candidate_email}: {'SUCCESS' if email_dispatched else 'FAILED/SKIPPED'}")
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({'status': 'success' if updated else 'not_found'}).encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({'error': str(e)}).encode('utf-8'))
        else:
            # Handle other POST requests
            super().do_POST()

    def do_GET(self):
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path
        
        if path == '/api/applications' or path.endswith('/api/applications'):
            apps_file = 'applications.json'
            apps_list = []
            if os.path.exists(apps_file):
                try:
                    with open(apps_file, 'r', encoding='utf-8') as f:
                        apps_list = json.load(f)
                except Exception:
                    apps_list = []
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(apps_list).encode('utf-8'))
        elif path == '/api/leads' or path.endswith('/api/leads'):
            leads_file = 'leads.json'
            leads_list = []
            if os.path.exists(leads_file):
                try:
                    with open(leads_file, 'r', encoding='utf-8') as f:
                        leads_list = json.load(f)
                except Exception:
                    leads_list = []
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(leads_list).encode('utf-8'))
        else:
            # Clean URL support: automatically map /about -> /about.html, /careers -> /careers.html
            clean_path = path.lstrip('/')
            if clean_path and not os.path.splitext(clean_path)[1]:
                html_candidate = clean_path + '.html'
                if os.path.isfile(html_candidate):
                    query = f"?{parsed_url.query}" if parsed_url.query else ""
                    self.path = f"/{html_candidate}{query}"
            super().do_GET()

    def do_OPTIONS(self):
        # Support preflight CORS requests if needed
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

if __name__ == '__main__':
    # Ensure we run in the directory of the server script
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    load_env()
    server_address = ('', 8080)
    httpd = http.server.HTTPServer(server_address, ProxyHandler)
    print("Serving on http://localhost:8080 with AI Estimator Proxy active...")
    httpd.serve_forever()
