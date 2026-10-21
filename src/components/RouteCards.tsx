import React, { useState } from 'react';
import {
  Bike,
  Footprints,
  ShieldCheck,
  Milestone,
  Clock,
  Flame,
  Navigation,
  ChevronDown,
  ChevronUp,
  CircleCheck,
  List
} from 'lucide-react';
import { Landmark, MobilityMode, RouteOption, VehicleComparison } from '../types';

interface RouteCardsProps {
  routes: RouteOption[];
  selectedRouteId: string | null;
  onSelectRoute: (id: string) => void;
  vehicle: MobilityMode;
  onSwitchVehicle: (vehicle: MobilityMode) => void;
  comparisons: VehicleComparison[];
  destination: Landmark | null;
  origin: Landmark | null;
  onStartNavigation: () => void;
  liveRemainingKm?: number;
  isLocationUpdated?: boolean;
}

export const RouteCards: React.FC<RouteCardsProps> = ({
  routes,
  selectedRouteId,
  onSelectRoute,
  vehicle,
  onStartNavigation,
  liveRemainingKm
}) => {
  const [showDirections, setShowDirections] = useState<boolean>(false);
  const currentRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];

  if (!currentRoute) return null;

  const safety = currentRoute.safetyProfile;

  return (
    <div className="space-y-3">
      {/* Primary Route Summary Card */}
      <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-4 sm:p-5 shadow-sm space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-2xl shadow-sm ${
                vehicle === 'cycle'
                  ? 'bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-indigo-500/25'
                  : 'bg-gradient-to-tr from-cyan-600 to-teal-500 text-white shadow-cyan-500/25'
              }`}
            >
              {vehicle === 'cycle' ? <Bike className="w-5 h-5 stroke-[2.5]" /> : <Footprints className="w-5 h-5 stroke-[2.5]" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                  {currentRoute.isSafest ? 'Safest Route' : 'Fast Route'}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800">
                  {currentRoute.isSafest ? 'Calm Corridor' : 'Direct'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[210px] mt-0.5">
                via {currentRoute.summary}
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300 font-mono">
                {safety.safetyScore}% Safe
              </span>
            </div>
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2.5 rounded-2xl bg-cyan-50/70 dark:bg-slate-800/60 border border-cyan-100 dark:border-slate-800">
            <div className="flex items-center justify-center gap-1 text-[11px] text-cyan-700 dark:text-cyan-400 mb-0.5 font-bold">
              <Milestone className="w-3.5 h-3.5" />
              <span>Distance</span>
            </div>
            <div className="text-base sm:text-lg font-bold font-mono text-slate-900 dark:text-slate-100">
              {liveRemainingKm === undefined
                ? currentRoute.distanceKm.toFixed(1)
                : liveRemainingKm.toFixed(1)}{' '}
              <span className="text-xs font-normal">km</span>
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-indigo-50/70 dark:bg-slate-800/60 border border-indigo-100 dark:border-slate-800">
            <div className="flex items-center justify-center gap-1 text-[11px] text-indigo-700 dark:text-indigo-400 mb-0.5 font-bold">
              <Clock className="w-3.5 h-3.5" />
              <span>Time</span>
            </div>
            <div className="text-base sm:text-lg font-bold font-mono text-slate-900 dark:text-slate-100">
              {currentRoute.durationMinutes} <span className="text-xs font-normal">min</span>
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-amber-50/70 dark:bg-slate-800/60 border border-amber-100 dark:border-slate-800">
            <div className="flex items-center justify-center gap-1 text-[11px] text-amber-700 dark:text-amber-400 mb-0.5 font-bold">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>Burn</span>
            </div>
            <div className="text-base sm:text-lg font-bold font-mono text-slate-900 dark:text-slate-100">
              {currentRoute.caloriesBurned} <span className="text-xs font-normal">cal</span>
            </div>
          </div>
        </div>

        {/* Start Navigation CTA Button */}
        <button
          type="button"
          onClick={onStartNavigation}
          className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-600 hover:from-indigo-500 hover:via-violet-500 hover:to-cyan-500 active:scale-[0.99] text-white font-bold text-sm shadow-md shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <Navigation className="w-4 h-4 fill-white" />
          <span>Start Navigation</span>
        </button>

        {/* Turn-by-Turn List Accordion */}
        <div className="pt-0.5">
          <button
            type="button"
            onClick={() => setShowDirections((v) => !v)}
            className="w-full py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between transition-colors cursor-pointer border border-slate-200/60 dark:border-slate-700/60"
          >
            <div className="flex items-center gap-1.5">
              <List className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Step Directions ({currentRoute.steps.length} steps)</span>
            </div>
            {showDirections ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showDirections && (
            <div className="mt-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-2 max-h-56 overflow-y-auto">
              {currentRoute.steps.map((st, i) => (
                <div key={i} className="flex items-start gap-2 pb-2 border-b border-slate-200/60 dark:border-slate-700/50 last:border-b-0 last:pb-0">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                      {st.instruction}
                    </p>
                    {st.distanceMeters > 0 && (
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        {Math.round(st.distanceMeters)} m
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Safe Highlights Chips */}
        <div className="pt-0.5 flex flex-wrap gap-2 text-xs">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-medium border border-emerald-200/60 dark:border-emerald-800/60">
            <CircleCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Well-lit roads</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 font-medium border border-indigo-200/60 dark:border-indigo-800/60">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Patrolled safe route</span>
          </div>
        </div>

        {/* Alternative Routes */}
        {routes.length > 1 && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Alternative Route
            </span>
            <div className="grid grid-cols-2 gap-2">
              {routes.map((r) => {
                const isSelected = r.id === currentRoute.id;
                return (
                  <button
                    type="button"
                    key={r.id}
                    onClick={() => onSelectRoute(r.id)}
                    className={`text-left p-2.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/50 ring-1 ring-indigo-500/40 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className={isSelected ? 'text-indigo-900 dark:text-indigo-200' : 'text-slate-800 dark:text-slate-200'}>
                        {r.isSafest ? 'Safest' : 'Fastest'}
                      </span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-mono text-[11px]">
                        {r.safetyProfile.safetyScore}%
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {r.distanceKm.toFixed(1)} km · {r.durationMinutes} min
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
