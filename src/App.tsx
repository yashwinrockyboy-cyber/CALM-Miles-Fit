/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ShieldCheck,
  Navigation,
  Sun,
  Moon,
  ArrowUpDown,
  LoaderCircle,
  TriangleAlert,
  School,
  Bus,
  Train,
  Landmark as LandmarkIcon,
  LogIn,
  X,
  Compass,
  Trophy,
  Flame,
  ChevronDown,
  ChevronUp,
  MapPin,
  PhoneCall,
  HeartPulse,
  Sparkles
} from 'lucide-react';
import {
  Landmark,
  MobilityMode,
  RouteOption,
  LiveLocation,
  UserProfile,
  RecentRoute,
  VehicleComparison,
  NavProgress,
  CustomRoutePlan,
  Badge
} from './types';
import { TRICHY_LANDMARKS } from './data/landmarks';
import { MapView } from './components/MapView';
import { PlaceAutocomplete } from './components/PlaceAutocomplete';
import { VehicleToggle } from './components/VehicleToggle';
import { RouteCards } from './components/RouteCards';
import { Leaderboard } from './components/Leaderboard';
import { CaloriePlanner } from './components/CaloriePlanner';
import { AuthModal } from './components/AuthModal';
import { ProfileModal } from './components/ProfileModal';
import { RecentRoutes } from './components/RecentRoutes';
import { AmbulanceModal } from './components/AmbulanceModal';
import { AchievementPhotoModal } from './components/AchievementPhotoModal';
import {
  fetchBothVehicleRoutes,
  calculateVehicleComparisons,
  reverseGeocode
} from './utils/routing';
import {
  getRecentRoutes,
  saveRecentRoute,
  clearRecentRoutes,
  getUserProfile,
  logCompletedTrip
} from './utils/storage';
import { speechSpeaker } from './utils/speech';

