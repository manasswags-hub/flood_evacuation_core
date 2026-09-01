from src.models import User, Shelter, Route

from p3.rerouting import personalized_reroute


# =========================================================
# USER
# =========================================================

user = User(
    id="U1",
    mobility="normal",
    travelling_with=[],
    transport_mode="walking"
)


# =========================================================
# SHELTERS
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
# ROUTES
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
# INITIAL ROUTE
# =========================================================

print("\n==============================")
print("INITIAL ROUTE")
print("==============================")

initial_result = personalized_reroute(
    user,
    shelters,
    routes,
    profile="elderly"
)

print(
    "Recommended:",
    initial_result["recommended_route"]["route_id"]
)


# =========================================================
# SCENARIO 1
# ROUTE R2 BECOMES UNSAFE
# =========================================================

print("\n==============================")
print("R2 BECOMES UNSAFE")
print("==============================")

rerouted_result = personalized_reroute(
    user,
    shelters,
    routes,
    profile="elderly",
    unavailable_route_ids=["R2"]
)

if rerouted_result is None:
    print("No route available.")
else:
    print("New candidate routes:")

    for route in rerouted_result["ranked_routes"]:
        print(
            route["route_id"],
            "| safety =",
            route["safety_score"],
            "| personalized =",
            route["personalized_score"]
        )

    print(
        "NEW RECOMMENDED:",
        rerouted_result["recommended_route"]["route_id"]
    )


# =========================================================
# SCENARIO 2
# SHELTER S2 BECOMES FULL
# =========================================================

print("\n==============================")
print("SHELTER S2 BECOMES UNAVAILABLE")
print("==============================")

rerouted_shelter_result = personalized_reroute(
    user,
    shelters,
    routes,
    profile="elderly",
    unavailable_shelter_ids=["S2"]
)

if rerouted_shelter_result is None:
    print("No route available.")
else:
    print("New candidate routes:")

    for route in rerouted_shelter_result["ranked_routes"]:
        print(
            route["route_id"],
            "| shelter =",
            route["shelter_id"],
            "| safety =",
            route["safety_score"],
            "| personalized =",
            route["personalized_score"]
        )

    print(
        "NEW RECOMMENDED:",
        rerouted_shelter_result["recommended_route"]["route_id"]
    )