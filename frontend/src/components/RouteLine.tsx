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
  if (!coordinates || coordinates.length < 2) {
    return null;
  }

  // Convert the route coordinates into SVG points.
  const pointsString = coordinates
    .filter(
      (coordinate) =>
        Number.isFinite(coordinate.x) &&
        Number.isFinite(coordinate.y),
    )
    .map(
      (coordinate) =>
        `${coordinate.x},${coordinate.y}`,
    )
    .join(' ');

  if (!pointsString) {
    return null;
  }

  const strokeColor =
    color ||
    (isRerouted
      ? '#F59E0B'
      : '#14B8A6');

  const glowColor =
    isRerouted
      ? 'rgba(245, 158, 11, 0.65)'
      : 'rgba(20, 184, 166, 0.65)';

  /*
   * Use the actual route geometry as the key.
   *
   * This is important because after rerouting the backend
   * returns completely different OSRM coordinates.
   */
  const routeKey =
    pointsString;

  return (
    <g
      key={routeKey}
      className="pointer-events-none"
    >
      {/* ====================================================
          OUTER GLOW
      ==================================================== */}

      <motion.polyline
        key={`glow-${routeKey}`}
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
          points: pointsString,
        }}
        transition={{
          duration: 0.45,
          ease: 'easeInOut',
        }}
        points={pointsString}
        fill="none"
        stroke={glowColor}
        strokeWidth="20"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* ====================================================
          DARK OUTLINE
      ==================================================== */}

      <motion.polyline
        key={`outline-${routeKey}`}
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
          points: pointsString,
        }}
        transition={{
          duration: 0.4,
          ease: 'easeInOut',
        }}
        points={pointsString}
        fill="none"
        stroke="#020617"
        strokeWidth="12"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* ====================================================
          MAIN EVACUATION ROUTE
      ==================================================== */}

      <motion.polyline
        key={`route-${routeKey}`}
        initial={{
          opacity: 0,
          pathLength: 0,
        }}
        animate={{
          opacity: 1,
          pathLength: 1,
          points: pointsString,
        }}
        transition={{
          duration: 0.8,
          ease: 'easeInOut',
        }}
        points={pointsString}
        fill="none"
        stroke={strokeColor}
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* ====================================================
          CENTER DIRECTION LINE
      ==================================================== */}

      <motion.polyline
        key={`center-${routeKey}`}
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 0.95,
          points: pointsString,
        }}
        transition={{
          duration: 0.5,
        }}
        points={pointsString}
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="10 8"
        className="animate-route-flow"
      />

      {/* ====================================================
          ROUTE WAYPOINTS
      ==================================================== */}

      {coordinates
        .filter(
          (coordinate) =>
            Number.isFinite(coordinate.x) &&
            Number.isFinite(coordinate.y),
        )
        .slice(1, -1)
        .map((coordinate, index) => (
          <motion.g
            key={`waypoint-${routeKey}-${index}-${coordinate.x}-${coordinate.y}`}
            initial={{
              opacity: 0,
              scale: 0,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            transition={{
              duration: 0.25,
              delay:
                Math.min(index, 8) *
                0.03,
            }}
            transform={`translate(${coordinate.x}, ${coordinate.y})`}
          >
            <circle
              cx="0"
              cy="0"
              r="6"
              fill="#020617"
              stroke={strokeColor}
              strokeWidth="3"
            />

            <circle
              cx="0"
              cy="0"
              r="2.5"
              fill="#FFFFFF"
            />
          </motion.g>
        ))}

      {/* ====================================================
          START MARKER
      ==================================================== */}

      {coordinates[0] && (
        <g
          transform={`translate(${coordinates[0].x}, ${coordinates[0].y})`}
        >
          <circle
            cx="0"
            cy="0"
            r="10"
            fill="#020617"
            stroke={strokeColor}
            strokeWidth="3"
          />

          <circle
            cx="0"
            cy="0"
            r="4"
            fill="#FFFFFF"
          />
        </g>
      )}

      {/* ====================================================
          DESTINATION MARKER
      ==================================================== */}

      {coordinates[
        coordinates.length - 1
      ] && (
        <g
          transform={`translate(${
            coordinates[
              coordinates.length - 1
            ].x
          }, ${
            coordinates[
              coordinates.length - 1
            ].y
          })`}
        >
          <circle
            cx="0"
            cy="0"
            r="11"
            fill="#020617"
            stroke={strokeColor}
            strokeWidth="3"
          />

          <circle
            cx="0"
            cy="0"
            r="4"
            fill={strokeColor}
          />
        </g>
      )}
    </g>
  );
};