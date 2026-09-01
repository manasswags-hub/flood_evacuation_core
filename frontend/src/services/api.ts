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

class SafeRouteApiService {
  private baseUrl: string;

  constructor() {
    const rawUrl =
      (import.meta as any).env?.VITE_API_BASE_URL || '';

    this.baseUrl =
      typeof rawUrl === 'string'
        ? rawUrl.trim().replace(/\/+$/, '')
        : '';
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    timeoutMs = 20000,
  ): Promise<T> {
    const cleanEndpoint = endpoint.startsWith('/')
      ? endpoint
      : `/${endpoint}`;

    const url = `${this.baseUrl}${cleanEndpoint}`;

    const controller =
      new AbortController();

    const timeoutId = setTimeout(
      () => controller.abort(),
      timeoutMs,
    );

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
        throw new Error(
          `API Error ${response.status} ${response.statusText}`,
        );
      }

      return (await response.json()) as T;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /*
   * Convert Kelambakkam geographic coordinates
   * into the existing 0-1000 vector-map space.
   */
  private geoToMapCoordinates(
    lat: number,
    lng: number,
  ): Coordinates {
    const minLat = 12.783;
    const maxLat = 12.795;

    const minLng = 80.198;
    const maxLng = 80.223;

    const normX = Math.max(
      0,
      Math.min(
        1,
        (lng - minLng) /
          (maxLng - minLng),
      ),
    );

    const normY = Math.max(
      0,
      Math.min(
        1,
        1 -
          (lat - minLat) /
            (maxLat - minLat),
      ),
    );

    return {
      x: Math.round(
        100 + normX * 800,
      ),
      y: Math.round(
        100 + normY * 800,
      ),
      latitude: lat,
      longitude: lng,
    };
  }

  public normalizeCoordinates(
    coord: any,
    fallback?: Coordinates,
  ): Coordinates {
    if (!coord) {
      return (
        fallback || {
          x: 500,
          y: 500,
        }
      );
    }

    if (
      typeof coord.x === 'number' &&
      typeof coord.y === 'number'
    ) {
      return {
        x: coord.x,
        y: coord.y,
        latitude:
          coord.latitude ??
          coord.lat,
        longitude:
          coord.longitude ??
          coord.lng,
      };
    }

    /*
     * Backend OSRM coordinates are:
     * [longitude, latitude]
     */
    if (
      Array.isArray(coord) &&
      coord.length >= 2
    ) {
      const first = Number(coord[0]);
      const second = Number(coord[1]);

      if (
        Math.abs(first) <= 180 &&
        Math.abs(second) <= 90
      ) {
        return this.geoToMapCoordinates(
          second,
          first,
        );
      }

      return {
        x: first,
        y: second,
      };
    }

    const lat =
      coord.latitude ??
      coord.lat;

    const lng =
      coord.longitude ??
      coord.lng;

    if (
      typeof lat === 'number' &&
      typeof lng === 'number'
    ) {
      return this.geoToMapCoordinates(
        lat,
        lng,
      );
    }

    return (
      fallback || {
        x: 500,
        y: 500,
      }
    );
  }

