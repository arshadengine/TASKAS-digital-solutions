import os
import re

scratch_dir = r"C:\Users\Arshad\.gemini\antigravity\brain\bc5e92f2-06fc-4b7f-addb-8f476959ca78\scratch"

files = os.listdir(scratch_dir)
print(f"Total files in scratch: {len(files)}")

component_files = []
for fn in files:
    if fn.startswith("shiki_block_") or fn.startswith("extracted_"):
        path = os.path.join(scratch_dir, fn)
        with open(path, "r", encoding="utf-8") as f:
            text = f.read()
        
        # Check if it has a substantial length and contains motion, activeIndex, etc.
        if len(text) > 400:
            if "framer-motion" in text or "motion.div" in text or "activeIndex" in text or "DeckCarousel" in text:
                component_files.append((fn, len(text), text))

print(f"Found {len(component_files)} potential component files.")
for name, length, text in sorted(component_files, key=lambda x: x[1], reverse=True):
    print("=" * 80)
    print(f"File: {name}, Size: {length}")
    print("Preview (first 1000 characters):")
    print(text[:1000])
    print("\nPreview (last 500 characters):")
    print(text[-500:])
    print("=" * 80)
    
    # Save the longest/most complete code to a main scratch file
    with open(r"C:\Users\Arshad\.gemini\antigravity\brain\bc5e92f2-06fc-4b7f-addb-8f476959ca78\scratch\final_extracted_code.txt", "w", encoding="utf-8") as out:
        out.write(text)
    print("Saved to final_extracted_code.txt")
    break
