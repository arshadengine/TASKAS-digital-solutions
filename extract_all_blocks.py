import re
import html

file_path = r"C:\Users\Arshad\.gemini\antigravity\brain\bc5e92f2-06fc-4b7f-addb-8f476959ca78\.system_generated\steps\584\content.md"

with open(file_path, "r", encoding="utf-8") as f:
    html_content = f.read()

# Let's find all pre tags using a relaxed regex
pre_matches = re.finditer(r'<pre[^>]*>(.*?)</pre>', html_content, re.DOTALL)
count = 0
for m in pre_matches:
    content_inside = m.group(1)
    # clean HTML entities and tags
    cleaned = html.unescape(re.sub(r'<[^>]+>', '', content_inside))
    
    filename = f"C:\\Users\\Arshad\\.gemini\\antigravity\\brain\\bc5e92f2-06fc-4b7f-addb-8f476959ca78\\scratch\\pre_block_{count}.txt"
    with open(filename, "w", encoding="utf-8") as out:
        out.write(cleaned)
    
    print(f"Pre {count} (len={len(cleaned)}) saved to {filename}")
    print(cleaned[:200])
    print("-" * 50)
    count += 1