export function App() {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return (
      localStorage.getItem('calm_miles_dark_mode') === 'true' ||
      window.matchMedia('(prefers-color-scheme: dark)').matches
    );
  });

  const [activeTab, setActiveTab] = useState<'route' | 'fitness' | 'leaderboard' | 'profile'>('route');

  // Navigation & Origin/Destination State
  const [from, setFrom] = useState<Landmark | null>(null);
  const [to, setTo] = useState<Landmark | null>(TRICHY_LANDMARKS[0]); // Default to Central Bus Stand
  const [vehicle, setVehicle] = useState<MobilityMode>('cycle');

  // Quick destinations expander
  const [showMoreDestinations, setShowMoreDestinations] = useState<boolean>(false);

  // Routes & Calculation State
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [isLoadingRoutes, setIsLoadingRoutes] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [distances, setDistances] = useState<{ cycleKm: number; walkKm: number }>({
    cycleKm: 0,
    walkKm: 0
  });
  const [comparisons, setComparisons] = useState<VehicleComparison[]>([]);

  // Live Location State
  const [liveLocation, setLiveLocation] = useState<LiveLocation | null>(null);
  const [isLocatingFrom, setIsLocatingFrom] = useState<boolean>(false);
  const [isLiveTracking, setIsLiveTracking] = useState<boolean>(true);

  // Turn-by-Turn In-Progress Navigation State
  const [isNavigating, setIsNavigating] = useState<boolean>(false);

  // User Profile & Authentication State
  const [userProfile, setUserProfile] = useState<UserProfile>(getUserProfile());
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [showAmbulanceModal, setShowAmbulanceModal] = useState<boolean>(false);
  const [unlockedAchievementForModal, setUnlockedAchievementForModal] = useState<Badge | null>(null);

  // History & Toast State
  const [recentRoutes, setRecentRoutes] = useState<RecentRoute[]>(getRecentRoutes());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const watchIdRef = useRef<number | null>(null);

  // Toggle Dark Mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('calm_miles_dark_mode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('calm_miles_dark_mode', 'false');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  // Continuous Geolocation Watcher
  useEffect(() => {
    if (!navigator.geolocation) return;

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setLiveLocation({
          lat: latitude,
          lon: longitude,
          accuracy
        });
      },
      (err) => {
        console.warn('Geolocation watch error:', err.message);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 15000
      }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // Initial setup: locate user and default route
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude, accuracy } = pos.coords;
          setLiveLocation({ lat: latitude, lon: longitude, accuracy });
          try {
            const address = await reverseGeocode(latitude, longitude);
            const userPos: Landmark = {
              name: 'My Location',
              displayName: address,
              lat: latitude,
              lon: longitude,
              category: 'current-location'
            };
            setFrom(userPos);
            calculateRoutes(userPos, TRICHY_LANDMARKS[0], 'cycle', false);
          } catch {
            const userPos: Landmark = {
              name: 'My Location',
              displayName: `GPS (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
              lat: latitude,
              lon: longitude,
              category: 'current-location'
            };
            setFrom(userPos);
            calculateRoutes(userPos, TRICHY_LANDMARKS[0], 'cycle', false);
          }
        },
        () => {
          // If denied, fallback to Trichy Junction -> Central Bus Stand
          const defaultOrigin = TRICHY_LANDMARKS[1]; // Trichy Junction Railway Station
          const defaultDest = TRICHY_LANDMARKS[0]; // Central Bus Stand
          setFrom(defaultOrigin);
          calculateRoutes(defaultOrigin, defaultDest, 'cycle', false);
        },
        { timeout: 7000 }
      );
    } else {
      const defaultOrigin = TRICHY_LANDMARKS[1];
      const defaultDest = TRICHY_LANDMARKS[0];
      setFrom(defaultOrigin);
      calculateRoutes(defaultOrigin, defaultDest, 'cycle', false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Main Route Calculation
  const calculateRoutes = useCallback(
    async (
      origin: Landmark,
      dest: Landmark,
      mobility: MobilityMode,
      recordHistory = true
    ) => {
      setIsLoadingRoutes(true);
      setErrorMessage(null);

      try {
        const { cycleRoutes, walkRoutes, cycleKm, walkKm } = await fetchBothVehicleRoutes(origin, dest);
        const options = mobility === 'cycle' ? cycleRoutes : walkRoutes;

        setDistances({ cycleKm, walkKm });
        setComparisons(
          calculateVehicleComparisons(cycleKm, walkKm, origin.category === 'current-location')
        );

        if (options.length === 0) {
          setErrorMessage('Could not calculate safe route between these locations.');
          setRoutes([]);
          setSelectedRouteId(null);
        } else {
          setRoutes(options);
          const defaultSelected = options.find((r: RouteOption) => r.isSafest) || options[0];
          setSelectedRouteId(defaultSelected.id);

          if (recordHistory) {
            const distance = mobility === 'cycle' ? cycleKm : walkKm;
            const newRec: RecentRoute = {
              id: `rec-${Date.now()}`,
              from: origin,
              to: dest,
              vehicle: mobility,
              timestamp: Date.now(),
              distanceKm: distance,
              durationMinutes: defaultSelected.durationMinutes,
              safetyScore: defaultSelected.safetyProfile.safetyScore
            };
            const updatedRecs = saveRecentRoute(newRec);
            setRecentRoutes(updatedRecs);
          }
        }
      } catch (err: unknown) {
        console.error(err);
        setErrorMessage('Failed to calculate route. Please try again.');
      } finally {
        setIsLoadingRoutes(false);
      }
    },
    []
  );

  const handleUpdateNavProgress = useCallback(
    (progress: NavProgress) => {
      const remKm = progress.remainingKm;
      const isCycle = vehicle === 'cycle';
      const cKm = isCycle ? remKm : Math.max(0.1, remKm * 1.07);
      const wKm = isCycle ? Math.max(0.1, remKm * 0.93) : remKm;

      setDistances({ cycleKm: cKm, walkKm: wKm });
      setComparisons(calculateVehicleComparisons(cKm, wKm, true));
    },
    [vehicle]
  );

  // Quick 1-Click Destination buttons
  const handleSetQuickDestination = (destName: string) => {
    const destination = TRICHY_LANDMARKS.find((lm) => lm.name === destName) || TRICHY_LANDMARKS[0];
    setTo(destination);

    if (liveLocation) {
      const myCurrentLoc: Landmark = {
        name: 'My Location',
        displayName: `GPS (${liveLocation.lat.toFixed(4)}, ${liveLocation.lon.toFixed(4)})`,
        lat: liveLocation.lat,
        lon: liveLocation.lon,
        category: 'current-location'
      };
      setFrom(myCurrentLoc);
      calculateRoutes(myCurrentLoc, destination, vehicle, true);
    } else if (from) {
      calculateRoutes(from, destination, vehicle, true);
    } else {
      const defaultFrom = destination.name === 'Central Bus Stand'
        ? TRICHY_LANDMARKS[0]
        : TRICHY_LANDMARKS[1];
      setFrom(defaultFrom);
      calculateRoutes(defaultFrom, destination, vehicle, true);
    }
    setToastMessage(`Destination: ${destination.name}`);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setErrorMessage('Geolocation not supported.');
      return;
    }

    setIsLocatingFrom(true);
    setErrorMessage(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setLiveLocation({ lat: latitude, lon: longitude, accuracy });
        try {
          const address = await reverseGeocode(latitude, longitude);
          const place: Landmark = {
            name: 'My Location',
            displayName: address,
            lat: latitude,
            lon: longitude,
            category: 'current-location'
          };
          setFrom(place);
          if (to) calculateRoutes(place, to, vehicle, true);
        } catch {
          const place: Landmark = {
            name: 'My Location',
            displayName: `GPS (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
            lat: latitude,
            lon: longitude,
            category: 'current-location'
          };
          setFrom(place);
          if (to) calculateRoutes(place, to, vehicle, true);
        } finally {
          setIsLocatingFrom(false);
        }
      },
      () => {
        setIsLocatingFrom(false);
        setErrorMessage('Location permission denied.');
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const handleSwapPlaces = () => {
    const prevFrom = from;
    const prevTo = to;
    setFrom(prevTo);
    setTo(prevFrom);
    if (prevTo && prevFrom) {
      calculateRoutes(prevTo, prevFrom, vehicle, true);
    }
  };

  const handleSwitchVehicle = (newMode: MobilityMode) => {
    setVehicle(newMode);
    if (from && to) {
      calculateRoutes(from, to, newMode, true);
    }
  };

  const handleFindRouteSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!from || !to) {
      setErrorMessage('Please select start and destination.');
      return;
    }
    if (Math.abs(from.lat - to.lat) < 0.0001 && Math.abs(from.lon - to.lon) < 0.0001) {
      setErrorMessage('Start and destination are the same location.');
      return;
    }
    calculateRoutes(from, to, vehicle, true);
  };

  const handleSelectRecent = (rec: RecentRoute) => {
    setFrom(rec.from);
    setTo(rec.to);
    setVehicle(rec.vehicle);
    calculateRoutes(rec.from, rec.to, rec.vehicle, false);
  };

  const handleStartNav = () => {
    if (!routes || routes.length === 0) return;
    setIsNavigating(true);
    speechSpeaker.speak(`Navigation started on CALM-Miles.`);
    setToastMessage('Live Voice Directions Started');
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleStopNav = () => {
    setIsNavigating(false);
    speechSpeaker.stop();

    const active = routes.find((r) => r.id === selectedRouteId) || routes[0];
    if (active) {
      const result = logCompletedTrip(active.distanceKm, vehicle) as any;
      setUserProfile(result.updatedProfile);
      if (result.newlyUnlocked && result.newlyUnlocked.length > 0) {
        setUnlockedAchievementForModal(result.newlyUnlocked[0]);
      }
      setToastMessage(`Trip finished! +${active.caloriesBurned} cal`);
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  const handleApplyCustomRoute = (plan: CustomRoutePlan) => {
    setVehicle(plan.vehicle);
    setFrom(plan.startPoint);
    setTo(plan.endPoint);
    setRoutes([plan.routeOption]);
    setSelectedRouteId(plan.routeOption.id);

    const cKm = plan.vehicle === 'cycle' ? plan.targetDistanceKm : plan.targetDistanceKm * 1.05;
    const wKm = plan.vehicle === 'walk' ? plan.targetDistanceKm : plan.targetDistanceKm * 0.95;
    setDistances({ cycleKm: cKm, walkKm: wKm });
    setComparisons(calculateVehicleComparisons(cKm, wKm, true));

    setActiveTab('route');
    setToastMessage(`🚀 You can do it! Fitness route loaded (${plan.targetDistanceKm.toFixed(1)} km) on Map!`);
    setTimeout(() => setToastMessage(null), 3500);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAuthSuccess = (user: UserProfile) => {
    setUserProfile(user);
    setToastMessage(`Welcome, ${user.name}!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-indigo-100 dark:border-slate-800 px-4 lg:px-8 py-2.5 flex items-center justify-between gap-4 shadow-xs">
        {/* Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/25 ring-2 ring-indigo-400/30">
            <Compass className="w-5 h-5 text-white stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg sm:text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-600 dark:from-indigo-400 dark:via-violet-300 dark:to-cyan-400 bg-clip-text text-transparent">
                CALM-Miles
              </span>
              <span className="text-[10px] bg-gradient-to-r from-indigo-600 to-cyan-600 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shadow-2xs">
                Trichy
              </span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block -mt-0.5 font-medium">
              Safe Mobility · Trichy
            </span>
          </div>
        </div>

        {/* Clean Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5 text-xs font-bold bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setActiveTab('route')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'route'
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Route
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('leaderboard')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'leaderboard'
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Leaderboard
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('fitness')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'fitness'
                ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>Fitness · You Can Do It!</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Profile
          </button>
        </nav>

        {/* Actions Zone */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Emergency Ambulance Hotline Button */}
          <button
            type="button"
            onClick={() => setShowAmbulanceModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-black hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-all cursor-pointer shadow-2xs active:scale-95"
            title="Emergency Ambulance Hotline (108)"
          >
            <span className="text-sm">🚑</span>
            <span className="hidden sm:inline">Ambulance (108)</span>
          </button>

          {/* User Account / Sign In button */}
          <button
            type="button"
            onClick={() => {
              if (userProfile.isLoggedIn) {
                setActiveTab('profile');
              } else {
                setShowAuthModal(true);
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/70 dark:bg-slate-800 text-indigo-900 dark:text-indigo-200 text-xs font-bold hover:bg-indigo-100/70 transition-colors cursor-pointer"
            title={userProfile.isLoggedIn ? `Account: ${userProfile.email}` : 'Sign In'}
          >
            {userProfile.isLoggedIn ? (
              <>
                <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
                  {userProfile.name.charAt(0)}
                </div>
                <span className="hidden sm:inline truncate max-w-[90px]">{userProfile.name}</span>
              </>
            ) : (
              <>
                <LogIn className="w-3.5 h-3.5 text-indigo-600" />
                <span>Sign In</span>
              </>
            )}
          </button>

          {!isNavigating ? (
            <button
              type="button"
              onClick={handleStartNav}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Navigation className="w-3.5 h-3.5 fill-white" />
              <span>Navigate</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleStopNav}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Exit</span>
            </button>
          )}

          <button
            type="button"
            onClick={toggleDarkMode}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>
        </div>
      </header>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 text-white px-4 py-2 rounded-2xl shadow-xl text-xs font-bold border border-slate-700 flex items-center gap-2 animate-in fade-in duration-150">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Mobile Bottom Tab Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 p-1.5 flex justify-around shadow-lg">
        <button
          type="button"
          onClick={() => setActiveTab('route')}
          className={`flex flex-col items-center py-1 px-3 rounded-xl text-[10px] font-bold ${
            activeTab === 'route' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Route</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('leaderboard')}
          className={`flex flex-col items-center py-1 px-3 rounded-xl text-[10px] font-bold ${
            activeTab === 'leaderboard' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Ranks</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('fitness')}
          className={`flex flex-col items-center py-1 px-3 rounded-xl text-[10px] font-bold ${
            activeTab === 'fitness' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'
          }`}
        >
          <Flame className="w-4 h-4" />
          <span>Fitness</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center py-1 px-3 rounded-xl text-[10px] font-bold ${
            activeTab === 'profile' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'
          }`}
        >
          <School className="w-4 h-4" />
          <span>Profile</span>
        </button>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 lg:p-6 pb-20 md:pb-8">
        {activeTab === 'profile' && (
          <ProfileModal
            onProfileUpdated={setUserProfile}
            onOpenAuth={() => setShowAuthModal(true)}
          />
        )}

        {activeTab === 'leaderboard' && (
          <Leaderboard
            onGoToRoute={(mode) => {
              setVehicle(mode);
              setActiveTab('route');
            }}
          />
        )}

        {activeTab === 'fitness' && (
          <CaloriePlanner
            currentGpsPoint={from?.category === 'current-location' ? from : null}
            onApplyRoute={handleApplyCustomRoute}
          />
        )}

        {activeTab === 'route' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left Column: Route Planner */}
            <section className="lg:col-span-5 xl:col-span-5 space-y-4">
              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-sm space-y-4">
                {/* Emergency Ambulance Hotline Card */}
                <div className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-rose-50 to-red-50 dark:from-rose-950/40 dark:to-red-950/30 border border-rose-200 dark:border-rose-900/60 flex items-center justify-between gap-2 shadow-2xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 text-sm shadow-xs animate-pulse">
                      🚑
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-black text-rose-950 dark:text-rose-100">
                          Ambulance: 108
                        </span>
                        <span className="text-[9px] bg-rose-600 text-white px-1.5 py-0.2 rounded-full font-bold uppercase tracking-wider">
                          Free 24x7
                        </span>
                      </div>
                      <span className="text-[11px] text-rose-700 dark:text-rose-300 block truncate">
                        Tamil Nadu Rapid Emergency Dispatch
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setShowAmbulanceModal(true)}
                      className="text-[11px] px-2.5 py-1.5 rounded-xl border border-rose-300 dark:border-rose-800 bg-white dark:bg-slate-900 text-rose-700 dark:text-rose-300 font-bold hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title="View all ambulance contacts"
                    >
                      All Numbers
                    </button>
                    <a
                      href="tel:108"
                      className="text-xs px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-black flex items-center gap-1 shadow-xs transition-transform active:scale-95"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Call</span>
                    </a>
                  </div>
                </div>

                {/* Fitness Workout Callout: You Can Do It! */}
                <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-cyan-950/20 border border-emerald-300 dark:border-emerald-800 flex items-center justify-between gap-2 shadow-2xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center shrink-0 text-sm shadow-xs">
                      💪
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-black text-emerald-950 dark:text-emerald-100">
                          Fitness Workout Mode
                        </span>
                        <span className="text-[9px] bg-emerald-600 text-white px-1.5 py-0.2 rounded-full font-bold uppercase tracking-wider">
                          You Can Do It!
                        </span>
                      </div>
                      <span className="text-[11px] text-emerald-700 dark:text-emerald-300 block truncate">
                        Walking & cycling photo motivation, calorie goals & audio cheering
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab('fitness')}
                    className="text-xs px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black flex items-center gap-1 shadow-xs transition-transform active:scale-95 shrink-0 cursor-pointer"
                  >
                    <span>Open</span>
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  </button>
                </div>

                {/* 3 Quick Destinations + More Options */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Quick Destinations
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowMoreDestinations((v) => !v)}
                      className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span>{showMoreDestinations ? 'Hide More' : '+ More Options'}</span>
                      {showMoreDestinations ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {/* 3 Primary Quick Destinations */}
                  <div className="grid grid-cols-3 gap-2">
                    {/* 1. Central Bus Stand */}
                    <button
                      type="button"
                      onClick={() => handleSetQuickDestination('Central Bus Stand')}
                      className={`p-2.5 rounded-2xl border transition-all text-left flex flex-col gap-1.5 cursor-pointer shadow-2xs ${
                        to?.name === 'Central Bus Stand'
                          ? 'bg-cyan-50 dark:bg-cyan-950/60 border-cyan-400 dark:border-cyan-700 ring-2 ring-cyan-500/20'
                          : 'bg-cyan-50/60 dark:bg-cyan-950/30 border-cyan-200 dark:border-cyan-800/60 hover:bg-cyan-100/70'
                      }`}
                      title="Route to Central Bus Stand"
                    >
                      <div className="w-7 h-7 rounded-xl bg-cyan-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Bus className="w-3.5 h-3.5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-cyan-950 dark:text-cyan-100 block truncate">
                          Bus Stand
                        </span>
                        <span className="text-[10px] text-cyan-600 dark:text-cyan-400 block truncate">
                          Transit Hub
                        </span>
                      </div>
                    </button>

                    {/* 2. Trichy Junction Railway Station */}
                    <button
                      type="button"
                      onClick={() => handleSetQuickDestination('Trichy Junction Railway Station')}
                      className={`p-2.5 rounded-2xl border transition-all text-left flex flex-col gap-1.5 cursor-pointer shadow-2xs ${
                        to?.name === 'Trichy Junction Railway Station'
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-400 dark:border-indigo-700 ring-2 ring-indigo-500/20'
                          : 'bg-indigo-50/60 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800/60 hover:bg-indigo-100/70'
                      }`}
                      title="Route to Trichy Junction Railway Station"
                    >
                      <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Train className="w-3.5 h-3.5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-indigo-950 dark:text-indigo-100 block truncate">
                          Junction
                        </span>
                        <span className="text-[10px] text-indigo-600 dark:text-indigo-400 block truncate">
                          Railway
                        </span>
                      </div>
                    </button>

                    {/* 3. Rockfort Temple */}
                    <button
                      type="button"
                      onClick={() => handleSetQuickDestination('Rockfort Temple')}
                      className={`p-2.5 rounded-2xl border transition-all text-left flex flex-col gap-1.5 cursor-pointer shadow-2xs ${
                        to?.name === 'Rockfort Temple'
                          ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-400 dark:border-amber-700 ring-2 ring-amber-500/20'
                          : 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/60 hover:bg-amber-100/70'
                      }`}
                      title="Route to Rockfort Temple"
                    >
                      <div className="w-7 h-7 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <LandmarkIcon className="w-3.5 h-3.5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-amber-950 dark:text-amber-100 block truncate">
                          Rockfort
                        </span>
                        <span className="text-[10px] text-amber-700 dark:text-amber-400 block truncate">
                          Citadel
                        </span>
                      </div>
                    </button>
                  </div>

                  {/* Expandable More Destinations */}
                  {showMoreDestinations && (
                    <div className="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800 space-y-1.5 animate-in fade-in duration-150">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        More Destinations
                      </span>
                      <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-0.5">
                        {TRICHY_LANDMARKS.filter(
                          (lm) =>
                            lm.name !== 'Central Bus Stand' &&
                            lm.name !== 'Trichy Junction Railway Station' &&
                            lm.name !== 'Rockfort Temple'
                        ).map((lm) => {
                          const isSelected = to?.name === lm.name;
                          const isHospital = lm.category === 'Hospital';
                          return (
                            <button
                              type="button"
                              key={lm.name}
                              onClick={() => handleSetQuickDestination(lm.name)}
                              className={`text-xs px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all text-left cursor-pointer ${
                                isSelected
                                  ? isHospital
                                    ? 'bg-rose-600 text-white border-rose-600 shadow-xs font-bold'
                                    : 'bg-indigo-600 text-white border-indigo-600 shadow-xs font-bold'
                                  : isHospital
                                  ? 'bg-rose-50/70 dark:bg-rose-950/30 text-rose-800 dark:text-rose-200 border-rose-200 dark:border-rose-900/60 hover:border-rose-400'
                                  : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                              }`}
                            >
                              {isHospital ? (
                                <span className="text-xs">🚑</span>
                              ) : (
                                <MapPin className="w-3 h-3 opacity-70 shrink-0" />
                              )}
                              <span className="truncate max-w-[160px]">{lm.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Where to where inputs */}
                <div className="space-y-3 relative">
                  <PlaceAutocomplete
                    label="Start"
                    placeholder="Enter start or use GPS"
                    value={from}
                    onChange={setFrom}
                    isFromField={true}
                    onUseCurrentLocation={handleUseCurrentLocation}
                    isLocating={isLocatingFrom}
                    accentColor="cyan"
                  />

                  {/* Swap button */}
                  <div className="relative flex justify-center -my-1 z-10">
                    <button
                      type="button"
                      onClick={handleSwapPlaces}
                      className="p-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-xs hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer"
                      title="Swap Start and Destination"
                    >
                      <ArrowUpDown className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    </button>
                  </div>

                  <PlaceAutocomplete
                    label="Destination"
                    placeholder="Enter destination"
                    value={to}
                    onChange={setTo}
                    isFromField={false}
                    accentColor="indigo"
                  />
                </div>

                {/* Mode Selector */}
                <VehicleToggle
                  selected={vehicle}
                  onChange={handleSwitchVehicle}
                  cycleKm={distances.cycleKm > 0 ? distances.cycleKm : undefined}
                  walkKm={distances.walkKm > 0 ? distances.walkKm : undefined}
                  isLocationUpdated={from?.category === 'current-location' || isNavigating}
                />

                {/* Find Route Button */}
                <button
                  type="button"
                  onClick={handleFindRouteSubmit}
                  disabled={isLoadingRoutes}
                  className="w-full h-11 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 active:scale-[0.99] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-indigo-600/25 transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoadingRoutes ? (
                    <>
                      <LoaderCircle className="w-4 h-4 animate-spin" />
                      <span>Finding Safe Route...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Find Safe Route</span>
                    </>
                  )}
                </button>
              </div>

              {/* Error Notice */}
              {errorMessage && (
                <div className="rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 p-3.5 text-xs text-rose-800 dark:text-rose-200 flex items-start gap-2">
                  <TriangleAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <p className="font-semibold">{errorMessage}</p>
                </div>
              )}

              {/* Route results */}
              {routes.length > 0 && (
                <RouteCards
                  routes={routes}
                  selectedRouteId={selectedRouteId}
                  onSelectRoute={setSelectedRouteId}
                  vehicle={vehicle}
                  onSwitchVehicle={handleSwitchVehicle}
                  comparisons={comparisons}
                  destination={to}
                  origin={from}
                  onStartNavigation={handleStartNav}
                  isLocationUpdated={from?.category === 'current-location' || isNavigating}
                />
              )}

              {/* Recent Routes */}
              <RecentRoutes
                recentRoutes={recentRoutes}
                onSelectRoute={handleSelectRecent}
                onClearRoutes={() => {
                  clearRecentRoutes();
                  setRecentRoutes([]);
                }}
              />
            </section>

            {/* Right Column: Map View (Clean 2D Map - 3D option removed) */}
            <section className="lg:col-span-7 xl:col-span-7 lg:sticky lg:top-20 h-[500px] sm:h-[600px] lg:h-[calc(100vh-130px)] min-h-[460px]">
              <MapView
                from={from}
                to={to}
                routes={routes}
                selectedRouteId={selectedRouteId}
                onSelectRoute={setSelectedRouteId}
                vehicle={vehicle}
                isDarkMode={isDarkMode}
                liveLocation={liveLocation}
                isNavigating={isNavigating}
                onStopNavigation={handleStopNav}
                onUpdateNavProgress={handleUpdateNavProgress}
                onOpenAmbulance={() => setShowAmbulanceModal(true)}
              />
            </section>
          </div>
        )}
      </main>

      {/* Emergency Ambulance Modal */}
      <AmbulanceModal
        isOpen={showAmbulanceModal}
        onClose={() => setShowAmbulanceModal(false)}
        onSelectHospitalLocation={(lat, lon, name) => {
          const hospLandmark: Landmark = {
            name,
            displayName: `${name}, Trichy`,
            lat,
            lon,
            category: 'Hospital'
          };
          setTo(hospLandmark);
          if (from) {
            calculateRoutes(from, hospLandmark, vehicle, false);
          }
        }}
      />

      {/* Newly Unlocked Achievement Photo & Congratulations Modal */}
      <AchievementPhotoModal
        badge={unlockedAchievementForModal}
        user={userProfile}
        isOpen={!!unlockedAchievementForModal}
        onClose={() => setUnlockedAchievementForModal(null)}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-3.5 px-4 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 justify-center">
            <span className="font-bold bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-600 bg-clip-text text-transparent">
              CALM-Miles
            </span>
            <span>· Safe Mobility for Everyone · Trichy</span>
          </div>
          <div>24/7 Emergency Ambulance Mobility & Safe Corridors · Trichy</div>
        </div>
      </footer>
    </div>
  );
}
export default App;