  public normalizeShelter(
    raw: any,
  ): Shelter {
    const id =
      raw.shelter_id ||
      raw.id ||
      `shelter-${Math.random()
        .toString(36)
        .slice(2, 7)}`;

    const latitude =
      raw.latitude ??
      raw.coordinates?.latitude ??
      raw.coordinates?.lat;

    const longitude =
      raw.longitude ??
      raw.coordinates?.longitude ??
      raw.coordinates?.lng;

    const coordinates =
      typeof latitude === 'number' &&
      typeof longitude === 'number'
        ? this.geoToMapCoordinates(
            latitude,
            longitude,
          )
        : this.normalizeCoordinates(
            raw.coordinates,
            MOCK_SHELTERS[id]
              ?.coordinates,
          );

    const capacityTotal =
      raw.capacity_total ??
      raw.capacityTotal ??
      raw.capacity ??
      0;

    const capacityOccupied =
      raw.capacity_occupied ??
      raw.capacityOccupied ??
      raw.occupancy ??
      0;

    const availableCapacity =
      raw.available_capacity ??
      raw.availableCapacity ??
      Math.max(
        0,
        capacityTotal -
          capacityOccupied,
      );

    return {
      id,
      shelter_id: id,

      name:
        raw.name ||
        'Emergency Evacuation Shelter',

      type:
        raw.type ||
        'Evacuation Shelter',

      address:
        raw.address ||
        'Kelambakkam, Tamil Nadu',

      district:
        raw.district ||
        'Kelambakkam',

      capacityTotal,
      capacity_total: capacityTotal,

      capacityOccupied,
      capacity_occupied:
        capacityOccupied,

      status:
        raw.status ||
        (availableCapacity <= 0
          ? 'full'
          : 'optimal'),

      coordinates,

      features:
        Array.isArray(raw.features)
          ? raw.features
          : [
              'Emergency Supplies',
              'Evacuation Intake',
            ],

      contactPhone:
        raw.contact_phone ||
        raw.contactPhone ||
        '',

      contact_phone:
        raw.contact_phone ||
        raw.contactPhone ||
        '',

      intakeNote:
        raw.intake_note ||
        raw.intakeNote ||
        'Open for evacuation intake.',

      intake_note:
        raw.intake_note ||
        raw.intakeNote ||
        'Open for evacuation intake.',

      isAccessible: Boolean(
        raw.is_accessible ??
          raw.isAccessible ??
          true,
      ),

      is_accessible: Boolean(
        raw.is_accessible ??
          raw.isAccessible ??
          true,
      ),

      petFriendly: Boolean(
        raw.pet_friendly ??
          raw.petFriendly ??
          false,
      ),

      pet_friendly: Boolean(
        raw.pet_friendly ??
          raw.petFriendly ??
          false,
      ),

      medicalSupport: Boolean(
        raw.medical_support ??
          raw.medicalSupport ??
          false,
      ),

      medical_support: Boolean(
        raw.medical_support ??
          raw.medicalSupport ??
          false,
      ),
    };
  }

