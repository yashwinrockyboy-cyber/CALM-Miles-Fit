import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Bike,
  Footprints,
  Calendar,
  Sparkles,
  ArrowRight,
  Award,
  Zap,
  Volume2,
  Clock,
  ChevronDown
} from 'lucide-react';
import { MobilityMode } from '../types';
import {
  MONTH_CONFIGS,
  MonthConfig,
  LeaderboardEntry,
  getMonthlyLeaderboardStandings,
  boostUserMonthlyStats
} from '../utils/storage';
import { speechSpeaker } from '../utils/speech';
import { LeaderboardChampionModal } from './LeaderboardChampionModal';

interface LeaderboardProps {
  onGoToRoute: (mode: MobilityMode) => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ onGoToRoute }) => {
  const [vehicle, setVehicle] = useState<MobilityMode>('cycle');
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>('2026-10');
  const [metric, setMetric] = useState<'km' | 'co2' | 'calories'>('km');
  const [showChampionModal, setShowChampionModal] = useState<boolean>(false);
  const [lastCelebratedMonth, setLastCelebratedMonth] = useState<string | null>(null);

  const selectedMonth =
    MONTH_CONFIGS.find((m) => m.key === selectedMonthKey) || MONTH_CONFIGS[0];

  const standings = getMonthlyLeaderboardStandings(vehicle, selectedMonthKey);
  const winner = standings.length > 0 && standings[0].distanceKm > 0 ? standings[0] : null;
  const isCurrentUserWinner = winner?.isCurrentUser || false;

  // Auto congratulations when current user is #1 in the month
  useEffect(() => {
    if (isCurrentUserWinner && lastCelebratedMonth !== selectedMonthKey) {
      setLastCelebratedMonth(selectedMonthKey);
      speechSpeaker.playFanfare();
      const congrats = `Congratulations ${winner?.name}! You are currently ranked number 1 on the monthly leaderboard for ${selectedMonth.name} in Trichy!`;
      speechSpeaker.speak(congrats);
    }
  }, [isCurrentUserWinner, selectedMonthKey, lastCelebratedMonth, winner?.name, selectedMonth.name]);

  const handleBoostToFirst = () => {
    boostUserMonthlyStats(15, vehicle);
    speechSpeaker.playFanfare();
    setShowChampionModal(true);
  };

  const formatMetric = (entry: LeaderboardEntry) => {
    if (metric === 'co2') {
      return `${entry.co2SavedKg.toFixed(1)} kg CO₂`;
    }
    if (metric === 'calories') {
      return `${entry.caloriesBurned} cal`;
    }
    return `${entry.distanceKm.toFixed(1)} km`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-12">
      {/* Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-indigo-700 via-violet-700 to-cyan-600 text-white p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-bold uppercase tracking-wider text-cyan-200 mb-2 border border-white/20">
              <Trophy className="w-3.5 h-3.5 text-amber-300" />
              <span>Monthly Championship</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              {vehicle === 'cycle' ? 'Cycling Leaderboard' : 'Walking Leaderboard'}
            </h1>
            <p className="text-xs sm:text-sm text-indigo-100 mt-1 max-w-lg">
              Rankings change every month · Compete for the Trichy Safe Miles Trophy
            </p>
          </div>

          <div className="bg-black/20 p-1.5 rounded-2xl flex items-center gap-1 border border-white/20 shrink-0">
            <button
              type="button"
              onClick={() => setVehicle('cycle')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                vehicle === 'cycle'
                  ? 'bg-white text-indigo-900 shadow-md'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <Bike className="w-4 h-4" />
              <span>Cycle</span>
            </button>

            <button
              type="button"
              onClick={() => setVehicle('walk')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                vehicle === 'walk'
                  ? 'bg-white text-indigo-900 shadow-md'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <Footprints className="w-4 h-4" />
              <span>Walk</span>
            </button>
          </div>
        </div>
      </div>

      {/* Month Selector Bar */}
      <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-bold text-slate-400 shrink-0 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-indigo-500" />
            <span>Select Month:</span>
          </span>

          {MONTH_CONFIGS.map((m) => {
            const isSelected = selectedMonthKey === m.key;
            return (
              <button
                type="button"
                key={m.key}
                onClick={() => setSelectedMonthKey(m.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>{m.name}</span>
                {m.isActive && (
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-black uppercase ${
                    isSelected ? 'bg-amber-400 text-amber-950' : 'bg-emerald-500 text-white'
                  }`}>
                    Active
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Month countdown badge */}
        <div className="flex items-center gap-2 text-xs shrink-0">
          {selectedMonth.isActive ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800 font-bold">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>{selectedMonth.daysRemaining} days left in {selectedMonth.shortName}</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold">
              <span>Archived Season Hall of Fame</span>
            </div>
          )}
        </div>
      </div>

      {/* #1 Winner Celebration Alert / Card */}
      {winner && (
        <div
          className={`rounded-3xl border p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all shadow-md ${
            isCurrentUserWinner
              ? 'border-amber-400 dark:border-amber-500 bg-gradient-to-r from-amber-500/20 via-orange-500/10 to-indigo-500/20'
              : 'border-amber-200 dark:border-amber-800/60 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-indigo-500/10'
          }`}
        >
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-amber-400 via-amber-500 to-orange-500 text-white flex items-center justify-center font-bold text-2xl shadow-md shrink-0 ring-4 ring-amber-400/30">
              🥇
            </div>
            <div>
              <span className="text-[10px] font-black text-amber-700 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>{selectedMonth.name} · Ranked #1 Champion</span>
              </span>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100">
                {winner.name} {isCurrentUserWinner && '(You!)'}
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {winner.schoolOrOrg} · {winner.tripsCount} trips completed
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:items-end gap-1.5 w-full sm:w-auto">
            <div className="text-xl sm:text-2xl font-black font-mono text-indigo-600 dark:text-indigo-400">
              {formatMetric(winner)}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowChampionModal(true);
                  speechSpeaker.playFanfare();
                  speechSpeaker.speak(
                    `Congratulations ${winner.name}! You are number 1 in ${selectedMonth.name}!`
                  );
                }}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black shadow-sm flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
              >
                <Trophy className="w-3.5 h-3.5" />
                <span>View #1 Photo & Congratulations</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  speechSpeaker.playFanfare();
                  speechSpeaker.speak(
                    `Congratulations ${winner.name}! Outstanding performance as number 1 in ${selectedMonth.name}!`
                  );
                }}
                className="p-1.5 rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-300 hover:bg-amber-50 transition-colors cursor-pointer"
                title="Hear audio congratulations"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Metric and Filter Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Metric:</span>
          <button
            type="button"
            onClick={() => setMetric('km')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              metric === 'km'
                ? 'bg-cyan-100 dark:bg-cyan-950/80 text-cyan-900 dark:text-cyan-200 border border-cyan-300 dark:border-cyan-800'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Distance (km)
          </button>
          <button
            type="button"
            onClick={() => setMetric('co2')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              metric === 'co2'
                ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            CO₂ Saved
          </button>
          <button
            type="button"
            onClick={() => setMetric('calories')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              metric === 'calories'
                ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Calories
          </button>
        </div>

        {/* Quick boost test button */}
        {selectedMonth.isActive && (
          <button
            type="button"
            onClick={handleBoostToFirst}
            className="text-xs px-3 py-1.5 rounded-xl border border-amber-300 dark:border-amber-700/60 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 font-bold hover:bg-amber-100 transition-colors flex items-center gap-1 cursor-pointer"
            title="Log safe miles to challenge for #1 rank"
          >
            <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
            <span>Challenge for #1 (+15 km)</span>
          </button>
        )}
      </div>

      {/* Standings List */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-slate-500">
          <span>{selectedMonth.name} Standings</span>
          <span>Trichy Active Mobiles</span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {standings.map((entry) => {
            const isTop3 = entry.rank <= 3;
            const medal =
              entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : null;

            return (
              <div
                key={`${selectedMonthKey}-${entry.id}`}
                className={`p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors ${
                  entry.isCurrentUser
                    ? 'bg-indigo-50/40 dark:bg-indigo-950/20 ring-1 ring-inset ring-indigo-500/20'
                    : ''
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                      isTop3
                        ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-200 font-mono'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono'
                    }`}
                  >
                    {medal || `#${entry.rank}`}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                        {entry.name}
                      </span>
                      {entry.isCurrentUser && (
                        <span className="text-[9px] bg-indigo-600 text-white px-1.5 py-0.2 rounded-full font-bold uppercase">
                          You
                        </span>
                      )}
                      {entry.rank === 1 && (
                        <span className="text-[9px] bg-amber-500 text-white px-1.5 py-0.2 rounded-full font-bold uppercase">
                          Leader
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {entry.schoolOrOrg} · {entry.tripsCount} trips
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-sm sm:text-base font-bold font-mono text-slate-900 dark:text-slate-100">
                    {formatMetric(entry)}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {metric !== 'co2' && `${entry.co2SavedKg.toFixed(1)} kg CO₂`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* #1 Monthly Champion Modal */}
      <LeaderboardChampionModal
        winner={winner}
        monthName={selectedMonth.name}
        isOpen={showChampionModal}
        onClose={() => setShowChampionModal(false)}
      />
    </div>
  );
};
