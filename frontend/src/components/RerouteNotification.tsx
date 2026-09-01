import React from 'react';
import { RerouteScenario, Shelter } from '../types';
import { AlertCircle, ArrowRight, X, ShieldAlert } from 'lucide-react';

interface RerouteNotificationProps {
  alert: RerouteScenario;
  newShelter: Shelter;
  onDismiss: () => void;
  onViewRoute: () => void;
}

export const RerouteNotification: React.FC<RerouteNotificationProps> = ({
  alert,
  newShelter,
  onDismiss,
  onViewRoute,
}) => {
  return (
    <div
      id="reroute-toast-banner"
      className="fixed top-18 left-3 right-3 sm:left-auto sm:right-4 sm:w-96 z-40 animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-auto"
    >
      <div className="bg-[#0F172A] border-2 border-amber-500 rounded-xl shadow-2xl p-3.5 text-white flex flex-col gap-2.5">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-amber-400 uppercase tracking-wider font-mono">
                  {alert.alertTitle || 'ROUTE UPDATED'}
                </span>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              </div>
              <p className="text-xs text-slate-300 leading-snug">
                {alert.reroute_reason || alert.alertDescription}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onDismiss}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            title="Dismiss notification"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action strip */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
          <span className="text-[11px] text-slate-400 truncate">
            New destination: <strong className="text-slate-200">{newShelter.name}</strong>
          </span>

          <button
            type="button"
            onClick={onViewRoute}
            className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-[#020617] font-bold text-xs flex items-center gap-1 shrink-0 transition-all shadow-sm"
          >
            View Detour
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
