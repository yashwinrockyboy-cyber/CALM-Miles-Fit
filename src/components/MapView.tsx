import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  MapContainer,
  TileLayer,
  Polyline,
  Circle,
  Marker,
  Popup,
  useMap
} from 'react-leaflet';
import L from 'leaflet';
import {
  ShieldAlert,
  ShieldCheck,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  LocateFixed,
  ArrowUp,
  CornerUpRight,
  CornerUpLeft,
  Flag,
  X,
  School,
  Compass
} from 'lucide-react';
import {
  Landmark,
  MobilityMode,
  RouteOption,
  LiveLocation,
  NavProgress,
  RouteStep
} from '../types';
import { SAFE_HUBS } from '../data/safetyHubs';
import { AVOIDED_CRIME_ZONES } from '../data/crimeZones';
import {
  distanceMeters,
  calculateBearing,
  calculateRemainingDistanceKm
} from '../utils/routing';
import { speechSpeaker } from '../utils/speech';

const TRICHY_CENTER: [number, number] = [10.8038, 78.6719];
const TRICHY_ZOOM = 14;

// Custom Marker for Ambulance and Hospital Safe Hubs
const IconAmbulanceHub = L.divIcon({
  className: 'bg-transparent border-0',
  html: `
    <div class="relative flex flex-col items-center group cursor-pointer filter drop-shadow-md">
      <div class="w-8 h-8 rounded-2xl bg-gradient-to-tr from-rose-600 to-red-600 text-white shadow-xl border-2 border-white flex items-center justify-center font-bold text-xs ring-4 ring-rose-500/30">
        🚑
      </div>
      <div class="w-2.5 h-2.5 bg-red-600 rotate-45 -mt-1 border-r-2 border-b-2 border-white"></div>
    </div>
  `,
  iconSize: [34, 40],
  iconAnchor: [17, 38],
  popupAnchor: [0, -36]
});

const IconOrigin = L.divIcon({
  className: 'bg-transparent border-0',
  html: `
    <div class="relative flex flex-col items-center group cursor-pointer filter drop-shadow-md">
      <div class="w-9 h-9 rounded-2xl bg-gradient-to-tr from-cyan-600 to-teal-500 text-white shadow-xl border-2 border-white flex items-center justify-center font-black text-xs ring-4 ring-cyan-500/30">
        A
      </div>
      <div class="w-2.5 h-2.5 bg-teal-500 rotate-45 -mt-1 border-r-2 border-b-2 border-white"></div>
    </div>
  `,
  iconSize: [36, 44],
  iconAnchor: [18, 42],
  popupAnchor: [0, -40]
});

const IconDestination = L.divIcon({
  className: 'bg-transparent border-0',
  html: `
    <div class="relative flex flex-col items-center group cursor-pointer filter drop-shadow-md">
      <div class="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-xl border-2 border-white flex items-center justify-center font-black text-xs ring-4 ring-indigo-500/30">
        B
      </div>
      <div class="w-2.5 h-2.5 bg-violet-600 rotate-45 -mt-1 border-r-2 border-b-2 border-white"></div>
    </div>
  `,
  iconSize: [36, 44],
  iconAnchor: [18, 42],
  popupAnchor: [0, -40]
});

const IconSafeHub = L.divIcon({
  className: 'bg-transparent border-0',
  html: `
    <div class="w-6 h-6 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 border-2 border-white shadow-md flex items-center justify-center text-white text-[11px] font-bold ring-2 ring-emerald-500/20">
      🛡️
    </div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

function createNavIcon(bearingDeg: number): L.DivIcon {
  return L.divIcon({
    className: 'bg-transparent border-0',
    html: `
      <div class="relative flex items-center justify-center" style="width: 44px; height: 44px;">
        <div class="absolute inset-0 rounded-full bg-cyan-500/30 animate-ping"></div>
        <div style="transform: rotate(${bearingDeg}deg);" class="absolute -top-3 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[14px] border-b-indigo-700 drop-shadow-md"></div>
        <div class="relative w-8 h-8 rounded-full bg-indigo-700 border-2 border-white shadow-xl flex items-center justify-center text-white ring-4 ring-indigo-500/30">
          <div class="w-2 h-2 rounded-full bg-white"></div>
        </div>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22]
  });
}

