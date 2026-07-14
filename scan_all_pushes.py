import re
import html
import json

file_path = r"C:\Users\Arshad\.gemini\antigravity\brain\bc5e92f2-06fc-4b7f-addb-8f476959ca78\.system_generated\steps\584\content.md"

with open(file_path, "r", encoding="utf-8") as f:
    html_content = f.read()

# Let's extract all pushes first, just like the previous script did
pushes = re.findall(r'self\.__next_f\.push\(\[(.*?)\n*\]\)', html_content)
print(f"Total pushes found: {len(pushes)}")

for idx, push in enumerate(pushes):
    # Let's find any HTML-like or Shiki-like code blocks in the push
    # We can search for shiki class or <code> tags
    shiki_matches = re.finditer(r'\\u003cpre[^>]*class=\\u0022shiki(.*?)\\u003c/pre\\u003e', push)
    for j, sm in enumerate(shiki_matches):
        block = sm.group(0)
        # Unescape the unicode sequences
        try:
            decoded_html = block.encode().decode('unicode-escape')
            # Let's clean tags to see the text
            clean_text = html.unescape(re.sub(r'<[^>]+>', '', decoded_html))
            print(f"Push {idx}, Shiki Block {j} (len={len(clean_text)}):")
            print(clean_text[:1200])
            print("=" * 60)
            
            # Save it
            filename = f"C:\\Users\\Arshad\\.gemini\\antigravity\\brain\\bc5e92f2-06fc-4b7f-addb-8f476959ca78\\scratch\\extracted_shiki_{idx}_{j}.txt"
            with open(filename, "w", encoding="utf-8") as out:
                out.write(clean_text)
            print(f"Saved to {filename}")
        except Exception as e:
            print(f"Error decoding block in push {idx}: {e}")
            
    # Also let's check for standard code tags that might be encoded differently
    code_matches = re.finditer(r'<code>(.*?)</code>', push)
    for j, cm in enumerate(code_matches):
        block = cm.group(1)
        cleaned = html.unescape(re.sub(r'<[^>]+>', '', block))
        print(f"Push {idx}, Code Tag {j} (len={len(cleaned)}):")
        print(cleaned[:800])
        print("=" * 60)
