import React, { useState, useEffect } from 'react';
import {
  UserProfile,
  Shelter,
  EvacuationRoute,
  RerouteScenario,
  Coordinates,
} from './types';
import {
  MOCK_SHELTERS,
  MOCK_ROUTES,
  MOCK_REROUTE_SCENARIOS,
  USER_START_LOCATION,
  getRecommendedRouteForProfile,
} from './data/evacuationData';
import { apiService } from './services/api';
import { MapView } from './components/MapView';
import { BottomCard } from './components/BottomCard';
import { PersonalizationForm } from './components/PersonalizationForm';
import { NavigationView } from './components/NavigationView';
import { RerouteToast } from './components/RerouteToast';
import { TopBar } from './components/TopBar';
import { SosModal } from './components/SosModal';
import { CheckCircle2, RotateCcw } from 'lucide-react';

export default function App() {
  // 1. User Profile & Onboarding State
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    mode: 'walking',
    travelingWith: 'alone',
    mobility: 'normal',
    transport: 'walking',
  });

  // 2. Shelters & User Location State
  const [sheltersMap, setSheltersMap] = useState<Record<string, Shelter>>(MOCK_SHELTERS);
  const [userLocation, setUserLocation] = useState<Coordinates>(USER_START_LOCATION);

  // 3. Active Evacuation & Route State
  const [selectedShelterId, setSelectedShelterId] = useState<string>('shelter-st-jude');
  const [activeRoute, setActiveRoute] = useState<EvacuationRoute>(
    MOCK_ROUTES['route-walk-st-jude']
  );

  // 4. Dynamic Reroute Event State
  const [activeHazard, setActiveHazard] = useState<RerouteScenario | null>(null);
  const [showRerouteToast, setShowRerouteToast] = useState<boolean>(false);
  const [isRerouted, setIsRerouted] = useState<boolean>(false);
  const [isSimulatingReroute, setIsSimulatingReroute] = useState<boolean>(false);

  // 5. Live Evacuation Navigation State
  const [isEvacuating, setIsEvacuating] = useState<boolean>(false);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [hasSafelyArrived, setHasSafelyArrived] = useState<boolean>(false);

  // 6. Modals State
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isSosModalOpen, setIsSosModalOpen] = useState<boolean>(false);

  // Initial load: Fetch shelters from /api/shelters
  useEffect(() => {
    let isMounted = true;
    apiService.getShelters().then((sheltersList) => {
      if (!isMounted || !sheltersList || sheltersList.length === 0) return;
      const dict: Record<string, Shelter> = {};
      sheltersList.forEach((s) => {
        dict[s.id || s.shelter_id] = s;
      });
      setSheltersMap((prev) => ({ ...prev, ...dict }));
    });
    return () => {
      isMounted = false;
    };
  }, []);

  /**
   * Handle personalization submission:
   * 1. Uses the user's location chosen in PersonalizationForm (Real GPS or Demo)
   * 2. Send latitude/longitude to /api/location
   * 3. Fetch shelters from /api/shelters
   * 4. Send location + group + mobility + transport to /api/safest-route
   * 5. Display the returned shelter, distance, ETA, safety score, safety factors, and route on the map.
   */
  const applyProfile = async (profile: UserProfile, location?: Coordinates) => {
    setUserProfile(profile);
    const activeLoc: Coordinates = location || userLocation || USER_START_LOCATION;
    setUserLocation(activeLoc);

    try {
      // 1. Coordinates for API
      const lat = activeLoc.latitude ?? 37.7749;
      const lng = activeLoc.longitude ?? -122.4194;

      // 2. Send location to /api/location
      await apiService.sendLocation({
        latitude: lat,
        longitude: lng,
        accuracy: activeLoc.accuracy,
      });

      // 3. Fetch shelters from /api/shelters
      const fetchedShelters = await apiService.getShelters();
      const newSheltersDict: Record<string, Shelter> = { ...sheltersMap };
      fetchedShelters.forEach((s) => {
        newSheltersDict[s.id || s.shelter_id] = s;
      });
      setSheltersMap(newSheltersDict);

      // 4. Send location + mode + transport to /api/safest-route
      const modeVal = profile.mode || 'walking';
      const recommendedRoute = await apiService.getSafestRoute(
        {
          latitude: lat,
          longitude: lng,
          mode: modeVal,
          group: modeVal,
          traveling_with: modeVal,
          mobility: profile.mobility || (modeVal === 'elderly' ? 'limited' : 'normal'),
          transport:
            profile.transport ||
            (modeVal === 'four_wheeler' || modeVal === 'two_wheeler'
              ? 'vehicle'
              : 'walking'),
        },
        newSheltersDict
      );

      // 5. Display returned shelter and route
      setActiveRoute(recommendedRoute);
      setSelectedShelterId(recommendedRoute.shelter_id || recommendedRoute.shelterId);
      setHasCompletedOnboarding(true);
      setIsProfileModalOpen(false);
      setIsRerouted(false);
      setActiveHazard(null);
      setShowRerouteToast(false);
      setActiveStepIndex(0);
    } catch (err) {
      console.error('[SafeRoute] Failed calculating safest route via API:', err);
      // Fallback
      const fallbackRoute = getRecommendedRouteForProfile(profile);
      setActiveRoute(fallbackRoute);
      setSelectedShelterId(fallbackRoute.shelter_id || fallbackRoute.shelterId);
      setHasCompletedOnboarding(true);
      setIsProfileModalOpen(false);
      setIsRerouted(false);
      setActiveHazard(null);
      setShowRerouteToast(false);
      setActiveStepIndex(0);
    }
  };

  /**
   * Handle Dynamic Reroute Event:
   * Send current location, current route ID, current shelter ID, and user's profile to /api/reroute.
   * When rerouting succeeds:
   * - animate route line and destination marker updating to new mock route/shelter
   * - show non-alarming "ROUTE UPDATED" toast with short reroute reason
   * - update distance, ETA, and evacuation status
   */
  const triggerRerouteDemo = async () => {
    setIsSimulatingReroute(true);
    try {
      const lat = userLocation.latitude ?? 37.7749;
      const lng = userLocation.longitude ?? -122.4194;

      const result = await apiService.getReroute(
        {
          latitude: lat,
          longitude: lng,
          route_id: activeRoute.route_id || activeRoute.id,
          shelter_id: selectedShelterId,
          group: userProfile.travelingWith,
          mobility: userProfile.mobility,
          transport: userProfile.transport,
        },
        sheltersMap
      );

      // Smooth state transition
      setActiveHazard(result.scenario);
      setActiveRoute(result.route);
      setSelectedShelterId(result.route.shelter_id || result.route.shelterId);
      setIsRerouted(true);
      setShowRerouteToast(true);
      setActiveStepIndex(0);
    } catch (err) {
      console.error('[SafeRoute] Reroute API call failed, using mock scenario fallback:', err);
      const scenario = MOCK_REROUTE_SCENARIOS[0];
      const newRoute = MOCK_ROUTES[scenario.newRouteId] || MOCK_ROUTES['route-rerouted-west-transit'];
      setActiveHazard(scenario);
      setActiveRoute(newRoute);
      setSelectedShelterId(scenario.newShelterId);
      setIsRerouted(true);
      setShowRerouteToast(true);
      setActiveStepIndex(0);
    } finally {
      setIsSimulatingReroute(false);
    }
  };

  // Reset Reroute to Normal Primary Route
  const resetRerouteDemo = () => {
    applyProfile(userProfile, userLocation);
  };

  // Handle Manual Shelter Selection on Map
  const handleSelectShelter = (shelter: Shelter) => {
    if (isEvacuating) return; // Locked during active navigation
    setSelectedShelterId(shelter.id || shelter.shelter_id);

    // Also fetch live availability
    apiService.getShelterAvailability(shelter.id || shelter.shelter_id).then((avail) => {
      if (avail && avail.capacity_total) {
        setSheltersMap((prev) => ({
          ...prev,
          [shelter.id]: {
            ...prev[shelter.id],
            capacityTotal: avail.capacity_total,
            capacityOccupied: avail.capacity_occupied,
          },
        }));
      }
    });

    // Find if a route exists for this shelter or create a fallback mapped route
    const matchingRoute = Object.values(MOCK_ROUTES).find(
      (r) => (r.shelter_id || r.shelterId) === (shelter.id || shelter.shelter_id)
    );
    if (matchingRoute) {
      setActiveRoute(matchingRoute);
    } else {
      // Construct a direct route to the clicked shelter
      setActiveRoute({
        id: `custom-route-${shelter.id}`,
        route_id: `custom-route-${shelter.id}`,
        shelterId: shelter.id,
        shelter_id: shelter.id,
        profileKey: 'custom',
        routeName: `Direct Corridor to ${shelter.name}`,
        distanceKm: 1.8,
        distance_km: 1.8,
        etaMinutes: 22,
        eta_minutes: 22,
        safety_score: 94,
        accessibility: shelter.isAccessible ? 'ADA Accessible' : 'Standard',
        transport_mode: userProfile.transport,
        safety_factors: ['Monitored municipal pathway', 'Direct line of travel', 'Adequate intake spots'],
        safetyTag: 'USER SELECTED CORRIDOR',
        reason: `Manually selected alternative shelter: ${shelter.district}.`,
        pathCoordinates: [
          userLocation,
          { x: Math.round((userLocation.x + shelter.coordinates.x) / 2), y: userLocation.y },
          shelter.coordinates,
        ],
        route_coordinates: [
          userLocation,
          { x: Math.round((userLocation.x + shelter.coordinates.x) / 2), y: userLocation.y },
          shelter.coordinates,
        ],
        elevationProfile: 'Monitored municipal path',
        hazardClear: true,
        steps: [
          {
            id: 'c1',
            instruction: `Head along main corridor toward ${shelter.district}`,
            streetName: 'Arterial Corridor',
            distance: '1.2 km',
            iconType: 'straight',
          },
          {
            id: 'c2',
            instruction: `Arrive at ${shelter.name}`,
            streetName: shelter.address,
            distance: '600 m',
            iconType: 'destination',
          },
        ],
      });
    }
    setActiveStepIndex(0);
  };

  // Safe Arrival Completion
  const handleCompleteEvacuation = () => {
    setIsEvacuating(false);
    setHasSafelyArrived(true);
  };

  const selectedShelter =
    sheltersMap[selectedShelterId] ||
    sheltersMap['shelter-st-jude'] ||
    Object.values(sheltersMap)[0] ||
    MOCK_SHELTERS['shelter-st-jude'];
  const allSheltersList = Object.values(sheltersMap);

  // If user hasn't completed 3-step onboarding form, show Personalization screen first
  if (!hasCompletedOnboarding) {
    return (
      <PersonalizationForm
        initialProfile={userProfile}
        initialLocation={userLocation}
        onSubmit={applyProfile}
      />
    );
  }

  return (
    <div id="saferoute-app" className="relative w-full h-screen h-[100dvh] overflow-hidden bg-[#020617] flex flex-col font-sans">
      {/* Top Header Bar (Shown in pre-navigation overview) */}
      {!isEvacuating && (
        <TopBar
          userProfile={userProfile}
          userLocation={userLocation}
          isRerouted={isRerouted}
          onOpenProfile={() => setIsProfileModalOpen(true)}
          onTriggerRerouteDemo={triggerRerouteDemo}
          onResetRerouteDemo={resetRerouteDemo}
          onOpenSos={() => setIsSosModalOpen(true)}
        />
      )}

      {/* Dynamic Reroute Alert Toast (Pre-navigation overview) */}
      {!isEvacuating && showRerouteToast && activeHazard && (
        <RerouteToast
          alert={activeHazard}
          newShelter={selectedShelter}
          onDismiss={() => setShowRerouteToast(false)}
          onViewRoute={() => setShowRerouteToast(false)}
        />
      )}

      {/* Main Full-Screen Map Area (Active & Interactive in both modes) */}
      <main className={`relative flex-1 w-full h-full ${isEvacuating ? 'pt-12 pb-24' : 'pt-14 pb-28'}`}>
        <MapView
          userLocation={userLocation}
          shelters={allSheltersList}
          selectedShelterId={selectedShelterId}
          activeRoute={activeRoute}
          activeHazard={activeHazard}
          onSelectShelter={handleSelectShelter}
          isEvacuating={isEvacuating}
        />
      </main>

      {/* PRE-NAVIGATION MODE: Floating Bottom Recommendation Card */}
      {!isEvacuating && (
        <BottomCard
          shelter={selectedShelter}
          route={activeRoute}
          userProfile={userProfile}
          userLocation={userLocation}
          isRerouted={isRerouted}
          isEvacuating={isEvacuating}
          activeStepIndex={activeStepIndex}
          onStartEvacuation={() => {
            setIsEvacuating(true);
            setActiveStepIndex(0);
          }}
          onCompleteEvacuation={handleCompleteEvacuation}
          onNextStep={() => {
            if (activeStepIndex < activeRoute.steps.length - 1) {
              setActiveStepIndex((prev) => prev + 1);
            }
          }}
          onPrevStep={() => {
            if (activeStepIndex > 0) {
              setActiveStepIndex((prev) => prev - 1);
            }
          }}
          onOpenProfile={() => setIsProfileModalOpen(true)}
        />
      )}

      {/* LIVE NAVIGATION MODE: Dedicated Navigation View & Controls */}
      {isEvacuating && (
        <NavigationView
          shelter={selectedShelter}
          route={activeRoute}
          userProfile={userProfile}
          isRerouted={isRerouted}
          activeHazard={activeHazard}
          showRerouteToast={showRerouteToast}
          activeStepIndex={activeStepIndex}
          isSimulatingReroute={isSimulatingReroute}
          onSimulateHazard={triggerRerouteDemo}
          onResetReroute={resetRerouteDemo}
          onCompleteEvacuation={handleCompleteEvacuation}
          onNextStep={() => {
            if (activeStepIndex < activeRoute.steps.length - 1) {
              setActiveStepIndex((prev) => prev + 1);
            }
          }}
          onPrevStep={() => {
            if (activeStepIndex > 0) {
              setActiveStepIndex((prev) => prev - 1);
            }
          }}
          onExitNavigation={() => setIsEvacuating(false)}
          onDismissToast={() => setShowRerouteToast(false)}
          onOpenSos={() => setIsSosModalOpen(true)}
        />
      )}

      {/* Personalization Modal (For editing profile anytime) */}
      {isProfileModalOpen && (
        <PersonalizationForm
          isModal
          initialProfile={userProfile}
          initialLocation={userLocation}
          onSubmit={applyProfile}
          onCancel={() => setIsProfileModalOpen(false)}
        />
      )}

      {/* Emergency Hotlines SOS Modal */}
      <SosModal
        isOpen={isSosModalOpen}
        onClose={() => setIsSosModalOpen(false)}
      />

      {/* Safe Arrival Success Modal */}
      {hasSafelyArrived && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#0F172A] border-2 border-emerald-500/60 rounded-3xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto shadow-[0_0_24px_rgba(16,185,129,0.3)]">
              <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
            </div>

            <div>
              <h2 className="text-xl font-black text-white tracking-tight">
                Evacuation Complete
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                You have arrived at <strong className="text-emerald-400">{selectedShelter.name}</strong>
              </p>
            </div>

            <div className="bg-[#1E293B]/70 border border-slate-700 rounded-2xl p-4 text-left text-xs space-y-2">
              <div className="font-bold text-slate-200 uppercase tracking-wider text-[11px] font-mono">
                Intake Instructions
              </div>
              <p className="text-slate-300 leading-relaxed">
                {selectedShelter.intakeNote}. Please check in at the intake desk for emergency credentials, food supplies, and designated rest quarters.
              </p>
              <div className="pt-2 border-t border-slate-700/80 flex items-center justify-between text-[11px] text-slate-400">
                <span>Direct Contact:</span>
                <span className="font-mono text-slate-200 font-bold">{selectedShelter.contactPhone}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setHasSafelyArrived(false)}
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-[#020617] font-extrabold text-xs uppercase tracking-wider transition-all shadow-md"
              >
                Close & Remain in Shelter
              </button>

              <button
                type="button"
                onClick={() => {
                  setHasSafelyArrived(false);
                  setIsEvacuating(false);
                  resetRerouteDemo();
                }}
                className="py-3 px-4 rounded-xl bg-[#1E293B] hover:bg-[#334155] text-slate-300 font-bold text-xs transition-all border border-slate-700"
                title="Reset simulation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

