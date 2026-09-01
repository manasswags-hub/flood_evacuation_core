from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import requests
import json
from pathlib import Path
from math import radians, sin, cos, sqrt, atan2

from p3.personalization import personalize_routes


app = FastAPI()


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# PATHS
# ============================================================

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"


# ============================================================
# HOME
# ============================================================

@app.get("/")
def home():
    return {
        "message": "Flood Evacuation Backend is running!"
    }


# ============================================================
# USER LOCATION
# ============================================================

class Location(BaseModel):
    latitude: float
    longitude: float
    accuracy: Optional[float] = None
    timestamp: Optional[str] = None


@app.post("/api/location")
def receive_location(location: Location):
    return {
        "status": "success",
        "latitude": location.latitude,
        "longitude": location.longitude,
        "message": "Location received successfully"
    }


# ============================================================
# REQUEST MODELS
# ============================================================

class SafestRouteRequest(BaseModel):
    latitude: float
    longitude: float
    group: Optional[str] = "alone"
    traveling_with: Optional[str] = "alone"
    mobility: Optional[str] = "normal"
    transport: Optional[str] = "walking"
    transport_mode: Optional[str] = "walking"


class RerouteRequest(SafestRouteRequest):
    route_id: Optional[str] = None
    shelter_id: Optional[str] = None
    profile: Optional[dict] = None


# ============================================================
# LOAD JSON DATA
# ============================================================

def load_json(filename):
    file_path = DATA_DIR / filename

    with open(
        file_path,
        "r",
        encoding="utf-8"
    ) as file:
        return json.load(file)


def load_shelters():
    return load_json("shelters.json")


def load_flood_zones():
    return load_json("flood_zones.json")


# ============================================================
# SHELTER APIs
# ============================================================

@app.get("/api/shelters")
def get_shelters():

    shelters = load_shelters()

    return {
        "shelters": shelters
    }


@app.get("/api/shelters/{shelter_id}/availability")
def get_shelter_availability(
    shelter_id: str
):

    shelters = load_shelters()

    for shelter in shelters:

        if shelter["shelter_id"] == shelter_id:

            return {
                "shelter_id":
                    shelter["shelter_id"],

                "name":
                    shelter["name"],

                "capacity":
                    shelter["capacity"],

                "occupancy":
                    shelter["occupancy"],

                "available_capacity":
                    shelter["available_capacity"],

                "is_available":
                    shelter["is_available"],

                "is_full":
                    shelter["is_full"]
            }

    return {
        "error": "Shelter not found"
    }


def get_available_shelters():

    shelters = load_shelters()

    return [
        shelter
        for shelter in shelters
        if shelter.get(
            "is_available",
            False
        )
        and not shelter.get(
            "is_full",
            False
        )
        and shelter.get(
            "available_capacity",
            0
        ) > 0
    ]


# ============================================================
# FLOOD ZONES
# ============================================================

@app.get("/api/flood-zones")
def get_flood_zones():

    return {
        "flood_zones":
            load_flood_zones()
    }


# ============================================================
# DISTANCE CALCULATION
# ============================================================

def calculate_distance_km(
    lat1,
    lon1,
    lat2,
    lon2
):

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


# ============================================================
# FLOOD RISK
# ============================================================

def check_route_flood_risk(
    route_coordinates
):

    flood_zones = load_flood_zones()

    closest_distance = float("inf")

    highest_risk = "low"

    for coordinate in route_coordinates:

        # OSRM GeoJSON:
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

            closest_distance = min(
                closest_distance,
                distance
            )

            if distance <= 0.30:

                if zone["risk_level"] == "high":

                    highest_risk = "high"

                elif (
                    zone["risk_level"] == "medium"
                    and highest_risk != "high"
                ):

                    highest_risk = "medium"

    if highest_risk == "high":

        safety_score = 40

    elif highest_risk == "medium":

        safety_score = 70

    else:

        safety_score = 95

    return {
        "flood_risk":
            highest_risk,

        "safety_score":
            safety_score,

        "closest_flood_zone_distance_km":
            round(
                closest_distance,
                3
            )
    }


