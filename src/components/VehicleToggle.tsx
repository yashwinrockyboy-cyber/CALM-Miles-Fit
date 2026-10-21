import React from 'react';
import { Bike, Footprints } from 'lucide-react';
import { MobilityMode } from '../types';

interface VehicleToggleProps {
  selected: MobilityMode;
  onChange: (mode: MobilityMode) => void;
  cycleKm?: number;
  walkKm?: number;
  isLocationUpdated?: boolean;
}

export const VehicleToggle: React.FC<VehicleToggleProps> = ({
  selected,
  onChange,
  cycleKm,
  walkKm,
  isLocationUpdated
}) => {
  return (
    <div className="w-full space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <span>Travel Mode</span>
          {isLocationUpdated && (
            <span className="px-1.5 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950/80 text-cyan-800 dark:text-cyan-300 text-[10px] font-bold flex items-center gap-1 border border-cyan-200 dark:border-cyan-800">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
              Live GPS
            </span>
          )}
        </label>
        <span className="text-[11px] text-slate-400">Safe routes</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onChange('cycle')}
          className={`flex items-center gap-2.5 p-2.5 rounded-2xl border transition-all cursor-pointer text-left ${
            selected === 'cycle'
              ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-transparent shadow-md shadow-indigo-600/25 ring-2 ring-indigo-400/40'
              : 'bg-white dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700'
          }`}
        >
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              selected === 'cycle'
                ? 'bg-white/20 text-white'
                : 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400'
            }`}
          >
            <Bike className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold">Cycle</span>
              {cycleKm !== undefined && (
                <span
                  className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                    selected === 'cycle'
                      ? 'bg-white/20 text-white'
                      : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300'
                  }`}
                >
                  {cycleKm.toFixed(1)} km
                </span>
              )}
            </div>
            <p
              className={`text-[10px] truncate ${
                selected === 'cycle' ? 'text-indigo-100' : 'text-slate-400'
              }`}
            >
              14 km/h · Fast
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onChange('walk')}
          className={`flex items-center gap-2.5 p-2.5 rounded-2xl border transition-all cursor-pointer text-left ${
            selected === 'walk'
              ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white border-transparent shadow-md shadow-cyan-600/25 ring-2 ring-cyan-400/40'
              : 'bg-white dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-cyan-300 dark:hover:border-cyan-700'
          }`}
        >
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              selected === 'walk'
                ? 'bg-white/20 text-white'
                : 'bg-cyan-50 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400'
            }`}
          >
            <Footprints className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold">Walk</span>
              {walkKm !== undefined && (
                <span
                  className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                    selected === 'walk'
                      ? 'bg-white/20 text-white'
                      : 'bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300'
                  }`}
                >
                  {walkKm.toFixed(1)} km
                </span>
              )}
            </div>
            <p
              className={`text-[10px] truncate ${
                selected === 'walk' ? 'text-cyan-100' : 'text-slate-400'
              }`}
            >
              4.5 km/h · Calm
            </p>
          </div>
        </button>
      </div>
    </div>
  );
};
