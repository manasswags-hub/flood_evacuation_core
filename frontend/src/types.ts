export type EvacuationMode = 'elderly' | 'walking' | 'two_wheeler' | 'four_wheeler';
export type TravelingWith = 'alone' | 'children' | 'elderly' | 'both';
export type MobilityLevel = 'normal' | 'limited' | 'wheelchair';
export type TransportMode = 'walking' | 'vehicle';

export interface UserProfile {
  mode: EvacuationMode;
  travelingWith?: TravelingWith | string;
  mobility?: MobilityLevel | string;
  transport?: TransportMode | string;
}

export interface Coordinates {
  x: number; // 0 to 1000 coordinate space for vector map
  y: number;
  latitude?: number;
  longitude?: number;
  lat?: number;
  lng?: number;
  accuracy?: number;
  isRealLocation?: boolean;
}

export interface Shelter {
  id: string;
  shelter_id: string;
  name: string;
  type: string;
  address: string;
  district: string;
  capacityTotal: number;
  capacity_total: number;
  capacityOccupied: number;
  capacity_occupied: number;
  status: 'optimal' | 'filling_fast' | 'near_capacity' | 'full' | string;
  coordinates: Coordinates;
  features: string[];
  contactPhone: string;
  contact_phone: string;
  intakeNote: string;
  intake_note: string;
  isAccessible: boolean;
  is_accessible: boolean;
  petFriendly: boolean;
  pet_friendly: boolean;
  medicalSupport: boolean;
  medical_support: boolean;
}

export interface RouteStep {
  id: string;
  instruction: string;
  streetName: string;
  distance: string;
  iconType: 'start' | 'straight' | 'left' | 'right' | 'slight_right' | 'slight_left' | 'destination';
  note?: string;
}

export interface EvacuationRoute {
  id: string;
  route_id: string;
  shelterId: string;
  shelter_id: string;
  profileKey?: string;
  routeName: string;
  distanceKm: number;
  distance_km: number;
  etaMinutes: number;
  eta_minutes: number;
  safety_score?: number | string;
  accessibility?: string | boolean;
  transport_mode?: string;
  safety_factors?: string[];
  safetyTag: string; // e.g. "SAFEST ROUTE", "WHEELCHAIR OPTIMIZED"
  reason: string;
  reroute_reason?: string;
  pathCoordinates: Coordinates[];
  route_coordinates: Array<Coordinates | { latitude: number; longitude: number } | { lat: number; lng: number } | [number, number]>;
  elevationProfile: string;
  steps: RouteStep[];
  hazardClear: boolean;
  isAlternative?: boolean;
}

export interface RerouteScenario {
  id: string;
  name: string;
  alertTitle: string;
  alertDescription: string;
  hazardLocation: string;
  hazardCoordinates: Coordinates;
  hazardRadius: number;
  newShelterId: string;
  newRouteId: string;
  reroute_reason?: string;
}

// Backend Contract Payloads
export interface BackendLocationPayload {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: string;
}

export interface BackendShelterAvailability {
  shelter_id: string;
  capacity_total: number;
  capacity_occupied: number;
  available_spots: number;
  status: string;
  last_updated?: string;
}

export interface SafestRouteRequest {
  latitude: number;
  longitude: number;
  mode?: EvacuationMode | string;
  group: string;
  traveling_with?: string;
  mobility: string;
  transport: string;
  transport_mode?: string;
}

export interface RerouteRequest {
  latitude: number;
  longitude: number;
  route_id: string;
  shelter_id: string;
  mode?: EvacuationMode | string;
  group: string;
  traveling_with?: string;
  mobility: string;
  transport: string;
  transport_mode?: string;
  profile?: {
    mode?: EvacuationMode | string;
    group: string;
    mobility: string;
    transport: string;
  };
}

export interface BackendRouteResponse {
  shelter_id: string;
  route_id: string;
  distance_km: number;
  eta_minutes: number;
  safety_score?: number | string;
  accessibility?: string | boolean;
  transport_mode?: string;
  route_coordinates: Array<Coordinates | { latitude: number; longitude: number } | { lat: number; lng: number } | [number, number]>;
  safety_factors?: string[];
  reason: string;
  reroute_reason?: string;
  route_name?: string;
  steps?: RouteStep[];
  elevation_profile?: string;
}

