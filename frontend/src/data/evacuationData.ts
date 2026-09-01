import {
  Shelter,
  EvacuationRoute,
  Coordinates,
  UserProfile,
  RerouteScenario,
} from '../types';

/*
 * KELAMBAKKAM DEMO DATA
 *
 * These values are frontend fallback/demo values.
 * The actual recommendation comes from the FastAPI backend.
 */

export const USER_START_LOCATION: Coordinates = {
  x: 420,
  y: 500,
  latitude: 12.7925,
  longitude: 80.2050,
  accuracy: 15,
  isRealLocation: false,
};

export const MOCK_SHELTERS: Record<string, Shelter> = {
  S02: {
    id: 'S02',
    shelter_id: 'S02',
    name: "St. Mary's Matriculation Higher Secondary School",
    type: 'School',
    address: 'Kelambakkam, Tamil Nadu - 603103',
    district: 'Kelambakkam',
    capacityTotal: 1000,
    capacity_total: 1000,
    capacityOccupied: 0,
    capacity_occupied: 0,
    status: 'optimal',
    coordinates: {
      x: 560,
      y: 470,
      latitude: 12.786187,
      longitude: 80.215199,
    },
    features: [
      'Basic Shelter',
      'Water',
      'Evacuation Intake',
    ],
    contactPhone: '',
    contact_phone: '',
    intakeNote: 'Open for evacuation intake.',
    intake_note: 'Open for evacuation intake.',
    isAccessible: true,
    is_accessible: true,
    petFriendly: false,
    pet_friendly: false,
    medicalSupport: false,
    medical_support: false,
  },

  S03: {
    id: 'S03',
    shelter_id: 'S03',
    name: 'Bhuvana Krishana Matriculation Higher Secondary School',
    type: 'School',
    address: 'Kelambakkam, Tamil Nadu - 603103',
    district: 'Kelambakkam',
    capacityTotal: 2000,
    capacity_total: 2000,
    capacityOccupied: 0,
    capacity_occupied: 0,
    status: 'optimal',
    coordinates: {
      x: 650,
      y: 450,
      latitude: 12.7878259,
      longitude: 80.2195327,
    },
    features: [
      'Basic Shelter',
      'Water',
      'Evacuation Intake',
    ],
    contactPhone: '',
    contact_phone: '',
    intakeNote: 'Open for evacuation intake.',
    intake_note: 'Open for evacuation intake.',
    isAccessible: true,
    is_accessible: true,
    petFriendly: false,
    pet_friendly: false,
    medicalSupport: false,
    medical_support: false,
  },

  S04: {
    id: 'S04',
    shelter_id: 'S04',
    name: 'Government Higher Secondary School, Kelambakkam',
    type: 'Government School',
    address: 'Kelambakkam, Tamil Nadu - 603103',
    district: 'Kelambakkam',
    capacityTotal: 1000,
    capacity_total: 1000,
    capacityOccupied: 0,
    capacity_occupied: 0,
    status: 'optimal',
    coordinates: {
      x: 630,
      y: 520,
      latitude: 12.7849576,
      longitude: 80.2187274,
    },
    features: [
      'Basic Shelter',
      'Water',
      'Evacuation Intake',
    ],
    contactPhone: '',
    contact_phone: '',
    intakeNote: 'Open for evacuation intake.',
    intake_note: 'Open for evacuation intake.',
    isAccessible: true,
    is_accessible: true,
    petFriendly: false,
    pet_friendly: false,
    medicalSupport: false,
    medical_support: false,
  },
};