# ============================================================
# PROFILE RESOLUTION
# ============================================================

def resolve_profile(request):

    transport = (
        request.transport_mode
        or request.transport
        or "walking"
    ).lower()

    mobility = (
        request.mobility
        or "normal"
    ).lower()

    if mobility in [
        "elderly",
        "senior",
        "limited"
    ]:
        return "elderly"

    if transport in [
        "two_wheeler",
        "two-wheeler",
        "bike",
        "motorcycle"
    ]:
        return "two_wheeler"

    if transport in [
        "four_wheeler",
        "four-wheeler",
        "car",
        "vehicle"
    ]:
        return "four_wheeler"

    return "walking"


# ============================================================
# NAVIGATION STEP HELPERS
# ============================================================

def format_distance(meters):
    """
    Convert OSRM distance in meters
    into a user-friendly string.
    """

    if meters is None:
        return ""

    if meters < 1000:
        return f"{round(meters)} m"

    return f"{meters / 1000:.1f} km"


def get_step_icon(maneuver_type, modifier=None):

    modifier = (modifier or "").lower()
    maneuver_type = (maneuver_type or "").lower()

    if maneuver_type == "depart":
        return "start"

    if maneuver_type == "arrive":
        return "destination"

    if modifier == "left":
        return "left"

    if modifier == "right":
        return "right"

    if modifier == "slight left":
        return "slight_left"

    if modifier == "slight right":
        return "slight_right"

    return "straight"


def build_instruction(
    maneuver_type,
    modifier,
    street_name,
    distance_meters
):

    maneuver_type = (
        maneuver_type or ""
    ).lower()

    modifier = (
        modifier or ""
    ).lower()

    street_name = (
        street_name or ""
    ).strip()

    distance_text = format_distance(
        distance_meters
    )

    # --------------------------------------------------------
    # START
    # --------------------------------------------------------

    if maneuver_type == "depart":

        if street_name:
            return f"Start and head onto {street_name}"

        return "Start from your current location"

    # --------------------------------------------------------
    # ARRIVAL
    # --------------------------------------------------------

    if maneuver_type == "arrive":

        return "Arrive at the evacuation shelter"

    # --------------------------------------------------------
    # U-TURN
    # --------------------------------------------------------

    if maneuver_type == "uturn":

        if street_name:
            return f"Make a U-turn onto {street_name}"

        return "Make a U-turn"

    # --------------------------------------------------------
    # ROUNDABOUT
    # --------------------------------------------------------

    if maneuver_type == "roundabout":

        if street_name:
            return f"Take the roundabout toward {street_name}"

        return "Continue through the roundabout"

    # --------------------------------------------------------
    # TURN
    # --------------------------------------------------------

    if maneuver_type in [
        "turn",
        "on ramp",
        "off ramp",
        "fork",
        "end of road"
    ]:

        if modifier == "left":

            if street_name:
                return f"Turn left onto {street_name}"

            return "Turn left"

        if modifier == "right":

            if street_name:
                return f"Turn right onto {street_name}"

            return "Turn right"

        if modifier == "slight left":

            if street_name:
                return f"Bear slightly left onto {street_name}"

            return "Bear slightly left"

        if modifier == "slight right":

            if street_name:
                return f"Bear slightly right onto {street_name}"

            return "Bear slightly right"

    # --------------------------------------------------------
    # CONTINUE
    # --------------------------------------------------------

    if street_name:

        if distance_text:
            return (
                f"Continue on {street_name} "
                f"for {distance_text}"
            )

        return f"Continue on {street_name}"

    if distance_text:

        return (
            f"Continue straight "
            f"for {distance_text}"
        )

    return "Continue straight"


