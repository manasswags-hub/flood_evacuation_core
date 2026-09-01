import { Shelter, EvacuationRoute, Coordinates, UserProfile, RerouteScenario } from '../types';

export const USER_START_LOCATION: Coordinates = {
  x: 290,
  y: 720,
  latitude: 37.7749,
  longitude: -122.4194,
  accuracy: 15,
  isRealLocation: false,
};

export const MOCK_SHELTERS: Record<string, Shelter> = {
  'shelter-st-jude': {
    id: 'shelter-st-jude',
    shelter_id: 'shelter-st-jude',
    name: 'St. Jude High School Gymnasium',
    type: 'Primary Municipal Evacuation Shelter',
    address: '1420 Highland Boulevard, Sector 4',
    district: 'Northeast Heights',
    capacityTotal: 350,
    capacity_total: 350,
    capacityOccupied: 142, // 208 spots left (~60% available)
    capacity_occupied: 142,
    status: 'optimal',
    coordinates: { x: 710, y: 340, latitude: 37.7845, longitude: -122.4082 },
    features: ['Step-Free ADA Ramp', 'Pediatric Supplies', 'Backup Generator', 'Dedicated Family Zone'],
    contactPhone: '(555) 019-4821',
    contact_phone: '(555) 019-4821',
    intakeNote: 'Open • Intake staging via Gymnasium Gate 2',
    intake_note: 'Open • Intake staging via Gymnasium Gate 2',
    isAccessible: true,
    is_accessible: true,
    petFriendly: true,
    pet_friendly: true,
    medicalSupport: true,
    medical_support: true,
  },
  'shelter-civic-arena': {
    id: 'shelter-civic-arena',
    shelter_id: 'shelter-civic-arena',
    name: 'North Civic Arena & Fieldhouse',
    type: 'Regional Emergency Operations & Shelter',
    address: '880 Civic Center Drive, Sector 1',
    district: 'North Valley Plaza',
    capacityTotal: 600,
    capacity_total: 600,
    capacityOccupied: 435, // 165 spots left (~28% available)
    capacity_occupied: 435,
    status: 'filling_fast',
    coordinates: { x: 380, y: 190, latitude: 37.7912, longitude: -122.4215 },
    features: ['Emergency Medical Triage', 'Heavy Vehicle Parking', 'Commercial Kitchen', 'Oxygen Refill'],
    contactPhone: '(555) 019-7700',
    contact_phone: '(555) 019-7700',
    intakeNote: 'Active Intake • Priority access for vehicles & medical cases',
    intake_note: 'Active Intake • Priority access for vehicles & medical cases',
    isAccessible: true,
    is_accessible: true,
    petFriendly: false,
    pet_friendly: false,
    medicalSupport: true,
    medical_support: true,
  },
  'shelter-pine-ridge': {
    id: 'shelter-pine-ridge',
    shelter_id: 'shelter-pine-ridge',
    name: 'Pine Ridge Community Center',
    type: 'Neighborhood Rapid Shelter',
    address: '312 Pine Ridge Parkway, Sector 3',
    district: 'Eastwood Commons',
    capacityTotal: 180,
    capacity_total: 180,
    capacityOccupied: 118, // 62 spots left (~34% available)
    capacity_occupied: 118,
    status: 'filling_fast',
    coordinates: { x: 820, y: 640, latitude: 37.7688, longitude: -122.3995 },
    features: ['Pet Boarding Section', 'Step-Free Entrances', 'Shortest Flat Walk', 'Water Station'],
    contactPhone: '(555) 019-3312',
    contact_phone: '(555) 019-3312',
    intakeNote: 'Open • Pet registration in Annex B',
    intake_note: 'Open • Pet registration in Annex B',
    isAccessible: true,
    is_accessible: true,
    petFriendly: true,
    pet_friendly: true,
    medicalSupport: false,
    medical_support: false,
  },
  'shelter-west-transit': {
    id: 'shelter-west-transit',
    shelter_id: 'shelter-west-transit',
    name: 'Westside Transit Center & Concourse',
    type: 'Intermodal Transit & Evacuation Hub',
    address: '450 Western Express Way, Sector 2',
    district: 'West Gateway',
    capacityTotal: 400,
    capacity_total: 400,
    capacityOccupied: 190, // 210 spots left (~52% available)
    capacity_occupied: 190,
    status: 'optimal',
    coordinates: { x: 140, y: 460, latitude: 37.7782, longitude: -122.4345 },
    features: ['Shuttle Bus Staging', 'Covered Concourse', 'Wheelchair Lifts', 'Security Escort'],
    contactPhone: '(555) 019-8834',
    contact_phone: '(555) 019-8834',
    intakeNote: 'Open • Outbound evacuation convoys depart every 20m',
    intake_note: 'Open • Outbound evacuation convoys depart every 20m',
    isAccessible: true,
    is_accessible: true,
    petFriendly: true,
    pet_friendly: true,
    medicalSupport: true,
    medical_support: true,
  },
};