  public normalizeRoute(
    raw: BackendRouteResponse | any,
    targetShelter?: Shelter,
  ): EvacuationRoute {
    const shelterId =
      raw.shelter_id ||
      targetShelter?.shelter_id ||
      targetShelter?.id ||
      'S02';

    const routeId =
      raw.route_id ||
      raw.id ||
      `${shelterId}-R01`;

    const distanceKm = Number(
      raw.distance_km ??
        raw.distanceKm ??
        0,
    );

    const backendEta = Number(
      raw.eta_minutes ??
        raw.etaMinutes ??
        1,
    );

    const transportMode =
      raw.transport_mode ||
      'walking';

    /*
     * Always keep walking ETA realistic.
     * 5 km/h = 12 minutes per km.
     */
    const etaMinutes =
      transportMode === 'walking'
        ? Math.max(
            1,
            Math.round(
              (distanceKm / 5) * 60,
            ),
          )
        : Math.max(
            1,
            Math.round(backendEta),
          );

    const rawCoordinates =
      raw.route_coordinates ||
      raw.routeCoordinates ||
      [];

    const routeCoordinates =
      Array.isArray(rawCoordinates)
        ? rawCoordinates
        : [];

    const pathCoordinates: Coordinates[] =
      routeCoordinates.map(
        (coordinate: any) =>
          this.normalizeCoordinates(
            coordinate,
            USER_START_LOCATION,
          ),
      );

    const safetyFactors =
      raw.safety_factors;

    const safetyFactorStrings: string[] =
      Array.isArray(safetyFactors)
        ? safetyFactors.map(String)
        : safetyFactors &&
            typeof safetyFactors ===
              'object'
          ? Object.entries(
              safetyFactors,
            ).map(
              ([key, value]) =>
                `${key}: ${String(value)}`,
            )
          : [];

    const finalPath =
      pathCoordinates.length > 0
        ? pathCoordinates
        : [
            USER_START_LOCATION,
            targetShelter?.coordinates ||
              MOCK_SHELTERS[
                shelterId
              ]?.coordinates ||
              USER_START_LOCATION,
          ];

    const safetyScore = Number(
      raw.safety_score ?? 95,
    );

    const routeName =
      raw.route_name ||
      raw.routeName ||
      `Safe Route to ${
        targetShelter?.name ||
        shelterId
      }`;

    return {
      id: routeId,
      route_id: routeId,

      shelterId,
      shelter_id: shelterId,

      profileKey:
        raw.profileKey ||
        undefined,

      routeName,

      distanceKm,
      distance_km: distanceKm,

      etaMinutes,
      eta_minutes: etaMinutes,

      safety_score:
        Number.isFinite(safetyScore)
          ? safetyScore
          : 95,

      accessibility:
        raw.accessibility ??
        'accessible',

      transport_mode:
        transportMode,

      safety_factors:
        safetyFactorStrings,

      safetyTag:
        raw.safetyTag ||
        'SAFEST ROUTE',

      reason:
        raw.reason ||
        'Safest available route selected using objective safety and personalized preferences.',

      reroute_reason:
        raw.reroute_reason,

      pathCoordinates: finalPath,

      route_coordinates:
        routeCoordinates,

      elevationProfile:
        raw.elevation_profile ||
        raw.elevationProfile ||
        'Stable',

      steps:
        Array.isArray(raw.steps) &&
        raw.steps.length > 0
          ? raw.steps
          : [
              {
                id: `${routeId}-start`,
                instruction:
                  'Start from your current location.',
                streetName:
                  'Kelambakkam',
                distance: `${distanceKm} km`,
                iconType: 'start',
              },
              {
                id: `${routeId}-destination`,
                instruction:
                  `Arrive at ${
                    targetShelter?.name ||
                    'evacuation shelter'
                  }.`,
                streetName:
                  'Shelter Entrance',
                distance: '0 km',
                iconType:
                  'destination',
              },
            ],

      hazardClear:
        raw.hazardClear ??
        true,

      isAlternative:
        raw.isAlternative ??
        false,
    };
  }

  public async sendLocation(
    payload: BackendLocationPayload,
  ) {
    return this.request(
      '/api/location',
      {
        method: 'POST',
        body: JSON.stringify(
          payload,
        ),
      },
    );
  }

  public async getShelters(): Promise<
    Shelter[]
  > {
    try {
      const data =
        await this.request<any>(
          '/api/shelters',
        );

      const rawShelters =
        Array.isArray(data)
          ? data
          : data?.shelters || [];

      return rawShelters.map(
        (shelter: any) =>
          this.normalizeShelter(
            shelter,
          ),
      );
    } catch (err) {
      console.warn(
        '[SafeRoute API] Shelters unavailable; using Kelambakkam fallback.',
        err,
      );

      return Object.values(
        MOCK_SHELTERS,
      );
    }
  }

  public async getShelterAvailability(
    shelterId: string,
  ): Promise<BackendShelterAvailability> {
    try {
      const data =
        await this.request<any>(
          `/api/shelters/${shelterId}/availability`,
        );

      const total =
        data.capacity_total ??
        data.capacity ??
        0;

      const occupied =
        data.capacity_occupied ??
        data.occupancy ??
        0;

      const available =
        data.available_spots ??
        data.available_capacity ??
        Math.max(
          0,
          total - occupied,
        );

      return {
        shelter_id:
          data.shelter_id ||
          shelterId,

        capacity_total: total,

        capacity_occupied:
          occupied,

        available_spots:
          available,

        status:
          data.status ||
          (data.is_full
            ? 'full'
            : 'optimal'),

        last_updated:
          data.last_updated,
      };
    } catch (err) {
      console.warn(
        `[SafeRoute API] Availability failed for ${shelterId}; using fallback.`,
        err,
      );

      const mock =
        MOCK_SHELTERS[
          shelterId
        ] ||
        Object.values(
          MOCK_SHELTERS,
        )[0];

      return {
        shelter_id:
          mock.shelter_id,

        capacity_total:
          mock.capacityTotal,

        capacity_occupied:
          mock.capacityOccupied,

        available_spots:
          Math.max(
            0,
            mock.capacityTotal -
              mock.capacityOccupied,
          ),

        status:
          mock.status,

        last_updated:
          new Date().toISOString(),
      };
    }
  }

