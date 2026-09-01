from dataclasses import dataclass
from typing import List, Dict, Any, Optional


@dataclass
class User:
    id: str
    mobility: str
    travelling_with: List[str]
    transport_mode: str


@dataclass
class Shelter:
    id: str
    name: str
    capacity: int
    occupied: int

    @property
    def available_capacity(self) -> int:
        return self.capacity - self.occupied

    @property
    def is_full(self) -> bool:
        return self.available_capacity <= 0


@dataclass
class Route:
    id: str
    shelter_id: str
    distance_km: float
    eta_minutes: float
    safety_score: float
    accessibility: str
    transport_mode: str
    route_coordinates: List[List[float]]
    safety_factors: Dict[str, Any]


@dataclass
class EvacuationRecommendation:
    recommended_route: Dict[str, Any]
    candidate_routes: List[Dict[str, Any]]
    alternative_route: Optional[Dict[str, Any]] = None