def build_navigation_steps(
    legs,
    shelter_name
):

    steps = []

    step_counter = 1

    for leg in legs or []:

        for osrm_step in leg.get(
            "steps",
            []
        ):

            maneuver = osrm_step.get(
                "maneuver",
                {}
            )

            maneuver_type = maneuver.get(
                "type",
                ""
            )

            modifier = maneuver.get(
                "modifier",
                ""
            )

            street_name = (
                osrm_step.get(
                    "name",
                    ""
                )
                or ""
            ).strip()

            distance_meters = osrm_step.get(
                "distance",
                0
            )

            instruction = build_instruction(
                maneuver_type,
                modifier,
                street_name,
                distance_meters
            )

            icon_type = get_step_icon(
                maneuver_type,
                modifier
            )

            note = None

            # Give useful context when OSRM
            # does not have a named road.

            if (
                not street_name
                and maneuver_type
                not in [
                    "depart",
                    "arrive"
                ]
            ):

                note = (
                    "Follow the highlighted "
                    "evacuation route."
                )

            steps.append({

                "id":
                    f"step-{step_counter}",

                "instruction":
                    instruction,

                "streetName":
                    street_name
                    or "Unnamed road",

                "distance":
                    format_distance(
                        distance_meters
                    ),

                "iconType":
                    icon_type,

                "note":
                    note
            })

            step_counter += 1

    # --------------------------------------------------------
    # Safety fallback
    # --------------------------------------------------------

    if not steps:

        steps = [

            {
                "id": "step-1",
                "instruction":
                    "Start from your current location",
                "streetName":
                    "Current location",
                "distance":
                    "",
                "iconType":
                    "start",
                "note":
                    "Follow the highlighted evacuation route."
            },

            {
                "id": "step-2",
                "instruction":
                    f"Arrive at {shelter_name}",
                "streetName":
                    shelter_name,
                "distance":
                    "",
                "iconType":
                    "destination",
                "note":
                    None
            }

        ]

    return steps


# ============================================================
# OSRM ROUTING
# ============================================================

def get_osrm_routes(
    latitude,
    longitude,
    destination_latitude,
    destination_longitude,
    shelter_id,
    shelter_name="Evacuation Shelter",
    transport_mode="walking"
):

    # Walking/elderly use walking routes.
    # Two-wheeler/four-wheeler use vehicle routing.

    if transport_mode == "walking":

        profile = "foot"

    else:

        profile = "driving"


    url = (
        f"https://router.project-osrm.org/"
        f"route/v1/"
        f"{profile}/"
        f"{longitude},{latitude};"
        f"{destination_longitude},"
        f"{destination_latitude}"
    )


    params = {
        "overview": "full",
        "geometries": "geojson",
        "alternatives": "true",

        # IMPORTANT:
        # Ask OSRM for real turn-by-turn steps.
        "steps": "true"
    }


    response = requests.get(
        url,
        params=params,
        timeout=20
    )


    response.raise_for_status()

    data = response.json()


    if data.get("code") != "Ok":

        return []


    routes = []


    for index, route in enumerate(
        data.get("routes", [])
    ):

        route_coordinates = (
            route["geometry"]["coordinates"]
        )


        # ----------------------------------------------------
        # FLOOD RISK
        # ----------------------------------------------------

        flood_result = (
            check_route_flood_risk(
                route_coordinates
            )
        )


        # ----------------------------------------------------
        # ROAD CONDITION
        # ----------------------------------------------------

        if flood_result[
            "flood_risk"
        ] == "high":

            road_condition = "poor"

        elif flood_result[
            "flood_risk"
        ] == "medium":

            road_condition = "moderate"

        else:

            road_condition = "good"


        # ----------------------------------------------------
        # DISTANCE
        # ----------------------------------------------------

        distance_km = (
            route["distance"] / 1000
        )


        # ----------------------------------------------------
        # ETA
        # ----------------------------------------------------

        if transport_mode == "walking":

            walking_speed_kmh = 5.0

            eta_minutes = round(
                (
                    distance_km
                    / walking_speed_kmh
                )
                * 60
            )

        else:

            eta_minutes = round(
                route["duration"] / 60
            )


        eta_minutes = max(
            1,
            eta_minutes
        )


        # ----------------------------------------------------
        # REAL TURN-BY-TURN NAVIGATION
        # ----------------------------------------------------

        navigation_steps = (
            build_navigation_steps(
                route.get("legs", []),
                shelter_name
            )
        )


        routes.append({

            "route_id":
                f"{shelter_id}-R{index + 1:02d}",

            "shelter_id":
                shelter_id,

            "distance_km":
                round(
                    distance_km,
                    2
                ),

            "eta_minutes":
                eta_minutes,

            "transport_mode":
                transport_mode,

            "accessibility":
                "accessible",

            "route_coordinates":
                route_coordinates,

            # NEW:
            # Actual OSRM turn-by-turn instructions.
            "steps":
                navigation_steps,

            "flood_risk":
                flood_result[
                    "flood_risk"
                ],

            "safety_score":
                flood_result[
                    "safety_score"
                ],

            "safety_factors": {

                "flood_exposure":
                    (
                        1.0
                        if flood_result[
                            "flood_risk"
                        ] == "high"

                        else 0.5
                        if flood_result[
                            "flood_risk"
                        ] == "medium"

                        else 0.1
                    ),

                "road_condition":
                    road_condition,

                "road_blocked":
                    (
                        flood_result[
                            "flood_risk"
                        ] == "high"
                    )
            }
        })


    return routes


