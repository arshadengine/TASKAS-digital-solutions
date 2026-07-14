import re
import json

file_path = r"C:\Users\Arshad\.gemini\antigravity\brain\bc5e92f2-06fc-4b7f-addb-8f476959ca78\.system_generated\steps\584\content.md"

with open(file_path, "r", encoding="utf-8") as f:
    html_content = f.read()

# Try to find Next.js __NEXT_DATA__ script content
m = re.search(r'<script id="__NEXT_DATA__" type="application/json">(.*?)</script>', html_content)
if m:
    print("Found __NEXT_DATA__!")
    try:
        data = json.loads(m.group(1))
        # Save it to a file
        with open("C:\\Users\\Arshad\\.gemini\\antigravity\\brain\\bc5e92f2-06fc-4b7f-addb-8f476959ca78\\scratch\\next_data.json", "w", encoding="utf-8") as out:
            json.dump(data, out, indent=2)
        print("Saved next_data.json. Keys:")
        print(data.keys())
    except Exception as e:
        print("Error parsing __NEXT_DATA__:", e)
else:
    print("__NEXT_DATA__ not found.")

# Try to find Next.js App Router flight/hydration scripts (usually self.__next_f.push)
print("Searching self.__next_f.push scripts:")
pushes = re.findall(r'self\.__next_f\.push\(\[(.*?)\n*\]\)', html_content)
print(f"Found {len(pushes)} pushes.")
for i, push in enumerate(pushes):
    # Check if this push contains component code
    if "DeckCarousel" in push or "blur-reveal" in push or "framer-motion" in push or "framer" in push:
        print(f"Push {i} contains keywords! Length: {len(push)}")
        # Let's write the push to a file
        filepath = f"C:\\Users\\Arshad\\.gemini\\antigravity\\brain\\bc5e92f2-06fc-4b7f-addb-8f476959ca78\\scratch\\push_{i}.txt"
        with open(filepath, "w", encoding="utf-8") as out:
            out.write(push)
        print(f"Saved push_{i} to {filepath}")
