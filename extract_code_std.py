import re
import json
import html

file_path = r"C:\Users\Arshad\.gemini\antigravity\brain\bc5e92f2-06fc-4b7f-addb-8f476959ca78\.system_generated\steps\584\content.md"

with open(file_path, "r", encoding="utf-8") as f:
    html_content = f.read()

# Let's search raw regex in the html text for code: "..." or code: '...'
print("\nRaw search in text for code field:")
code_matches = re.finditer(r'"code"\s*:\s*"([^"]+)"', html_content)
count = 0
for m in code_matches:
    cm = m.group(1)
    try:
        # We can unescape using json.loads to handle double-escaped json string
        decoded = json.loads(f'"{cm}"')
        print(f"Raw match {count} (len={len(decoded)}):")
        print(decoded[:800])
        print("...\n")
        
        # Save the first non-trivial React code to a file
        if "import" in decoded or "export" in decoded or "React" in decoded:
            filename = f"C:\\Users\\Arshad\\.gemini\\antigravity\\brain\\bc5e92f2-06fc-4b7f-addb-8f476959ca78\\scratch\\extracted_component_{count}.tsx"
            with open(filename, "w", encoding="utf-8") as out:
                out.write(decoded)
            print(f"Saved to {filename}")
        count += 1
    except Exception as e:
        print(f"Error decoding match {count}: {e}")

# Also search for code block elements in html (since we don't have bs4, let's use regex to find pre/code)
print("\nSearching pre/code using regex:")
pre_matches = re.finditer(r'<pre[^>]*>(.*?)</pre>', html_content, re.DOTALL)
for i, m in enumerate(pre_matches):
    content_inside = m.group(1)
    # clean html entities
    cleaned = html.unescape(re.sub(r'<[^>]+>', '', content_inside))
    if i < 5:
        print(f"Pre {i} (len={len(cleaned)}):")
        print(cleaned[:400])
        print("...\n")