function MapViewController({
  from,
  to,
  routes,
  selectedRouteId,
  isNavigating,
  navPosition,
  autoCenterNav
}: {
  from: Landmark | null;
  to: Landmark | null;
  routes: RouteOption[];
  selectedRouteId: string | null;
  isNavigating: boolean;
  navPosition: [number, number] | null;
  autoCenterNav: boolean;
}) {
  const map = useMap();
  const prevBoundsRef = useRef<string>('');

  useEffect(() => {
    if (isNavigating && navPosition && autoCenterNav) {
      map.panTo(navPosition, { animate: true, duration: 0.5 });
      return;
    }

    if (routes.length > 0) {
      const active = routes.find((r) => r.id === selectedRouteId) || routes[0];
      if (active && active.geometry.length > 1) {
        const bounds = L.latLngBounds(active.geometry.map((p) => [p[0], p[1]]));
        const key = `${bounds.getSouthWest().toString()}-${bounds.getNorthEast().toString()}`;
        if (key !== prevBoundsRef.current) {
          prevBoundsRef.current = key;
          map.fitBounds(bounds, { padding: [60, 60], maxZoom: 16 });
        }
        return;
      }
    }

    if (from && to) {
      const bounds = L.latLngBounds([
        [from.lat, from.lon],
        [to.lat, to.lon]
      ]);
      const key = `${bounds.getSouthWest().toString()}-${bounds.getNorthEast().toString()}`;
      if (key !== prevBoundsRef.current) {
        prevBoundsRef.current = key;
        map.fitBounds(bounds, { padding: [60, 60], maxZoom: 16 });
      }
    } else if (from) {
      map.setView([from.lat, from.lon], 15, { animate: true });
    } else if (to) {
      map.setView([to.lat, to.lon], 15, { animate: true });
    }
  }, [from, to, routes, selectedRouteId, isNavigating, navPosition, autoCenterNav, map]);

  return null;
}

interface MapViewProps {
  from: Landmark | null;
  to: Landmark | null;
  vehicle: MobilityMode;
  routes: RouteOption[];
  selectedRouteId: string | null;
  onSelectRoute: (id: string) => void;
  isDarkMode: boolean;
  liveLocation?: LiveLocation | null;
  isNavigating: boolean;
  onStopNavigation: () => void;
  onUpdateNavProgress?: (prog: NavProgress) => void;
  onOpenAmbulance?: () => void;
}

