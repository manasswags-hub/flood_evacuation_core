from src.models import Route


def calculate_safety_score(route: Route) -> float:
    """
    Calculate objective safety score for an evacuation route.

    Score:
        1.0 = safest
        0.0 = least safe

    Safety factors:
        - flood exposure
        - road condition
        - road blockage

    Distance and ETA are NOT included in the safety score.
    """

    factors = route.safety_factors

    # ---------------------------------------------------------
    # FLOOD EXPOSURE
    # 0.0 = no exposure
    # 1.0 = extremely high exposure
    # ---------------------------------------------------------

    flood_exposure = float(
        factors.get("flood_exposure", 0.0)
    )

    flood_exposure = max(
        0.0,
        min(1.0, flood_exposure)
    )

    flood_safety = 1.0 - flood_exposure

    # ---------------------------------------------------------
    # ROAD CONDITION
    # ---------------------------------------------------------

    road_condition = str(
        factors.get("road_condition", "unknown")
    ).lower()

    road_condition_scores = {
        "good": 1.0,
        "moderate": 0.7,
        "poor": 0.4,
        "very_poor": 0.2,
        "unknown": 0.5,
    }

    road_safety = road_condition_scores.get(
        road_condition,
        0.5
    )

    # ---------------------------------------------------------
    # ROAD BLOCKAGE
    # ---------------------------------------------------------

    road_blocked = factors.get(
        "road_blocked",
        False
    )

    blockage_safety = 0.0 if road_blocked else 1.0

    # ---------------------------------------------------------
    # FINAL OBJECTIVE SAFETY SCORE
    # ---------------------------------------------------------

    score = (
        0.60 * flood_safety
        + 0.25 * road_safety
        + 0.15 * blockage_safety
    )

    return round(score, 3)