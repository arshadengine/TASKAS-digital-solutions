import re
import json

file_path = r"C:\Users\Arshad\.gemini\antigravity\brain\bc5e92f2-06fc-4b7f-addb-8f476959ca78\.system_generated\steps\584\content.md"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Let's find all keys named "code" in the JSON structures in the file
# Example: "code":"..."
matches = re.finditer(r'"code"\s*:\s*"([^"]+)"', content)
print("Found matches:")
for idx, m in enumerate(matches):
    val = m.group(1)
    if len(val) > 100:
        try:
            decoded = json.loads(f'"{val}"')
            print(f"Match {idx} (len={len(decoded)}):")
            print(decoded[:1000])
            print("=" * 80)
            
            # Save it
            with open(f"C:\\Users\\Arshad\\.gemini\\antigravity\\brain\\bc5e92f2-06fc-4b7f-addb-8f476959ca78\\scratch\\non_empty_code_{idx}.txt", "w", encoding="utf-8") as out:
                out.write(decoded)
        except Exception as e:
            print(f"Match {idx} error decoding: {e}")
            print("Raw snippet:")
            print(val[:200])
            print("-" * 50)