# ============================================================
# BUILD CANDIDATE ROUTES
# ============================================================

def build_candidate_routes(
    latitude,
    longitude,
    transport_mode,
    exclude_route_ids=None,
    exclude_shelter_ids=None,
    only_shelter_id=None
):

    exclude_route_ids = (
        exclude_route_ids or []
    )

    exclude_shelter_ids = (
        exclude_shelter_ids or []
    )


    shelters = get_available_shelters()


    # --------------------------------------------------------
    # Exclude shelters that cannot be used
    # --------------------------------------------------------

    if exclude_shelter_ids:

        shelters = [
            shelter
            for shelter in shelters
            if shelter["shelter_id"]
            not in exclude_shelter_ids
        ]


    # --------------------------------------------------------
    # If a specific shelter was requested
    # --------------------------------------------------------

    if only_shelter_id:

        shelters = [
            shelter
            for shelter in shelters
            if shelter["shelter_id"]
            == only_shelter_id
        ]


    all_routes = []


    for shelter in shelters:

        try:

            routes = get_osrm_routes(

                latitude=latitude,

                longitude=longitude,

                destination_latitude=
                    shelter["latitude"],

                destination_longitude=
                    shelter["longitude"],

                shelter_id=
                    shelter["shelter_id"],

                shelter_name=
                    shelter["name"],

                transport_mode=
                    transport_mode
            )


            for route in routes:

                if (
                    route["route_id"]
                    not in exclude_route_ids
                ):

                    all_routes.append(
                        route
                    )


        except Exception as error:

            print(
                f"OSRM failed for "
                f"{shelter['shelter_id']}: "
                f"{error}"
            )


    return all_routes


# ============================================================
# SAFEST ROUTE
# ============================================================

