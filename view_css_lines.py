file_path = r"C:\Users\Arshad\Documents\antigravity\lucid-hubble\TASKAS\style.css"

with open(file_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

print(f"Total lines in CSS: {len(lines)}")

for i, line in enumerate(lines):
    if ".projects" in line or ".project-card" in line:
        # print 5 lines before and after
        start = max(0, i - 2)
        end = min(len(lines), i + 3)
        print(f"--- Line {i+1} ---")
        for idx in range(start, end):
            print(f"{idx+1}: {lines[idx].strip()}")
        print("-" * 50)
