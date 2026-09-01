import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, CheckCircle2, X, ArrowRight, ShieldCheck } from 'lucide-react';
import { RerouteScenario, Shelter } from '../types';

interface RerouteToastProps {
  alert: RerouteScenario;
  newShelter?: Shelter;
  onDismiss: () => void;
  onViewRoute?: () => void;
  isVisible?: boolean;
}

export const RerouteToast: React.FC<RerouteToastProps> = ({
  alert,
  newShelter,
  onDismiss,
  onViewRoute,
  isVisible = true,
}) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          id="reroute-toast-notification"
          initial={{ opacity: 0, y: -24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.96 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="fixed top-16 left-0 right-0 z-40 px-3 sm:px-4 flex justify-center pointer-events-none"
        >
          <div className="w-full max-w-lg bg-[#0F172A]/95 border-2 border-amber-500/80 rounded-2xl p-3.5 sm:p-4 shadow-[0_12px_36px_rgba(0,0,0,0.85)] pointer-events-auto backdrop-blur-md">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 shrink-0 mt-0.5 shadow-[0_0_12px_rgba(245,158,11,0.25)]">
                  <ShieldAlert className="w-4.5 h-4.5 stroke-[2.5]" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-extrabold uppercase tracking-wider text-amber-400">
                      {alert.alertTitle || 'ROUTE UPDATED'}
                    </span>
                    <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  </div>
                  <p className="text-xs text-slate-200 leading-snug">
                    {alert.reroute_reason || alert.alertDescription}
                  </p>
                  {newShelter && (
                    <p className="text-[11px] text-teal-300 flex items-center gap-1 font-medium">
                      <ShieldCheck className="w-3 h-3 text-teal-400" />
                      Redirecting safely to <strong className="text-white">{newShelter.name}</strong>
                    </p>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={onDismiss}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
                aria-label="Dismiss route update notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {onViewRoute && (
              <div className="mt-2.5 pt-2 border-t border-slate-700/60 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400 font-mono">Real-time bypass active</span>
                <button
                  type="button"
                  onClick={onViewRoute}
                  className="inline-flex items-center gap-1 text-teal-400 hover:text-teal-300 font-bold"
                >
                  <span>View Updated Route</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
