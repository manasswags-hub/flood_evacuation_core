from typing import List, Dict, Any

from src.models import (
    User,
    Shelter,
    Route,
    EvacuationRecommendation,
)

from src.safety_score import calculate_safety_score


def route_matches_user(user: User, route: Route) -> bool:
    """
    Check whether a route is physically suitable for the
    user's selected transport mode and hard accessibility
    requirements.

    This is NOT personalization.

    P2 only removes routes that cannot be used.
    """

    # ---------------------------------------------------------
    # TRANSPORT MODE
    # ---------------------------------------------------------

    if route.transport_mode != user.transport_mode:
        return False

    # ---------------------------------------------------------
    # WHEELCHAIR ACCESSIBILITY
    # ---------------------------------------------------------

    if user.mobility == "wheelchair":
        if route.accessibility != "accessible":
            return False

    return True


def route_to_dict(route: Route) -> Dict[str, Any]:
    """
    Convert Route into the API/JSON format expected by P3/UI.
    """

    return {
        "route_id": route.id,
        "shelter_id": route.shelter_id,
        "distance_km": route.distance_km,
        "eta_minutes": route.eta_minutes,
        "safety_score": route.safety_score,
        "accessibility": route.accessibility,
        "transport_mode": route.transport_mode,
        "route_coordinates": route.route_coordinates,
        "safety_factors": route.safety_factors,
    }


def select_best_shelter(
    user: User,
    shelters: List[Shelter],
    routes: List[Route]
) -> EvacuationRecommendation | None:
    """
    P2 OBJECTIVE ROUTING ENGINE.

    Responsibilities:
        1. Remove full shelters.
        2. Remove incompatible routes.
        3. Calculate objective safety score.
        4. Return ALL suitable candidate routes.
        5. Identify objectively safest route.

    P2 DOES NOT:
        - personalize routes
        - give preference bonuses
        - rank based on elderly/children preferences
        - make the final personalized decision

    P3 performs personalization.
    """

    candidates: List[Route] = []

    # =========================================================
    # 1. REMOVE FULL SHELTERS
    # =========================================================

    available_shelters = [
        shelter
        for shelter in shelters
        if not shelter.is_full
    ]

    available_shelter_ids = {
        shelter.id
        for shelter in available_shelters
    }

    # =========================================================
    # 2. FILTER ROUTES
    # =========================================================

    for route in routes:

        # Route must lead to a shelter that has capacity.
        if route.shelter_id not in available_shelter_ids:
            continue

        # Route must satisfy hard feasibility requirements.
        if not route_matches_user(user, route):
            continue

        # =====================================================
        # 3. CALCULATE OBJECTIVE SAFETY
        # =====================================================

        route.safety_score = calculate_safety_score(route)

        candidates.append(route)

    # =========================================================
    # 4. NO SUITABLE ROUTES
    # =========================================================

    if not candidates:
        return None

    # =========================================================
    # 5. OBJECTIVE RANKING
    #
    # Safety is the primary criterion.
    # ETA is the first tie-breaker.
    # Distance is the second tie-breaker.
    # =========================================================

    candidates.sort(
        key=lambda route: (
            route.safety_score,
            -route.eta_minutes,
            -route.distance_km
        ),
        reverse=True
    )

    # =========================================================
    # 6. RETURN ALL CANDIDATE ROUTES
    # =========================================================

    candidate_routes = [
        route_to_dict(route)
        for route in candidates
    ]

    # =========================================================
    # 7. OBJECTIVELY SAFEST ROUTE
    # =========================================================

    recommended_route = candidate_routes[0]

    # =========================================================
    # 8. SECOND-BEST ROUTE
    #
    # Kept for compatibility.
    # P3 should use candidate_routes for personalization.
    # =========================================================

    alternative_route = None

    if len(candidate_routes) > 1:
        alternative_route = candidate_routes[1]

    # =========================================================
    # 9. FINAL RESULT
    # =========================================================

    return EvacuationRecommendation(
        recommended_route=recommended_route,
        candidate_routes=candidate_routes,
        alternative_route=alternative_route,
    )