export const MOCK_ROUTES: Record<string, EvacuationRoute> = {
  // 1. Default Walking / Normal / Alone or Family
  'route-walk-st-jude': {
    id: 'route-walk-st-jude',
    route_id: 'route-walk-st-jude',
    shelterId: 'shelter-st-jude',
    shelter_id: 'shelter-st-jude',
    profileKey: 'walking_normal',
    routeName: 'Highland Paved Corridor (Route A-1)',
    distanceKm: 1.6,
    distance_km: 1.6,
    etaMinutes: 20,
    eta_minutes: 20,
    safety_score: 96,
    accessibility: 'Paved Walkway & ADA Compliant',
    transport_mode: 'walking',
    safety_factors: [
      'Clear wide sidewalks',
      'Zero bridge bottlenecks',
      'Verified storm drainage clearance',
      'Active civil defense corridor patrol',
    ],
    safetyTag: 'SAFEST ROUTE',
    reason: 'Selected because: clear wide sidewalks, zero bridge crossings, and verified clear storm drainage.',
    elevationProfile: 'Gentle incline (+12m over 1.6km)',
    hazardClear: true,
    pathCoordinates: [
      { x: 290, y: 720 }, // start
      { x: 370, y: 720 },
      { x: 450, y: 660 },
      { x: 450, y: 520 },
      { x: 580, y: 520 },
      { x: 620, y: 410 },
      { x: 710, y: 340 }, // dest
    ],
    route_coordinates: [
      { x: 290, y: 720 },
      { x: 370, y: 720 },
      { x: 450, y: 660 },
      { x: 450, y: 520 },
      { x: 580, y: 520 },
      { x: 620, y: 410 },
      { x: 710, y: 340 },
    ],
    steps: [
      {
        id: 's1',
        instruction: 'Head East on Elm Street toward 4th Avenue',
        streetName: 'Elm Street',
        distance: '250 m',
        iconType: 'straight',
      },
      {
        id: 's2',
        instruction: 'Turn Left onto 4th Avenue corridor',
        streetName: '4th Avenue',
        distance: '450 m',
        iconType: 'left',
        note: 'Wide pedestrian promenade • No debris reported',
      },
      {
        id: 's3',
        instruction: 'Turn Right onto Highland Parkway',
        streetName: 'Highland Parkway',
        distance: '600 m',
        iconType: 'right',
      },
      {
        id: 's4',
        instruction: 'Arrive at St. Jude High School Gymnasium (Gate 2)',
        streetName: 'Highland Blvd',
        distance: '300 m',
        iconType: 'destination',
        note: 'Shelter intake tents straight ahead',
      },
    ],
  },

  // 2. Wheelchair / Limited Mobility Walking Route
  'route-wheelchair-pine-ridge': {
    id: 'route-wheelchair-pine-ridge',
    route_id: 'route-wheelchair-pine-ridge',
    shelterId: 'shelter-pine-ridge',
    shelter_id: 'shelter-pine-ridge',
    profileKey: 'walking_wheelchair',
    routeName: 'Eastwood Level Access Corridor',
    distanceKm: 1.1,
    distance_km: 1.1,
    etaMinutes: 15,
    eta_minutes: 15,
    safety_score: 98,
    accessibility: '100% Step-Free & Ramped Curbs',
    transport_mode: 'walking',
    safety_factors: [
      'Continuous level pavement (0m elevation gain)',
      'ADA curb cuts at every intersection',
      'Zero stairs or steep incline hazards',
      'Tactile ground paving and wide crossing lanes',
    ],
    safetyTag: 'ACCESSIBILITY VERIFIED',
    reason: 'Selected because: 100% flat continuous pavement, curb cuts at all intersections, zero stair obstacles.',
    elevationProfile: 'Completely Flat (0m gain)',
    hazardClear: true,
    pathCoordinates: [
      { x: 290, y: 720 },
      { x: 440, y: 720 },
      { x: 590, y: 720 },
      { x: 710, y: 680 },
      { x: 820, y: 640 },
    ],
    route_coordinates: [
      { x: 290, y: 720 },
      { x: 440, y: 720 },
      { x: 590, y: 720 },
      { x: 710, y: 680 },
      { x: 820, y: 640 },
    ],
    steps: [
      {
        id: 'w1',
        instruction: 'Head East along Elm Street barrier-free sidewalk',
        streetName: 'Elm Street Paved Way',
        distance: '300 m',
        iconType: 'straight',
        note: 'Smooth concrete surface, ramped curbs',
      },
      {
        id: 'w2',
        instruction: 'Continue East past Eastwood Plaza',
        streetName: 'Eastwood Commons Way',
        distance: '500 m',
        iconType: 'straight',
      },
      {
        id: 'w3',
        instruction: 'Bear slight Left toward Pine Ridge entrance',
        streetName: 'Pine Ridge Parkway',
        distance: '300 m',
        iconType: 'slight_left',
        note: 'Direct ground-level entry ramp',
      },
      {
        id: 'w4',
        instruction: 'Arrive at Pine Ridge Community Center',
        streetName: 'Sector 3 Entrance',
        distance: '100 m',
        iconType: 'destination',
      },
    ],
  },

  // 3. Vehicle Evacuation Route
  'route-vehicle-civic-arena': {
    id: 'route-vehicle-civic-arena',
    route_id: 'route-vehicle-civic-arena',
    shelterId: 'shelter-civic-arena',
    shelter_id: 'shelter-civic-arena',
    profileKey: 'vehicle_normal',
    routeName: 'North Arterial Expressway (Priority Green Lane)',
    distanceKm: 3.2,
    distance_km: 3.2,
    etaMinutes: 8,
    eta_minutes: 8,
    safety_score: 93,
    accessibility: 'Highway & Emergency Vehicle Access',
    transport_mode: 'vehicle',
    safety_factors: [
      'Traffic signal priority preemption',
      'Dual breakdown shoulders open',
      'Police-cleared express corridor',
      'Heavy staging lot with parking capacity',
    ],
    safetyTag: 'PRIORITY VEHICLE LANE',
    reason: 'Selected because: dedicated emergency vehicle corridor with police-cleared signals and large parking zone.',
    elevationProfile: 'Paved highway (+18m)',
    hazardClear: true,
    pathCoordinates: [
      { x: 290, y: 720 },
      { x: 220, y: 720 },
      { x: 220, y: 550 },
      { x: 260, y: 380 },
      { x: 330, y: 260 },
      { x: 380, y: 190 },
    ],
    route_coordinates: [
      { x: 290, y: 720 },
      { x: 220, y: 720 },
      { x: 220, y: 550 },
      { x: 260, y: 380 },
      { x: 330, y: 260 },
      { x: 380, y: 190 },
    ],
    steps: [
      {
        id: 'v1',
        instruction: 'Proceed West on Elm St toward Arterial On-ramp',
        streetName: 'Elm St & Ramp 2',
        distance: '350 m',
        iconType: 'straight',
      },
      {
        id: 'v2',
        instruction: 'Merge Right onto North Arterial Express Corridor',
        streetName: 'Arterial HWY 1',
        distance: '1.8 km',
        iconType: 'right',
        note: 'Keep headlights on • Speed limit 35 mph',
      },
      {
        id: 'v3',
        instruction: 'Take Exit 4 toward Civic Center Drive',
        streetName: 'Exit 4 Ramp',
        distance: '750 m',
        iconType: 'slight_right',
      },
      {
        id: 'v4',
        instruction: 'Enter North Civic Arena Parking Staging Lot C',
        streetName: 'Civic Arena Plaza',
        distance: '300 m',
        iconType: 'destination',
      },
    ],
  },

  // 4. Children/Elderly Family Route (Specialized care & pace)
  'route-family-st-jude': {
    id: 'route-family-st-jude',
    route_id: 'route-family-st-jude',
    shelterId: 'shelter-st-jude',
    shelter_id: 'shelter-st-jude',
    profileKey: 'family_care',
    routeName: 'Parkway Low-Stress Family Corridor',
    distanceKm: 1.4,
    distance_km: 1.4,
    etaMinutes: 18,
    eta_minutes: 18,
    safety_score: 97,
    accessibility: 'Family & Stroller Friendly Greenway',
    transport_mode: 'walking',
    safety_factors: [
      'Shaded greenway segregated from vehicle exhaust',
      '3 emergency hydration and rest stops',
      'Pediatric triage unit on site at intake',
      'Low stress pedestrian lighting',
    ],
    safetyTag: 'FAMILY PROTECTED CORRIDOR',
    reason: 'Selected because: shaded rest points, pediatric nurse intake, and segregated from vehicle exhaust.',
    elevationProfile: 'Flat greenway (+5m)',
    hazardClear: true,
    pathCoordinates: [
      { x: 290, y: 720 },
      { x: 380, y: 700 },
      { x: 460, y: 620 },
      { x: 550, y: 480 },
      { x: 650, y: 400 },
      { x: 710, y: 340 },
    ],
    route_coordinates: [
      { x: 290, y: 720 },
      { x: 380, y: 700 },
      { x: 460, y: 620 },
      { x: 550, y: 480 },
      { x: 650, y: 400 },
      { x: 710, y: 340 },
    ],
    steps: [
      {
        id: 'f1',
        instruction: 'Walk East toward Green Park Promenade',
        streetName: 'Park Promenade',
        distance: '350 m',
        iconType: 'straight',
      },
      {
        id: 'f2',
        instruction: 'Follow lighted green path Northward',
        streetName: 'Central Green Corridor',
        distance: '650 m',
        iconType: 'slight_left',
        note: 'Rest benches and emergency hydration stations available',
      },
      {
        id: 'f3',
        instruction: 'Cross at signalized pedestrian crossing to Highland Blvd',
        streetName: 'Highland Crossing',
        distance: '250 m',
        iconType: 'straight',
      },
      {
        id: 'f4',
        instruction: 'Arrive at St. Jude Family Intake Gate',
        streetName: 'Highland Blvd',
        distance: '150 m',
        iconType: 'destination',
      },
    ],
  },

  // 5. Dynamic Reroute Target Option (Used when reroute triggered)
  'route-rerouted-west-transit': {
    id: 'route-rerouted-west-transit',
    route_id: 'route-rerouted-west-transit',
    shelterId: 'shelter-west-transit',
    shelter_id: 'shelter-west-transit',
    profileKey: 'reroute_active',
    routeName: 'West Gateway Safe Bypass (Alternative 2)',
    distanceKm: 1.3,
    distance_km: 1.3,
    etaMinutes: 14,
    eta_minutes: 14,
    safety_score: 95,
    accessibility: 'Clear Bypass Arterial',
    transport_mode: 'walking',
    safety_factors: [
      'Bypasses confirmed 4th Ave debris blockage',
      'Continuous river path surveillance',
      'Immediate transit concourse capacity',
    ],
    safetyTag: 'ACTIVE DETOUR ROUTE',
    reason: 'Selected because: avoids confirmed 4th Avenue corridor blockage with immediate transit hub backup.',
    reroute_reason: 'Debris obstruction on 4th Avenue Corridor bypassed via West Gateway route.',
    elevationProfile: 'Completely Paved & Clear',
    hazardClear: true,
    isAlternative: true,
    pathCoordinates: [
      { x: 290, y: 720 },
      { x: 210, y: 720 },
      { x: 150, y: 660 },
      { x: 130, y: 550 },
      { x: 140, y: 460 },
    ],
    route_coordinates: [
      { x: 290, y: 720 },
      { x: 210, y: 720 },
      { x: 150, y: 660 },
      { x: 130, y: 550 },
      { x: 140, y: 460 },
    ],
    steps: [
      {
        id: 'r1',
        instruction: 'Turn West onto Elm Street away from 4th Ave obstruction',
        streetName: 'Elm Street West',
        distance: '220 m',
        iconType: 'left',
        note: 'Reroute active • Hazard cleared on this corridor',
      },
      {
        id: 'r2',
        instruction: 'Head North on River Walkway',
        streetName: 'West Riverside Path',
        distance: '580 m',
        iconType: 'right',
      },
      {
        id: 'r3',
        instruction: 'Approach Westside Transit Concourse',
        streetName: 'Western Way',
        distance: '400 m',
        iconType: 'straight',
      },
      {
        id: 'r4',
        instruction: 'Arrive at Westside Transit Hub Intake Desk',
        streetName: 'Transit Main Terminal',
        distance: '100 m',
        iconType: 'destination',
        note: 'Shelter space confirmed • 210 spots open',
      },
    ],
  },

  // 6. Secondary Reroute Target (North Civic Bypass)
  'route-rerouted-civic-arena': {
    id: 'route-rerouted-civic-arena',
    route_id: 'route-rerouted-civic-arena',
    shelterId: 'shelter-civic-arena',
    shelter_id: 'shelter-civic-arena',
    profileKey: 'reroute_civic',
    routeName: 'North Ridge Emergency Detour',
    distanceKm: 2.1,
    distance_km: 2.1,
    etaMinutes: 24,
    eta_minutes: 24,
    safety_score: 92,
    accessibility: 'High Ridge Elevated Route',
    transport_mode: 'walking',
    safety_factors: [
      'Elevated ridge terrain avoiding flood hazards',
      'Direct highway bypass route',
    ],
    safetyTag: 'HAZARD-BYPASS ROUTE',
    reason: 'Selected because: elevated ridge routing bypassing lower flooded zones directly into North Civic Arena.',
    reroute_reason: 'Precautionary diversion to elevated ground due to lower corridor flood hazard.',
    elevationProfile: 'Paved High Ridge',
    hazardClear: true,
    isAlternative: true,
    pathCoordinates: [
      { x: 290, y: 720 },
      { x: 210, y: 720 },
      { x: 190, y: 580 },
      { x: 240, y: 420 },
      { x: 320, y: 280 },
      { x: 380, y: 190 },
    ],
    route_coordinates: [
      { x: 290, y: 720 },
      { x: 210, y: 720 },
      { x: 190, y: 580 },
      { x: 240, y: 420 },
      { x: 320, y: 280 },
      { x: 380, y: 190 },
    ],
    steps: [
      {
        id: 'rc1',
        instruction: 'Turn West away from central grid',
        streetName: 'Elm Street West',
        distance: '250 m',
        iconType: 'left',
      },
      {
        id: 'rc2',
        instruction: 'Ascend North Ridge Corridor',
        streetName: 'Ridge Ave',
        distance: '1.1 km',
        iconType: 'right',
        note: 'High ground route • Completely dry & safe',
      },
      {
        id: 'rc3',
        instruction: 'Follow Civic Center signs',
        streetName: 'Civic Way',
        distance: '650 m',
        iconType: 'straight',
      },
      {
        id: 'rc4',
        instruction: 'Arrive at North Civic Arena Main Concourse',
        streetName: 'North Civic Entrance',
        distance: '100 m',
        iconType: 'destination',
      },
    ],
  },
};

