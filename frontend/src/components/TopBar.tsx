import React from 'react';
import { UserProfile, Coordinates } from '../types';
import { Shield, Phone, RefreshCw, UserCheck, AlertTriangle, MapPin } from 'lucide-react';

interface TopBarProps {
  userProfile: UserProfile;
  userLocation?: Coordinates;
  isRerouted: boolean;
  onOpenProfile: () => void;
  onTriggerRerouteDemo: () => void;
  onResetRerouteDemo: () => void;
  onOpenSos: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  userProfile,
  userLocation,
  isRerouted,
  onOpenProfile,
  onTriggerRerouteDemo,
  onResetRerouteDemo,
  onOpenSos,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-30 bg-[#0F172A]/95 backdrop-blur-md border-b border-[#1E293B] px-3 sm:px-6 py-2.5 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* Left: Brand + Emergency Status */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-500/15 border border-teal-500/40 flex items-center justify-center text-teal-400 shrink-0">
            <Shield className="w-4 h-4" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-white">
                SafeRoute
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
            </div>

            <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400">
              <span className="hidden sm:inline">CIVIL DEFENSE LEVEL 2 •</span>
              <span className="text-teal-400 font-semibold">ALL CORRIDORS MONITORED</span>
            </div>
          </div>
        </div>

        {/* Center: Profile & Location Chip (Mobile & Desktop) */}
        <button
          id="btn-edit-profile-chip"
          type="button"
          onClick={onOpenProfile}
          className="hidden md:flex items-center gap-2 px-3 py-1 rounded-lg bg-[#1E293B]/80 hover:bg-[#1E293B] border border-slate-700 text-xs text-slate-200 transition-colors cursor-pointer"
          title="Click to change your evacuation mode and location"
        >
          <div className="flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5 text-teal-400" />
            <span className="font-semibold capitalize text-teal-300">
              {userProfile.mode === 'two_wheeler'
                ? 'Two-Wheeler'
                : userProfile.mode === 'four_wheeler'
                ? 'Four-Wheeler'
                : userProfile.mode || 'Walking'}
            </span>
          </div>
          <span className="text-slate-500">•</span>
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-slate-400" />
            <span className={`text-[11px] font-mono ${userLocation?.isRealLocation ? 'text-emerald-400 font-semibold' : 'text-amber-300'}`}>
              {userLocation?.isRealLocation ? 'Live GPS' : 'Demo Loc'}
            </span>
          </div>
        </button>

        {/* Right: Demo Trigger + SOS Hotline */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Demo Reroute Toggle Button */}
          {!isRerouted ? (
            <button
              id="btn-demo-reroute"
              type="button"
              onClick={onTriggerRerouteDemo}
              className="px-2.5 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 active:scale-95 border border-amber-500/50 text-amber-300 font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              title="Test dynamic reroute event when road blockage occurs"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden xs:inline sm:inline">Simulate Hazard / Reroute</span>
              <span className="xs:hidden sm:hidden">Reroute Demo</span>
            </button>
          ) : (
            <button
              id="btn-reset-reroute"
              type="button"
              onClick={onResetRerouteDemo}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-600 text-slate-200 font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              title="Reset to original primary route"
            >
              <RefreshCw className="w-3.5 h-3.5 text-teal-400" />
              <span>Reset Route</span>
            </button>
          )}

          {/* Quick Profile Edit (Small Screen Icon) */}
          <button
            type="button"
            onClick={onOpenProfile}
            className="md:hidden p-2 rounded-lg bg-[#1E293B] hover:bg-[#334155] border border-slate-700 text-slate-300 transition-colors cursor-pointer"
            title="Edit Evacuation Profile"
            aria-label="Edit Profile"
          >
            <UserCheck className="w-4 h-4 text-teal-400" />
          </button>

          {/* SOS Hotlines Button */}
          <button
            id="btn-sos-modal"
            type="button"
            onClick={onOpenSos}
            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-black text-xs tracking-wider flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(225,29,72,0.4)] cursor-pointer"
            title="Open Emergency Hotlines"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>SOS</span>
          </button>
        </div>
      </div>
    </header>
  );
};
