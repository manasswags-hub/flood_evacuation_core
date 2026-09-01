import React from 'react';
import { motion } from 'motion/react';
import { Shelter, EvacuationRoute, RerouteScenario, UserProfile } from '../types';
import { NavigationBottomCard } from './NavigationBottomCard';
import { RerouteToast } from './RerouteToast';
import { Navigation, Compass, AlertTriangle, Phone, ShieldAlert, ArrowLeft } from 'lucide-react';

interface NavigationViewProps {
  shelter: Shelter;
  route: EvacuationRoute;
  userProfile: UserProfile;
  isRerouted: boolean;
  activeHazard?: RerouteScenario | null;
  showRerouteToast: boolean;
  activeStepIndex: number;
  isSimulatingReroute?: boolean;
  onSimulateHazard: () => void;
  onResetReroute: () => void;
  onCompleteEvacuation: () => void;
  onNextStep: () => void;
  onPrevStep: () => void;
  onExitNavigation: () => void;
  onDismissToast: () => void;
  onOpenSos: () => void;
}

export const NavigationView: React.FC<NavigationViewProps> = ({
  shelter,
  route,
  userProfile,
  isRerouted,
  activeHazard,
  showRerouteToast,
  activeStepIndex,
  isSimulatingReroute = false,
  onSimulateHazard,
  onResetReroute,
  onCompleteEvacuation,
  onNextStep,
  onPrevStep,
  onExitNavigation,
  onDismissToast,
  onOpenSos,
}) => {
  const currentStep = route.steps[activeStepIndex] || route.steps[0];

  return (
    <>
      {/* Top Navigation HUD Banner */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="fixed top-0 left-0 right-0 z-40 bg-[#0F172A]/95 border-b border-teal-500/40 backdrop-blur-md px-3 sm:px-4 py-2.5 shadow-[0_4px_20px_rgba(0,0,0,0.6)]"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          {/* Back / Exit Button */}
          <button
            type="button"
            onClick={onExitNavigation}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#1E293B] border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Overview</span>
          </button>

          {/* Center Next Action Strip */}
          <div className="flex items-center gap-2 min-w-0 text-left">
            <div className="w-7 h-7 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-300 shrink-0">
              <Navigation className="w-4 h-4 animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono uppercase text-teal-400 font-extrabold tracking-wider">
                  LIVE TRACKING
                </span>
                <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                  • {currentStep.distance} to next turn
                </span>
              </div>
              <p className="text-xs font-bold text-white truncate max-w-[200px] sm:max-w-md">
                {currentStep.instruction}
              </p>
            </div>
          </div>

          {/* SOS Quick Hotline Trigger */}
          <button
            type="button"
            onClick={onOpenSos}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-500/20 border border-rose-500/40 hover:bg-rose-500/30 text-rose-300 font-extrabold text-xs transition-colors shrink-0"
          >
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
            <span>SOS</span>
          </button>
        </div>
      </motion.div>

      {/* Reroute Alert Toast */}
      {showRerouteToast && activeHazard && (
        <RerouteToast
          alert={activeHazard}
          newShelter={shelter}
          onDismiss={onDismissToast}
        />
      )}

      {/* Floating Bottom Card in Navigation Mode */}
      <NavigationBottomCard
        shelter={shelter}
        route={route}
        isRerouted={isRerouted}
        activeStepIndex={activeStepIndex}
        isSimulatingReroute={isSimulatingReroute}
        onSimulateHazard={onSimulateHazard}
        onResetReroute={onResetReroute}
        onCompleteEvacuation={onCompleteEvacuation}
        onNextStep={onNextStep}
        onPrevStep={onPrevStep}
        onExitNavigation={onExitNavigation}
      />
    </>
  );
};
