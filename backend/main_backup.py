from fastapi import FastAPI
from pydantic import BaseModel
import requests
import json
from pathlib import Path
from math import radians, sin, cos, sqrt, atan2

app = FastAPI()


# --------------------------------------------------
# HOME
# --------------------------------------------------

@app.get("/")
def home():
    return {
        "message": "Flood Evacuation Backend is running!"
    }


# --------------------------------------------------
# USER LOCATION
# --------------------------------------------------

class Location(BaseModel):
    latitude: float
    longitude: float


@app.post("/api/location")
def receive_location(location: Location):
    return {
        "latitude": location.latitude,
        "longitude": location.longitude,
        "message": "Location received successfully"
    }


# --------------------------------------------------
# LOAD SHELTERS
# --------------------------------------------------

def load_shelters():

    file_path = Path(__file__).parent / "data" / "shelters.json"

    with open(file_path, "r", encoding="utf-8") as file:
        shelters = json.load(file)

    return shelters


# --------------------------------------------------
# GET ALL SHELTERS
# --------------------------------------------------

@app.get("/api/shelters")
def get_shelters():

    shelters = load_shelters()

    return {
        "shelters": shelters
    }


# --------------------------------------------------
# GET SHELTER AVAILABILITY
# --------------------------------------------------

@app.get("/api/shelters/{shelter_id}/availability")
def get_shelter_availability(shelter_id: str):

    shelters = load_shelters()

    for shelter in shelters:

        if shelter["shelter_id"] == shelter_id:

            return {
                "shelter_id": shelter["shelter_id"],
                "name": shelter["name"],
                "capacity": shelter["capacity"],
                "occupancy": shelter["occupancy"],
                "available_capacity": shelter["available_capacity"],
                "is_available": shelter["is_available"],
                "is_full": shelter["is_full"]
            }

    return {
        "error": "Shelter not found"
    }


# --------------------------------------------------
# LOAD FLOOD ZONES
# --------------------------------------------------

def load_flood_zones():

    file_path = Path(__file__).parent / "data" / "flood_zones.json"

    with open(file_path, "r", encoding="utf-8") as file:
        flood_zones = json.load(file)

    return flood_zones


# --------------------------------------------------
# GET ALL FLOOD ZONES
# --------------------------------------------------

@app.get("/api/flood-zones")
def get_flood_zones():

    flood_zones = load_flood_zones()

    return {
        "flood_zones": flood_zones
    }


# --------------------------------------------------
# CALCULATE DISTANCE BETWEEN TWO POINTS
# --------------------------------------------------

def calculate_distance_km(lat1, lon1, lat2, lon2):

    earth_radius = 6371.0

    lat1 = radians(lat1)
    lon1 = radians(lon1)
    lat2 = radians(lat2)
    lon2 = radians(lon2)

    dlat = lat2 - lat1
    dlon = lon2 - lon1

    a = (
        sin(dlat / 2) ** 2
        + cos(lat1)
        * cos(lat2)
        * sin(dlon / 2) ** 2
    )

    c = 2 * atan2(
        sqrt(a),
        sqrt(1 - a)
    )

    return earth_radius * c


# --------------------------------------------------
# CHECK ROUTE FLOOD RISK
# --------------------------------------------------

def check_route_flood_risk(route_coordinates):

    flood_zones = load_flood_zones()

    closest_distance = float("inf")

    highest_risk = "low"

    for coordinate in route_coordinates:

        # OSRM coordinates are:
        # [longitude, latitude]

        route_longitude = coordinate[0]
        route_latitude = coordinate[1]

        for zone in flood_zones:

            distance = calculate_distance_km(
                route_latitude,
                route_longitude,
                zone["latitude"],
                zone["longitude"]
            )

            if distance < closest_distance:
                closest_distance = distance

            # Prototype flood-risk threshold
            if distance <= 0.30:

                if zone["risk_level"] == "high":

                    highest_risk = "high"

                elif (
                    zone["risk_level"] == "medium"
                    and highest_risk != "high"
                ):

                    highest_risk = "medium"

    # --------------------------------------------------
    # SAFETY SCORE
    # --------------------------------------------------

    if highest_risk == "high":

        safety_score = 40

    elif highest_risk == "medium":

        safety_score = 70

    else:

        safety_score = 95

    return {
        "flood_risk": highest_risk,
        "safety_score": safety_score,
        "closest_flood_zone_distance_km": round(
            closest_distance,
            3
        )
    }


# --------------------------------------------------
# ROUTES
# --------------------------------------------------

@app.get("/api/routes")
def get_routes(
    latitude: float,
    longitude: float,
    destination_latitude: float,
    destination_longitude: float,
    shelter_id: str
):

    # --------------------------------------------------
    # OSRM ROUTING
    # --------------------------------------------------

    url = (
        f"https://router.project-osrm.org/route/v1/driving/"
        f"{longitude},{latitude};"
        f"{destination_longitude},{destination_latitude}"
    )

    params = {
        "overview": "full",
        "geometries": "geojson",
        "alternatives": "true"
    }

    response = requests.get(
        url,
        params=params,
        timeout=20
    )

    data = response.json()

    if data.get("code") != "Ok":

        return {
            "error": "Route could not be calculated"
        }

    routes = []

    for index, route in enumerate(data["routes"]):

        route_coordinates = route["geometry"]["coordinates"]

        # --------------------------------------------------
        # FLOOD RISK CHECK
        # --------------------------------------------------

        flood_result = check_route_flood_risk(
            route_coordinates
        )

        routes.append({

            "route_id": f"R{index + 1:02d}",

            "shelter_id": shelter_id,

            "distance_km": round(
                route["distance"] / 1000,
                2
            ),

            "eta_minutes": round(
                route["duration"] / 60
            ),

            "transport_mode": "vehicle",

            "route_coordinates": route_coordinates,

            "flood_risk": flood_result["flood_risk"],

            "safety_score": flood_result["safety_score"],

            "closest_flood_zone_distance_km":
                flood_result[
                    "closest_flood_zone_distance_km"
                ]
        })

    return {
        "shelter_id": shelter_id,
        "routes": routes
    }


# --------------------------------------------------
# SAFEST ROUTE
# --------------------------------------------------

@app.get("/api/safest-route")
def get_safest_route(
    latitude: float,
    longitude: float,
    destination_latitude: float,
    destination_longitude: float,
    shelter_id: str
):

    # Get routes from existing route function

    route_data = get_routes(
        latitude=latitude,
        longitude=longitude,
        destination_latitude=destination_latitude,
        destination_longitude=destination_longitude,
        shelter_id=shelter_id
    )

    # Check for route calculation error

    if "error" in route_data:

        return route_data

    routes = route_data["routes"]

    if not routes:

        return {
            "error": "No routes available"
        }

    # --------------------------------------------------
    # REMOVE HIGH-RISK ROUTES
    # --------------------------------------------------

    safe_routes = [
        route
        for route in routes
        if route["flood_risk"] != "high"
    ]

    # If every route has high flood risk,
    # use all routes and choose the best one

    if not safe_routes:

        safe_routes = routes

    # --------------------------------------------------
    # SELECT SAFEST ROUTE
    # --------------------------------------------------

    recommended_route = max(
        safe_routes,
        key=lambda route: (
            route["safety_score"],
            -route["eta_minutes"]
        )
    )

    return {
        "shelter_id": shelter_id,
        "recommended_route": recommended_route,
        "reason": "Safest available route based on flood risk and safety score"
    }