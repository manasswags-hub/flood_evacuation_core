import {
  Shelter,
  EvacuationRoute,
  Coordinates,
  UserProfile,
  RerouteScenario,
  BackendLocationPayload,
  BackendShelterAvailability,
  SafestRouteRequest,
  RerouteRequest,
  BackendRouteResponse,
} from '../types';
import {
  MOCK_SHELTERS,
  MOCK_ROUTES,
  MOCK_REROUTE_SCENARIOS,
  USER_START_LOCATION,
  getRecommendedRouteForProfile,
} from '../data/evacuationData';

/**
 * Backend API Client for SafeRoute FastAPI Service
 * Configured via VITE_API_BASE_URL environment variable.
 */
class SafeRouteApiService {
  private baseUrl: string;

  constructor() {
    const rawUrl = (import.meta as any).env?.VITE_API_BASE_URL || '';
    // Normalize URL: remove trailing slash if present
    this.baseUrl = typeof rawUrl === 'string' ? rawUrl.trim().replace(/\/+$/, '') : '';
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Helper fetcher with timeout and response validation
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    timeoutMs = 6000
  ): Promise<T> {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${this.baseUrl}${cleanEndpoint}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(options.headers || {}),
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`API Error ${response.status} ${response.statusText} at ${endpoint}`);
      }

      const data = await response.json();
      return data as T;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Coordinate normalizer
   * Accepts {x,y}, {latitude, longitude}, {lat, lng}, or [lat, lng]
   */
  public normalizeCoordinates(coord: any, fallback?: Coordinates): Coordinates {
    if (!coord) return fallback || { x: 500, y: 500 };

    if (typeof coord.x === 'number' && typeof coord.y === 'number') {
      return {
        x: coord.x,
        y: coord.y,
        latitude: coord.latitude || coord.lat,
        longitude: coord.longitude || coord.lng,
      };
    }

    if (Array.isArray(coord) && coord.length >= 2) {
      const [val1, val2] = coord;
      // If in lat/lng range
      if (Math.abs(val1) <= 90 && Math.abs(val2) <= 180) {
        return this.geoToMapCoordinates(val1, val2);
      }
      return { x: Number(val1), y: Number(val2) };
    }

    const lat = coord.latitude ?? coord.lat;
    const lng = coord.longitude ?? coord.lng;

    if (typeof lat === 'number' && typeof lng === 'number') {
      return this.geoToMapCoordinates(lat, lng);
    }

    return fallback || { x: 500, y: 500 };
  }

  /**
   * Linear mapping from standard city geo bbox to 0..1000 vector map space
   */
  private geoToMapCoordinates(lat: number, lng: number): Coordinates {
    // Reference city bbox (San Francisco downtown emergency grid reference)
    const minLat = 37.76;
    const maxLat = 37.80;
    const minLng = -122.45;
    const maxLng = -122.39;

    const normX = Math.max(0, Math.min(1, (lng - minLng) / (maxLng - minLng)));
    // Invert Y because SVG coordinates 0 is top, max is bottom
    const normY = Math.max(0, Math.min(1, 1 - (lat - minLat) / (maxLat - minLat)));

    return {
      x: Math.round(100 + normX * 800),
      y: Math.round(100 + normY * 800),
      latitude: lat,
      longitude: lng,
    };
  }

  /**
   * Normalize shelter response from FastAPI backend
   */
  public normalizeShelter(raw: any): Shelter {
    const id = raw.shelter_id || raw.id || `shelter-${Math.random().toString(36).slice(2, 7)}`;
    const coordinates = this.normalizeCoordinates(raw.coordinates, { x: 500, y: 500 });
    const capacityTotal = raw.capacity_total ?? raw.capacityTotal ?? 300;
    const capacityOccupied = raw.capacity_occupied ?? raw.capacityOccupied ?? 100;

    return {
      id,
      shelter_id: id,
      name: raw.name || 'Emergency Evacuation Facility',
      type: raw.type || 'Municipal Shelter',
      address: raw.address || 'Civil Defense Sector Area',
      district: raw.district || 'Municipal Safe Zone',
      capacityTotal,
      capacity_total: capacityTotal,
      capacityOccupied,
      capacity_occupied: capacityOccupied,
      status: raw.status || (capacityOccupied / capacityTotal > 0.85 ? 'filling_fast' : 'optimal'),
      coordinates,
      features: Array.isArray(raw.features) ? raw.features : ['Emergency Supplies', 'ADA Accessible Intake'],
      contactPhone: raw.contact_phone || raw.contactPhone || '(555) 019-4000',
      contact_phone: raw.contact_phone || raw.contactPhone || '(555) 019-4000',
      intakeNote: raw.intake_note || raw.intakeNote || 'Open • Verify credentials at intake station',
      intake_note: raw.intake_note || raw.intakeNote || 'Open • Verify credentials at intake station',
      isAccessible: Boolean(raw.is_accessible ?? raw.isAccessible ?? true),
      is_accessible: Boolean(raw.is_accessible ?? raw.isAccessible ?? true),
      petFriendly: Boolean(raw.pet_friendly ?? raw.petFriendly ?? true),
      pet_friendly: Boolean(raw.pet_friendly ?? raw.petFriendly ?? true),
      medicalSupport: Boolean(raw.medical_support ?? raw.medicalSupport ?? true),
      medical_support: Boolean(raw.medical_support ?? raw.medicalSupport ?? true),
    };
  }

  /**
   * Normalize route response from FastAPI backend
   */
  public normalizeRoute(raw: BackendRouteResponse | any, targetShelter?: Shelter): EvacuationRoute {
    const shelterId = raw.shelter_id || raw.shelterId || targetShelter?.id || 'shelter-st-jude';
    const routeId = raw.route_id || raw.id || `route-${shelterId}`;

    const rawCoords = raw.route_coordinates || raw.pathCoordinates || [];
    let pathCoordinates: Coordinates[] = [];

    if (Array.isArray(rawCoords) && rawCoords.length > 0) {
      pathCoordinates = rawCoords.map((c: any) => this.normalizeCoordinates(c));
    } else if (targetShelter) {
      pathCoordinates = [
        USER_START_LOCATION,
        {
          x: Math.round((USER_START_LOCATION.x + targetShelter.coordinates.x) / 2),
          y: USER_START_LOCATION.y,
        },
        targetShelter.coordinates,
      ];
    } else {
      pathCoordinates = MOCK_ROUTES['route-walk-st-jude'].pathCoordinates;
    }

    const distanceKm = Number(raw.distance_km ?? raw.distanceKm ?? 1.5);
    const etaMinutes = Number(raw.eta_minutes ?? raw.etaMinutes ?? 18);
    const reason = raw.reason || 'Verified municipal evacuation corridor.';
    const rerouteReason = raw.reroute_reason || raw.rerouteReason || '';
    const safetyFactors = Array.isArray(raw.safety_factors)
      ? raw.safety_factors
      : Array.isArray(raw.safetyFactors)
      ? raw.safetyFactors
      : [reason];

    const safetyScore = raw.safety_score ?? raw.safetyScore ?? 95;
    const accessibility = raw.accessibility ?? 'ADA Verified Corridor';
    const transportMode = raw.transport_mode ?? raw.transportMode ?? 'walking';

    // Generate step by step turns if not provided by backend
    const steps = Array.isArray(raw.steps) && raw.steps.length > 0
      ? raw.steps
      : [
          {
            id: 's1',
            instruction: `Head along designated evacuation path toward ${targetShelter?.name || 'shelter'}`,
            streetName: 'Safe Evacuation Arterial',
            distance: `${Math.round(distanceKm * 600)} m`,
            iconType: 'straight' as const,
            note: 'Monitored route • Follow civil defense signage',
          },
          {
            id: 's2',
            instruction: `Arrive at intake gate of ${targetShelter?.name || 'Shelter'}`,
            streetName: targetShelter?.address || 'Intake Staging',
            distance: `${Math.round(distanceKm * 400)} m`,
            iconType: 'destination' as const,
            note: 'Report to intake staging for assignment',
          },
        ];

    return {
      id: routeId,
      route_id: routeId,
      shelterId,
      shelter_id: shelterId,
      routeName: raw.route_name || raw.routeName || `Evacuation Corridor to ${targetShelter?.name || 'Safe Zone'}`,
      distanceKm,
      distance_km: distanceKm,
      etaMinutes,
      eta_minutes: etaMinutes,
      safety_score: safetyScore,
      accessibility,
      transport_mode: transportMode,
      safety_factors: safetyFactors,
      safetyTag: raw.safety_tag || (rerouteReason ? 'ROUTE UPDATED' : 'SAFEST ROUTE'),
      reason,
      reroute_reason: rerouteReason,
      pathCoordinates,
      route_coordinates: rawCoords.length > 0 ? rawCoords : pathCoordinates,
      elevationProfile: raw.elevation_profile || 'Monitored Paved Ground',
      steps,
      hazardClear: true,
    };
  }

  // ==========================================
  // API ENDPOINTS
  // ==========================================

  /**
   * POST /api/location
   * Send user's GPS latitude and longitude to backend
   */
  public async sendLocation(payload: BackendLocationPayload): Promise<{ status: string; received?: any }> {
    try {
      return await this.request<{ status: string; received?: any }>('/api/location', {
        method: 'POST',
        body: JSON.stringify({
          latitude: payload.latitude,
          longitude: payload.longitude,
          accuracy: payload.accuracy,
          timestamp: payload.timestamp || new Date().toISOString(),
        }),
      });
    } catch (err) {
      console.warn('[SafeRoute API] sendLocation offline or failed; continuing gracefully:', err);
      return { status: 'mock_fallback', received: payload };
    }
  }

  /**
   * GET /api/shelters
   * Fetch all emergency shelters
   */
  public async getShelters(): Promise<Shelter[]> {
    try {
      const data = await this.request<any>('/api/shelters', {
        method: 'GET',
      });

      const list = Array.isArray(data) ? data : data?.shelters || Object.values(data || {});
      if (Array.isArray(list) && list.length > 0) {
        return list.map((item: any) => this.normalizeShelter(item));
      }
      throw new Error('Empty shelter response from backend');
    } catch (err) {
      console.warn('[SafeRoute API] getShelters offline or failed; using mock shelters fallback:', err);
      return Object.values(MOCK_SHELTERS);
    }
  }

  /**
   * GET /api/shelters/{shelter_id}/availability
   * Fetch live capacity and spots for a specific shelter
   */
  public async getShelterAvailability(shelterId: string): Promise<BackendShelterAvailability> {
    try {
      const data = await this.request<BackendShelterAvailability>(
        `/api/shelters/${encodeURIComponent(shelterId)}/availability`,
        { method: 'GET' }
      );
      return data;
    } catch (err) {
      console.warn(`[SafeRoute API] getShelterAvailability for ${shelterId} offline; using fallback:`, err);
      const mock = MOCK_SHELTERS[shelterId] || Object.values(MOCK_SHELTERS)[0];
      return {
        shelter_id: shelterId,
        capacity_total: mock.capacityTotal,
        capacity_occupied: mock.capacityOccupied,
        available_spots: mock.capacityTotal - mock.capacityOccupied,
        status: mock.status,
        last_updated: new Date().toISOString(),
      };
    }
  }

  /**
   * POST /api/safest-route
   * Calculate safest route given user location and triage profile
   */
  public async getSafestRoute(
    params: SafestRouteRequest,
    sheltersMap: Record<string, Shelter> = MOCK_SHELTERS
  ): Promise<EvacuationRoute> {
    const payload = {
      latitude: params.latitude,
      longitude: params.longitude,
      group: params.group,
      traveling_with: params.group,
      mobility: params.mobility,
      transport: params.transport,
      transport_mode: params.transport,
    };

    try {
      const data = await this.request<BackendRouteResponse>('/api/safest-route', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const targetShelter = sheltersMap[data.shelter_id] || Object.values(sheltersMap)[0];
      return this.normalizeRoute(data, targetShelter);
    } catch (err) {
      console.warn('[SafeRoute API] getSafestRoute backend request failed; using fallback calculation:', err);
      const modeVal = (params.mode as any) || (params.group as any) || 'walking';
      const profile: UserProfile = {
        mode: modeVal,
        travelingWith: (params.group as any) || 'alone',
        mobility: (params.mobility as any) || 'normal',
        transport: (params.transport as any) || 'walking',
      };
      const fallbackRoute = getRecommendedRouteForProfile(profile);
      return fallbackRoute;
    }
  }

  /**
   * POST /api/reroute
   * Request dynamic detour when obstacles/hazards are detected
   */
  public async getReroute(
    params: RerouteRequest,
    sheltersMap: Record<string, Shelter> = MOCK_SHELTERS
  ): Promise<{ route: EvacuationRoute; scenario: RerouteScenario }> {
    const payload = {
      latitude: params.latitude,
      longitude: params.longitude,
      route_id: params.route_id,
      shelter_id: params.shelter_id,
      group: params.group,
      traveling_with: params.group,
      mobility: params.mobility,
      transport: params.transport,
      transport_mode: params.transport,
      profile: {
        group: params.group,
        mobility: params.mobility,
        transport: params.transport,
      },
    };

    try {
      const data = await this.request<BackendRouteResponse>('/api/reroute', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const targetShelter = sheltersMap[data.shelter_id] || Object.values(sheltersMap)[0];
      const normalizedRoute = this.normalizeRoute(data, targetShelter);

      const rerouteReason =
        data.reroute_reason ||
        data.reason ||
        'Hazard obstruction on primary corridor detected. Safest bypass applied.';

      const scenario: RerouteScenario = {
        id: `reroute-${data.route_id}`,
        name: 'Active Roadway Detour',
        alertTitle: 'ROUTE UPDATED',
        alertDescription: rerouteReason,
        hazardLocation: 'Corridor Obstruction Zone',
        hazardCoordinates: { x: 450, y: 540 },
        hazardRadius: 45,
        newShelterId: normalizedRoute.shelterId,
        newRouteId: normalizedRoute.id,
        reroute_reason: rerouteReason,
      };

      return { route: normalizedRoute, scenario };
    } catch (err) {
      console.warn('[SafeRoute API] getReroute backend request failed; using scenario fallback:', err);
      const scenario = MOCK_REROUTE_SCENARIOS[0];
      const fallbackRoute = MOCK_ROUTES[scenario.newRouteId] || MOCK_ROUTES['route-rerouted-west-transit'];
      return { route: fallbackRoute, scenario };
    }
  }

  /**
   * 1:1 Helper: getCurrentRoute
   * Retrieves the current optimal evacuation route for a given profile and optional location/shelter.
   */
  public async getCurrentRoute(
    profile: UserProfile,
    shelterId?: string,
    location?: Coordinates,
    sheltersMap: Record<string, Shelter> = MOCK_SHELTERS
  ): Promise<EvacuationRoute> {
    const coords = location || USER_START_LOCATION;
    const modeVal = profile.mode || 'walking';
    return this.getSafestRoute(
      {
        latitude: coords.latitude || 37.7749,
        longitude: coords.longitude || -122.4194,
        mode: modeVal,
        group: modeVal,
        traveling_with: modeVal,
        mobility: profile.mobility || (modeVal === 'elderly' ? 'limited' : 'normal'),
        transport: profile.transport || (modeVal === 'four_wheeler' || modeVal === 'two_wheeler' ? 'vehicle' : 'walking'),
      },
      sheltersMap
    );
  }

  /**
   * 1:1 Helper: triggerReroute
   * Triggers a dynamic hazard/reroute recalculation for the active route.
   */
  public async triggerReroute(
    currentRouteId: string,
    currentShelterId: string,
    profile: UserProfile,
    location?: Coordinates,
    sheltersMap: Record<string, Shelter> = MOCK_SHELTERS
  ): Promise<{ route: EvacuationRoute; scenario: RerouteScenario }> {
    const coords = location || USER_START_LOCATION;
    const modeVal = profile.mode || 'walking';
    return this.getReroute(
      {
        latitude: coords.latitude || 37.7749,
        longitude: coords.longitude || -122.4194,
        route_id: currentRouteId,
        shelter_id: currentShelterId,
        mode: modeVal,
        group: modeVal,
        traveling_with: modeVal,
        mobility: profile.mobility || (modeVal === 'elderly' ? 'limited' : 'normal'),
        transport: profile.transport || (modeVal === 'four_wheeler' || modeVal === 'two_wheeler' ? 'vehicle' : 'walking'),
      },
      sheltersMap
    );
  }
}

export const apiService = new SafeRouteApiService();

// Exported standalone convenience functions to match 1:1 FastAPI backend bindings
export const getCurrentRoute = (
  profile: UserProfile,
  shelterId?: string,
  location?: Coordinates,
  sheltersMap?: Record<string, Shelter>
) => apiService.getCurrentRoute(profile, shelterId, location, sheltersMap);

export const triggerReroute = (
  currentRouteId: string,
  currentShelterId: string,
  profile: UserProfile,
  location?: Coordinates,
  sheltersMap?: Record<string, Shelter>
) => apiService.triggerReroute(currentRouteId, currentShelterId, profile, location, sheltersMap);

export const getShelters = () => apiService.getShelters();
export const getShelterAvailability = (shelterId: string) => apiService.getShelterAvailability(shelterId);

export default apiService;

