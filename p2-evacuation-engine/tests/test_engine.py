import unittest

from src.models import User, Shelter, Route
from src.shelter_selector import select_best_shelter
from src.rerouting import reroute


class TestP2Engine(unittest.TestCase):

    def setUp(self):
        self.user = User(
            id="U1",
            mobility="normal",
            travelling_with=[],
            transport_mode="walking"
        )

        self.shelters = [
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
        ]

        self.routes = [
            Route(
                id="R1",
                shelter_id="S1",
                distance_km=3,
                eta_minutes=12,
                safety_score=0.0,
                accessibility="accessible",
                transport_mode="walking",
                route_coordinates=[
                    [12.8301, 80.2301],
                    [12.8310, 80.2315]
                ],
                safety_factors={
                    "flood_exposure": 0.10,
                    "road_condition": "good",
                    "road_blocked": False
                }
            ),
            Route(
                id="R2",
                shelter_id="S2",
                distance_km=4,
                eta_minutes=15,
                safety_score=0.0,
                accessibility="accessible",
                transport_mode="walking",
                route_coordinates=[
                    [12.8301, 80.2301],
                    [12.8320, 80.2340]
                ],
                safety_factors={
                    "flood_exposure": 0.05,
                    "road_condition": "good",
                    "road_blocked": False
                }
            ),
        ]

    def test_selects_safest_route(self):
        result = select_best_shelter(
            self.user,
            self.shelters,
            self.routes
        )

        self.assertIsNotNone(result)

        # R2 has lower flood exposure,
        # so it should have the higher safety score.
        self.assertEqual(
            result.recommended_route["route_id"],
            "R2"
        )

    def test_returns_all_candidate_routes(self):
        result = select_best_shelter(
            self.user,
            self.shelters,
            self.routes
        )

        self.assertEqual(
            len(result.candidate_routes),
            2
        )

        route_ids = [
            route["route_id"]
            for route in result.candidate_routes
        ]

        self.assertIn("R1", route_ids)
        self.assertIn("R2", route_ids)

    def test_full_shelter_is_removed(self):
        self.shelters[0].occupied = 100

        result = select_best_shelter(
            self.user,
            self.shelters,
            self.routes
        )

        self.assertIsNotNone(result)

        route_ids = [
            route["route_id"]
            for route in result.candidate_routes
        ]

        self.assertNotIn("R1", route_ids)
        self.assertIn("R2", route_ids)

    def test_wrong_transport_mode_is_removed(self):
        self.routes[0].transport_mode = "vehicle"

        result = select_best_shelter(
            self.user,
            self.shelters,
            self.routes
        )

        self.assertIsNotNone(result)

        route_ids = [
            route["route_id"]
            for route in result.candidate_routes
        ]

        self.assertNotIn("R1", route_ids)
        self.assertIn("R2", route_ids)

    def test_wheelchair_requires_accessible_route(self):
        self.user.mobility = "wheelchair"

        self.routes[0].accessibility = "inaccessible"

        result = select_best_shelter(
            self.user,
            self.shelters,
            self.routes
        )

        self.assertIsNotNone(result)

        route_ids = [
            route["route_id"]
            for route in result.candidate_routes
        ]

        self.assertNotIn("R1", route_ids)
        self.assertIn("R2", route_ids)

    def test_rerouting_when_route_unavailable(self):
        result = reroute(
            self.user,
            self.shelters,
            self.routes,
            unavailable_route_ids=["R2"]
        )

        self.assertIsNotNone(result)

        self.assertEqual(
            result.recommended_route["route_id"],
            "R1"
        )

        route_ids = [
            route["route_id"]
            for route in result.candidate_routes
        ]

        self.assertNotIn("R2", route_ids)

    def test_rerouting_when_shelter_unavailable(self):
        result = reroute(
            self.user,
            self.shelters,
            self.routes,
            unavailable_shelter_ids=["S2"]
        )

        self.assertIsNotNone(result)

        self.assertEqual(
            result.recommended_route["shelter_id"],
            "S1"
        )

        route_ids = [
            route["route_id"]
            for route in result.candidate_routes
        ]

        self.assertNotIn("R2", route_ids)

    def test_api_route_fields(self):
        result = select_best_shelter(
            self.user,
            self.shelters,
            self.routes
        )

        route = result.recommended_route

        required_fields = [
            "route_id",
            "shelter_id",
            "distance_km",
            "eta_minutes",
            "safety_score",
            "accessibility",
            "transport_mode",
            "route_coordinates",
            "safety_factors"
        ]

        for field in required_fields:
            self.assertIn(field, route)


if __name__ == "__main__":
    unittest.main()