export const MapView: React.FC<MapViewProps> = ({
  from,
  to,
  vehicle,
  routes,
  selectedRouteId,
  onSelectRoute,
  isDarkMode,
  liveLocation,
  isNavigating,
  onStopNavigation,
  onUpdateNavProgress,
  onOpenAmbulance
}) => {
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
  const [showSafetyZones, setShowSafetyZones] = useState<boolean>(true);
  const [isVoiceMuted, setIsVoiceMuted] = useState<boolean>(false);
  const [autoCenterNav, setAutoCenterNav] = useState<boolean>(true);

  const [currentNavPos, setCurrentNavPos] = useState<[number, number] | null>(null);
  const [currentBearing, setCurrentBearing] = useState<number>(0);
  const [breadcrumbs, setBreadcrumbs] = useState<[number, number][]>([]);
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [remainingKm, setRemainingKm] = useState<number>(0);
  const [remainingMinutes, setRemainingMinutes] = useState<number>(0);

  const activeRoute = useMemo(
    () => routes.find((r) => r.id === selectedRouteId) || routes[0] || null,
    [routes, selectedRouteId]
  );

  const alternateRoutes = useMemo(
    () => routes.filter((r) => r.id !== activeRoute?.id),
    [routes, activeRoute]
  );

  // Initialize or reset navigation state
  useEffect(() => {
    if (isNavigating && activeRoute && activeRoute.geometry.length > 0) {
      const startPoint = activeRoute.geometry[0];
      setCurrentNavPos(startPoint);
      setBreadcrumbs([startPoint]);
      setCurrentStepIdx(0);
      setRemainingKm(activeRoute.distanceKm);
      setRemainingMinutes(activeRoute.durationMinutes);

      if (activeRoute.geometry.length > 1) {
        const nextPt = activeRoute.geometry[1];
        setCurrentBearing(
          calculateBearing(startPoint[0], startPoint[1], nextPt[0], nextPt[1])
        );
      }

      const initialInstruction =
        activeRoute.steps?.[0]?.instruction ||
        `Follow ${activeRoute.summary} towards ${to?.name || 'Destination'}`;

      if (!isVoiceMuted) {
        speechSpeaker.speak(initialInstruction);
      }
    } else {
      setCurrentNavPos(null);
      setBreadcrumbs([]);
      setCurrentStepIdx(0);
      speechSpeaker.stop();
    }
  }, [isNavigating, activeRoute, to, isVoiceMuted]);

  // Simulation step advance or real GPS update
  const simIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isNavigating || !activeRoute || activeRoute.geometry.length < 2) {
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
      return;
    }

    let geomIndex = 0;
    const geom = activeRoute.geometry;
    const totalPoints = geom.length;
    const speedMs = vehicle === 'cycle' ? 1200 : 2000;

    simIntervalRef.current = window.setInterval(() => {
      geomIndex += 1;
      if (geomIndex >= totalPoints) {
        if (simIntervalRef.current) clearInterval(simIntervalRef.current);
        if (!isVoiceMuted) {
          speechSpeaker.speak('You have arrived safely at your destination!');
        }
        onStopNavigation();
        return;
      }

      const prev = geom[geomIndex - 1];
      const curr = geom[geomIndex];
      const bearing = calculateBearing(prev[0], prev[1], curr[0], curr[1]);

      setCurrentNavPos(curr);
      setCurrentBearing(bearing);
      setBreadcrumbs((prevTrail) => [...prevTrail, curr]);

      const remKm = calculateRemainingDistanceKm(curr, geom);
      const speedKmh = vehicle === 'cycle' ? 14 : 4.5;
      const remMin = Math.max(1, Math.round((remKm / speedKmh) * 60));

      setRemainingKm(remKm);
      setRemainingMinutes(remMin);

      // Determine current step
      if (activeRoute.steps && activeRoute.steps.length > 0) {
        const estStep = Math.min(
          Math.floor((geomIndex / totalPoints) * activeRoute.steps.length),
          activeRoute.steps.length - 1
        );
        if (estStep !== currentStepIdx) {
          setCurrentStepIdx(estStep);
          const stepInstruction = activeRoute.steps[estStep]?.instruction;
          if (stepInstruction && !isVoiceMuted) {
            speechSpeaker.speak(stepInstruction);
          }
        }
      }

      if (onUpdateNavProgress) {
        onUpdateNavProgress({
          remainingKm: remKm,
          remainingMinutes: remMin,
          distanceTraveledKm: Math.max(0, activeRoute.distanceKm - remKm),
          currentPos: curr
        });
      }
    }, speedMs);

    return () => {
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    };
  }, [isNavigating, activeRoute, vehicle, isVoiceMuted, currentStepIdx, onStopNavigation, onUpdateNavProgress]);

  const navIcon = useMemo(() => createNavIcon(currentBearing), [currentBearing]);

  const handleToggleVoice = useCallback(() => {
    setIsVoiceMuted((prev) => {
      const next = !prev;
      if (next) speechSpeaker.stop();
      return next;
    });
  }, []);

  const handleCenterMap = useCallback(() => {
    if (!mapInstance) return;
    if (isNavigating && currentNavPos) {
      mapInstance.setView(currentNavPos, 16, { animate: true });
    } else if (from && to) {
      const b = L.latLngBounds([
        [from.lat, from.lon],
        [to.lat, to.lon]
      ]);
      mapInstance.fitBounds(b, { padding: [50, 50] });
    } else if (from) {
      mapInstance.setView([from.lat, from.lon], 15, { animate: true });
    } else if (to) {
      mapInstance.setView([to.lat, to.lon], 15, { animate: true });
    } else {
      mapInstance.setView(TRICHY_CENTER, TRICHY_ZOOM, { animate: true });
    }
  }, [mapInstance, isNavigating, currentNavPos, from, to]);

  const step: RouteStep | undefined = activeRoute?.steps?.[currentStepIdx];
  const nextStep: RouteStep | undefined = activeRoute?.steps?.[currentStepIdx + 1];

  const renderStepIcon = (s?: RouteStep) => {
    const text = (s?.instruction || '').toLowerCase();
    if (text.includes('left')) return <CornerUpLeft className="w-5 h-5 text-white" />;
    if (text.includes('right')) return <CornerUpRight className="w-5 h-5 text-white" />;
    if (text.includes('arrive') || text.includes('destination')) return <Flag className="w-5 h-5 text-white" />;
    return <ArrowUp className="w-5 h-5 text-white" />;
  };

  return (
    <div className="relative w-full h-full min-h-[420px] rounded-3xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900">
      <MapContainer
        center={TRICHY_CENTER}
        zoom={TRICHY_ZOOM}
        className={`w-full h-full z-10 ${
          isDarkMode
            ? '[&_.leaflet-tile-pane]:invert [&_.leaflet-tile-pane]:hue-rotate-180 [&_.leaflet-tile-pane]:brightness-[0.88] [&_.leaflet-tile-pane]:contrast-[0.95]'
            : ''
        }`}
        ref={setMapInstance}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {showSafetyZones && (
          <>
            {AVOIDED_CRIME_ZONES.map((zone, idx) => (
              <Circle
                key={`risk-${idx}`}
                center={[zone.lat, zone.lon]}
                radius={zone.radiusMeters}
                pathOptions={{
                  color: '#f43f5e',
                  fillColor: '#f43f5e',
                  fillOpacity: 0.14,
                  weight: 2,
                  dashArray: '4, 6'
                }}
              >
                <Popup>
                  <div className="p-1 space-y-1 text-xs">
                    <div className="flex items-center gap-1 font-bold text-rose-600">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Avoided Congestion / Risk Zone</span>
                    </div>
                    <p className="font-semibold text-slate-800">{zone.name}</p>
                    <p className="text-[11px] text-slate-500">{zone.reason}</p>
                  </div>
                </Popup>
              </Circle>
            ))}

            {SAFE_HUBS.map((hub) => {
              const isAmbulanceOrHospital = hub.type === 'hospital' || !!hub.phone;
              return (
                <Marker
                  key={hub.id}
                  position={[hub.lat, hub.lon]}
                  icon={isAmbulanceOrHospital ? IconAmbulanceHub : IconSafeHub}
                >
                  <Popup>
                    <div className="p-1.5 text-xs space-y-1.5 min-w-[170px]">
                      <div className="flex items-center gap-1">
                        {isAmbulanceOrHospital ? (
                          <span className="text-rose-600 font-black text-xs flex items-center gap-1">
                            <span>🚑 Ambulance & Medical Hub</span>
                          </span>
                        ) : (
                          <span className="text-emerald-700 font-bold flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>{hub.type}</span>
                          </span>
                        )}
                      </div>
                      <p className="font-bold text-slate-800">{hub.name}</p>
                      <p className="text-[11px] text-slate-600 leading-tight">{hub.description}</p>
                      {hub.phone && (
                        <div className="pt-1.5 border-t border-slate-200">
                          <a
                            href={`tel:${hub.phone}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs"
                          >
                            <span>📞 Call {hub.phone}</span>
                          </a>
                        </div>
                      )}
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </>
        )}

        <MapViewController
          from={from}
          to={to}
          routes={routes}
          selectedRouteId={selectedRouteId}
          isNavigating={isNavigating}
          navPosition={currentNavPos}
          autoCenterNav={autoCenterNav}
        />

        {/* Live GPS location pulse */}
        {liveLocation && !isNavigating && (
          <Circle
            center={[liveLocation.lat, liveLocation.lon]}
            radius={Math.max(15, liveLocation.accuracy || 25)}
            pathOptions={{
              color: '#06b6d4',
              fillColor: '#06b6d4',
              fillOpacity: 0.22,
              weight: 2
            }}
          >
            <Popup>
              <span className="text-xs font-bold text-cyan-700">Your Current GPS Location</span>
            </Popup>
          </Circle>
        )}

        {/* Active Route Polylines */}
        {activeRoute && (
          <>
            {/* Soft luminous casing */}
            <Polyline
              key={`casing-${activeRoute.id}`}
              positions={activeRoute.geometry}
              pathOptions={{
                color: isDarkMode ? '#1e1b4b' : '#c7d2fe',
                weight: 9,
                opacity: 0.65,
                lineCap: 'round',
                lineJoin: 'round'
              }}
            />
            {/* Main vibrant path */}
            <Polyline
              key={`active-${activeRoute.id}`}
              positions={activeRoute.geometry}
              pathOptions={{
                color: '#6366f1',
                weight: 5,
                opacity: 0.98,
                lineCap: 'round',
                lineJoin: 'round'
              }}
            />
          </>
        )}

        {/* Alternative route polylines */}
        {alternateRoutes.map((alt) => (
          <Polyline
            key={alt.id}
            positions={alt.geometry}
            pathOptions={{
              color: isDarkMode ? '#475569' : '#94a3b8',
              weight: 4,
              opacity: 0.65,
              dashArray: '5, 8',
              lineCap: 'round'
            }}
            eventHandlers={{
              click: () => onSelectRoute(alt.id)
            }}
          />
        ))}

        {/* Breadcrumbs trail */}
        {isNavigating && breadcrumbs.length > 1 && (
          <Polyline
            positions={breadcrumbs}
            pathOptions={{
              color: '#06b6d4',
              weight: 5,
              opacity: 0.95,
              lineCap: 'round'
            }}
          />
        )}

        {/* Origin & Destination markers */}
        {from && !isNavigating && (
          <Marker
            position={[from.lat, from.lon]}
            icon={IconOrigin}
          >
            <Popup>
              <div className="text-xs">
                <span className="font-bold text-cyan-800 block">Start Point</span>
                <span className="text-slate-800">{from.name}</span>
              </div>
            </Popup>
          </Marker>
        )}

        {to && (
          <Marker
            position={[to.lat, to.lon]}
            icon={IconDestination}
          >
            <Popup>
              <div className="text-xs">
                <span className="font-bold text-indigo-700 block">Destination</span>
                <span className="text-slate-800">{to.name}</span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Live navigating position marker */}
        {isNavigating && currentNavPos && (
          <Marker position={currentNavPos} icon={navIcon} zIndexOffset={1200} />
        )}
      </MapContainer>

      {/* Floating control buttons (Clean 2D Map - 3D option removed) */}
      <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-2">
        {onOpenAmbulance && (
          <button
            type="button"
            onClick={onOpenAmbulance}
            className="p-2.5 rounded-2xl border border-rose-500 bg-rose-600 hover:bg-rose-500 text-white shadow-lg transition-transform active:scale-95 cursor-pointer flex items-center justify-center ring-2 ring-rose-400/30"
            title="Emergency Ambulance Directory (108)"
          >
            <span className="text-sm">🚑</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setShowSafetyZones((v) => !v)}
          className={`p-2.5 rounded-2xl border shadow-md backdrop-blur-md transition-all cursor-pointer ${
            showSafetyZones
              ? 'bg-indigo-600 text-white border-indigo-500 shadow-indigo-600/30'
              : 'bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
          }`}
          title="Toggle Safe Corridors"
        >
          {showSafetyZones ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </button>

        <button
          type="button"
          onClick={handleToggleVoice}
          className={`p-2.5 rounded-2xl border shadow-md backdrop-blur-md transition-all cursor-pointer ${
            isVoiceMuted
              ? 'bg-rose-600 text-white border-rose-500 shadow-rose-600/30'
              : 'bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
          }`}
          title={isVoiceMuted ? 'Unmute Directions' : 'Mute Voice Directions'}
        >
          {isVoiceMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        <button
          type="button"
          onClick={handleCenterMap}
          className="p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 shadow-md backdrop-blur-md hover:bg-white transition-all cursor-pointer"
          title="Center Map"
        >
          <LocateFixed className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation In-Progress HUD */}
      {isNavigating && (
        <div className="absolute inset-x-3 bottom-3 z-[1000] pointer-events-none">
          <div className="pointer-events-auto bg-slate-900/95 backdrop-blur-lg border border-slate-800 text-white p-4 rounded-3xl shadow-2xl space-y-3 max-w-lg mx-auto">
            {/* Top row */}
            <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-indigo-600 flex items-center justify-center shrink-0 shadow-md">
                  {renderStepIcon(step)}
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400 block">
                    Next Direction
                  </span>
                  <h3 className="text-sm font-bold text-white leading-tight truncate">
                    {step?.instruction || 'Continue along route'}
                  </h3>
                  {nextStep && (
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      Then: {nextStep.instruction}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <a
                  href="tel:108"
                  className="px-2.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs transition-colors flex items-center gap-1 shadow-md cursor-pointer"
                  title="Emergency: Call 108 Ambulance"
                >
                  <span>🚑 108</span>
                </a>
                <button
                  type="button"
                  onClick={onStopNavigation}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                  title="Exit Navigation"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-2 rounded-xl bg-slate-800/80">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Remaining
                </span>
                <span className="text-base font-black font-mono text-cyan-400">
                  {remainingKm.toFixed(1)} km
                </span>
              </div>

              <div className="p-2 rounded-xl bg-slate-800/80">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Time Left
                </span>
                <span className="text-base font-black font-mono text-amber-400">
                  {remainingMinutes} min
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Clean Bottom legend */}
      {!isNavigating && (
        <div className="absolute bottom-3 left-3 z-[1000] hidden sm:flex items-center gap-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            <span className="font-bold text-slate-700 dark:text-slate-300">CALM-Miles Route</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs">🚑</span>
            <span className="text-slate-600 dark:text-slate-400 font-medium">Ambulance Hub</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="text-slate-600 dark:text-slate-400">Avoided Hotspot</span>
          </div>
        </div>
      )}
    </div>
  );
};
