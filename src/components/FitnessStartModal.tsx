import React, { useEffect } from 'react';
import {
  X,
  Flame,
  Bike,
  Footprints,
  Sparkles,
  ShieldCheck,
  Play,
  HeartPulse
} from 'lucide-react';
import { CustomRoutePlan } from '../types';
import { speechSpeaker } from '../utils/speech';
import { Confetti } from './Confetti';

interface FitnessStartModalProps {
  plan: CustomRoutePlan | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmStart: () => void;
}

export const FitnessStartModal: React.FC<FitnessStartModalProps> = ({
  plan,
  isOpen,
  onClose,
  onConfirmStart
}) => {
  useEffect(() => {
    if (isOpen && plan) {
      speechSpeaker.playFanfare();
      const encouragement = `Yes, I can do it! Congratulations on taking the first step towards fitness today! Let's conquer this workout safely in Trichy!`;
      speechSpeaker.speak(encouragement);
    }
  }, [isOpen, plan]);

  if (!isOpen || !plan) return null;

  const isCycle = plan.vehicle === 'cycle';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="fitness-start-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <Confetti durationMs={3500} />

      <div className="relative w-full max-w-md max-h-[92vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border-2 border-emerald-400 dark:border-emerald-500 overflow-hidden flex flex-col">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-4 text-white flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-xl shadow-inner animate-pulse">
              💪
            </div>
            <div>
              <span className="text-[10px] uppercase font-black tracking-widest text-emerald-200 block">
                Fitness Journey Kickoff
              </span>
              <h2 id="fitness-start-title" className="text-base sm:text-lg font-black leading-tight">
                Yes, I Can Do It!
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body - scrollable container so all buttons are easily reachable */}
        <div className="p-4 sm:p-5 space-y-3.5 text-center overflow-y-auto flex-1">
          {/* Fully Visible Activity Photo (Not Half) */}
          <div className="relative rounded-2xl overflow-hidden shadow-md border border-slate-200 dark:border-slate-800 bg-slate-950 flex items-center justify-center min-h-[190px] sm:min-h-[230px] max-h-[250px]">
            <img
              src={
                isCycle
                  ? '/assets/aistudio/images__15__1def267b.jfif'
                  : '/assets/aistudio/runner-park-trail-morning-walking-app-hero_a040ebc8.jpg'
              }
              alt={isCycle ? 'Cycling Fitness Inspiration' : 'Walking Fitness Inspiration'}
              className={`w-full max-h-[240px] transition-all duration-300 ${
                isCycle ? 'object-contain' : 'object-cover h-[220px]'
              }`}
            />
            <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 border border-white/20">
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>{isCycle ? '🚴 Cycling Fitness' : '🚶 Walking Fitness'}</span>
            </div>
          </div>

          {/* Motivational Message Placed Directly Below Photo */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/15 to-cyan-500/15 border-2 border-emerald-400 dark:border-emerald-600 shadow-sm text-center space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-black uppercase tracking-wider border border-emerald-300 dark:border-emerald-700">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Congratulations!</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Yes, I Can Do It! 💪
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-medium leading-relaxed">
              {isCycle
                ? 'Congratulations on choosing cycling! Yes, I can do it — pedal strong and enjoy Trichy’s peaceful, safe roads!'
                : 'Congratulations on choosing walking! Yes, I can do it — every step boosts your health, endurance, and calm!'}
            </p>
          </div>

          {/* Target Stats Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800 grid grid-cols-3 gap-2 text-center">
            <div className="p-2">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Goal</span>
              <span className="text-base font-black font-mono text-emerald-600 dark:text-emerald-400">
                {plan.targetCalories} kcal
              </span>
            </div>
            <div className="p-2 border-x border-emerald-200 dark:border-emerald-800">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Distance</span>
              <span className="text-base font-black font-mono text-cyan-600 dark:text-cyan-400">
                {plan.targetDistanceKm.toFixed(1)} km
              </span>
            </div>
            <div className="p-2">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Activity</span>
              <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 flex items-center justify-center gap-1 mt-1">
                {isCycle ? <Bike className="w-3.5 h-3.5" /> : <Footprints className="w-3.5 h-3.5" />}
                <span>{isCycle ? 'Cycle' : 'Walk'}</span>
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2 text-left">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Route verified: <strong>{plan.routeOption.safetyProfile.safetyScore}% Safety Rating</strong> avoiding congested intersections.
            </span>
          </div>
        </div>

        {/* Action Buttons: "No, I'll rest" above, and "Yes, I can do it!" down below */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 px-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>No, I'll rest</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onConfirmStart();
            }}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-transform active:scale-95 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Yes, I can do it!</span>
          </button>
        </div>
      </div>
    </div>
  );
};
