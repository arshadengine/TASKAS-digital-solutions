import re

file_path = r"C:\Users\Arshad\.gemini\antigravity\brain\bc5e92f2-06fc-4b7f-addb-8f476959ca78\.system_generated\steps\584\content.md"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

matches = list(re.finditer(r"DeckCarousel", content))
print(f"Total matches of DeckCarousel: {len(matches)}")

for i in range(min(4, len(matches))):
    m = matches[i]
    start = max(0, m.start() - 200)
    end = min(len(content), m.end() + 2500)
    print(f"--- MATCH {i} at position {m.start()} ---")
    print(content[start:end])
    print("=" * 80)
