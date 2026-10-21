import React from 'react';
import { History, Trash2, ArrowRight, Bike, Footprints } from 'lucide-react';
import { RecentRoute } from '../types';

interface RecentRoutesProps {
  recentRoutes: RecentRoute[];
  onSelectRoute: (route: RecentRoute) => void;
  onClearRoutes: () => void;
}

export const RecentRoutes: React.FC<RecentRoutesProps> = ({
  recentRoutes,
  onSelectRoute,
  onClearRoutes
}) => {
  if (recentRoutes.length === 0) return null;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <History className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Recent Safe Routes</span>
        </div>
        <button
          type="button"
          onClick={onClearRoutes}
          className="text-[11px] text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 flex items-center gap-1 transition-colors cursor-pointer"
          title="Clear search history"
        >
          <Trash2 className="w-3 h-3" />
          <span>Clear</span>
        </button>
      </div>

      <div className="space-y-1.5">
        {recentRoutes.map((item) => {
          const VehicleIcon = item.vehicle === 'cycle' ? Bike : Footprints;
          return (
            <button
              type="button"
              key={item.id}
              onClick={() => onSelectRoute(item)}
              className="w-full text-left p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-2 min-w-0 pr-2">
                <div className="p-1 rounded-md bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 shrink-0 text-slate-600 dark:text-slate-300">
                  <VehicleIcon className="w-3 h-3" />
                </div>
                <div className="text-xs truncate text-slate-800 dark:text-slate-200 flex items-center gap-1">
                  <span className="font-semibold truncate max-w-[90px] sm:max-w-[120px]">
                    {item.from.name}
                  </span>
                  <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="font-semibold truncate max-w-[90px] sm:max-w-[120px]">
                    {item.to.name}
                  </span>
                </div>
              </div>
              <div className="text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400 shrink-0">
                {item.distanceKm.toFixed(1)} km · {item.durationMinutes} min
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
