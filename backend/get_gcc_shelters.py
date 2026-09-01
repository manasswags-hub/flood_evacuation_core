import requests

url = "https://gisgcc.chennaicorporation.gov.in/server/rest/services/GCCPublic/ICCC_Relief_CookingCenter/MapServer/0/query"

params = {
    "where": "1=1",
    "outFields": "name_of_the_relief_centre,capacity,latitude,longitud,ward,zone,road_name",
    "returnGeometry": "false",
    "f": "json"
}

response = requests.get(url, params=params, timeout=20)

data = response.json()

if "features" not in data:
    print("❌ Could not get GCC data")
    print(data)
else:
    print(f"✅ Found {len(data['features'])} GCC relief centres\n")

    for feature in data["features"]:
        a = feature["attributes"]

        name = str(a.get("name_of_the_relief_centre", ""))

        # Show only Velachery-related centres
        if "VELACHERY" in name.upper() or "VELACHERY" in str(a.get("road_name", "")).upper():
            print("--------------------------------")
            print("Name      :", name)
            print("Capacity  :", a.get("capacity"))
            print("Latitude  :", a.get("latitude"))
            print("Longitude :", a.get("longitud"))
            print("Ward      :", a.get("ward"))
            print("Zone      :", a.get("zone"))
            print("Road      :", a.get("road_name"))