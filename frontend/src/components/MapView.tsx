import React, { useEffect, useMemo, useRef } from 'react';
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Circle,
  Popup,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import {
  Coordinates,
  Shelter,
  EvacuationRoute,
  RerouteScenario,
} from '../types';

import {
  Locate,
  Plus,
  Minus,
  RotateCcw,
  Compass,
  AlertTriangle,
} from 'lucide-react';

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

/* ============================================================
   COORDINATE HELPER
   ============================================================

   Backend/frontend data may contain either:

   latitude / longitude

   OR

   lat / lng

   Leaflet needs:

   [latitude, longitude]
   ============================================================ */

const getLatLng = (
  coordinates?: Coordinates | null
): [number, number] | null => {
  if (!coordinates) {
    return null;
  }

  const latitude = Number(
    coordinates.latitude ?? coordinates.lat
  );

  const longitude = Number(
    coordinates.longitude ?? coordinates.lng
  );

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude)
  ) {
    return null;
  }

  return [latitude, longitude];
};

/* ============================================================
   CUSTOM USER ICON
   ============================================================ */

const userIcon = L.divIcon({
  className: 'saferoute-user-icon',
  html: `
    <div style="
      width:36px;
      height:36px;
      border-radius:50%;
      background:#0f172a;
      border:3px solid #14b8a6;
      box-shadow:
        0 0 0 7px rgba(20,184,166,0.18),
        0 0 25px rgba(20,184,166,0.75);
      display:flex;
      align-items:center;
      justify-content:center;
      color:#5eead4;
      font-size:18px;
      font-weight:900;
    ">
      ●
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

/* ============================================================
   SHELTER ICON
   ============================================================ */

const createShelterIcon = (
  selected: boolean
) =>
  L.divIcon({
    className: 'saferoute-shelter-icon',
    html: `
      <div style="
        width:42px;
        height:42px;
        border-radius:12px;
        background:${
          selected ? '#0f766e' : '#0f172a'
        };
        border:2px solid:${
          selected ? '#5eead4' : '#14b8a6'
        };
        box-shadow:
          0 0 ${
            selected
              ? '28px rgba(20,184,166,0.85)'
              : '14px rgba(20,184,166,0.40)'
          };
        display:flex;
        align-items:center;
        justify-content:center;
        font-size:20px;
      ">
        🏠
      </div>
    `,
    iconSize: [42, 42],
    iconAnchor: [21, 21],
  });

/* ============================================================
   HAZARD ICON
   ============================================================ */

const hazardIcon = L.divIcon({
  className: 'saferoute-hazard-icon',
  html: `
    <div style="
      width:40px;
      height:40px;
      border-radius:50%;
      background:#450a0a;
      border:3px solid #ef4444;
      box-shadow:
        0 0 0 8px rgba(239,68,68,0.18),
        0 0 28px rgba(239,68,68,0.70);
      display:flex;
      align-items:center;
      justify-content:center;
      color:#fca5a5;
      font-size:21px;
      font-weight:900;
    ">
      !
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

/* ============================================================
   MAP CONTROLLER
   ============================================================ */

interface MapControllerProps {
  userLocation: Coordinates;
  activeRoute: EvacuationRoute;
  selectedShelter?: Shelter;
  mapRef: React.MutableRefObject<L.Map | null>;
}

const MapController: React.FC<MapControllerProps> = ({
  userLocation,
  activeRoute,
  selectedShelter,
  mapRef,
}) => {
  const map = useMap();

  /* Store Leaflet map instance */
  useEffect(() => {
    mapRef.current = map;

    return () => {
      if (mapRef.current === map) {
        mapRef.current = null;
      }
    };
  }, [map, mapRef]);

  /*
   * Fit the actual route + user + shelter.
   */
  useEffect(() => {
    const points: [number, number][] = [];

    const userPoint =
      getLatLng(userLocation);

    if (userPoint) {
      points.push(userPoint);
    }

    for (
      const coordinate of
        activeRoute.pathCoordinates ?? []
    ) {
      const point =
        getLatLng(coordinate);

      if (point) {
        points.push(point);
      }
    }

    if (selectedShelter) {
      const shelterPoint =
        getLatLng(
          selectedShelter.coordinates
        );

      if (shelterPoint) {
        points.push(shelterPoint);
      }
    }

    if (points.length === 0) {
      return;
    }

    const bounds =
      L.latLngBounds(points);

    map.fitBounds(bounds, {
      paddingTopLeft: [50, 100],
      paddingBottomRight: [50, 250],
      maxZoom: 16,
      animate: true,
      duration: 0.7,
    });
  }, [
    map,
    userLocation.latitude,
    userLocation.longitude,
    userLocation.lat,
    userLocation.lng,
    activeRoute.id,
    activeRoute.route_id,
    activeRoute.pathCoordinates,
    selectedShelter?.id,
  ]);

  return null;
};

/* ============================================================
   MAIN MAP VIEW
   ============================================================ */

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
  const mapRef =
    useRef<L.Map | null>(null);

  /* ----------------------------------------------------------
     USER POSITION
     ---------------------------------------------------------- */

  const userLatLng = useMemo(
    () => getLatLng(userLocation),
    [
      userLocation.latitude,
      userLocation.longitude,
      userLocation.lat,
      userLocation.lng,
    ]
  );

  /* ----------------------------------------------------------
     REAL BACKEND ROUTE
     ---------------------------------------------------------- */

  const routeCoordinates =
    useMemo(() => {
      return (
        activeRoute.pathCoordinates ?? []
      )
        .map(getLatLng)
        .filter(
          (
            point
          ): point is [number, number] =>
            point !== null
        );
    }, [
      activeRoute.pathCoordinates,
    ]);

  /* ----------------------------------------------------------
     SELECTED SHELTER
     ---------------------------------------------------------- */

  const selectedShelter =
    shelters.find(
      (shelter) =>
        shelter.id ===
        selectedShelterId
    );

  const selectedShelterLatLng =
    selectedShelter
      ? getLatLng(
          selectedShelter.coordinates
        )
      : null;

  /* ----------------------------------------------------------
     HAZARD
     ---------------------------------------------------------- */

  const hazardLatLng =
    activeHazard
      ? getLatLng(
          activeHazard.hazardCoordinates
        )
      : null;

  /* ----------------------------------------------------------
     FALLBACK KELAMBAKKAM CENTER
     ---------------------------------------------------------- */

  const mapCenter: [
    number,
    number
  ] =
    userLatLng ?? [
      12.7925,
      80.2050,
    ];

  /* ----------------------------------------------------------
     ROUTE COLOR
     ---------------------------------------------------------- */

  const routeColor =
    activeRoute.isAlternative ||
    activeHazard
      ? '#f59e0b'
      : '#14b8a6';

  /* ==========================================================
     MAP CONTROLS
     ========================================================== */

  const recenterOnUser = () => {
    if (
      !mapRef.current ||
      !userLatLng
    ) {
      return;
    }

    mapRef.current.flyTo(
      userLatLng,
      Math.max(
        mapRef.current.getZoom(),
        15
      ),
      {
        animate: true,
        duration: 0.6,
      }
    );

    onRecenter?.();
  };

  const zoomIn = () => {
    mapRef.current?.zoomIn();
  };

  const zoomOut = () => {
    mapRef.current?.zoomOut();
  };

  const resetView = () => {
    if (!mapRef.current) {
      return;
    }

    const points: [
      number,
      number
    ][] = [];

    if (userLatLng) {
      points.push(userLatLng);
    }

    points.push(
      ...routeCoordinates
    );

    if (selectedShelterLatLng) {
      points.push(
        selectedShelterLatLng
      );
    }

    if (points.length > 0) {
      mapRef.current.fitBounds(
        L.latLngBounds(points),
        {
          paddingTopLeft: [50, 100],
          paddingBottomRight: [
            50,
            250,
          ],
          maxZoom: 16,
          animate: true,
          duration: 0.7,
        }
      );
    } else {
      mapRef.current.setView(
        mapCenter,
        14
      );
    }
  };

  /* ==========================================================
     RENDER
     ========================================================== */

  return (
    <div
      id="map-viewport"
      className="relative z-0 isolate w-full h-full overflow-hidden bg-[#020617]"
    >
      {/* ======================================================
          REAL KELAMBAKKAM MAP
          ====================================================== */}

      <MapContainer
        center={mapCenter}
        zoom={14}
        scrollWheelZoom={true}
        zoomControl={false}
        className="w-full h-full"
        style={{
          background: '#020617',
        }}
      >
        {/* ====================================================
            OPENSTREETMAP
            ==================================================== */}

        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* ====================================================
            MAP CONTROLLER
            ==================================================== */}

        <MapController
          userLocation={userLocation}
          activeRoute={activeRoute}
          selectedShelter={selectedShelter}
          mapRef={mapRef}
        />

        {/* ====================================================
            ACTUAL OSRM ROUTE
            ==================================================== */}

        {routeCoordinates.length > 1 && (
          <>
            {/* Wide route glow */}
            <Polyline
              positions={
                routeCoordinates
              }
              pathOptions={{
                color: routeColor,
                weight: 17,
                opacity: 0.22,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />

            {/* Main route */}
            <Polyline
              positions={
                routeCoordinates
              }
              pathOptions={{
                color: routeColor,
                weight: 8,
                opacity: 1,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />

            {/* Inner white highlight */}
            <Polyline
              positions={
                routeCoordinates
              }
              pathOptions={{
                color: '#ecfeff',
                weight: 2.5,
                opacity: 0.95,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
          </>
        )}

        {/* ====================================================
            USER LOCATION
            ==================================================== */}

        {userLatLng && (
          <Marker
            position={userLatLng}
            icon={userIcon}
          >
            <Popup>
              <div className="text-sm font-bold text-slate-900">
                Your Location
              </div>

              <div className="mt-1 text-xs text-slate-600">
                {isEvacuating
                  ? 'Evacuation in progress'
                  : userLocation.isRealLocation
                    ? 'Live GPS location'
                    : 'Demo location • Kelambakkam'}
              </div>
            </Popup>
          </Marker>
        )}

        {/* ====================================================
            SHELTERS
            ==================================================== */}

        {shelters.map(
          (shelter) => {
            const position =
              getLatLng(
                shelter.coordinates
              );

            if (!position) {
              return null;
            }

            const isSelected =
              shelter.id ===
              selectedShelterId;

            return (
              <Marker
                key={shelter.id}
                position={position}
                icon={createShelterIcon(
                  isSelected
                )}
                eventHandlers={{
                  click: () =>
                    onSelectShelter(
                      shelter
                    ),
                }}
              >
                <Popup>
                  <div className="min-w-[210px]">
                    <div className="font-bold text-slate-900">
                      {shelter.name}
                    </div>

                    <div className="mt-1 text-xs text-slate-600">
                      {shelter.address}
                    </div>

                    <div className="mt-2 text-xs text-slate-700">
                      Shelter ID:{' '}
                      {shelter.id}
                    </div>

                    <div className="mt-1 text-xs text-slate-700">
                      Available:{' '}
                      {shelter.capacityTotal -
                        shelter.capacityOccupied}
                    </div>

                    {isSelected && (
                      <div className="mt-2 text-xs font-black text-teal-700">
                        SAFEST SELECTED SHELTER
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          }
        )}

        {/* ====================================================
            FLOOD HAZARD
            ==================================================== */}

        {hazardLatLng &&
          activeHazard && (
            <>
              <Circle
                center={
                  hazardLatLng
                }
                radius={
                  Math.max(
                    Number(
                      activeHazard.hazardRadius
                    ) || 100,
                    100
                  ) * 2
                }
                pathOptions={{
                  color: '#ef4444',
                  weight: 3,
                  opacity: 0.9,
                  fillColor:
                    '#ef4444',
                  fillOpacity: 0.18,
                  dashArray:
                    '9 7',
                }}
              />

              <Marker
                position={
                  hazardLatLng
                }
                icon={
                  hazardIcon
                }
              >
                <Popup>
                  <div className="font-bold text-red-700">
                    <AlertTriangle className="inline w-4 h-4 mr-1" />
                    Flood-Risk Corridor
                  </div>

                  <div className="mt-1 text-xs text-slate-600">
                    Unsafe route section
                    detected.
                  </div>

                  <div className="mt-2 text-xs font-bold text-amber-700">
                    Safest route updated
                  </div>
                </Popup>
              </Marker>
            </>
          )}
      </MapContainer>

      {/* ======================================================
          TOP-LEFT STATUS
          ====================================================== */}

      <div className="absolute left-3 top-4 z-[1000] flex items-center gap-2 bg-[#0F172A]/95 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-700 shadow-lg pointer-events-none">
        <Compass
          className={`w-4 h-4 ${
            userLocation.isRealLocation
              ? 'text-teal-400'
              : 'text-amber-400'
          }`}
        />

        <span className="font-mono text-[10px] tracking-wider text-slate-200">
          {userLocation.isRealLocation
            ? `LIVE GPS • ±${Math.round(
                userLocation.accuracy ??
                  5
              )}m`
            : 'DEMO LOCATION • KELAMBAKKAM'}
        </span>
      </div>

      {/* ======================================================
          ROUTE STATUS
          ====================================================== */}

      <div className="absolute left-3 top-[62px] z-[1000] bg-[#0F172A]/95 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-700 shadow-lg pointer-events-none">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{
              backgroundColor:
                routeColor,
              boxShadow:
                `0 0 12px ${routeColor}`,
            }}
          />

          <span className="text-[10px] font-bold tracking-wider text-slate-100">
            {activeRoute.isAlternative ||
            activeHazard
              ? 'REROUTED SAFE PATH'
              : 'SAFEST EVACUATION ROUTE'}
          </span>
        </div>
      </div>

      {/* ======================================================
          MAP CONTROLS
          ====================================================== */}

      <div className="absolute right-3 top-4 z-[1000] flex flex-col gap-2">
        {/* Recenter */}
        <button
          id="btn-recenter"
          type="button"
          onClick={
            recenterOnUser
          }
          className="w-11 h-11 bg-[#0F172A]/95 hover:bg-[#1E293B] text-teal-400 border border-teal-500/40 rounded-xl shadow-lg flex items-center justify-center transition-all active:scale-95"
          title="Recenter on my position"
          aria-label="Recenter on my position"
        >
          <Locate className="w-5 h-5" />
        </button>

        {/* Zoom in */}
        <button
          id="btn-zoom-in"
          type="button"
          onClick={zoomIn}
          className="w-11 h-11 bg-[#0F172A]/95 hover:bg-[#1E293B] text-slate-200 border border-slate-700 rounded-xl shadow-lg flex items-center justify-center transition-all active:scale-95"
          title="Zoom in"
          aria-label="Zoom in"
        >
          <Plus className="w-5 h-5" />
        </button>

        {/* Zoom out */}
        <button
          id="btn-zoom-out"
          type="button"
          onClick={zoomOut}
          className="w-11 h-11 bg-[#0F172A]/95 hover:bg-[#1E293B] text-slate-200 border border-slate-700 rounded-xl shadow-lg flex items-center justify-center transition-all active:scale-95"
          title="Zoom out"
          aria-label="Zoom out"
        >
          <Minus className="w-5 h-5" />
        </button>

        {/* Reset */}
        <button
          id="btn-reset-view"
          type="button"
          onClick={resetView}
          className="w-11 h-11 bg-[#0F172A]/95 hover:bg-[#1E293B] text-slate-300 hover:text-white border border-slate-700 rounded-xl shadow-lg flex items-center justify-center transition-all active:scale-95"
          title="Reset map view"
          aria-label="Reset map view"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* ======================================================
          PROVIDER BADGE
          ====================================================== */}

      <div className="absolute bottom-3 right-3 z-[1000] bg-[#0F172A]/90 backdrop-blur-md px-3 py-1.5 rounded-md border border-slate-700 pointer-events-none">
        <span className="text-[9px] font-mono tracking-wider text-slate-400">
          KELAMBAKKAM • OPENSTREETMAP
        </span>
      </div>
    </div>
  );
};