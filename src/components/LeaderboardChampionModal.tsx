import React, { useEffect, useState } from 'react';
import {
  X,
  Trophy,
  Download,
  Share2,
  Check,
  Sparkles,
  Calendar,
  Award,
  Flame,
  Volume2
} from 'lucide-react';
import { LeaderboardEntry } from '../utils/storage';
import { speechSpeaker } from '../utils/speech';
import { Confetti } from './Confetti';

interface LeaderboardChampionModalProps {
  winner: LeaderboardEntry | null;
  monthName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const LeaderboardChampionModal: React.FC<LeaderboardChampionModalProps> = ({
  winner,
  monthName,
  isOpen,
  onClose
}) => {
  const [downloading, setDownloading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && winner) {
      speechSpeaker.playFanfare();
      const text = `Congratulations ${winner.name}! You are ranked number 1 on the monthly leaderboard for ${monthName} in Trichy! Outstanding achievement!`;
      speechSpeaker.speak(text);
    }
  }, [isOpen, winner, monthName]);

  if (!isOpen || !winner) return null;

  const handleDownloadChampionPhoto = () => {
    setDownloading(true);

    try {
      const canvas = document.createElement('canvas');
      const width = 1200;
      const height = 800;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        setDownloading(false);
        return;
      }

      // 1. Rich Royal Indigo / Amber Champion Background
      const bg = ctx.createLinearGradient(0, 0, width, height);
      bg.addColorStop(0, '#1e1b4b');
      bg.addColorStop(0.5, '#431407'); // deep warm amber-red
      bg.addColorStop(1, '#0f172a');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);

      // 2. Gold borders
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 14;
      ctx.strokeRect(30, 30, width - 60, height - 60);

      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.strokeRect(45, 45, width - 90, height - 90);

      // 3. Header
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fde047';
      ctx.font = 'bold 24px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('CALM-MILES · CITY OF TIRUCHIRAPPALLI', width / 2, 110);

      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 18px "Plus Jakarta Sans", sans-serif';
      ctx.letterSpacing = '5px';
      ctx.fillText(`★ #1 MONTHLY LEADERBOARD CHAMPION · ${monthName.toUpperCase()} ★`, width / 2, 145);

      // 4. Gold Trophy Circle
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.arc(width / 2, 240, 70, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 6;
      ctx.stroke();

      ctx.font = '72px sans-serif';
      ctx.fillText('🏆', width / 2, 265);

      // 5. Crown text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 44px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Monthly Champion Recognition', width / 2, 360);

      ctx.fillStyle = '#fef08a';
      ctx.font = '22px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(`Proudly presented to Trichy's Number 1 Ranked Commuter`, width / 2, 415);

      // 6. Champion Name
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 42px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(winner.name, width / 2, 475);

      // 7. Stats
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '22px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(
        `${winner.distanceKm.toFixed(1)} km Logged · ${winner.co2SavedKg.toFixed(1)} kg CO₂ Saved · ${winner.tripsCount} Safe Trips`,
        width / 2,
        535
      );

      // 8. Seal Pill
      ctx.fillStyle = 'rgba(245, 158, 11, 0.2)';
      const pillW = 420;
      ctx.fillRect(width / 2 - pillW / 2, 580, pillW, 46);
      ctx.fillStyle = '#fde047';
      ctx.font = 'bold 20px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(`RANK #1 · ${monthName} GOLD MEDAL WINNER`, width / 2, 610);

      // 9. Footer
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '16px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`Season: ${monthName}`, 90, 715);
      ctx.fillText('Safe Corridors & Sustainable Mobility', 90, 740);

      ctx.textAlign = 'right';
      ctx.fillText('Certified by CALM-Miles Leaderboard', width - 90, 715);
      ctx.fillStyle = '#38bdf8';
      ctx.fillText('Tiruchirappalli, Tamil Nadu', width - 90, 740);

      // Trigger download
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `CALM-Miles-${monthName}-Champion-#1.png`;
      a.click();
    } catch (err) {
      console.error('Failed to generate champion photo:', err);
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `#1 Leaderboard Champion - ${monthName}`,
        text: `🏆 I'm ranked #1 on the CALM-Miles Leaderboard for ${monthName} in Trichy!`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(
        `🏆 I'm ranked #1 on the CALM-Miles Leaderboard for ${monthName} in Trichy! Safe miles for clean air.`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="champion-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <Confetti durationMs={5000} />

      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border-2 border-amber-400 dark:border-amber-500 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-indigo-600 p-4 text-white flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-xl shadow-inner">
              🥇
            </div>
            <div>
              <span className="text-[10px] uppercase font-black tracking-widest text-amber-200 block">
                Official Congratulations!
              </span>
              <h2 id="champion-modal-title" className="text-base sm:text-lg font-black leading-tight">
                #1 Monthly Champion · {monthName}
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

        {/* Champion Certificate Card */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          <div className="rounded-2xl p-5 sm:p-6 bg-gradient-to-br from-amber-950 via-slate-900 to-indigo-950 text-white border-2 border-amber-400 shadow-2xl text-center space-y-3.5 relative overflow-hidden">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-black border border-amber-400/40 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Month Champion Gold Recognition</span>
            </div>

            {/* Giant Gold Trophy */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 via-orange-500 to-amber-600 mx-auto flex items-center justify-center text-4xl shadow-xl ring-4 ring-amber-400/50 animate-bounce" style={{ animationDuration: '2s' }}>
              🏆
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Congratulations {winner.name}!
              </h3>
              <p className="text-xs text-amber-200 font-bold mt-0.5">
                Rank #1 on the Trichy Leaderboard · {monthName}
              </p>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed px-2">
              You've earned first place in safe miles, inspiring our entire community to cycle and walk along protected corridors!
            </p>

            {/* Stats badges */}
            <div className="grid grid-cols-3 gap-2 pt-1 text-center">
              <div className="p-2.5 rounded-xl bg-white/10 border border-white/10">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Distance</span>
                <span className="text-sm sm:text-base font-black font-mono text-cyan-300">
                  {winner.distanceKm.toFixed(1)} km
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/10 border border-white/10">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">CO₂ Saved</span>
                <span className="text-sm sm:text-base font-black font-mono text-emerald-300">
                  {winner.co2SavedKg.toFixed(1)} kg
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/10 border border-white/10">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Trips</span>
                <span className="text-sm sm:text-base font-black font-mono text-amber-300">
                  {winner.tripsCount}
                </span>
              </div>
            </div>
          </div>

          {/* Voice Replay */}
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
            <span>🎉 Voice congratulations spoken automatically.</span>
            <button
              type="button"
              onClick={() => {
                speechSpeaker.playFanfare();
                speechSpeaker.speak(
                  `Congratulations ${winner.name}! You are ranked number 1 on the monthly leaderboard for ${monthName} in Trichy! Keep up the champion spirit!`
                );
              }}
              className="text-amber-600 dark:text-amber-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Replay Voice</span>
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex flex-col sm:flex-row items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleDownloadChampionPhoto}
            disabled={downloading}
            className="w-full sm:flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{downloading ? 'Creating Photo...' : '📸 Save Champion Photo'}</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="w-full sm:w-auto py-3 px-4 rounded-2xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
