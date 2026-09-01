import React from 'react';
import { motion } from 'motion/react';
import { Coordinates } from '../types';

interface RouteLineProps {
  coordinates: Coordinates[];
  isRerouted?: boolean;
  color?: string;
}

export const RouteLine: React.FC<RouteLineProps> = ({
  coordinates,
  isRerouted = false,
  color,
}) => {
  if (!coordinates || coordinates.length < 2) return null;

  // Build SVG polyline points string
  const pointsString = coordinates.map((c) => `${c.x},${c.y}`).join(' ');
  const strokeColor = color || (isRerouted ? '#F59E0B' : '#0D9488');
  const glowColor = isRerouted ? 'rgba(245, 158, 11, 0.45)' : 'rgba(13, 148, 136, 0.45)';

  return (
    <g className="pointer-events-none transition-all duration-500 ease-in-out">
      {/* Route Glow Underlay */}
      <motion.polyline
        key={`glow-${isRerouted ? 'rerouted' : 'primary'}`}
        initial={{ opacity: 0.2 }}
        animate={{ opacity: 1, points: pointsString }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        points={pointsString}
        fill="none"
        stroke={glowColor}
        strokeWidth="14"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Dark Border / Highway Base */}
      <motion.polyline
        key={`base-${isRerouted ? 'rerouted' : 'primary'}`}
        animate={{ points: pointsString }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        points={pointsString}
        fill="none"
        stroke="#020617"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Main Solid Route Line */}
      <motion.polyline
        key={`main-${isRerouted ? 'rerouted' : 'primary'}`}
        initial={{ strokeDashoffset: 100 }}
        animate={{ strokeDashoffset: 0, points: pointsString }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        points={pointsString}
        fill="none"
        stroke={strokeColor}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="transition-colors duration-500"
      />

      {/* Animated Directional Dash Flow */}
      <polyline
        points={pointsString}
        fill="none"
        stroke="#F8FAFC"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="animate-route-flow opacity-85"
      />

      {/* Intermediate Turn Waypoint Nodes */}
      {coordinates.slice(1, -1).map((coord, idx) => (
        <motion.g
          key={`turn-node-${idx}-${coord.x}-${coord.y}`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay: idx * 0.05 }}
          transform={`translate(${coord.x}, ${coord.y})`}
        >
          <circle cx="0" cy="0" r="5" fill="#0F172A" stroke={strokeColor} strokeWidth="2.5" />
          <circle cx="0" cy="0" r="2" fill="#FFFFFF" />
        </motion.g>
      ))}
    </g>
  );
};
