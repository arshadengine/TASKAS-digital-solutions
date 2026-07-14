import sys
import codecs

# Reconfigure stdout to use utf-8
if sys.stdout.encoding != 'utf-8':
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')

file_path = r"C:\Users\Arshad\Documents\antigravity\lucid-hubble\TASKAS\style.css"

with open(file_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

print(f"Total lines in CSS: {len(lines)}")

for i, line in enumerate(lines):
    if ".projects" in line or ".project-card" in line:
        start = max(0, i - 3)
        end = min(len(lines), i + 4)
        print(f"--- Line {i+1} ---")
        for idx in range(start, end):
            # Print only ascii safe or encode explicitly
            safe_line = lines[idx].strip()
            print(f"{idx+1}: {safe_line}")
        print("-" * 50)
