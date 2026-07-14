import re

file_path = r"C:\Users\Arshad\.gemini\antigravity\brain\bc5e92f2-06fc-4b7f-addb-8f476959ca78\.system_generated\steps\584\content.md"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Let's search for "DeckCarousel" case-insensitively and output 3000 chars of context around each occurrence
matches = re.finditer(r"DeckCarousel", content)
print("Occurrences of DeckCarousel:")
for idx, m in enumerate(matches):
    start = max(0, m.start() - 200)
    end = min(len(content), m.end() + 3000)
    print(f"Match {idx} at position {m.start()}:")
    print(content[start:end])
    print("=" * 80)