export const MOCK_REROUTE_SCENARIOS: RerouteScenario[] = [
  {
    id: 'hazard-4th-ave',
    name: 'Obstruction on 4th Ave Corridor',
    alertTitle: 'ROUTE UPDATED',
    alertDescription: 'Debris obstruction reported on 4th Ave. System switched to West Gateway Safe Bypass.',
    hazardLocation: '4th Avenue & Highland Intersection',
    hazardCoordinates: { x: 450, y: 540 },
    hazardRadius: 45,
    newShelterId: 'shelter-west-transit',
    newRouteId: 'route-rerouted-west-transit',
    reroute_reason: 'Debris obstruction on 4th Avenue Corridor bypassed via West Gateway Safe Bypass.',
  },
  {
    id: 'hazard-river-swelling',
    name: 'High Water on Lower Corridor',
    alertTitle: 'ROUTE UPDATED',
    alertDescription: 'Precautionary reroute to elevated ground. Diverted to North Civic Arena Ridge Path.',
    hazardLocation: 'Lower River Crossing #2',
    hazardCoordinates: { x: 500, y: 640 },
    hazardRadius: 50,
    newShelterId: 'shelter-civic-arena',
    newRouteId: 'route-rerouted-civic-arena',
    reroute_reason: 'High water on lower corridor bypassed via elevated North Civic Arena ridge path.',
  },
];

/**
 * Pure helper function to lookup the best matching mock route
 * based on user profile. The safety and recommendations are pre-computed static JSON.
 */
export function getRecommendedRouteForProfile(profile: UserProfile): EvacuationRoute {
  const mode = profile.mode || profile.transport || profile.travelingWith || 'walking';

  if (mode === 'four_wheeler') {
    return MOCK_ROUTES['route-vehicle-civic-arena'];
  }

  if (mode === 'two_wheeler') {
    return MOCK_ROUTES['route-vehicle-civic-arena'];
  }

  if (mode === 'elderly') {
    return MOCK_ROUTES['route-wheelchair-pine-ridge'];
  }

  if (profile.transport === 'vehicle') {
    return MOCK_ROUTES['route-vehicle-civic-arena'];
  }

  if (profile.mobility === 'wheelchair' || profile.mobility === 'limited') {
    return MOCK_ROUTES['route-wheelchair-pine-ridge'];
  }

  if (profile.travelingWith === 'children' || profile.travelingWith === 'elderly' || profile.travelingWith === 'both') {
    return MOCK_ROUTES['route-family-st-jude'];
  }

  return MOCK_ROUTES['route-walk-st-jude'];
}

