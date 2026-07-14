import re
import json

files = ["push_10.txt", "push_16.txt", "push_28.txt", "push_29.txt"]
base_path = r"C:\Users\Arshad\.gemini\antigravity\brain\bc5e92f2-06fc-4b7f-addb-8f476959ca78\scratch\\"

for fn in files:
    try:
        with open(base_path + fn, "r", encoding="utf-8") as f:
            content = f.read()
        
        print("=" * 60)
        print(f"File: {fn}, len={len(content)}")
        
        # Next.js flight format contains raw strings with escaped characters.
        # Let's search for "import" or code structures in the file
        # By searching for large blocks of text that look like JS.
        matches = re.finditer(r'"[^"]*import[^"]*"', content)
        for i, m in enumerate(matches):
            chunk = m.group(0)
            try:
                decoded = json.loads(chunk)
                print(f"Decoded JS chunk {i} in {fn} (len={len(decoded)}):")
                print(decoded[:1500])
                print("-" * 40)
            except Exception as e:
                # Try simple regex unescaping if json loads fails
                print(f"Failed decoding chunk {i}: {e}")
                
        # Also just print raw strings that match component code patterns
        print("Search for component code patterns:")
        # Look for code strings that look like typescript React components
        matches = re.finditer(r'(\\n|\\t|import\s+|const\s+|export\s+|return\s+<)', content)
        print(f"Found {len(list(matches))} text/code structural elements.")
        
        # Let's print the first 2000 chars of the raw file
        print("Raw snippet (first 1000):")
        print(content[:1000])
    except Exception as e:
        print(f"Error reading {fn}: {e}")
