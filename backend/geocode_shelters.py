import requests
import json
import time
from pathlib import Path

file_path = Path(__file__).parent / "data" / "shelters.json"

with open(file_path, "r", encoding="utf-8") as file:
    shelters = json.load(file)

headers = {
    "User-Agent": "SAFEROUTE-Hackathon/1.0"
}

for shelter in shelters:

    # Better, more specific addresses for geocoding
    addresses = {
        "S01": "Sree Ramarajya Campus, Vandalur Road, Kelambakkam, Tamil Nadu 603103, India",
        "S02": "Market Road, Kelambakkam, Tamil Nadu 603103, India",
        "S03": "Malayappa Mudali Street, Kelambakkam, Tamil Nadu 603103, India",
        "S04": "Government Higher Secondary School, Kelambakkam, Tamil Nadu 603103, India"
    }

    query = addresses.get(shelter["shelter_id"], shelter["address"])

    print(f"\nSearching: {query}")

    try:
        response = requests.get(
            "https://nominatim.openstreetmap.org/search",
            params={
                "q": query,
                "format": "json",
                "limit": 1,
                "countrycodes": "in"
            },
            headers=headers,
            timeout=15
        )

        results = response.json()

        if results:
            shelter["latitude"] = float(results[0]["lat"])
            shelter["longitude"] = float(results[0]["lon"])

            print("✅ Found!")
            print("Latitude :", shelter["latitude"])
            print("Longitude:", shelter["longitude"])
            print("OSM name :", results[0].get("display_name"))

        else:
            print("❌ Not found")

    except Exception as e:
        print("❌ Error:", e)

    # Nominatim rate limit
    time.sleep(1)


with open(file_path, "w", encoding="utf-8") as file:
    json.dump(shelters, file, indent=2, ensure_ascii=False)

print("\n✅ Coordinate update completed!")