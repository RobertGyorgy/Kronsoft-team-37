import json

tree_path = r"c:\Users\user\Desktop\SmartCity\public\decision_tree.json"

with open(tree_path, "r", encoding="utf-8") as f:
    tree = json.load(f)

lines = []
lines.append("Categories present in tree:")
for cat_id, cat_data in tree.items():
    places = cat_data.get("places", {})
    results = cat_data.get("results", {})
    lines.append(f"\n- Category ID: '{cat_id}'")
    lines.append(f"  Label: '{cat_data.get('categoryLabel', '')}'")
    lines.append(f"  Number of Places: {len(places)}")
    lines.append(f"  Number of Results Combinations: {len(results)}")
    
    # Audit place coordinates
    places_missing_coords = []
    for place_id, place_data in places.items():
        coords = place_data.get("coordinates")
        if not coords or "lat" not in coords or "lng" not in coords:
            places_missing_coords.append(place_id)
            
    if places_missing_coords:
        lines.append(f"  [ERROR] PLACES MISSING COORDINATES: {places_missing_coords}")
    else:
        lines.append("  [OK] All places have valid coordinates!")

output_path = r"c:\Users\user\Desktop\SmartCity\scratch\audit_results.txt"
with open(output_path, "w", encoding="utf-8") as f:
    f.write("\n".join(lines))
print("Audit results written to scratch/audit_results.txt")
