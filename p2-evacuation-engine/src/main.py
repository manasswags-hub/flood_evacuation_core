import json
from dataclasses import asdict
from pathlib import Path

from src.models import User, Shelter, Route
from src.shelter_selector import select_best_shelter


# ============================================================
# PATHS
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"


# ============================================================
# LOAD JSON
# ============================================================

def load_json(filename):
    path = DATA_DIR / filename

    with open(path, "r", encoding="utf-8") as file:
        return json.load(file)


# ============================================================
# MAIN
# ============================================================

def main():

    print("P2 Evacuation Decision Engine")
    print("System starting...")

    # --------------------------------------------------------
    # LOAD DATA
    # --------------------------------------------------------

    users_data = load_json("users.json")
    shelters_data = load_json("shelters.json")
    routes_data = load_json("routes.json")

    # --------------------------------------------------------
    # CONVERT JSON → MODELS
    # --------------------------------------------------------

    users = [
        User(**user)
        for user in users_data
    ]

    shelters = [
        Shelter(**shelter)
        for shelter in shelters_data
    ]

    routes = [
        Route(**route)
        for route in routes_data
    ]

    # --------------------------------------------------------
    # USE FIRST USER FOR DEMO
    # --------------------------------------------------------

    user = users[0]

    # --------------------------------------------------------
    # RUN P2
    # --------------------------------------------------------

    recommendation = select_best_shelter(
        user,
        shelters,
        routes
    )

    # --------------------------------------------------------
    # NO ROUTE AVAILABLE
    # --------------------------------------------------------

    if recommendation is None:

        output = {
            "status": "no_route_available",
            "message": "No suitable evacuation route is currently available."
        }

        print(json.dumps(output, indent=2))
        return

    # --------------------------------------------------------
    # CONVERT RESULT → JSON
    # --------------------------------------------------------

    output = {
        "status": "success",
        "user_id": user.id,
        "recommended_route": recommendation.recommended_route,
        "alternative_route": recommendation.alternative_route,
        "candidate_routes": recommendation.candidate_routes
    }

    # --------------------------------------------------------
    # PRINT API-FRIENDLY JSON
    # --------------------------------------------------------

    print(json.dumps(output, indent=2))


if __name__ == "__main__":
    main()