@app.post("/api/safest-route")
def get_safest_route(
    request: SafestRouteRequest
):

    profile = resolve_profile(
        request
    )


    if profile in [
        "walking",
        "elderly"
    ]:

        transport_mode = "walking"

    else:

        transport_mode = "vehicle"


    # --------------------------------------------------------
    # Generate routes to ALL available shelters
    # --------------------------------------------------------

    candidate_routes = (
        build_candidate_routes(

            latitude=request.latitude,

            longitude=request.longitude,

            transport_mode=
                transport_mode
        )
    )


    if not candidate_routes:

        return {

            "status":
                "no_routes",

            "recommended_route":
                None,

            "message":
                "No evacuation routes are currently available."
        }


    # --------------------------------------------------------
    # P3 PERSONALIZATION
    # --------------------------------------------------------

    personalized_result = (
        personalize_routes(
            candidate_routes,
            profile
        )
    )


    if (
        personalized_result["status"]
        != "success"
    ):

        return {

            "status":
                "no_routes",

            "recommended_route":
                None
        }


    recommended = (
        personalized_result[
            "recommended_route"
        ]
    )


    return {

        "status":
            "success",

        "profile":
            profile,

        "shelter_id":
            recommended[
                "shelter_id"
            ],

        "recommended_route":
            recommended,

        "ranked_routes":
            personalized_result[
                "ranked_routes"
            ],

        "reason":
            (
                "Safest available route "
                "selected using objective "
                "safety and personalized "
                "preferences."
            )
    }


# ============================================================
# DYNAMIC REROUTE
# ============================================================

@app.post("/api/reroute")
def reroute(
    request: RerouteRequest
):

    profile = resolve_profile(
        request
    )


    if profile in [
        "walking",
        "elderly"
    ]:

        transport_mode = "walking"

    else:

        transport_mode = "vehicle"


    # --------------------------------------------------------
    # CURRENT ROUTE + CURRENT SHELTER ARE UNAVAILABLE
    # --------------------------------------------------------

    unavailable_routes = []

    unavailable_shelters = []


    if request.route_id:

        unavailable_routes.append(
            request.route_id
        )


    if request.shelter_id:

        unavailable_shelters.append(
            request.shelter_id
        )


    # --------------------------------------------------------
    # GENERATE ALTERNATE ROUTES
    # --------------------------------------------------------

    candidate_routes = (
        build_candidate_routes(

            latitude=request.latitude,

            longitude=request.longitude,

            transport_mode=
                transport_mode,

            exclude_route_ids=
                unavailable_routes,

            exclude_shelter_ids=
                unavailable_shelters
        )
    )


    # --------------------------------------------------------
    # EXTRA SAFETY CHECK
    # --------------------------------------------------------

    if request.shelter_id:

        candidate_routes = [
            route
            for route in candidate_routes
            if route["shelter_id"]
            != request.shelter_id
        ]


    if not candidate_routes:

        return {

            "status":
                "no_routes",

            "recommended_route":
                None,

            "message":
                (
                    "No alternate shelter "
                    "route is currently available."
                )
        }


    # --------------------------------------------------------
    # P3 RANKING
    # --------------------------------------------------------

    personalized_result = (
        personalize_routes(
            candidate_routes,
            profile
        )
    )


    if (
        personalized_result["status"]
        != "success"
    ):

        return {

            "status":
                "no_routes",

            "recommended_route":
                None
        }


    recommended = (
        personalized_result[
            "recommended_route"
        ]
    )


    # --------------------------------------------------------
    # FINAL SAFETY CHECK
    # --------------------------------------------------------

    if (
        request.shelter_id
        and recommended["shelter_id"]
        == request.shelter_id
    ):

        return {

            "status":
                "no_routes",

            "recommended_route":
                None,

            "message":
                (
                    "Personalization selected "
                    "the current shelter. "
                    "No valid alternate shelter "
                    "was found."
                )
        }


    return {

        "status":
            "success",

        "profile":
            profile,

        "previous_route_id":
            request.route_id,

        "previous_shelter_id":
            request.shelter_id,

        "shelter_id":
            recommended[
                "shelter_id"
            ],

        "route_id":
            recommended[
                "route_id"
            ],

        "recommended_route":
            recommended,

        "ranked_routes":
            personalized_result[
                "ranked_routes"
            ],

        "reroute_reason":
            (
                "The current route and current "
                "shelter were excluded. A new "
                "safe personalized route to an "
                "alternate shelter was selected."
            ),

        "reason":
            (
                "Dynamic rerouting selected "
                "an alternate shelter using "
                "current route safety and "
                "personalized preferences."
            )
    }