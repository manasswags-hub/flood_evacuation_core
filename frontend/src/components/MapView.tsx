import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Coordinates, Shelter, EvacuationRoute, RerouteScenario } from '../types';
import { UserMarker } from './UserMarker';
import { ShelterMarker } from './ShelterMarker';
import { RouteLine } from './RouteLine';
import { Locate, Plus, Minus, RotateCcw, AlertTriangle, ShieldCheck, Compass } from 'lucide-react';

interface MapViewProps {
  userLocation: Coordinates;
  shelters: Shelter[];
  selectedShelterId: string;
  activeRoute: EvacuationRoute;
  activeHazard?: RerouteScenario | null;
  onSelectShelter: (shelter: Shelter) => void;
  onRecenter?: () => void;
  isEvacuating?: boolean;
}

export const MapView: React.FC<MapViewProps> = ({
  userLocation,
  shelters,
  selectedShelterId,
  activeRoute,
  activeHazard,
  onSelectShelter,
  onRecenter,
  isEvacuating = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Transform state for interactive pan and zoom
  const [transform, setTransform] = useState({
    x: 0,
    y: 0,
    scale: 1,
  });

  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ startX: number; startY: number; initX: number; initY: number }>({
    startX: 0,
    startY: 0,
    initX: 0,
    initY: 0,
  });

  // Calculate default view to fit user & active shelter
  const resetToDefaultView = useCallback(() => {
    const targetShelter = shelters.find((s) => s.id === selectedShelterId);
    if (!targetShelter) {
      setTransform({ x: 0, y: 0, scale: 1 });
      return;
    }

    // Midpoint between user and shelter
    const midX = (userLocation.x + targetShelter.coordinates.x) / 2;
    const midY = (userLocation.y + targetShelter.coordinates.y) / 2;

    // In SVG 1000x1000 space, center of viewport is 500, 500
    // Shift slightly down so the bottom floating card doesn't cover the path
    const targetX = (500 - midX) * 0.9;
    const targetY = (450 - midY) * 0.9;

    setTransform({
      x: Math.max(-200, Math.min(200, targetX)),
      y: Math.max(-200, Math.min(200, targetY)),
      scale: 1.05,
    });
  }, [userLocation, selectedShelterId, shelters]);

  useEffect(() => {
    resetToDefaultView();
  }, [selectedShelterId, resetToDefaultView]);

  // Handle Drag / Pan Events
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initX: transform.x,
      initY: transform.y,
    };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = (e.clientX - dragStartRef.current.startX) / transform.scale;
    const dy = (e.clientY - dragStartRef.current.startY) / transform.scale;

    setTransform((prev) => ({
      ...prev,
      x: Math.max(-400, Math.min(400, dragStartRef.current.initX + dx)),
      y: Math.max(-400, Math.min(400, dragStartRef.current.initY + dy)),
    }));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch {
      // ignore
    }
  };

  // Zoom controls
  const handleZoom = (delta: number) => {
    setTransform((prev) => ({
      ...prev,
      scale: Math.max(0.75, Math.min(2.4, Number((prev.scale + delta).toFixed(2)))),
    }));
  };

  return (
    <div
      ref={containerRef}
      id="map-viewport"
      className="relative w-full h-full bg-[#020617] overflow-hidden select-none touch-none cursor-grab active:cursor-grabbing"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* SVG Vector Map Layer */}
      <svg
        viewBox="0 0 1000 1000"
        className="w-full h-full transition-transform duration-100 ease-out"
        style={{
          transform: `scale(${transform.scale}) translate(${transform.x}px, ${transform.y}px)`,
          transformOrigin: '50% 50%',
        }}
      >
        <defs>
          {/* Street Grid Pattern */}
          <pattern id="grid-pattern" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#0F172A" strokeWidth="0.8" />
          </pattern>

          {/* Sector Hatching */}
          <pattern id="hazard-hatch" width="12" height="12" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="12" stroke="#EF4444" strokeWidth="2.5" opacity="0.4" />
          </pattern>

          <pattern id="safe-zone-dots" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.2" fill="#0D9488" opacity="0.25" />
          </pattern>

          {/* Linear gradient for water channel */}
          <linearGradient id="river-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0B1B36" />
            <stop offset="100%" stopColor="#051024" />
          </linearGradient>
        </defs>

        {/* Map Base Canvas */}
        <rect width="1000" height="1000" fill="#020617" />
        <rect width="1000" height="1000" fill="url(#grid-pattern)" />

        {/* Sector Boundary Dividers */}
        <g opacity="0.4" stroke="#1E293B" strokeDasharray="8 8" strokeWidth="1.5">
          <line x1="500" y1="0" x2="500" y2="1000" />
          <line x1="0" y1="500" x2="1000" y2="500" />
        </g>

        {/* Sector Labels */}
        <g fill="#334155" fontSize="11" fontWeight="700" letterSpacing="0.1em" fontFamily="monospace">
          <text x="40" y="50">SECTOR 1 • NORTH HIGHLAND</text>
          <text x="540" y="50">SECTOR 4 • NORTHEAST RESIDENTIAL</text>
          <text x="40" y="550">SECTOR 2 • WEST GATEWAY</text>
          <text x="540" y="550">SECTOR 3 • EASTWOOD COMMONS</text>
        </g>

        {/* Safe Evacuation Corridors / Parks (Green Zones) */}
        <g>
          {/* Central Greenway */}
          <polygon
            points="380,680 480,590 560,490 640,430 680,480 580,580 460,710"
            fill="#064E3B"
            fillOpacity="0.22"
            stroke="#0D9488"
            strokeWidth="1.2"
            strokeDasharray="4 2"
          />
          <polygon
            points="380,680 480,590 560,490 640,430 680,480 580,580 460,710"
            fill="url(#safe-zone-dots)"
          />
          <text
            x="540"
            y="540"
            fill="#14B8A6"
            fontSize="9"
            fontWeight="700"
            letterSpacing="0.08em"
            textAnchor="middle"
            transform="rotate(-35, 540, 540)"
          >
            PROTECTED GREEN CORRIDOR
          </text>

          {/* East Woodlands Safe Zone */}
          <rect
            x="760"
            y="600"
            width="180"
            height="180"
            rx="12"
            fill="#064E3B"
            fillOpacity="0.15"
            stroke="#0D9488"
            strokeWidth="1"
          />
          <text x="850" y="740" fill="#14B8A6" fontSize="9" fontWeight="600" textAnchor="middle">
            EAST PARK REFUGE
          </text>
        </g>

        {/* Waterway / Canal (Cumberland Safe Channel) */}
        <g>
          <path
            d="M 0,380 C 180,360 280,420 380,480 C 480,540 520,660 620,780 C 720,900 860,940 1000,960 L 1000,1000 L 0,1000 Z"
            fill="url(#river-gradient)"
            opacity="0.75"
          />
          <path
            d="M 0,380 C 180,360 280,420 380,480 C 480,540 520,660 620,780 C 720,900 860,940 1000,960"
            fill="none"
            stroke="#1D4ED8"
            strokeWidth="2.5"
            opacity="0.4"
          />
          <text
            x="200"
            y="420"
            fill="#38BDF8"
            fontSize="9"
            fontWeight="600"
            letterSpacing="0.05em"
            transform="rotate(18, 200, 420)"
          >
            CUMBERLAND CANAL (MONITORED)
          </text>
        </g>

        {/* City Road Network Grid */}
        <g stroke="#0F172A" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round">
          {/* Secondary Street Grid Lines */}
          <line x1="80" y1="120" x2="920" y2="120" />
          <line x1="80" y1="260" x2="920" y2="260" />
          <line x1="80" y1="400" x2="920" y2="400" />
          <line x1="80" y1="560" x2="920" y2="560" />
          <line x1="80" y1="720" x2="920" y2="720" />
          <line x1="80" y1="860" x2="920" y2="860" />

          <line x1="140" y1="60" x2="140" y2="940" />
          <line x1="290" y1="60" x2="290" y2="940" />
          <line x1="450" y1="60" x2="450" y2="940" />
          <line x1="620" y1="60" x2="620" y2="940" />
          <line x1="780" y1="60" x2="780" y2="940" />
        </g>

        {/* Primary Arterial Expressways (Higher Contrast) */}
        <g stroke="#1E293B" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round">
          {/* Arterial 1: Elm Street East-West */}
          <line x1="50" y1="720" x2="950" y2="720" />
          {/* Arterial 2: 4th Ave North-South */}
          <line x1="450" y1="100" x2="450" y2="900" />
          {/* Arterial 3: North Civic Expressway */}
          <path d="M 140,460 L 220,460 L 220,260 L 380,190 L 710,190" />
          {/* Arterial 4: Highland Blvd */}
          <path d="M 450,520 L 580,520 L 710,340 L 880,340" />
        </g>

        {/* Inner Road Lanes (Visual Hierarchy) */}
        <g stroke="#090E17" strokeWidth="4" strokeLinecap="round">
          <line x1="50" y1="720" x2="950" y2="720" />
          <line x1="450" y1="100" x2="450" y2="900" />
          <path d="M 140,460 L 220,460 L 220,260 L 380,190 L 710,190" />
          <path d="M 450,520 L 580,520 L 710,340 L 880,340" />
        </g>

        {/* Bridge Structures Over Water */}
        <g>
          {/* 4th Ave Bridge */}
          <rect x="442" y="605" width="16" height="36" fill="#334155" stroke="#94A3B8" strokeWidth="1.2" rx="2" />
          {/* West Arterial Bridge */}
          <rect x="132" y="380" width="16" height="32" fill="#334155" stroke="#94A3B8" strokeWidth="1.2" rx="2" />
        </g>

        {/* Street Name Labels */}
        <g fill="#475569" fontSize="8.5" fontWeight="600" letterSpacing="0.06em">
          <text x="320" y="712">ELM STREET (SAFE WALKWAY)</text>
          <text x="458" y="470">4TH AVENUE CORRIDOR</text>
          <text x="590" y="512">HIGHLAND BOULEVARD</text>
          <text x="180" y="248">NORTH ARTERIAL HWY 1</text>
          <text x="740" y="632">PINE RIDGE PKWY</text>
        </g>

        {/* Active Hazard / Blockage Zone (Shown if Reroute Alert Triggered) */}
        {activeHazard && (
          <g transform={`translate(${activeHazard.hazardCoordinates.x}, ${activeHazard.hazardCoordinates.y})`}>
            {/* Hazard Warning Radius */}
            <circle
              cx="0"
              cy="0"
              r={activeHazard.hazardRadius}
              fill="url(#hazard-hatch)"
              stroke="#EF4444"
              strokeWidth="2"
              strokeDasharray="4 3"
            />
            {/* Pulsing Warning Center */}
            <circle cx="0" cy="0" r="16" fill="#0F172A" stroke="#EF4444" strokeWidth="2" />
            <polygon points="0,-8 -7,5 7,5" fill="#EF4444" />
            <circle cx="0" cy="2" r="1" fill="#F8FAFC" />
            <line x1="0" y1="-4" x2="0" y2="0" stroke="#F8FAFC" strokeWidth="1.5" strokeLinecap="round" />

            {/* Hazard Label */}
            <g transform="translate(0, 36)">
              <rect x="-65" y="-9" width="130" height="18" rx="4" fill="#0F172A" stroke="#EF4444" strokeWidth="1" />
              <text x="0" y="3.5" textAnchor="middle" fill="#FCA5A5" fontSize="8.5" fontWeight="700">
                OBSTRUCTION DETECTED
              </text>
            </g>
          </g>
        )}

        {/* Render Drawn Evacuation Route Line */}
        <RouteLine
          coordinates={activeRoute.pathCoordinates}
          isRerouted={Boolean(activeRoute.isAlternative || activeHazard)}
        />

        {/* Render Shelters */}
        {shelters.map((shelter) => (
          <ShelterMarker
            key={shelter.id}
            shelter={shelter}
            isSelected={shelter.id === selectedShelterId}
            onSelect={onSelectShelter}
          />
        ))}

        {/* Render User GPS Location Marker */}
        <UserMarker coordinates={userLocation} heading={isEvacuating ? 60 : 45} />
      </svg>

      {/* Floating Map Controls (Top-Right / Side) */}
      <div className="absolute right-3 top-20 z-20 flex flex-col gap-2">
        {/* Recenter on Me Button */}
        <button
          id="btn-recenter"
          type="button"
          onClick={() => {
            resetToDefaultView();
            onRecenter?.();
          }}
          className="w-11 h-11 bg-[#0F172A]/90 hover:bg-[#1E293B] active:scale-95 text-teal-400 border border-teal-500/40 rounded-xl shadow-lg flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-teal-400"
          title="Recenter on my position"
          aria-label="Recenter on my position"
        >
          <Locate className="w-5 h-5" />
        </button>

        {/* Zoom In */}
        <button
          id="btn-zoom-in"
          type="button"
          onClick={() => handleZoom(0.2)}
          className="w-11 h-11 bg-[#0F172A]/90 hover:bg-[#1E293B] active:scale-95 text-slate-200 border border-slate-700/80 rounded-xl shadow-lg flex items-center justify-center transition-all focus:outline-none"
          title="Zoom in"
          aria-label="Zoom in"
        >
          <Plus className="w-5 h-5" />
        </button>

        {/* Zoom Out */}
        <button
          id="btn-zoom-out"
          type="button"
          onClick={() => handleZoom(-0.2)}
          className="w-11 h-11 bg-[#0F172A]/90 hover:bg-[#1E293B] active:scale-95 text-slate-200 border border-slate-700/80 rounded-xl shadow-lg flex items-center justify-center transition-all focus:outline-none"
          title="Zoom out"
          aria-label="Zoom out"
        >
          <Minus className="w-5 h-5" />
        </button>

        {/* Reset View */}
        <button
          id="btn-reset-view"
          type="button"
          onClick={resetToDefaultView}
          className="w-11 h-11 bg-[#0F172A]/90 hover:bg-[#1E293B] active:scale-95 text-slate-400 hover:text-slate-200 border border-slate-700/80 rounded-xl shadow-lg flex items-center justify-center transition-all focus:outline-none"
          title="Reset map view"
          aria-label="Reset map view"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Map Legend / Compass Badge (Top-Left) */}
      <div className="absolute left-3 top-20 z-10 flex items-center gap-2 bg-[#0F172A]/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-xs text-slate-300 pointer-events-none shadow-md">
        <Compass
          className={`w-4 h-4 ${
            userLocation.isRealLocation ? 'text-teal-400' : 'text-amber-400'
          } animate-spin`}
          style={{ animationDuration: '24s' }}
        />
        <span className="font-mono text-[10px] tracking-wider text-slate-300">
          {userLocation.isRealLocation
            ? `LIVE GPS LOCK • ±${Math.round(userLocation.accuracy ?? 5)}m`
            : 'DEMO LOCATION • MOCK MODE'}
        </span>
      </div>
    </div>
  );
};
