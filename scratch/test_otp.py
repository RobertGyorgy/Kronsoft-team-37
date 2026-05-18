import urllib.request
import urllib.parse
import json

def safe_print(msg):
    try:
        print(msg)
    except Exception:
        # Fallback to ascii/safe prints for cp1252 terminal
        print(msg.encode('ascii', errors='replace').decode('ascii'))

safe_print("--- Testing OpenTripPlanner routers list ---")
routers_url = "http://localhost:8080/otp/routers"

try:
    req = urllib.request.Request(routers_url)
    with urllib.request.urlopen(req, timeout=5) as response:
        html = response.read()
        data = json.loads(html.decode('utf-8'))
        safe_print(f"Routers: {json.dumps(data, indent=2)}")
except Exception as e:
    safe_print(f"Failed to fetch routers: {e}")

print("\n--- Testing OpenTripPlanner direct (port 8080) plan ---")
otp_url = "http://localhost:8080/otp/routers/default/plan"
params = {
    "fromPlace": "45.6483,25.5891",
    "toPlace": "45.6583,25.5991",
    "mode": "WALK,TRANSIT",
    "date": "2026-05-18",
    "time": "12:00",
    "numItineraries": "3"
}
query_string = urllib.parse.urlencode(params)
full_url = f"{otp_url}?{query_string}"

try:
    req = urllib.request.Request(full_url)
    with urllib.request.urlopen(req, timeout=5) as response:
        html = response.read()
        data = json.loads(html.decode('utf-8'))
        safe_print("Success plan!")
        if "plan" in data:
            itineraries = data["plan"].get("itineraries", [])
            safe_print(f"Number of itineraries: {len(itineraries)}")
            if itineraries:
                for idx, leg in enumerate(itineraries[0]['legs']):
                    safe_print(f"  Leg {idx+1}: Mode: {leg['mode']}, Duration: {leg['duration']}s, From: {leg['from']['name']} -> To: {leg['to']['name']}")
except Exception as e:
    safe_print(f"Failed to connect to plan: {e}")
