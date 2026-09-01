import React, { useState } from 'react';
import {
  Shelter,
  EvacuationRoute,
  UserProfile,
  Coordinates,
} from '../types';

import { PersonalizationSummary } from './PersonalizationSummary';

import {
  ShieldCheck,
  Navigation,
  Clock,
  MapPin,
  Users,
  ChevronUp,
  ChevronDown,
  Info,
  CheckCircle2,
  Phone,
  Accessibility,
  Zap,
  HeartPulse,
  Share2,
  ArrowRight,
} from 'lucide-react';

interface BottomCardProps {
  shelter: Shelter;
  route: EvacuationRoute;
  userProfile?: UserProfile;
  userLocation?: Coordinates;
  isRerouted: boolean;
  isEvacuating: boolean;
  activeStepIndex: number;
  onStartEvacuation: () => void;
  onCompleteEvacuation: () => void;
  onNextStep: () => void;
  onPrevStep: () => void;
  onOpenProfile: () => void;
}

export const BottomCard: React.FC<BottomCardProps> = ({
  shelter,
  route,
  userProfile,
  userLocation,
  isRerouted,
  isEvacuating,
  activeStepIndex,
  onStartEvacuation,
  onCompleteEvacuation,
  onNextStep,
  onPrevStep,
  onOpenProfile,
}) => {
  const [isExpanded, setIsExpanded] =
    useState<boolean>(false);

  const [activeTab, setActiveTab] =
    useState<'directions' | 'amenities' | 'contact'>(
      'directions',
    );

  const [copiedShare, setCopiedShare] =
    useState<boolean>(false);

  const spotsAvailable = Math.max(
    0,
    shelter.capacityTotal -
      shelter.capacityOccupied,
  );

  const capacityPercent =
    shelter.capacityTotal > 0
      ? Math.round(
          (shelter.capacityOccupied /
            shelter.capacityTotal) *
            100,
        )
      : 0;

  const currentStep =
    route.steps?.[activeStepIndex] ||
    route.steps?.[0];

  const isLastStep =
    activeStepIndex ===
    route.steps.length - 1;

  /*
   * Walking ETA is calculated using 5 km/h.
   * Vehicle ETA uses the backend value.
   */
  const displayedEta =
    route.transport_mode === 'walking'
      ? Math.max(
          1,
          Math.round(
            ((route.distance_km ??
              route.distanceKm) /
              5) *
              60,
          ),
        )
      : Number(
          route.eta_minutes ??
            route.etaMinutes ??
            1,
        );

  const handleShare = () => {
    if (!navigator.clipboard) return;

    navigator.clipboard
      .writeText(
        `SafeRoute Evacuation: Heading to ${shelter.name} (${shelter.address}) via ${route.routeName}. ETA: ${displayedEta} min.`,
      )
      .then(() => {
        setCopiedShare(true);

        setTimeout(
          () => setCopiedShare(false),
          2500,
        );
      })
      .catch(() => {});
  };

  return (
    <div
      id="floating-bottom-card"
      className="fixed bottom-0 left-0 right-0 z-30 flex flex-col items-center pointer-events-none px-2 sm:px-4 pb-2"
    >
      <div className="w-full max-w-lg bg-[#0F172A] border-t-2 sm:border border-[#1E293B] rounded-t-3xl sm:rounded-2xl shadow-[0_-10px_30px_rgba(0,0,0,0.8)] pointer-events-auto transition-all duration-300 flex flex-col max-h-[85vh] overflow-hidden">

        {/* Pull bar */}
        <button
          type="button"
          onClick={() =>
            setIsExpanded(!isExpanded)
          }
          className="w-full py-2.5 flex flex-col items-center justify-center hover:bg-[#1E293B]/50 transition-colors focus:outline-none"
          aria-label={
            isExpanded
              ? 'Collapse route summary'
              : 'Expand route summary'
          }
        >
          <div className="w-12 h-1 rounded-full bg-slate-600 mb-1" />

          <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400">
            {isExpanded ? (
              <>
                <span>
                  Hide Detailed Directions & Facility Info
                </span>
                <ChevronDown className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                <span>
                  Tap to view step-by-step turns & shelter details
                </span>
                <ChevronUp className="w-3.5 h-3.5" />
              </>
            )}
          </div>
        </button>

        {/* Main summary */}
        <div className="px-5 pt-1 pb-3 space-y-3">

          {/* Safety + capacity */}
          <div className="flex items-center justify-between gap-2">

            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border font-mono ${
                  isRerouted
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-teal-500/15 text-teal-300 border-teal-500/30'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                {route.safetyTag}
              </span>

              {route.elevationProfile && (
                <span className="hidden sm:inline-block text-[11px] text-slate-400 font-mono">
                  {route.elevationProfile}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
              <Users className="w-3.5 h-3.5 text-teal-400" />

              <span>
                <strong className="text-white">
                  {spotsAvailable}
                </strong>{' '}
                spots left
              </span>
            </div>
          </div>

          {/* Shelter */}
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight leading-snug">
              {shelter.name}
            </h2>

            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />

              <span>
                {shelter.address} • {shelter.district}
              </span>
            </p>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-4 gap-1.5 sm:gap-2 py-1">

            <div className="bg-[#1E293B]/70 border border-slate-700/60 rounded-xl p-2 sm:p-2.5 flex flex-col items-center text-center">
              <span className="text-[9px] sm:text-[10px] uppercase font-mono text-slate-400">
                Distance
              </span>

              <span className="text-xs sm:text-base font-bold text-white mt-0.5">
                {route.distance_km ??
                  route.distanceKm}{' '}
                km
              </span>
            </div>

            <div className="bg-[#1E293B]/70 border border-teal-500/30 rounded-xl p-2 sm:p-2.5 flex flex-col items-center text-center">

              <span className="text-[9px] sm:text-[10px] uppercase font-mono text-teal-400 flex items-center gap-0.5">
                <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                ETA
              </span>

              <span className="text-xs sm:text-base font-extrabold text-teal-300 mt-0.5">
                {displayedEta} min
              </span>
            </div>

            <div className="bg-[#1E293B]/70 border border-emerald-500/30 rounded-xl p-2 sm:p-2.5 flex flex-col items-center text-center">

              <span className="text-[9px] sm:text-[10px] uppercase font-mono text-emerald-400 flex items-center gap-0.5">
                <ShieldCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                Safety
              </span>

              <span className="text-xs sm:text-base font-extrabold text-emerald-300 mt-0.5">
                {route.safety_score !== undefined
                  ? `${route.safety_score}%`
                  : '95%'}
              </span>
            </div>

            <div className="bg-[#1E293B]/70 border border-slate-700/60 rounded-xl p-2 sm:p-2.5 flex flex-col items-center text-center">

              <span className="text-[9px] sm:text-[10px] uppercase font-mono text-slate-400">
                Capacity
              </span>

              <span
                className={`text-xs sm:text-base font-bold mt-0.5 ${
                  capacityPercent > 80
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {capacityPercent}%
              </span>
            </div>
          </div>

          {/* Personalization */}
          {userProfile && !isEvacuating && (
            <PersonalizationSummary
              profile={userProfile}
              location={userLocation}
              onEdit={onOpenProfile}
            />
          )}

          {/* Reason */}
          <div className="bg-[#162238] border border-slate-700/50 rounded-xl p-2.5 space-y-1.5 text-xs text-slate-300">

            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />

              <p className="leading-tight">
                <strong className="text-teal-300">
                  Safe Selection:
                </strong>{' '}
                {route.reason}
              </p>
            </div>

            {route.safety_factors &&
              route.safety_factors.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-0.5 pl-6">

                  {route.safety_factors.map(
                    (factor, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-[#0F172A] border border-slate-700 text-slate-300"
                      >
                        <ShieldCheck className="w-2.5 h-2.5 text-teal-400" />
                        {factor}
                      </span>
                    ),
                  )}
                </div>
              )}
          </div>

          {/* Live navigation */}
          {isEvacuating && currentStep && (
            <div className="bg-teal-950/40 border border-teal-500/50 rounded-xl p-3 text-xs text-white space-y-2">

              <div className="flex items-center justify-between">

                <span className="font-mono text-[10px] uppercase tracking-wider text-teal-400 font-bold flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 animate-pulse" />
                  Live Navigation • Step{' '}
                  {activeStepIndex + 1} of{' '}
                  {route.steps.length}
                </span>

                <span className="text-[11px] font-bold text-teal-300">
                  {currentStep.distance}
                </span>
              </div>

              <div className="font-bold text-sm text-slate-100 flex items-center gap-2">

                <span className="w-6 h-6 rounded-full bg-teal-500 text-[#020617] flex items-center justify-center text-xs font-black shrink-0">
                  {activeStepIndex + 1}
                </span>

                <span>
                  {currentStep.instruction}
                </span>
              </div>

              {currentStep.note && (
                <p className="text-[11px] text-teal-300/90 pl-8">
                  {currentStep.note}
                </p>
              )}

              <div className="flex items-center justify-between pt-1 gap-2">

                <button
                  type="button"
                  disabled={activeStepIndex === 0}
                  onClick={onPrevStep}
                  className="px-2.5 py-1 rounded bg-[#1E293B] disabled:opacity-40 text-xs text-slate-300 hover:text-white"
                >
                  Previous Step
                </button>

                {!isLastStep ? (
                  <button
                    type="button"
                    onClick={onNextStep}
                    className="px-3 py-1 rounded bg-teal-500 hover:bg-teal-400 text-[#020617] font-bold text-xs flex items-center gap-1"
                  >
                    Next Turn
                    <ArrowRight className="w-3 h-3" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onCompleteEvacuation}
                    className="px-3 py-1 rounded bg-emerald-500 hover:bg-emerald-400 text-[#020617] font-bold text-xs flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    Safely Arrived
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Expanded section */}
        {isExpanded && (
          <div className="px-5 py-3 border-t border-[#1E293B] overflow-y-auto max-h-60 space-y-3">

            <div className="flex rounded-lg bg-[#162238] p-1 border border-slate-700/60">

              <button
                type="button"
                onClick={() =>
                  setActiveTab('directions')
                }
                className={`flex-1 py-1.5 text-xs font-bold rounded-md ${
                  activeTab === 'directions'
                    ? 'bg-teal-500 text-[#020617]'
                    : 'text-slate-400'
                }`}
              >
                Directions ({route.steps.length})
              </button>

              <button
                type="button"
                onClick={() =>
                  setActiveTab('amenities')
                }
                className={`flex-1 py-1.5 text-xs font-bold rounded-md ${
                  activeTab === 'amenities'
                    ? 'bg-teal-500 text-[#020617]'
                    : 'text-slate-400'
                }`}
              >
                Facility
              </button>

              <button
                type="button"
                onClick={() =>
                  setActiveTab('contact')
                }
                className={`flex-1 py-1.5 text-xs font-bold rounded-md ${
                  activeTab === 'contact'
                    ? 'bg-teal-500 text-[#020617]'
                    : 'text-slate-400'
                }`}
              >
                Contact
              </button>
            </div>

            {activeTab === 'directions' && (
              <div className="space-y-2.5">

                {route.steps.map(
                  (step, idx) => (
                    <div
                      key={step.id}
                      className="p-2.5 rounded-xl border bg-[#1E293B]/40 border-slate-800 text-xs flex items-start gap-3"
                    >
                      <span className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 bg-[#0F172A] text-slate-400 border border-slate-700">
                        {idx + 1}
                      </span>

                      <div className="flex-1">
                        <div className="font-semibold text-slate-100 flex items-center justify-between gap-2">
                          <span>
                            {step.instruction}
                          </span>

                          <span className="font-mono text-slate-400 text-[11px]">
                            {step.distance}
                          </span>
                        </div>

                        {step.note && (
                          <p className="text-[11px] text-teal-300 mt-1">
                            {step.note}
                          </p>
                        )}
                      </div>
                    </div>
                  ),
                )}
              </div>
            )}

            {activeTab === 'amenities' && (
              <div className="space-y-2.5 text-xs">

                <div className="p-2.5 rounded-xl bg-[#1E293B]/50 border border-slate-700/60">
                  <div className="font-bold text-slate-200 mb-1">
                    Intake Protocol
                  </div>

                  <p className="text-slate-300">
                    {shelter.intakeNote}
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-[#1E293B]/50 border border-slate-700/60">
                  <div className="font-bold text-slate-200 mb-2">
                    Shelter Resources
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {shelter.features.map(
                      (feature, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 rounded bg-[#0F172A] border border-slate-700 text-slate-300 text-[11px]"
                        >
                          {feature}
                        </span>
                      ),
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-[11px]">

                  <div className="p-2 rounded-lg bg-[#162238] border border-slate-700">
                    <Accessibility className="w-4 h-4 mx-auto mb-1 text-teal-400" />
                    Accessible
                  </div>

                  <div className="p-2 rounded-lg bg-[#162238] border border-slate-700">
                    <HeartPulse className="w-4 h-4 mx-auto mb-1 text-rose-400" />
                    {shelter.medicalSupport
                      ? 'Medical'
                      : 'First Aid'}
                  </div>

                  <div className="p-2 rounded-lg bg-[#162238] border border-slate-700">
                    <Zap className="w-4 h-4 mx-auto mb-1 text-amber-400" />
                    Backup
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'contact' && (
              <div className="space-y-2.5 text-xs">

                <div className="p-3 rounded-xl bg-[#1E293B]/50 border border-slate-700/60 flex items-center justify-between">

                  <div>
                    <div className="font-bold text-slate-200">
                      Shelter Direct Desk
                    </div>

                    <div className="text-slate-400 font-mono">
                      {shelter.contactPhone ||
                        'Contact unavailable'}
                    </div>
                  </div>

                  {shelter.contactPhone && (
                    <a
                      href={`tel:${shelter.contactPhone}`}
                      className="px-3 py-1.5 rounded-lg bg-teal-500 text-[#020617] font-bold text-xs flex items-center gap-1"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      Call
                    </a>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleShare}
                  className="w-full py-2 px-3 rounded-xl border border-slate-700 bg-[#1E293B]/60 text-slate-200 font-semibold text-xs flex items-center justify-center gap-2"
                >
                  <Share2 className="w-3.5 h-3.5 text-teal-400" />

                  {copiedShare
                    ? 'Route Info Copied!'
                    : 'Share Evacuation Route'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* CTA */}
        <div className="px-5 py-3 border-t border-[#1E293B] bg-[#0F172A]">

          {!isEvacuating ? (
            <button
              id="btn-start-evacuation"
              type="button"
              onClick={onStartEvacuation}
              className={`w-full min-h-[52px] px-6 py-3.5 rounded-xl font-black text-sm tracking-wider uppercase transition-all shadow-lg flex items-center justify-center gap-2.5 ${
                isRerouted
                  ? 'bg-amber-500 hover:bg-amber-400 text-[#020617]'
                  : 'bg-teal-500 hover:bg-teal-400 text-[#020617]'
              }`}
            >
              <Navigation className="w-5 h-5" />
              {isRerouted
                ? 'START NEW ROUTE'
                : 'START EVACUATION'}
            </button>
          ) : (
            <div className="flex gap-2">

              <button
                type="button"
                onClick={onCompleteEvacuation}
                className="flex-1 min-h-[52px] px-4 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#020617] font-bold text-sm uppercase flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                I HAVE SAFELY ARRIVED
              </button>

              <button
                type="button"
                onClick={onOpenProfile}
                className="min-h-[52px] px-3.5 rounded-xl bg-[#1E293B] border border-slate-700 text-slate-300 font-bold text-xs"
              >
                Edit
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};