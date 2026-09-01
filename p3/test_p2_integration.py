from src.models import User, Shelter, Route
from src.shelter_selector import select_best_shelter

from p3.personalization import personalize_routes


# =========================================================
# 1. USER
# =========================================================

user = User(
    id="U1",
    mobility="normal",
    travelling_with=[],
    transport_mode="walking"
)


# =========================================================
# 2. SHELTERS
# =========================================================

shelters = [
    Shelter(
        id="S1",
        name="Shelter A",
        capacity=100,
        occupied=20
    ),
    Shelter(
        id="S2",
        name="Shelter B",
        capacity=100,
        occupied=30
    ),
    Shelter(
        id="S3",
        name="Shelter C",
        capacity=100,
        occupied=40
    )
]


# =========================================================
# 3. ROUTES
# =========================================================

routes = [
    Route(
        id="R1",
        shelter_id="S1",
        distance_km=2,
        eta_minutes=10,
        safety_score=0,
        accessibility="accessible",
        transport_mode="walking",
        route_coordinates=[],
        safety_factors={
            "flood_exposure": 0.30,
            "road_condition": "poor",
            "road_blocked": False
        }
    ),

    Route(
        id="R2",
        shelter_id="S2",
        distance_km=4,
        eta_minutes=16,
        safety_score=0,
        accessibility="accessible",
        transport_mode="walking",
        route_coordinates=[],
        safety_factors={
            "flood_exposure": 0.05,
            "road_condition": "good",
            "road_blocked": False
        }
    ),

    Route(
        id="R3",
        shelter_id="S3",
        distance_km=3,
        eta_minutes=13,
        safety_score=0,
        accessibility="accessible",
        transport_mode="walking",
        route_coordinates=[],
        safety_factors={
            "flood_exposure": 0.15,
            "road_condition": "moderate",
            "road_blocked": False
        }
    )
]


# =========================================================
# 4. P2
# =========================================================

p2_result = select_best_shelter(
    user,
    shelters,
    routes
)


if p2_result is None:
    print("P2 found no suitable routes.")
    raise SystemExit


print("\n==============================")
print("P2 CANDIDATE ROUTES")
print("==============================")


for route in p2_result.candidate_routes:
    print(
        route["route_id"],
        "| safety =",
        route["safety_score"]
    )


# =========================================================
# 5. P3
# =========================================================

p3_result = personalize_routes(
    p2_result.candidate_routes,
    "elderly"
)


print("\n==============================")
print("P3 PERSONALIZED ROUTES")
print("==============================")


for route in p3_result["ranked_routes"]:
    print(
        route["route_id"],
        "| objective safety =",
        route["safety_score"],
        "| personalized =",
        route["personalized_score"]
    )


# =========================================================
# 6. FINAL RESULT
# =========================================================

print("\n==============================")
print("FINAL P3 RECOMMENDATION")
print("==============================")

print(
    "Route:",
    p3_result["recommended_route"]["route_id"]
)

print(
    "Shelter:",
    p3_result["recommended_route"]["shelter_id"]
)