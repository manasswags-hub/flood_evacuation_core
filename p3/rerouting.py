from typing import List, Optional

from src.models import User, Shelter, Route
from src.rerouting import reroute as p2_reroute

from p3.personalization import personalize_routes


def personalized_reroute(
    user: User,
    shelters: List[Shelter],
    routes: List[Route],
    profile: str,
    unavailable_route_ids: Optional[List[str]] = None,
    unavailable_shelter_ids: Optional[List[str]] = None,
):
    """
    P3 dynamic rerouting.

    P2 removes unavailable routes/shelters and recalculates
    objective safety.

    P3 then applies the user's profile to the new
    candidate routes and selects the final personalized route.
    """

    unavailable_route_ids = unavailable_route_ids or []
    unavailable_shelter_ids = unavailable_shelter_ids or []

    # ---------------------------------------------------------
    # STEP 1: ASK P2 TO REROUTE
    # ---------------------------------------------------------

    p2_result = p2_reroute(
        user,
        shelters,
        routes,
        unavailable_route_ids=unavailable_route_ids,
        unavailable_shelter_ids=unavailable_shelter_ids,
    )

    # No feasible route remains
    if p2_result is None:
        return None

    # ---------------------------------------------------------
    # STEP 2: GET P2 CANDIDATE ROUTES
    # ---------------------------------------------------------

    candidate_routes = p2_result.candidate_routes

    if not candidate_routes:
        return None

    # ---------------------------------------------------------
    # STEP 3: P3 PERSONALIZES NEW ROUTES
    # ---------------------------------------------------------

    p3_result = personalize_routes(
        candidate_routes,
        profile
    )

    # ---------------------------------------------------------
    # STEP 4: RETURN P3 RESULT
    # ---------------------------------------------------------

    return p3_result