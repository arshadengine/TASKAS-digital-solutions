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
        else:
            # Handle other POST requests
            super().do_POST()

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
