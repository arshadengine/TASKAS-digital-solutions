import re
import html

files = ["push_10.txt", "push_16.txt", "push_28.txt", "push_29.txt"]
base_path = r"C:\Users\Arshad\Documents\antigravity\lucid-hubble\TASKAS\\" # Wait, files were saved in scratch, let's use scratch path:
scratch_path = r"C:\Users\Arshad\Documents\antigravity\lucid-hubble\TASKAS\\"
# Wait, let's verify where they are saved: "Saved push_10 to C:\Users\Arshad\.gemini\antigravity\brain\bc5e92f2-06fc-4b7f-addb-8f476959ca78\scratch\push_10.txt"
scratch_path = r"C:\Users\Arshad\.gemini\antigravity\brain\bc5e92f2-06fc-4b7f-addb-8f476959ca78\scratch\\"

for fn in files:
    try:
        with open(scratch_path + fn, "r", encoding="utf-8") as f:
            content = f.read()
            
        print("=" * 80)
        print(f"File: {fn}")
        
        # Let's search for "shiki"
        idx = 0
        while True:
            pos = content.find("shiki", idx)
            if pos == -1:
                break
            
            # Find the starting \u003cpre or <pre before it
            pre_start = content.rfind("pre", 0, pos)
            # Find the ending \u003c/pre\u003e or </pre> after it
            pre_end = content.find("pre", pos)
            
            # Let's extract a window of 5000 characters around it
            window_start = max(0, pos - 100)
            window_end = min(len(content), pos + 8000)
            chunk = content[window_start:window_end]
            
            # Unescape unicode characters like \u003c, \u003e, \u0022
            # We can replace them manually or use a decoding function
            chunk_clean = chunk.replace(r"\u003c", "<").replace(r"\u003e", ">").replace(r"\u0022", '"').replace(r"\u0026", "&").replace(r"\/", "/")
            # Remove html tags
            text_only = html.unescape(re.sub(r'<[^>]+>', '', chunk_clean))
            
            print(f"Found 'shiki' at position {pos}. Cleaned text around it:")
            print(text_only[:1500])
            print("*" * 50)
            
            # Save this block
            block_fn = f"C:\\Users\\Arshad\\.gemini\\antigravity\\brain\\bc5e92f2-06fc-4b7f-addb-8f476959ca78\\scratch\\shiki_block_{fn}_{pos}.txt"
            with open(block_fn, "w", encoding="utf-8") as out:
                out.write(text_only)
            print(f"Saved block to {block_fn}")
            
            idx = pos + 5
    except Exception as e:
        print(f"Error reading {fn}: {e}")