  public async getSafestRoute(
    params: SafestRouteRequest,
    sheltersMap: Record<
      string,
      Shelter
    > = MOCK_SHELTERS,
  ): Promise<EvacuationRoute> {
    const payload = {
      latitude: params.latitude,
      longitude: params.longitude,

      group:
        params.group ||
        params.mode ||
        'walking',

      traveling_with:
        params.traveling_with ||
        'alone',

      mobility:
        params.mobility ||
        'normal',

      transport:
        params.transport ||
        (
          params.mode ===
            'two_wheeler' ||
          params.mode ===
            'four_wheeler'
            ? 'vehicle'
            : 'walking'
        ),

      transport_mode:
        params.transport_mode ||
        params.transport ||
        (
          params.mode ===
            'two_wheeler' ||
          params.mode ===
            'four_wheeler'
            ? 'vehicle'
            : 'walking'
        ),
    };

    try {
      const data =
        await this.request<any>(
          '/api/safest-route',
          {
            method: 'POST',
            body: JSON.stringify(
              payload,
            ),
          },
        );

      const recommended =
        data.recommended_route ||
        data;

      const targetShelter =
        sheltersMap[
          recommended.shelter_id
        ] ||
        Object.values(
          sheltersMap,
        ).find(
          (shelter) =>
            shelter.shelter_id ===
            recommended.shelter_id,
        );

      return this.normalizeRoute(
        recommended,
        targetShelter,
      );
    } catch (err) {
      console.warn(
        '[SafeRoute API] Safest route failed; using Kelambakkam fallback.',
        err,
      );

      const modeVal =
        (params.mode as any) ||
        'walking';

      const profile: UserProfile = {
        mode: modeVal,
        travelingWith:
          params.traveling_with ||
          'alone',
        mobility:
          params.mobility ||
          'normal',
        transport:
          params.transport ||
          'walking',
      };

      return getRecommendedRouteForProfile(
        profile,
      );
    }
  }

  public async getReroute(
    params: RerouteRequest,
    sheltersMap: Record<
      string,
      Shelter
    > = MOCK_SHELTERS,
  ): Promise<{
    route: EvacuationRoute;
    scenario: RerouteScenario;
  }> {
    const payload = {
      latitude: params.latitude,
      longitude: params.longitude,

      route_id:
        params.route_id,

      shelter_id:
        params.shelter_id,

      group:
        params.group ||
        params.mode ||
        'walking',

      traveling_with:
        params.traveling_with ||
        params.group ||
        'alone',

      mobility:
        params.mobility ||
        'normal',

      transport:
        params.transport ||
        'walking',

      transport_mode:
        params.transport_mode ||
        params.transport ||
        'walking',

      profile: {
        mode:
          params.mode,
        group:
          params.group ||
          'walking',
        mobility:
          params.mobility ||
          'normal',
        transport:
          params.transport ||
          'walking',
      },
    };

    try {
      const data =
        await this.request<any>(
          '/api/reroute',
          {
            method: 'POST',
            body: JSON.stringify(
              payload,
            ),
          },
        );

      const recommended =
        data.recommended_route ||
        data;

      const targetShelter =
        sheltersMap[
          recommended.shelter_id
        ] ||
        Object.values(
          sheltersMap,
        ).find(
          (shelter) =>
            shelter.shelter_id ===
            recommended.shelter_id,
        );

      const route =
        this.normalizeRoute(
          recommended,
          targetShelter,
        );

      const reason =
        data.reroute_reason ||
        recommended.reroute_reason ||
        data.reason ||
        'Current corridor excluded because a safer alternative was found.';

      const scenario: RerouteScenario = {
        id:
          `reroute-${route.route_id}`,

        name:
          'Kelambakkam Safe Reroute',

        alertTitle:
          'ROUTE UPDATED',

        alertDescription:
          reason,

        hazardLocation:
          'Kelambakkam flood-risk corridor',

        hazardCoordinates: {
          x: 850,
          y: 430,
          latitude: 12.786617,
          longitude: 80.235480,
        },

        hazardRadius: 80,

        newShelterId:
          route.shelterId,

        newRouteId:
          route.route_id,

        reroute_reason:
          reason,
      };

      return {
        route,
        scenario,
      };
    } catch (err) {
      console.warn(
        '[SafeRoute API] Reroute failed; using Kelambakkam fallback.',
        err,
      );

      const scenario =
        MOCK_REROUTE_SCENARIOS[0];

      const fallbackRoute =
        MOCK_ROUTES[
          scenario.newRouteId
        ] ||
        MOCK_ROUTES['S04-R01'];

      return {
        route: fallbackRoute,
        scenario,
      };
    }
  }

