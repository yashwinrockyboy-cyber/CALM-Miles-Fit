import React, { useState, useEffect } from 'react';
import {
  Flame,
  Bike,
  Footprints,
  Milestone,
  RotateCcw,
  Volume2,
  VolumeX,
  Navigation,
  Radio,
  Clock,
  ShieldCheck,
  LoaderCircle,
  Sparkles,
  Play
} from 'lucide-react';
import { Landmark, MobilityMode, CustomRoutePlan } from '../types';
import { TRICHY_LANDMARKS } from '../data/landmarks';
import { calculateCustomFitnessRoute } from '../utils/routing';
import { speechSpeaker } from '../utils/speech';
import { FitnessStartModal } from './FitnessStartModal';

interface CaloriePlannerProps {
  currentGpsPoint: Landmark | null;
  onApplyRoute: (plan: CustomRoutePlan) => void;
}

export const CaloriePlanner: React.FC<CaloriePlannerProps> = ({
  currentGpsPoint,
  onApplyRoute
}) => {
  const [vehicle, setVehicle] = useState<MobilityMode>('walk');
  const [calories, setCalories] = useState<number>(150);
  const [distanceKm, setDistanceKm] = useState<number>(2.4);
  const [loopType, setLoopType] = useState<'loop' | 'point_to_point'>('loop');

  const defaultStart = currentGpsPoint || TRICHY_LANDMARKS[0];
  const [startPoint, setStartPoint] = useState<Landmark>(defaultStart);

  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [customPlan, setCustomPlan] = useState<CustomRoutePlan | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showStartModal, setShowStartModal] = useState<boolean>(false);

  const handleCalorieChange = (c: number) => {
    setCalories(c);
    const rate = vehicle === 'walk' ? 62 : 36;
    const d = Math.round((c / rate) * 10) / 10;
    setDistanceKm(Math.max(0.5, d));
  };

  const handleDistanceChange = (d: number) => {
    setDistanceKm(d);
    const rate = vehicle === 'walk' ? 62 : 36;
    const c = Math.round(d * rate);
    setCalories(c);
  };

  const handleVehicleChange = (v: MobilityMode) => {
    setVehicle(v);
    const rate = v === 'walk' ? 62 : 36;
    const d = Math.round((calories / rate) * 10) / 10;
    setDistanceKm(Math.max(0.5, d));
  };

  const handleGenerate = async () => {
    setIsCalculating(true);
    setErrorMsg(null);
    try {
      const plan = await calculateCustomFitnessRoute({
        targetCalories: calories,
        targetDistanceKm: distanceKm,
        vehicle,
        startPoint,
        loopType
      });
      setCustomPlan(plan);
      speechSpeaker.speak(plan.spokenNarrative);
      setIsSpeaking(true);
      setTimeout(() => setIsSpeaking(false), 8000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Unable to calculate custom route.');
    } finally {
      setIsCalculating(false);
    }
  };

  useEffect(() => {
    handleGenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-12">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-indigo-700 via-violet-700 to-cyan-600 text-white p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-bold uppercase tracking-wider text-cyan-200 border border-white/20">
            <Flame className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
            <span>Fitness Tracker</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Fitness Route Planner
          </h1>
          <p className="text-xs sm:text-sm text-indigo-100 max-w-xl">
            Choose your activity and goal — we'll map a safe workout loop in Trichy.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
        {/* Controls Column */}
        <div className="md:col-span-5 space-y-4">
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-sm space-y-4">
            {/* Mode selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Activity
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleVehicleChange('walk')}
                  className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                    vehicle === 'walk'
                      ? 'bg-amber-500 text-white border-amber-500 shadow-md ring-2 ring-amber-400/20'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <Footprints className="w-4 h-4" />
                  <div>
                    <div className="font-extrabold text-xs">Walking</div>
                    <div className="text-[10px] opacity-80">~62 kcal/km</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleVehicleChange('cycle')}
                  className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                    vehicle === 'cycle'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-500/20'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <Bike className="w-4 h-4" />
                  <div>
                    <div className="font-extrabold text-xs">Cycling</div>
                    <div className="text-[10px] opacity-80">~36 kcal/km</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Motivational Activity Photo & Encouragement Banner (Below Photo) */}
            <div className="space-y-2.5">
              <div className="relative rounded-2xl overflow-hidden shadow-xs border border-slate-200 dark:border-slate-800 bg-slate-950 flex items-center justify-center min-h-[220px] sm:min-h-[260px] max-h-[300px]">
                <img
                  src={
                    vehicle === 'cycle'
                      ? '/assets/aistudio/images__15__1def267b.jfif'
                      : '/assets/aistudio/runner-park-trail-morning-walking-app-hero_a040ebc8.jpg'
                  }
                  alt={vehicle === 'cycle' ? 'Cycling Fitness Inspiration' : 'Walking Fitness Inspiration'}
                  className={`w-full max-h-[280px] transition-all duration-300 ${
                    vehicle === 'cycle' ? 'object-contain' : 'object-cover h-[260px]'
                  }`}
                />
                <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 border border-white/20">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>{vehicle === 'cycle' ? '🚴 Cycling Fitness' : '🚶 Walking Fitness'}</span>
                </div>
              </div>

              {/* Motivational Banner Below Photo */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/15 to-amber-500/15 border border-emerald-300 dark:border-emerald-700/60 shadow-2xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-xs">
                  💪
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                      Yes, I Can Do It!
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                      Congratulations!
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-snug">
                    {vehicle === 'cycle'
                      ? 'Congratulations on choosing cycling! Yes, I can do it — pedal strong and conquer your fitness goal!'
                      : 'Congratulations on choosing walking! Yes, I can do it — every step brings energy, health, and vitality!'}
                  </p>
                </div>
              </div>
            </div>

            {/* Target Calories */}
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400">
                  <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
                  <span>Calorie Target</span>
                </div>
                <div className="text-lg font-black font-mono text-amber-600 dark:text-amber-400">
                  {calories} <span className="text-xs font-normal">kcal</span>
                </div>
              </div>

              <input
                type="range"
                min="30"
                max="800"
                step="10"
                value={calories}
                onChange={(e) => handleCalorieChange(parseInt(e.target.value, 10))}
                className="w-full accent-amber-500 cursor-pointer"
              />

              <div className="flex items-center justify-between gap-1 text-[10px]">
                {[50, 150, 300, 500].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => handleCalorieChange(v)}
                    className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-bold hover:bg-amber-50 cursor-pointer"
                  >
                    {v} kcal
                  </button>
                ))}
              </div>
            </div>

            {/* Distance display */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Milestone className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Est. Route Distance:
                </span>
              </div>
              <div className="text-base font-black font-mono text-blue-600 dark:text-blue-400">
                {distanceKm.toFixed(1)} km
              </div>
            </div>

            {/* Start location */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Start From
              </label>
              <select
                value={startPoint.name}
                onChange={(e) => {
                  const found =
                    currentGpsPoint?.name === e.target.value
                      ? currentGpsPoint
                      : TRICHY_LANDMARKS.find((lm) => lm.name === e.target.value);
                  if (found) setStartPoint(found);
                }}
                className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer font-medium"
              >
                {currentGpsPoint && (
                  <option value={currentGpsPoint.name}>📍 My Current Location (GPS)</option>
                )}
                {TRICHY_LANDMARKS.map((lm) => (
                  <option key={lm.name} value={lm.name}>
                    {lm.name} ({lm.category})
                  </option>
                ))}
              </select>
            </div>

            {/* Loop Type toggle */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setLoopType('loop')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  loopType === 'loop'
                    ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 ring-1 ring-blue-500'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
                  <span>Return Loop</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">Returns to start point</p>
              </button>

              <button
                type="button"
                onClick={() => setLoopType('point_to_point')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  loopType === 'point_to_point'
                    ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 ring-1 ring-blue-500'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <Navigation className="w-3.5 h-3.5 text-amber-500" />
                  <span>Point to Point</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">Walks to nearby landmark</p>
              </button>
            </div>

            <button
              type="button"
              onClick={handleGenerate}
              disabled={isCalculating}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
            >
              {isCalculating ? (
                <>
                  <LoaderCircle className="w-4 h-4 animate-spin" />
                  <span>Planning Safe Loop...</span>
                </>
              ) : (
                <>
                  <Flame className="w-4 h-4" />
                  <span>Calculate Workout Route</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results Column */}
        <div className="md:col-span-7 space-y-4">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {customPlan ? (
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
              {/* Quick stats row */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60">
                  <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400 block">
                    Calories Burned
                  </span>
                  <span className="text-xl font-black font-mono text-amber-600 dark:text-amber-300">
                    {customPlan.routeOption.caloriesBurned}
                  </span>
                  <span className="text-[9px] text-amber-600 dark:text-amber-400 block font-semibold">
                    kcal
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/60">
                  <span className="text-[10px] uppercase font-bold text-blue-700 dark:text-blue-400 block">
                    Distance
                  </span>
                  <span className="text-xl font-black font-mono text-blue-600 dark:text-blue-300">
                    {customPlan.routeOption.distanceKm.toFixed(1)}
                  </span>
                  <span className="text-[9px] text-blue-600 dark:text-blue-400 block font-semibold">
                    km
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60">
                  <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 block">
                    Safety Score
                  </span>
                  <span className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-300">
                    {customPlan.routeOption.safetyProfile.safetyScore}%
                  </span>
                  <span className="text-[9px] text-emerald-600 dark:text-emerald-400 block font-semibold">
                    Verified
                  </span>
                </div>
              </div>

              {/* Itinerary Milestones */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase text-slate-800 dark:text-slate-200">
                    Route Circuit
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (isSpeaking) {
                        speechSpeaker.stop();
                        setIsSpeaking(false);
                      } else {
                        setIsSpeaking(true);
                        speechSpeaker.speak(customPlan.spokenNarrative);
                        setTimeout(() => setIsSpeaking(false), 8000);
                      }
                    }}
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    <span>{isSpeaking ? 'Stop voice' : 'Listen aloud'}</span>
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                      1
                    </span>
                    <span>Start: <strong>{customPlan.startPoint.name}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                      2
                    </span>
                    <span>Turn point: <strong>{customPlan.waypoints[1]?.name || 'Safe Boulevard'}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                      3
                    </span>
                    <span>
                      {customPlan.loopType === 'loop' ? 'Return back to start' : 'Finish at destination'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Start Workout Actions: "No, I'll rest" above, and "Yes, I can do it!" down below */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    speechSpeaker.speak("Take good rest today! Rest and recovery keep you strong and energized.");
                  }}
                  className="w-full py-3 px-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>No, I'll rest</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowStartModal(true)}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
                >
                  <Play className="w-5 h-5 fill-white" />
                  <span>Yes, I can do it!</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 border border-slate-200 dark:border-slate-800 text-center text-slate-500">
              <LoaderCircle className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-3" />
              <p className="font-bold text-sm text-slate-800 dark:text-slate-200">
                Calculating Safest Route for Your Goal...
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Fitness Start Motivation Modal: "You can do it! Congratulations!" */}
      <FitnessStartModal
        plan={customPlan}
        isOpen={showStartModal}
        onClose={() => setShowStartModal(false)}
        onConfirmStart={() => {
          if (customPlan) onApplyRoute(customPlan);
        }}
      />
    </div>
  );
};
