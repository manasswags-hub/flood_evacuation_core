from typing import List, Optional

from src.models import (
    User,
    Shelter,
    Route,
    EvacuationRecommendation,
)

from src.shelter_selector import select_best_shelter


def reroute(
    user: User,
    shelters: List[Shelter],
    routes: List[Route],
    unavailable_route_ids: Optional[List[str]] = None,
    unavailable_shelter_ids: Optional[List[str]] = None,
) -> EvacuationRecommendation | None:
    """
    Recalculate P2 when routes or shelters become unavailable.
    """

    unavailable_route_ids = unavailable_route_ids or []
    unavailable_shelter_ids = unavailable_shelter_ids or []

    # =========================================================
    # REMOVE UNAVAILABLE SHELTERS
    # =========================================================

    updated_shelters = [
        shelter
        for shelter in shelters
        if shelter.id not in unavailable_shelter_ids
    ]

    # =========================================================
    # REMOVE UNAVAILABLE ROUTES
    # =========================================================

    updated_routes = [
        route
        for route in routes
        if route.id not in unavailable_route_ids
    ]

    # =========================================================
    # RUN P2 AGAIN
    # =========================================================

    return select_best_shelter(
        user,
        updated_shelters,
        updated_routes,
    )