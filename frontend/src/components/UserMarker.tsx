import React from 'react';
import { Coordinates } from '../types';

interface UserMarkerProps {
  coordinates: Coordinates;
  heading?: number;
}

export const UserMarker: React.FC<UserMarkerProps> = ({ coordinates, heading = 45 }) => {
  const isReal = Boolean(coordinates.isRealLocation);
  const badgeLabel = isReal ? 'YOU' : 'YOU (DEMO)';
  const badgeWidth = isReal ? 44 : 70;
  const badgeOffset = isReal ? -22 : -35;

  return (
    <g transform={`translate(${coordinates.x}, ${coordinates.y})`} className="cursor-pointer">
      {/* Outer Radar Rings */}
      <circle
        cx="0"
        cy="0"
        r="28"
        fill={isReal ? "rgba(20, 184, 166, 0.18)" : "rgba(245, 158, 11, 0.15)"}
        className="animate-radar origin-center"
      />
      <circle
        cx="0"
        cy="0"
        r="18"
        fill="none"
        stroke={isReal ? "#14B8A6" : "#F59E0B"}
        strokeWidth="1.5"
        strokeDasharray="3 3"
        opacity="0.7"
      />

      {/* Outer High-Contrast Puck */}
      <circle
        cx="0"
        cy="0"
        r="11"
        fill="#0F172A"
        stroke="#FFFFFF"
        strokeWidth="3"
        filter="drop-shadow(0 4px 6px rgba(0,0,0,0.6))"
      />

      {/* Inner Active Location Teal / Amber Dot */}
      <circle cx="0" cy="0" r="6" fill={isReal ? "#14B8A6" : "#F59E0B"} />

      {/* Directional Beacon Arrow */}
      <polygon
        points="0,-16 -4,-11 4,-11"
        fill={isReal ? "#14B8A6" : "#F59E0B"}
        transform={`rotate(${heading})`}
      />

      {/* Label Badge */}
      <g transform="translate(0, 24)">
        <rect
          x={badgeOffset}
          y="-10"
          width={badgeWidth}
          height="18"
          rx="4"
          fill="#0F172A"
          stroke={isReal ? "#14B8A6" : "#F59E0B"}
          strokeWidth="1.2"
        />
        <text
          x="0"
          y="2.5"
          textAnchor="middle"
          fill={isReal ? "#F8FAFC" : "#FDE68A"}
          fontSize="8.5"
          fontWeight="700"
          letterSpacing="0.05em"
          fontFamily="system-ui, sans-serif"
        >
          {badgeLabel}
        </text>
      </g>
    </g>
  );
};

