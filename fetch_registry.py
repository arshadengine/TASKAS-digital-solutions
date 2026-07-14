import urllib.request
import json

url = "https://21st.dev/r/y.lamfadelpro/blur-reveal-deck"
req = urllib.request.Request(
    url, 
    headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'}
)

try:
    with urllib.request.urlopen(req) as response:
        html = response.read().decode('utf-8')
        data = json.loads(html)
        print("Success! Registry data keys:", data.keys())
        
        # Save registry data
        with open("C:\\Users\\Arshad\\.gemini\\antigravity\\brain\\bc5e92f2-06fc-4b7f-addb-8f476959ca78\\scratch\\registry.json", "w", encoding="utf-8") as out:
            json.dump(data, out, indent=2)
        print("Saved registry data to C:\\Users\\Arshad\\.gemini\\antigravity\\brain\\bc5e92f2-06fc-4b7f-addb-8f476959ca78\\scratch\\registry.json")
        
        # Let's inspect the files inside the registry data
        if "files" in data:
            for f in data["files"]:
                print(f"File: {f.get('name')}, Path: {f.get('path')}")
                content = f.get("content", "")
                print("Content preview:")
                print(content[:500])
                print("-" * 50)
                
                # Save component file
                filepath = f"C:\\Users\\Arshad\\.gemini\\antigravity\\brain\\bc5e92f2-06fc-4b7f-addb-8f476959ca78\\scratch\\{f.get('name')}"
                with open(filepath, "w", encoding="utf-8") as file_out:
                    file_out.write(content)
                print(f"Saved file to {filepath}")
except Exception as e:
    print("Error fetching registry:", e)
