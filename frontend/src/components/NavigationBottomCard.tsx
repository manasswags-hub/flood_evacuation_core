import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shelter, EvacuationRoute } from '../types';
import {
  Navigation,
  Clock,
  MapPin,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  RotateCcw,
  Compass,
  X,
  Phone,
  Info,
} from 'lucide-react';

interface NavigationBottomCardProps {
  shelter: Shelter;
  route: EvacuationRoute;
  isRerouted: boolean;
  activeStepIndex: number;
  isSimulatingReroute?: boolean;
  onSimulateHazard: () => void;
  onResetReroute?: () => void;
  onCompleteEvacuation: () => void;
  onNextStep: () => void;
  onPrevStep: () => void;
  onExitNavigation: () => void;
}

export const NavigationBottomCard: React.FC<NavigationBottomCardProps> = ({
  shelter,
  route,
  isRerouted,
  activeStepIndex,
  isSimulatingReroute = false,
  onSimulateHazard,
  onResetReroute,
  onCompleteEvacuation,
  onNextStep,
  onPrevStep,
  onExitNavigation,
}) => {
  const currentStep = route.steps[activeStepIndex] || route.steps[0];
  const isLastStep = activeStepIndex === route.steps.length - 1;
  const isFirstStep = activeStepIndex === 0;

  // Calculate evacuation status text
  const getEvacuationStatus = (): { label: string; badge: string; color: string } => {
    if (isLastStep) {
      return {
        label: 'Approaching Shelter Gate',
        badge: 'FINAL APPROACH',
        color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30',
      };
    }
    if (isRerouted) {
      return {
        label: 'Bypassing Hazard Corridor',
        badge: 'ACTIVE REROUTE',
        color: 'text-amber-400 bg-amber-500/15 border-amber-500/40',
      };
    }
    return {
      label: 'En Route on Designated Path',
      badge: 'EN ROUTE',
      color: 'text-teal-300 bg-teal-500/15 border-teal-500/30',
    };
  };

  const status = getEvacuationStatus();

  // Dynamic remaining distance calculation based on step index
  const totalDistance = route.distance_km ?? route.distanceKm ?? 1.8;
  const totalEta = route.eta_minutes ?? route.etaMinutes ?? 18;
  const stepRatio = (route.steps.length - activeStepIndex) / Math.max(1, route.steps.length);
  const remainingDistance = Math.max(0.1, Number((totalDistance * stepRatio).toFixed(1)));
  const remainingEta = Math.max(2, Math.round(totalEta * stepRatio));

  return (
    <div
      id="navigation-floating-card"
      className="fixed bottom-0 left-0 right-0 z-30 flex flex-col items-center pointer-events-none px-2 sm:px-4 pb-2"
    >
      <motion.div
        layout
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-lg bg-[#0F172A] border-t-2 sm:border border-[#1E293B] rounded-t-3xl sm:rounded-2xl shadow-[0_-12px_36px_rgba(0,0,0,0.85)] pointer-events-auto flex flex-col overflow-hidden"
      >
        {/* Top Live Navigation Header */}
        <div className="px-4 sm:px-5 pt-3 pb-2 flex items-center justify-between border-b border-slate-800/80 bg-[#162238]/40">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-mono font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${status.color}`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              {status.badge}
            </span>
            <span className="text-xs font-semibold text-slate-300 truncate max-w-[170px] sm:max-w-[220px]">
              {status.label}
            </span>
          </div>

          <button
            type="button"
            onClick={onExitNavigation}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-slate-200 px-2 py-1 rounded-md hover:bg-slate-800 transition-colors"
            title="Exit live navigation mode"
          >
            <X className="w-3.5 h-3.5" />
            <span>Exit</span>
          </button>
        </div>

        {/* Shelter Destination Info */}
        <div className="px-4 sm:px-5 pt-3 pb-2 space-y-2.5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-[9px] uppercase font-mono tracking-wider text-slate-400 block">
                Destination Shelter
              </span>
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight leading-snug">
                {shelter.name}
              </h2>
              <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                <span className="truncate">{shelter.address} • {shelter.district}</span>
              </p>
            </div>

            <a
              href={`tel:${shelter.contactPhone}`}
              className="px-2.5 py-1.5 rounded-lg bg-[#1E293B] border border-slate-700 hover:bg-[#334155] text-slate-300 text-[11px] font-semibold flex items-center gap-1 shrink-0 mt-1 transition-colors"
              title="Call Shelter Emergency Desk"
            >
              <Phone className="w-3 h-3 text-teal-400" />
              <span className="hidden sm:inline">Call</span>
            </a>
          </div>

          {/* Metric Bar: Remaining Distance, ETA, Safety, Status */}
          <div className="grid grid-cols-4 gap-1.5 sm:gap-2 py-0.5">
            <div className="bg-[#1E293B]/70 border border-slate-700/60 rounded-xl p-2 flex flex-col items-center text-center">
              <span className="text-[9px] uppercase font-mono text-slate-400">Remaining</span>
              <span className="text-xs sm:text-sm font-extrabold text-white mt-0.5">
                {remainingDistance} km
              </span>
            </div>

            <div className="bg-[#1E293B]/70 border border-teal-500/30 rounded-xl p-2 flex flex-col items-center text-center">
              <span className="text-[9px] uppercase font-mono text-teal-400 flex items-center gap-0.5">
                <Clock className="w-2.5 h-2.5" /> ETA
              </span>
              <span className="text-xs sm:text-sm font-extrabold text-teal-300 mt-0.5">
                {remainingEta} min
              </span>
            </div>

            <div className="bg-[#1E293B]/70 border border-emerald-500/30 rounded-xl p-2 flex flex-col items-center text-center">
              <span className="text-[9px] uppercase font-mono text-emerald-400 flex items-center gap-0.5">
                <ShieldCheck className="w-2.5 h-2.5" /> Safety
              </span>
              <span className="text-xs sm:text-sm font-extrabold text-emerald-300 mt-0.5">
                {route.safety_score !== undefined ? `${route.safety_score}%` : '96%'}
              </span>
            </div>

            <div className="bg-[#1E293B]/70 border border-slate-700/60 rounded-xl p-2 flex flex-col items-center text-center">
              <span className="text-[9px] uppercase font-mono text-slate-400">Progress</span>
              <span className="text-xs sm:text-sm font-extrabold text-slate-200 mt-0.5">
                {activeStepIndex + 1}/{route.steps.length}
              </span>
            </div>
          </div>

          {/* Current Turn Instruction HUD Box */}
          <div className="bg-teal-950/40 border border-teal-500/50 rounded-xl p-3 text-xs text-white space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-wider text-teal-400 font-bold flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
                Step {activeStepIndex + 1} of {route.steps.length} • {currentStep.streetName}
              </span>
              <span className="text-[11px] font-bold text-teal-300">{currentStep.distance}</span>
            </div>

            <div className="font-bold text-sm text-slate-100 flex items-start gap-2.5">
              <span className="w-6 h-6 rounded-full bg-teal-500 text-[#020617] flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                {activeStepIndex + 1}
              </span>
              <span className="leading-snug">{currentStep.instruction}</span>
            </div>

            {currentStep.note && (
              <p className="text-[11px] text-teal-300/90 pl-8.5 font-mono">{currentStep.note}</p>
            )}

            {/* Turn Stepper Buttons */}
            <div className="flex items-center justify-between pt-1 gap-2 border-t border-teal-500/20">
              <button
                type="button"
                disabled={isFirstStep}
                onClick={onPrevStep}
                className="px-2.5 py-1 rounded bg-[#1E293B] disabled:opacity-35 text-xs text-slate-300 hover:text-white flex items-center gap-1 transition-opacity"
              >
                <ChevronLeft className="w-3 h-3" /> Prev Turn
              </button>

              {!isLastStep ? (
                <button
                  type="button"
                  onClick={onNextStep}
                  className="px-3 py-1 rounded bg-teal-500 hover:bg-teal-400 text-[#020617] font-bold text-xs flex items-center gap-1 transition-colors"
                >
                  Next Turn <ChevronRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <span className="text-[11px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Near Entrance
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls & SIMULATE HAZARD / REROUTE Trigger */}
        <div className="px-4 sm:px-5 py-3 border-t border-[#1E293B] bg-[#0F172A] space-y-2">
          {/* SIMULATE HAZARD / REROUTE Button (Demo Trigger) */}
          <div className="flex gap-2">
            <button
              id="btn-simulate-hazard"
              type="button"
              disabled={isSimulatingReroute}
              onClick={onSimulateHazard}
              className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-bold font-mono tracking-wide uppercase flex items-center justify-center gap-2 transition-all ${
                isRerouted
                  ? 'bg-amber-500/15 border-amber-500/50 text-amber-300 hover:bg-amber-500/25'
                  : 'bg-[#1E293B] border-amber-500/40 text-amber-400 hover:bg-amber-500/10 hover:border-amber-400'
              }`}
              title="Test dynamic rerouting when road obstruction is reported"
            >
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>{isSimulatingReroute ? 'Rerouting...' : 'SIMULATE HAZARD / REROUTE'}</span>
            </button>

            {isRerouted && onResetReroute && (
              <button
                type="button"
                onClick={onResetReroute}
                className="py-2.5 px-3 rounded-xl bg-[#1E293B] border border-slate-700 hover:bg-[#334155] text-slate-300 text-xs font-bold transition-colors"
                title="Reset to original primary route"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Primary Action Button: Mark Arrival */}
          <button
            id="btn-nav-arrived"
            type="button"
            onClick={onCompleteEvacuation}
            className="w-full min-h-[48px] px-4 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-[#020617] font-extrabold text-xs sm:text-sm tracking-wider uppercase transition-all flex items-center justify-center gap-2 shadow-[0_0_18px_rgba(16,185,129,0.35)] active:scale-[0.99]"
          >
            <CheckCircle2 className="w-4.5 h-4.5 stroke-[2.5]" />
            I HAVE SAFELY ARRIVED AT SHELTER
          </button>
        </div>
      </motion.div>
    </div>
  );
};
