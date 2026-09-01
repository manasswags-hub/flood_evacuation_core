# p3/personalization.py

"""
P3 Personalized Evacuation Decision Engine

P2 provides all feasible candidate routes with objective safety scores.

P3:
1. Reads the user's profile
2. Scores every candidate route
3. Applies personalized preferences
4. Selects the best route for that user

P3 NEVER modifies P2's objective safety_score.
"""

from .profiles import get_profile


def normalize_distance(distance, all_distances):
    """
    Convert distance into a 0-1 preference score.

    Shorter distance = higher score.
    """

    if not all_distances:
        return 1.0

    min_distance = min(all_distances)
    max_distance = max(all_distances)

    if max_distance == min_distance:
        return 1.0

    return 1 - (
        (distance - min_distance)
        / (max_distance - min_distance)
    )


def normalize_eta(eta, all_etas):
    """
    Convert ETA into a 0-1 preference score.

    Lower ETA = higher score.
    """

    if not all_etas:
        return 1.0

    min_eta = min(all_etas)
    max_eta = max(all_etas)

    if max_eta == min_eta:
        return 1.0

    return 1 - (
        (eta - min_eta)
        / (max_eta - min_eta)
    )


def accessibility_score(accessibility):
    """
    Convert accessibility information into a score.
    """

    if accessibility is None:
        return 0.5

    value = str(accessibility).lower()

    if value in ["accessible", "high", "excellent"]:
        return 1.0

    if value in ["partially_accessible", "partial", "medium"]:
        return 0.5

    if value in ["inaccessible", "low", "poor"]:
        return 0.0

    return 0.5


def road_condition_score(road_condition):
    """
    Convert road condition into a 0-1 score.
    """

    if road_condition is None:
        return 0.5

    value = str(road_condition).lower()

    conditions = {
        "excellent": 1.0,
        "good": 0.8,
        "moderate": 0.5,
        "poor": 0.2,
        "bad": 0.1
    }

    return conditions.get(value, 0.5)


def calculate_personalized_score(route, profile_name):
    """
    Calculate P3's personalized score for one route.

    P2's safety_score remains unchanged.
    """

    weights = get_profile(profile_name)

    safety = float(route.get("safety_score", 0.0))

    distance = float(route.get("distance_km", 0.0))

    eta = float(route.get("eta_minutes", 0.0))

    accessibility = accessibility_score(
        route.get("accessibility")
    )

    safety_factors = route.get("safety_factors", {})

    road_condition = road_condition_score(
        safety_factors.get("road_condition")
    )

    # These are normalized later when multiple routes are available.
    return {
        "safety": safety,
        "distance": distance,
        "eta": eta,
        "accessibility": accessibility,
        "road_condition": road_condition,
        "weights": weights
    }


def personalize_routes(candidate_routes, profile_name):
    """
    Rank ALL P2 candidate routes according to the user's profile.

    Returns the personalized recommendation and ranked routes.
    """

    if not candidate_routes:
        return {
            "status": "no_routes",
            "recommended_route": None,
            "ranked_routes": []
        }

    weights = get_profile(profile_name)

    distances = [
        float(route.get("distance_km", 0.0))
        for route in candidate_routes
    ]

    etas = [
        float(route.get("eta_minutes", 0.0))
        for route in candidate_routes
    ]

    ranked_routes = []

    for route in candidate_routes:

        safety = float(route.get("safety_score", 0.0))

        distance = float(route.get("distance_km", 0.0))

        eta = float(route.get("eta_minutes", 0.0))

        accessibility = accessibility_score(
            route.get("accessibility")
        )

        safety_factors = route.get("safety_factors", {})

        road_condition = road_condition_score(
            safety_factors.get("road_condition")
        )

        distance_score = normalize_distance(
            distance,
            distances
        )

        eta_score = normalize_eta(
            eta,
            etas
        )

        personalized_score = (
            safety * weights.get("safety", 0)
            + distance_score * weights.get("distance", 0)
            + accessibility * weights.get("accessibility", 0)
            + eta_score * weights.get("eta", 0)
            + road_condition * weights.get("road_condition", 0)
        )

        result = route.copy()

        # IMPORTANT:
        # Keep P2 safety_score unchanged.
        result["safety_score"] = safety

        # Add P3 score separately.
        result["personalized_score"] = round(
            personalized_score,
            4
        )

        ranked_routes.append(result)

    # Highest personalized score = best route
    ranked_routes.sort(
        key=lambda route: route["personalized_score"],
        reverse=True
    )

    recommended_route = ranked_routes[0]

    return {
        "status": "success",
        "profile": profile_name,
        "recommended_route": recommended_route,
        "ranked_routes": ranked_routes
    }