import React from 'react';
import { Shelter } from '../types';

interface ShelterMarkerProps {
  shelter: Shelter;
  isSelected: boolean;
  onSelect: (shelter: Shelter) => void;
}

export const ShelterMarker: React.FC<ShelterMarkerProps> = ({
  shelter,
  isSelected,
  onSelect,
}) => {
  const availableSpots = shelter.capacityTotal - shelter.capacityOccupied;
  const isOptimal = shelter.status === 'optimal';
  const accentColor = isSelected ? '#F59E0B' : isOptimal ? '#0D9488' : '#F59E0B';

  return (
    <g
      transform={`translate(${shelter.coordinates.x}, ${shelter.coordinates.y})`}
      className="cursor-pointer transition-transform duration-200 hover:scale-105"
      onClick={(e) => {
        e.stopPropagation();
        onSelect(shelter);
      }}
      id={`marker-${shelter.id}`}
    >
      {/* Selected Halo */}
      {isSelected && (
        <circle
          cx="0"
          cy="-18"
          r="34"
          fill="rgba(245, 158, 11, 0.18)"
          stroke="#F59E0B"
          strokeWidth="1.5"
          strokeDasharray="4 3"
        />
      )}

      {/* Pin Shadow */}
      <ellipse cx="0" cy="2" rx="10" ry="4" fill="rgba(0, 0, 0, 0.6)" />

      {/* Pin Body (High-contrast shield / drop shape) */}
      <path
        d="M 0 0 L -14 -16 C -20 -23, -20 -36, 0 -36 C 20 -36, 20 -23, 14 -16 Z"
        fill={isSelected ? '#1E293B' : '#0F172A'}
        stroke={accentColor}
        strokeWidth={isSelected ? '2.5' : '1.8'}
        filter="drop-shadow(0 4px 6px rgba(0,0,0,0.6))"
      />

      {/* Shelter Symbol (House / Cross) */}
      <path
        d="M -6 -23 L 0 -29 L 6 -23 L 4 -23 L 4 -17 L -4 -17 L -4 -23 Z"
        fill={accentColor}
      />

      {/* Floating Availability Pill (Always Visible for quick triage) */}
      <g transform="translate(0, -48)">
        <rect
          x="-58"
          y="-13"
          width="116"
          height="22"
          rx="11"
          fill="#0F172A"
          stroke={accentColor}
          strokeWidth="1.2"
          filter="drop-shadow(0 2px 4px rgba(0,0,0,0.7))"
        />

        {/* Status Dot */}
        <circle cx="-46" cy="-2" r="3.5" fill={accentColor} />

        {/* Shelter Live Capacity Text */}
        <text
          x="6"
          y="1.5"
          textAnchor="middle"
          fill="#F8FAFC"
          fontSize="9.5"
          fontWeight="700"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          {availableSpots}/{shelter.capacityTotal} SPOTS
        </text>
      </g>

      {/* Shelter Short Name Label Underneath */}
      <g transform="translate(0, 16)">
        <rect
          x="-60"
          y="-8"
          width="120"
          height="18"
          rx="4"
          fill="rgba(15, 23, 42, 0.95)"
          stroke="#334155"
          strokeWidth="1"
        />
        <text
          x="0"
          y="4.5"
          textAnchor="middle"
          fill="#F8FAFC"
          fontSize="9"
          fontWeight="600"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          {shelter.name.length > 20 ? shelter.name.slice(0, 19) + '…' : shelter.name}
        </text>
      </g>
    </g>
  );
};

