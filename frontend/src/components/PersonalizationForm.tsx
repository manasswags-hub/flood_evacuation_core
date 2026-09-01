import React, { useState } from 'react';
import { UserProfile, EvacuationMode, Coordinates } from '../types';
import { USER_START_LOCATION } from '../data/evacuationData';
import {
  HeartHandshake,
  Footprints,
  Bike,
  Car,
  Check,
  Shield,
  Locate,
  Loader2,
  AlertTriangle,
  RotateCcw,
  MapPin,
  CheckCircle2,
} from 'lucide-react';

interface PersonalizationFormProps {
  initialProfile?: UserProfile;
  initialLocation?: Coordinates;
  onSubmit: (profile: UserProfile, location: Coordinates) => void;
  onCancel?: () => void;
  isModal?: boolean;
}

interface ModeOption {
  id: EvacuationMode;
  label: string;
  subtext: string;
  icon: React.ComponentType<{ className?: string }>;
}

const EVACUATION_MODES: ModeOption[] = [
  {
    id: 'elderly',
    label: 'Elderly',
    subtext: 'Assisted pace & step-free priority',
    icon: HeartHandshake,
  },
  {
    id: 'walking',
    label: 'Walking',
    subtext: 'Pedestrian corridors & footpaths',
    icon: Footprints,
  },
  {
    id: 'two_wheeler',
    label: 'Two-Wheeler',
    subtext: 'Bicycle & motorized 2-wheel bypass',
    icon: Bike,
  },
  {
    id: 'four_wheeler',
    label: 'Four-Wheeler',
    subtext: 'Vehicle corridors & road staging',
    icon: Car,
  },
];

