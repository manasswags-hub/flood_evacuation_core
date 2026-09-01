import React from 'react';
import { UserProfile, EvacuationMode, Coordinates } from '../types';
import {
  HeartHandshake,
  Footprints,
  Bike,
  Car,
  Edit3,
  ShieldCheck,
  MapPin,
} from 'lucide-react';

interface PersonalizationSummaryProps {
  profile: UserProfile;
  location?: Coordinates;
  onEdit?: () => void;
  compact?: boolean;
}

export const PersonalizationSummary: React.FC<PersonalizationSummaryProps> = ({
  profile,
  location,
  onEdit,
  compact = false,
}) => {
  const getModeDetails = (mode?: EvacuationMode | string) => {
    switch (mode) {
      case 'elderly':
        return {
          label: 'Elderly',
          tag: 'Assisted Pace & Step-Free',
          badge: 'Priority Clearance',
          icon: HeartHandshake,
        };
      case 'two_wheeler':
        return {
          label: 'Two-Wheeler',
          tag: 'Bicycle & Motorized 2-Wheel',
          badge: 'Narrow Bypass Active',
          icon: Bike,
        };
      case 'four_wheeler':
        return {
          label: 'Four-Wheeler',
          tag: 'Vehicle Evacuation Corridor',
          badge: 'Road Staging Enabled',
          icon: Car,
        };
      case 'walking':
      default:
        return {
          label: 'Walking',
          tag: 'Pedestrian Safe Footpaths',
          badge: 'Greenway Protected',
          icon: Footprints,
        };
    }
  };

  const currentMode = profile.mode || 'walking';
  const modeInfo = getModeDetails(currentMode);
  const ModeIcon = modeInfo.icon;

  return (
    <div
      id="personalization-summary-section"
      className="bg-[#162238]/90 border border-slate-700/60 rounded-xl p-2.5 sm:p-3 space-y-2 transition-colors"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
          <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-slate-300 font-bold">
            Personalized For You
          </span>
        </div>
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-400 hover:text-teal-300 transition-colors px-2 py-0.5 rounded-md hover:bg-teal-500/10 cursor-pointer"
            title="Update evacuation mode and location"
          >
            <Edit3 className="w-3 h-3" />
            <span>Edit</span>
          </button>
        )}
      </div>

      {/* Mode & Location Summary Card */}
      <div className="bg-[#0F172A] border border-slate-700/70 rounded-lg p-2.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
            <ModeIcon className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[9px] uppercase font-mono text-slate-400 block leading-none">
                Evacuation Mode
              </span>
              <span className="text-[9px] font-mono text-teal-400/90 font-semibold bg-teal-950/60 border border-teal-500/30 px-1.5 py-0.2 rounded hidden xs:inline sm:inline">
                {modeInfo.badge}
              </span>
            </div>
            <span className="text-xs sm:text-sm font-bold text-slate-100 truncate block mt-0.5">
              {modeInfo.label} • <span className="text-slate-400 font-normal text-[11px]">{modeInfo.tag}</span>
            </span>
          </div>
        </div>

        <div className="shrink-0 flex flex-col items-end gap-1">
          {location?.isRealLocation ? (
            <span className="inline-flex items-center gap-1 text-[9.5px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-1.5 py-0.5 rounded">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live GPS
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[9.5px] font-mono text-amber-300 bg-amber-950/40 border border-amber-500/30 px-1.5 py-0.5 rounded">
              Demo Loc
            </span>
          )}
          <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/30 border border-emerald-500/30 px-2 py-0.5 rounded-md">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span className="hidden sm:inline">Verified Match</span>
          </div>
        </div>
      </div>
    </div>
  );
};