  public async getCurrentRoute(
    profile: UserProfile,
    shelterId?: string,
    location?: Coordinates,
    sheltersMap: Record<
      string,
      Shelter
    > = MOCK_SHELTERS,
  ): Promise<EvacuationRoute> {
    const coords =
      location ||
      USER_START_LOCATION;

    const modeVal =
      profile.mode ||
      'walking';

    return this.getSafestRoute(
      {
        latitude:
          coords.latitude ??
          12.7925,

        longitude:
          coords.longitude ??
          80.2050,

        mode: modeVal,

        group:
          profile.travelingWith ||
          modeVal,

        traveling_with:
          profile.travelingWith ||
          'alone',

        mobility:
          profile.mobility ||
          'normal',

        transport:
          profile.transport ||
          (
            modeVal ===
              'two_wheeler' ||
            modeVal ===
              'four_wheeler'
              ? 'vehicle'
              : 'walking'
          ),
      },
      sheltersMap,
    );
  }

  public async triggerReroute(
    currentRouteId: string,
    currentShelterId: string,
    profile: UserProfile,
    location?: Coordinates,
    sheltersMap: Record<
      string,
      Shelter
    > = MOCK_SHELTERS,
  ) {
    const coords =
      location ||
      USER_START_LOCATION;

    return this.getReroute(
      {
        latitude:
          coords.latitude ??
          12.7925,

        longitude:
          coords.longitude ??
          80.2050,

        route_id:
          currentRouteId,

        shelter_id:
          currentShelterId,

        mode:
          profile.mode,

        group:
          profile.travelingWith ||
          profile.mode,

        traveling_with:
          profile.travelingWith ||
          'alone',

        mobility:
          profile.mobility ||
          'normal',

        transport:
          profile.transport ||
          'walking',
      },
      sheltersMap,
    );
  }
}

export const apiService =
  new SafeRouteApiService();

export const getCurrentRoute = (
  profile: UserProfile,
  shelterId?: string,
  location?: Coordinates,
  sheltersMap?: Record<
    string,
    Shelter
  >,
) =>
  apiService.getCurrentRoute(
    profile,
    shelterId,
    location,
    sheltersMap,
  );

export const triggerReroute = (
  currentRouteId: string,
  currentShelterId: string,
  profile: UserProfile,
  location?: Coordinates,
  sheltersMap?: Record<
    string,
    Shelter
  >,
) =>
  apiService.triggerReroute(
    currentRouteId,
    currentShelterId,
    profile,
    location,
    sheltersMap,
  );

export const getShelters = () =>
  apiService.getShelters();

export const getShelterAvailability = (
  shelterId: string,
) =>
  apiService.getShelterAvailability(
    shelterId,
  );

export default apiService;