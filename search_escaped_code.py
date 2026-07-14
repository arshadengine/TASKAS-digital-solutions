file_path = r"C:\Users\Arshad\.gemini\antigravity\brain\bc5e92f2-06fc-4b7f-addb-8f476959ca78\.system_generated\steps\584\content.md"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Let's search for all occurrences of '\"code\"' or '"code"' in the content
idx = 0
while True:
    pos = content.find('"code"', idx)
    if pos == -1:
        # try escaped
        pos = content.find('\\"code\\"', idx)
        if pos == -1:
            break
            
    print(f"Found 'code' key at position {pos}")
    # Print 2000 chars of context after it
    print(content[pos:pos+1000])
    print("=" * 80)
    idx = pos + 6