function createFallbackRoute(
  routeId: string,
  shelterId: string,
  profileKey: string,
  distanceKm: number,
  etaMinutes: number,
  reason: string,
  transportMode: 'walking' | 'vehicle' = 'walking',
): EvacuationRoute {
  const shelter = MOCK_SHELTERS[shelterId];

  const destination = shelter.coordinates;

  const middle: Coordinates = {
    x: Math.round(
      (USER_START_LOCATION.x + destination.x) / 2,
    ),
    y: Math.round(
      (USER_START_LOCATION.y + destination.y) / 2,
    ),
    latitude:
      ((USER_START_LOCATION.latitude ?? 12.7925) +
        (destination.latitude ?? 12.786187)) /
      2,
    longitude:
      ((USER_START_LOCATION.longitude ?? 80.2050) +
        (destination.longitude ?? 80.215199)) /
      2,
  };

  const path: Coordinates[] = [
    USER_START_LOCATION,
    middle,
    destination,
  ];

  return {
    id: routeId,
    route_id: routeId,

    shelterId,
    shelter_id: shelterId,

    profileKey,

    routeName: `Safe Route to ${shelter.name}`,

    distanceKm,
    distance_km: distanceKm,

    etaMinutes,
    eta_minutes: etaMinutes,

    safety_score: 95,

    accessibility: 'accessible',

    transport_mode: transportMode,

    safety_factors: [
      'Low flood risk',
      'Available shelter',
      'Safe evacuation corridor',
    ],

    safetyTag: 'SAFEST ROUTE',

    reason,

    pathCoordinates: path,

    route_coordinates: path,

    elevationProfile: 'Stable',

    hazardClear: true,

    steps: [
      {
        id: `${routeId}-start`,
        instruction: 'Start from your current location.',
        streetName: 'Kelambakkam',
        distance: `${(distanceKm / 2).toFixed(1)} km`,
        iconType: 'start',
      },
      {
        id: `${routeId}-middle`,
        instruction: 'Continue along the recommended safe corridor.',
        streetName: 'Kelambakkam',
        distance: `${(distanceKm / 2).toFixed(1)} km`,
        iconType: 'straight',
      },
      {
        id: `${routeId}-destination`,
        instruction: `Arrive at ${shelter.name}.`,
        streetName: 'Shelter Entrance',
        distance: '0 km',
        iconType: 'destination',
      },
    ],

    isAlternative: false,
  };
}

export const MOCK_ROUTES: Record<string, EvacuationRoute> = {
  'S02-R01': createFallbackRoute(
    'S02-R01',
    'S02',
    'walking',
    1.79,
    21,
    'Recommended because it provides a safe and accessible evacuation corridor.',
  ),

  'S03-R01': createFallbackRoute(
    'S03-R01',
    'S03',
    'walking',
    2.22,
    27,
    'Alternative route with good safety conditions.',
  ),

  'S04-R01': createFallbackRoute(
    'S04-R01',
    'S04',
    'walking',
    2.46,
    30,
    'Alternative route to an available evacuation shelter.',
  ),

  'S02-R-ELDERLY': createFallbackRoute(
    'S02-R-ELDERLY',
    'S02',
    'elderly',
    1.79,
    21,
    'Prioritizes safety and accessibility for elderly evacuees.',
  ),

  'S03-R-BIKE': createFallbackRoute(
    'S03-R-BIKE',
    'S03',
    'two_wheeler',
    2.22,
    5,
    'Prioritizes safe road conditions and travel time for two-wheelers.',
    'vehicle',
  ),

  'S03-R-CAR': createFallbackRoute(
    'S03-R-CAR',
    'S03',
    'four_wheeler',
    2.22,
    4,
    'Prioritizes safe road conditions and travel time for four-wheelers.',
    'vehicle',
  ),
};

export const MOCK_REROUTE_SCENARIOS: RerouteScenario[] = [
  {
    id: 'kelambakkam-flood-reroute',

    name: 'Kelambakkam Flood Risk Reroute',

    alertTitle: 'ROUTE UPDATED',

    alertDescription:
      'The current corridor is no longer preferred. A safer alternative route has been selected.',

    hazardLocation: 'Kelambakkam Backwaters flood-risk zone',

    hazardCoordinates: {
      x: 850,
      y: 430,
      latitude: 12.786617,
      longitude: 80.235480,
    },

    hazardRadius: 80,

    newShelterId: 'S04',

    newRouteId: 'S04-R01',

    reroute_reason:
      'Current corridor excluded because of increased flood risk.',
  },
];

export function getRecommendedRouteForProfile(
  profile: UserProfile,
): EvacuationRoute {
  if (profile.mode === 'elderly') {
    return MOCK_ROUTES['S02-R-ELDERLY'];
  }

  if (profile.mode === 'two_wheeler') {
    return MOCK_ROUTES['S03-R-BIKE'];
  }

  if (profile.mode === 'four_wheeler') {
    return MOCK_ROUTES['S03-R-CAR'];
  }

  if (
    profile.mobility === 'wheelchair' ||
    profile.mobility === 'limited'
  ) {
    return MOCK_ROUTES['S02-R-ELDERLY'];
  }

  return MOCK_ROUTES['S02-R01'];
}