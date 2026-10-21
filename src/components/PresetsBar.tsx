import React, { useState } from 'react';
import { School, MapPin, Bus, Train, Landmark as LandmarkIcon, Sparkles } from 'lucide-react';
import { Landmark } from '../types';
import { TRICHY_LANDMARKS } from '../data/landmarks';

interface PresetsBarProps {
  onSelectPlace: (place: Landmark, target: 'from' | 'to') => void;
  activeFrom: Landmark | null;
  activeTo: Landmark | null;
}

export const PresetsBar: React.FC<PresetsBarProps> = ({
  onSelectPlace,
  activeFrom,
  activeTo
}) => {
  const [targetField, setTargetField] = useState<'from' | 'to'>('to');

  const getPlaceIcon = (lm: Landmark) => {
    if (lm.name.includes('School')) return <School className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />;
    if (lm.name.includes('Bus Stand')) return <Bus className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />;
    if (lm.name.includes('Railway') || lm.name.includes('Junction')) return <Train className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />;
    if (lm.name.includes('Temple') || lm.name.includes('Fort')) return <LandmarkIcon className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />;
    return <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
  };

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Quick Destinations</span>
        </span>
        <div className="flex items-center gap-1 text-xs bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setTargetField('from')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              targetField === 'from'
                ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Set Start
          </button>
          <button
            type="button"
            onClick={() => setTargetField('to')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              targetField === 'to'
                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Set Destination
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-0.5">
        {TRICHY_LANDMARKS.slice(0, 12).map((lm) => {
          const isFrom = activeFrom?.name === lm.name;
          const isTo = activeTo?.name === lm.name;
          const isHospital = lm.category === 'Hospital';

          let style =
            'bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 shadow-2xs';

          if (isHospital) {
            style =
              'bg-rose-50/70 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200 border-rose-200 dark:border-rose-800 font-medium';
          }
          if (isFrom) {
            style =
              'bg-gradient-to-r from-teal-600 to-emerald-600 text-white border-transparent font-bold shadow-xs';
          } else if (isTo) {
            style =
              'bg-gradient-to-r from-indigo-600 to-blue-600 text-white border-transparent font-bold shadow-xs';
          }

          return (
            <button
              type="button"
              key={lm.name}
              onClick={() => onSelectPlace(lm, targetField)}
              className={`text-xs px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all text-left cursor-pointer ${style}`}
            >
              {getPlaceIcon(lm)}
              <span className="truncate max-w-[170px]">{lm.name}</span>
              {isFrom && (
                <span className="text-[9px] bg-white/25 text-white px-1.5 py-0.2 rounded font-bold uppercase">
                  Start
                </span>
              )}
              {isTo && (
                <span className="text-[9px] bg-white/25 text-white px-1.5 py-0.2 rounded font-bold uppercase">
                  End
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
