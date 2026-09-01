from p3.personalization import personalize_routes


routes = [
    {
        "route_id": "R1",
        "shelter_id": "S1",
        "distance_km": 2,
        "eta_minutes": 10,
        "safety_score": 0.82,
        "accessibility": "inaccessible",
        "transport_mode": "walking",
        "route_coordinates": [],
        "safety_factors": {
            "flood_exposure": 0.30,
            "road_condition": "poor",
            "road_blocked": False
        }
    },
    {
        "route_id": "R2",
        "shelter_id": "S2",
        "distance_km": 4,
        "eta_minutes": 16,
        "safety_score": 0.97,
        "accessibility": "accessible",
        "transport_mode": "walking",
        "route_coordinates": [],
        "safety_factors": {
            "flood_exposure": 0.05,
            "road_condition": "good",
            "road_blocked": False
        }
    },
    {
        "route_id": "R3",
        "shelter_id": "S3",
        "distance_km": 3,
        "eta_minutes": 13,
        "safety_score": 0.90,
        "accessibility": "accessible",
        "transport_mode": "walking",
        "route_coordinates": [],
        "safety_factors": {
            "flood_exposure": 0.15,
            "road_condition": "moderate",
            "road_blocked": False
        }
    }
]


for profile in [
    "elderly",
    "walking",
    "two_wheeler",
    "four_wheeler"
]:

    result = personalize_routes(routes, profile)

    print("\n==============================")
    print("PROFILE:", profile)
    print("==============================")

    for route in result["ranked_routes"]:
        print(
            route["route_id"],
            "| safety =", route["safety_score"],
            "| personalized =", route["personalized_score"]
        )

    print(
        "RECOMMENDED:",
        result["recommended_route"]["route_id"]
    )