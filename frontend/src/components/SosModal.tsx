import React from 'react';
import { Phone, ShieldAlert, X, HeartPulse, Truck, Radio } from 'lucide-react';

interface SosModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SosModal: React.FC<SosModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const hotlines = [
    {
      name: 'Civil Emergency & 911 Dispatch',
      number: '911',
      desc: 'Immediate life-safety, fire rescue, police evacuation escort',
      icon: ShieldAlert,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10 border-rose-500/30',
    },
    {
      name: 'Regional Evacuation Assistance & Transit',
      number: '211',
      desc: 'Specialized wheelchair transport & public shelter intake line',
      icon: Truck,
      color: 'text-teal-400',
      bg: 'bg-teal-500/10 border-teal-500/30',
    },
    {
      name: 'Medical Triage & Field Hospital Unit',
      number: '(555) 019-4999',
      desc: 'Emergency prescription refills, oxygen staging, acute care',
      icon: HeartPulse,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/30',
    },
    {
      name: 'Municipal Emergency Radio Broadcast',
      number: 'FM 94.7 / AM 1120',
      desc: 'Official real-time civil defense bulletins & shelter updates',
      icon: Radio,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/30',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#0F172A] border border-rose-500/40 rounded-2xl p-5 shadow-2xl space-y-4">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/50 flex items-center justify-center text-rose-400">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Emergency Dispatch Hotlines</h2>
              <p className="text-xs text-slate-400">Tap to call direct civil defense numbers</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#1E293B]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hotlines list */}
        <div className="space-y-2.5">
          {hotlines.map((h, i) => {
            const Icon = h.icon;
            return (
              <div
                key={i}
                className="p-3 rounded-xl bg-[#1E293B]/50 border border-slate-700/60 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${h.bg} ${h.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-100">{h.name}</div>
                    <div className="text-[11px] text-slate-400 leading-tight mt-0.5">{h.desc}</div>
                  </div>
                </div>

                <a
                  href={`tel:${h.number.replace(/[^0-9]/g, '')}`}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-bold text-xs font-mono shrink-0 flex items-center gap-1 shadow"
                >
                  <Phone className="w-3 h-3" />
                  {h.number}
                </a>
              </div>
            );
          })}
        </div>

        {/* Advisory */}
        <p className="text-[11px] text-slate-400 text-center leading-relaxed">
          If you are in direct life-threatening danger, call 911 immediately or proceed directly to the nearest highlighted evacuation point.
        </p>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-[#1E293B] hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors"
        >
          Return to SafeRoute Map
        </button>
      </div>
    </div>
  );
};
