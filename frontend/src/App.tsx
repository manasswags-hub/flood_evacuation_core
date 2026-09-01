import React, { useEffect, useState } from 'react';

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

import {
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';

export default function App() {
  // ============================================================
  // PROFILE
  // ============================================================

  const [
    hasCompletedOnboarding,
    setHasCompletedOnboarding,
  ] = useState(false);

  const [userProfile, setUserProfile] =
    useState<UserProfile>({
      mode: 'walking',
      travelingWith: 'alone',
      mobility: 'normal',
      transport: 'walking',
    });

  // ============================================================
  // LOCATION + SHELTERS
  // ============================================================

  const [userLocation, setUserLocation] =
    useState<Coordinates>(
      USER_START_LOCATION,
    );

  const [sheltersMap, setSheltersMap] =
    useState<Record<string, Shelter>>(
      MOCK_SHELTERS,
    );

  // ============================================================
  // ROUTE
  // ============================================================

  const [
    selectedShelterId,
    setSelectedShelterId,
  ] = useState('S02');

  const [activeRoute, setActiveRoute] =
    useState<EvacuationRoute>(
      MOCK_ROUTES['S02-R01'],
    );

  // ============================================================
  // REROUTE
  // ============================================================

  const [activeHazard, setActiveHazard] =
    useState<RerouteScenario | null>(
      null,
    );

  const [
    showRerouteToast,
    setShowRerouteToast,
  ] = useState(false);

  const [isRerouted, setIsRerouted] =
    useState(false);

  const [
    isSimulatingReroute,
    setIsSimulatingReroute,
  ] = useState(false);

  // ============================================================
  // NAVIGATION
  // ============================================================

  const [isEvacuating, setIsEvacuating] =
    useState(false);

  const [
    activeStepIndex,
    setActiveStepIndex,
  ] = useState(0);

  const [
    hasSafelyArrived,
    setHasSafelyArrived,
  ] = useState(false);

  // ============================================================
  // MODALS
  // ============================================================

  const [
    isProfileModalOpen,
    setIsProfileModalOpen,
  ] = useState(false);

  const [
    isSosModalOpen,
    setIsSosModalOpen,
  ] = useState(false);

  // ============================================================
  // LOAD SHELTERS
  // ============================================================

  useEffect(() => {
    let mounted = true;

    apiService
      .getShelters()
      .then((shelters) => {
        if (
          !mounted ||
          shelters.length === 0
        ) {
          return;
        }

        const dictionary: Record<
          string,
          Shelter
        > = {};

        shelters.forEach(
          (shelter) => {
            const id =
              shelter.id ||
              shelter.shelter_id;

            if (id) {
              dictionary[id] =
                shelter;
            }
          },
        );

        setSheltersMap(
          (previous) => ({
            ...previous,
            ...dictionary,
          }),
        );
      })
      .catch((error) => {
        console.error(
          '[SafeRoute] Shelter loading failed:',
          error,
        );
      });

    return () => {
      mounted = false;
    };
  }, []);

  // ============================================================
  // APPLY PROFILE
  // ============================================================

  const applyProfile = async (
    profile: UserProfile,
    location?: Coordinates,
  ) => {
    setUserProfile(profile);

    const activeLocation =
      location ||
      userLocation ||
      USER_START_LOCATION;

    setUserLocation(
      activeLocation,
    );

    // Kelambakkam fallback location
    const latitude =
      activeLocation.latitude ??
      12.7925;

    const longitude =
      activeLocation.longitude ??
      80.2050;

    const mode =
      profile.mode ||
      'walking';

    const transport =
      profile.transport ||
      (
        mode === 'two_wheeler' ||
        mode === 'four_wheeler'
          ? 'vehicle'
          : 'walking'
      );

    try {
      // --------------------------------------------------------
      // 1. Send location
      // --------------------------------------------------------

      await apiService.sendLocation({
        latitude,
        longitude,
        accuracy:
          activeLocation.accuracy,
      });

      // --------------------------------------------------------
      // 2. Fetch shelters
      // --------------------------------------------------------

      const fetchedShelters =
        await apiService.getShelters();

      const updatedShelters: Record<
        string,
        Shelter
      > = {
        ...sheltersMap,
      };

      fetchedShelters.forEach(
        (shelter) => {
          const id =
            shelter.id ||
            shelter.shelter_id;

          if (id) {
            updatedShelters[id] =
              shelter;
          }
        },
      );

      setSheltersMap(
        updatedShelters,
      );

      // --------------------------------------------------------
      // 3. Ask backend for safest personalized route
      // --------------------------------------------------------

      const route =
        await apiService.getSafestRoute(
          {
            latitude,
            longitude,

            mode,

            group:
              profile.travelingWith ||
              mode,

            traveling_with:
              profile.travelingWith ||
              'alone',

            mobility:
              profile.mobility ||
              (
                mode === 'elderly'
                  ? 'limited'
                  : 'normal'
              ),

            transport,

            transport_mode:
              transport,
          },

          updatedShelters,
        );

      // --------------------------------------------------------
      // 4. Display backend/P3 result
      // --------------------------------------------------------

      setActiveRoute(route);

      setSelectedShelterId(
        route.shelter_id ||
          route.shelterId,
      );

      setHasCompletedOnboarding(
        true,
      );

      setIsProfileModalOpen(
        false,
      );

      setIsRerouted(false);

      setActiveHazard(null);

      setShowRerouteToast(false);

      setActiveStepIndex(0);

    } catch (error) {
      console.error(
        '[SafeRoute] Safest route calculation failed:',
        error,
      );

      // --------------------------------------------------------
      // Frontend fallback only if backend request fails.
      // This uses Kelambakkam demo data.
      // --------------------------------------------------------

      const fallback =
        getRecommendedRouteForProfile(
          profile,
        );

      setActiveRoute(fallback);

      setSelectedShelterId(
        fallback.shelter_id ||
          fallback.shelterId,
      );

      setHasCompletedOnboarding(
        true,
      );

      setIsProfileModalOpen(
        false,
      );

      setIsRerouted(false);

      setActiveHazard(null);

      setShowRerouteToast(false);

      setActiveStepIndex(0);
    }
  };

  // ============================================================
  // REROUTE
  // ============================================================

  const triggerRerouteDemo =
    async () => {
      setIsSimulatingReroute(true);

      try {
        // ------------------------------------------------------
        // Current Kelambakkam location
        // ------------------------------------------------------

        const latitude =
          userLocation.latitude ??
          12.7925;

        const longitude =
          userLocation.longitude ??
          80.2050;

        // ------------------------------------------------------
        // Ask backend for a new route.
        //
        // Backend now excludes:
        // 1. Current route
        // 2. Current shelter
        //
        // Therefore the returned shelter must be different.
        // ------------------------------------------------------

        const result =
          await apiService.getReroute(
            {
              latitude,
              longitude,

              route_id:
                activeRoute.route_id ||
                activeRoute.id,

              shelter_id:
                selectedShelterId,

              mode:
                userProfile.mode,

              group:
                userProfile.travelingWith ||
                userProfile.mode,

              traveling_with:
                userProfile.travelingWith ||
                'alone',

              mobility:
                userProfile.mobility ||
                'normal',

              transport:
                userProfile.transport ||
                'walking',
            },

            sheltersMap,
          );

        // ------------------------------------------------------
        // IMPORTANT:
        // Only display the backend result.
        // ------------------------------------------------------

        setActiveHazard(
          result.scenario,
        );

        setActiveRoute(
          result.route,
        );

        setSelectedShelterId(
          result.route.shelter_id ||
            result.route.shelterId,
        );

        setIsRerouted(true);

        setShowRerouteToast(true);

        setActiveStepIndex(0);

      } catch (error) {
        // ------------------------------------------------------
        // Do NOT pretend that a reroute happened.
        // ------------------------------------------------------

        console.error(
          '[SafeRoute] Reroute failed:',
          error,
        );

        setShowRerouteToast(false);

        setIsRerouted(false);

        alert(
          'Unable to calculate a new evacuation route. Please try again.',
        );

      } finally {
        setIsSimulatingReroute(
          false,
        );
      }
    };

  // ============================================================
  // RESET
  // ============================================================

  const resetRerouteDemo = () => {
    applyProfile(
      userProfile,
      userLocation,
    );
  };

  // ============================================================
  // MANUAL SHELTER SELECTION
  // ============================================================

  const handleSelectShelter = (
    shelter: Shelter,
  ) => {
    if (isEvacuating) {
      return;
    }

    const shelterId =
      shelter.id ||
      shelter.shelter_id;

    setSelectedShelterId(
      shelterId,
    );

    // ----------------------------------------------------------
    // Get latest shelter availability from backend
    // ----------------------------------------------------------

    apiService
      .getShelterAvailability(
        shelterId,
      )
      .then((availability) => {
        setSheltersMap(
          (previous) => ({
            ...previous,

            [shelterId]: {
              ...shelter,

              capacityTotal:
                availability.capacity_total,

              capacity_total:
                availability.capacity_total,

              capacityOccupied:
                availability.capacity_occupied,

              capacity_occupied:
                availability.capacity_occupied,
            },
          }),
        );
      })
      .catch(() => {});

    // ----------------------------------------------------------
    // Keep existing frontend demo route behavior for
    // manual shelter selection.
    // Core safest-route and reroute flows use the backend.
    // ----------------------------------------------------------

    const matchingRoute =
      Object.values(
        MOCK_ROUTES,
      ).find(
        (route) =>
          (
            route.shelter_id ||
            route.shelterId
          ) === shelterId,
      );

    if (matchingRoute) {
      setActiveRoute(
        matchingRoute,
      );
    }

    setActiveStepIndex(0);
  };

  // ============================================================
  // ARRIVAL
  // ============================================================

  const handleCompleteEvacuation =
    () => {
      setIsEvacuating(false);
      setHasSafelyArrived(true);
    };

  // ============================================================
  // SELECTED SHELTER
  // ============================================================

  const selectedShelter =
    sheltersMap[
      selectedShelterId
    ] ||
    sheltersMap['S02'] ||
    MOCK_SHELTERS['S02'];

  const allSheltersList =
    Object.values(
      sheltersMap,
    );

  // ============================================================
  // ONBOARDING
  // ============================================================

  if (
    !hasCompletedOnboarding
  ) {
    return (
      <PersonalizationForm
        initialProfile={
          userProfile
        }
        initialLocation={
          userLocation
        }
        onSubmit={
          applyProfile
        }
      />
    );
  }

  // ============================================================
  // MAIN UI
  // ============================================================

  return (
    <div
      id="saferoute-app"
      className="relative w-full h-screen h-[100dvh] overflow-hidden bg-[#020617] flex flex-col font-sans"
    >

      {/* ======================================================
          TOP BAR
      ====================================================== */}

      {!isEvacuating && (
        <TopBar
          userProfile={
            userProfile
          }
          userLocation={
            userLocation
          }
          isRerouted={
            isRerouted
          }
          onOpenProfile={() =>
            setIsProfileModalOpen(
              true,
            )
          }
          onTriggerRerouteDemo={
            triggerRerouteDemo
          }
          onResetRerouteDemo={
            resetRerouteDemo
          }
          onOpenSos={() =>
            setIsSosModalOpen(
              true,
            )
          }
        />
      )}

      {/* ======================================================
          REROUTE TOAST
      ====================================================== */}

      {!isEvacuating &&
        showRerouteToast &&
        activeHazard && (
          <RerouteToast
            alert={activeHazard}
            newShelter={
              selectedShelter
            }
            onDismiss={() =>
              setShowRerouteToast(
                false,
              )
            }
            onViewRoute={() =>
              setShowRerouteToast(
                false,
              )
            }
          />
        )}

      {/* ======================================================
          MAP
      ====================================================== */}

      <main
        className={`relative flex-1 w-full h-full ${
          isEvacuating
            ? 'pt-12 pb-24'
            : 'pt-14 pb-28'
        }`}
      >
        <MapView
          userLocation={
            userLocation
          }
          shelters={
            allSheltersList
          }
          selectedShelterId={
            selectedShelterId
          }
          activeRoute={
            activeRoute
          }
          activeHazard={
            activeHazard
          }
          onSelectShelter={
            handleSelectShelter
          }
          isEvacuating={
            isEvacuating
          }
        />
      </main>

      {/* ======================================================
          BOTTOM CARD
      ====================================================== */}

      {!isEvacuating && (
        <BottomCard
          shelter={
            selectedShelter
          }
          route={
            activeRoute
          }
          userProfile={
            userProfile
          }
          userLocation={
            userLocation
          }
          isRerouted={
            isRerouted
          }
          isEvacuating={
            isEvacuating
          }
          activeStepIndex={
            activeStepIndex
          }
          onStartEvacuation={() => {
            setIsEvacuating(
              true,
            );

            setActiveStepIndex(
              0,
            );
          }}
          onCompleteEvacuation={
            handleCompleteEvacuation
          }
          onNextStep={() => {
            if (
              activeStepIndex <
              activeRoute.steps
                .length -
                1
            ) {
              setActiveStepIndex(
                (previous) =>
                  previous + 1,
              );
            }
          }}
          onPrevStep={() => {
            if (
              activeStepIndex >
              0
            ) {
              setActiveStepIndex(
                (previous) =>
                  previous - 1,
              );
            }
          }}
          onOpenProfile={() =>
            setIsProfileModalOpen(
              true,
            )
          }
        />
      )}

      {/* ======================================================
          NAVIGATION MODE
      ====================================================== */}

      {isEvacuating && (
        <NavigationView
          shelter={
            selectedShelter
          }
          route={
            activeRoute
          }
          userProfile={
            userProfile
          }
          isRerouted={
            isRerouted
          }
          activeHazard={
            activeHazard
          }
          showRerouteToast={
            showRerouteToast
          }
          activeStepIndex={
            activeStepIndex
          }
          isSimulatingReroute={
            isSimulatingReroute
          }
          onSimulateHazard={
            triggerRerouteDemo
          }
          onResetReroute={
            resetRerouteDemo
          }
          onCompleteEvacuation={
            handleCompleteEvacuation
          }
          onNextStep={() => {
            if (
              activeStepIndex <
              activeRoute.steps
                .length -
                1
            ) {
              setActiveStepIndex(
                (previous) =>
                  previous + 1,
              );
            }
          }}
          onPrevStep={() => {
            if (
              activeStepIndex >
              0
            ) {
              setActiveStepIndex(
                (previous) =>
                  previous - 1,
              );
            }
          }}
          onExitNavigation={() =>
            setIsEvacuating(
              false,
            )
          }
          onDismissToast={() =>
            setShowRerouteToast(
              false,
            )
          }
          onOpenSos={() =>
            setIsSosModalOpen(
              true,
            )
          }
        />
      )}

      {/* ======================================================
          PROFILE MODAL
      ====================================================== */}

      {isProfileModalOpen && (
        <PersonalizationForm
          isModal
          initialProfile={
            userProfile
          }
          initialLocation={
            userLocation
          }
          onSubmit={
            applyProfile
          }
          onCancel={() =>
            setIsProfileModalOpen(
              false,
            )
          }
        />
      )}

      {/* ======================================================
          SOS MODAL
      ====================================================== */}

      <SosModal
        isOpen={
          isSosModalOpen
        }
        onClose={() =>
          setIsSosModalOpen(
            false,
          )
        }
      />

      {/* ======================================================
          EVACUATION COMPLETE
      ====================================================== */}

      {hasSafelyArrived && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">

          <div className="w-full max-w-md bg-[#0F172A] border-2 border-emerald-500/60 rounded-3xl p-6 shadow-2xl text-center space-y-4">

            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <h2 className="text-xl font-black text-white">
                Evacuation Complete
              </h2>

              <p className="text-xs text-slate-300 mt-1">
                You have arrived at{' '}
                <strong className="text-emerald-400">
                  {selectedShelter.name}
                </strong>
              </p>
            </div>

            <div className="bg-[#1E293B]/70 border border-slate-700 rounded-2xl p-4 text-left text-xs">

              <div className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
                Intake Instructions
              </div>

              <p className="text-slate-300 leading-relaxed mt-2">
                {selectedShelter.intakeNote}
              </p>

              <div className="pt-2 mt-2 border-t border-slate-700 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">
                  Direct Contact:
                </span>

                <span className="font-mono text-slate-200 font-bold">
                  {selectedShelter.contactPhone ||
                    'Not available'}
                </span>
              </div>
            </div>

            <div className="flex gap-2">

              <button
                type="button"
                onClick={() =>
                  setHasSafelyArrived(
                    false,
                  )
                }
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#020617] font-extrabold text-xs uppercase"
              >
                Close & Remain in Shelter
              </button>

              <button
                type="button"
                onClick={() => {
                  setHasSafelyArrived(
                    false,
                  );

                  setIsEvacuating(
                    false,
                  );

                  resetRerouteDemo();
                }}
                className="py-3 px-4 rounded-xl bg-[#1E293B] text-slate-300 border border-slate-700"
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