export const PersonalizationForm: React.FC<PersonalizationFormProps> = ({
  initialProfile = {
    mode: 'walking',
  },
  initialLocation,
  onSubmit,
  onCancel,
  isModal = false,
}) => {
  const [selectedMode, setSelectedMode] = useState<EvacuationMode>(
    initialProfile.mode || 'walking'
  );

  // Geolocation State
  const [locationState, setLocationState] = useState<Coordinates>(
    initialLocation || USER_START_LOCATION
  );
  const [isLoadingLocation, setIsLoadingLocation] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  /**
   * Acquire real GPS location via browser Geolocation API
   */
  const handleAcquireLocation = () => {
    setIsLoadingLocation(true);
    setLocationError(null);

    if (typeof window === 'undefined' || !navigator || !navigator.geolocation) {
      setIsLoadingLocation(false);
      setLocationError(
        'Geolocation is not supported in this browser environment. You can continue using demo location mode.'
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLoadingLocation(false);
        setLocationError(null);
        const realCoords: Coordinates = {
          x: locationState.x || USER_START_LOCATION.x,
          y: locationState.y || USER_START_LOCATION.y,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          isRealLocation: true,
        };
        setLocationState(realCoords);
      },
      (error) => {
        setIsLoadingLocation(false);
        console.warn('[SafeRoute Geolocation] Error:', error.code, error.message);
        let friendlyMessage = 'Unable to determine your starting location.';

        switch (error.code) {
          case 1: // PERMISSION_DENIED
            friendlyMessage =
              'Location permission is required to find your safest evacuation route.';
            break;
          case 2: // POSITION_UNAVAILABLE
            friendlyMessage =
              'Position unavailable. Please ensure your device location services are enabled.';
            break;
          case 3: // TIMEOUT
            friendlyMessage =
              'Location request timed out. Please check your signal and retry.';
            break;
          default:
            friendlyMessage =
              'Could not access GPS. Please check browser permissions and retry.';
            break;
        }

        setLocationError(friendlyMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  /**
   * Fallback to Demo Location Mode
   */
  const handleUseDemoLocation = () => {
    setLocationError(null);
    setIsLoadingLocation(false);
    setLocationState({
      ...USER_START_LOCATION,
      isRealLocation: false,
    });
  };

  const handleSubmit = () => {
    const mobility = selectedMode === 'elderly' ? 'limited' : 'normal';
    const transport =
      selectedMode === 'four_wheeler' || selectedMode === 'two_wheeler'
        ? 'vehicle'
        : 'walking';
    const travelingWith = selectedMode === 'elderly' ? 'elderly' : 'alone';

    const fullProfile: UserProfile = {
      mode: selectedMode,
      travelingWith,
      mobility,
      transport,
    };

    onSubmit(fullProfile, locationState);
  };

  return (
    <div
      id="personalization-flow"
      className={`${
        isModal
          ? 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md'
          : 'w-full min-h-screen flex flex-col justify-between bg-[#020617] p-4 sm:p-6'
      }`}
    >
      <div
        className={`w-full max-w-lg mx-auto bg-[#0F172A] border border-[#1E293B] rounded-2xl p-5 sm:p-6 shadow-2xl flex flex-col justify-between ${
          isModal ? 'max-h-[92vh] overflow-y-auto' : 'flex-1'
        }`}
      >
        {/* Header with Emergency Badge */}
        <div>
          <div className="flex items-center justify-between border-b border-[#1E293B] pb-4 mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  SafeRoute
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40">
                    Triage Setup
                  </span>
                </h1>
                <p className="text-xs text-slate-400">
                  Customizing safest evacuation corridor
                </p>
              </div>
            </div>

            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="text-xs text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg border border-slate-700 bg-[#1E293B]/60 transition-colors cursor-pointer"
              >
                Close
              </button>
            )}
          </div>

          {/* Step 1: Select your evacuation mode */}
          <div className="space-y-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-100">
                1. Select your evacuation mode
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Choose how you will evacuate to determine route clearance, elevation, and shelter intake readiness.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              {EVACUATION_MODES.map((item) => {
                const Icon = item.icon;
                const isSelected = selectedMode === item.id;
                return (
                  <button
                    key={item.id}
                    id={`option-mode-${item.id}`}
                    type="button"
                    onClick={() => setSelectedMode(item.id)}
                    className={`min-h-[64px] p-3 sm:p-3.5 rounded-xl border text-left flex items-center justify-between transition-all active:scale-[0.98] cursor-pointer ${
                      isSelected
                        ? 'bg-teal-950/40 border-teal-400 text-white shadow-[0_0_14px_rgba(13,148,136,0.25)] ring-1 ring-teal-400/50'
                        : 'bg-[#1E293B]/40 border-[#1E293B] hover:border-slate-600 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'bg-teal-500/20 text-teal-400'
                            : 'bg-[#020617] text-slate-400'
                        }`}
                      >
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-sm text-slate-100">
                          {item.label}
                        </div>
                        <div className="text-[11px] text-slate-400 leading-tight mt-0.5">
                          {item.subtext}
                        </div>
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ml-2 ${
                        isSelected
                          ? 'border-teal-400 bg-teal-400 text-[#020617]'
                          : 'border-slate-600'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Location Setup */}
          <div className="mt-5 pt-5 border-t border-[#1E293B] space-y-3">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center justify-between">
                <span>2. Starting Location</span>
                {locationState.isRealLocation ? (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    LIVE GPS LOCKED
                  </span>
                ) : (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-500/30">
                    DEMO LOCATION
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Acquire real browser GPS to map your nearest safe corridor and intake gate.
              </p>
            </div>

            {/* Location Status Display Card */}
            <div className="bg-[#162238]/80 border border-slate-700/60 rounded-xl p-3 space-y-2.5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      locationState.isRealLocation
                        ? 'bg-teal-500/20 text-teal-400 border border-teal-500/40'
                        : 'bg-slate-800 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-200">
                      {locationState.isRealLocation
                        ? 'Current location'
                        : 'Demo location (Sector 1 Start)'}
                    </div>
                    <div className="text-[11px] font-mono text-slate-300 mt-0.5 truncate">
                      {locationState.latitude !== undefined && locationState.longitude !== undefined ? (
                        <>
                          {locationState.latitude.toFixed(5)}° N, {Math.abs(locationState.longitude).toFixed(5)}° W
                          {locationState.accuracy !== undefined && (
                            <span className="text-slate-400 ml-1.5 font-sans">
                              (±{Math.round(locationState.accuracy)}m accuracy)
                            </span>
                          )}
                        </>
                      ) : (
                        '37.7749° N, 122.4194° W'
                      )}
                    </div>
                  </div>
                </div>

                {/* Primary Geolocation Action Button */}
                <button
                  id="btn-use-current-location"
                  type="button"
                  onClick={handleAcquireLocation}
                  disabled={isLoadingLocation}
                  className="shrink-0 min-h-[38px] px-3 py-1.5 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 active:bg-teal-500/40 border border-teal-500/50 text-teal-300 font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                  title="Request real browser geolocation"
                >
                  {isLoadingLocation ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-400" />
                      <span>Acquiring...</span>
                    </>
                  ) : (
                    <>
                      <Locate className="w-3.5 h-3.5 text-teal-400" />
                      <span>Use Current Location</span>
                    </>
                  )}
                </button>
              </div>

              {/* Error Message & Retry Controls */}
              {locationError && (
                <div className="bg-red-950/50 border border-red-500/40 rounded-lg p-2.5 text-xs text-red-200 space-y-2 animate-fadeIn">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <p className="leading-snug">{locationError}</p>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleAcquireLocation}
                      className="px-2.5 py-1 rounded bg-red-900/60 hover:bg-red-900 border border-red-500/50 text-[11px] font-semibold text-white flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Retry GPS
                    </button>
                    <button
                      type="button"
                      onClick={handleUseDemoLocation}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-600 text-[11px] text-slate-300 transition-colors cursor-pointer"
                    >
                      Use Demo Location
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Action */}
        <div className="pt-5 mt-5 border-t border-[#1E293B] flex items-center justify-end">
          <button
            id="btn-form-submit"
            type="button"
            onClick={handleSubmit}
            className="w-full min-h-[50px] px-6 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 active:bg-teal-600 active:scale-[0.98] text-[#020617] font-bold text-sm tracking-wide flex items-center justify-center gap-2 shadow-[0_0_16px_rgba(13,148,136,0.35)] transition-all cursor-pointer"
          >
            <Shield className="w-5 h-5 stroke-[2.5]" />
            CALCULATE SAFEST ROUTE
          </button>
        </div>
      </div>
    </div>
  );
};
