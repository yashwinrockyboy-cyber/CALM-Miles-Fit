import React, { useEffect, useRef, useState } from 'react';
import {
  X,
  Download,
  Share2,
  Check,
  Sparkles,
  Award,
  Calendar,
  ShieldCheck,
  MapPin,
  Volume2
} from 'lucide-react';
import { Badge, UserProfile } from '../types';
import { speechSpeaker } from '../utils/speech';
import { Confetti } from './Confetti';

interface AchievementPhotoModalProps {
  badge: Badge | null;
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
}

export const AchievementPhotoModal: React.FC<AchievementPhotoModalProps> = ({
  badge,
  user,
  isOpen,
  onClose
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [downloading, setDownloading] = useState<boolean>(false);
  const cardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen && badge) {
      // Voice congratulations!
      speechSpeaker.playFanfare();
      const congratsText = `Congratulations ${user.name}! You have unlocked the achievement, ${badge.title}! ${badge.description}. Wonderful job travelling safely in Trichy!`;
      speechSpeaker.speak(congratsText);
    }
  }, [isOpen, badge, user.name]);

  if (!isOpen || !badge) return null;

  const dateStr = badge.unlockedAt || new Date().toISOString().split('T')[0];

  const handleDownloadPhoto = () => {
    setDownloading(true);

    try {
      // Create high-res canvas for photo download
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

      // 1. Background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, '#1e1b4b'); // deep indigo
      bgGrad.addColorStop(0.5, '#312e81');
      bgGrad.addColorStop(1, '#0f172a'); // slate
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Gold decorative borders
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 14;
      ctx.strokeRect(30, 30, width - 60, height - 60);

      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.strokeRect(45, 45, width - 90, height - 90);

      // Corner ornaments
      const corners = [
        [55, 55],
        [width - 55, 55],
        [55, height - 55],
        [width - 55, height - 55]
      ];
      corners.forEach(([cx, cy]) => {
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(cx, cy, 8, 0, Math.PI * 2);
        ctx.fill();
      });

      // 3. Top Branding Header
      ctx.textAlign = 'center';
      ctx.fillStyle = '#67e8f9';
      ctx.font = 'bold 24px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('CALM-MILES · TIRUCHIRAPPALLI SAFE MOBILITY', width / 2, 110);

      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 16px "Plus Jakarta Sans", sans-serif';
      ctx.letterSpacing = '4px';
      ctx.fillText('★ OFFICIAL ACHIEVEMENT CERTIFICATE ★', width / 2, 145);

      // 4. Large Badge Icon circle
      ctx.fillStyle = '#4338ca';
      ctx.beginPath();
      ctx.arc(width / 2, 240, 65, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 6;
      ctx.stroke();

      // Emoji
      ctx.font = '64px sans-serif';
      ctx.fillText(badge.icon, width / 2, 262);

      // 5. Achievement Title
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 44px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(badge.title, width / 2, 360);

      // 6. Presentation Line
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '22px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('This official recognition is proudly awarded to', width / 2, 415);

      // 7. Recipient Name
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 38px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(user.name || 'Dedicated Commuter', width / 2, 470);

      // 8. Description
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '20px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(badge.description, width / 2, 535);

      // 9. Metric pill badge
      ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
      const pillWidth = 320;
      ctx.fillRect(width / 2 - pillWidth / 2, 580, pillWidth, 42);
      ctx.fillStyle = '#4ade80';
      ctx.font = 'bold 18px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(`Milestone Goal: ${badge.goal} ${badge.metric} Completed`, width / 2, 607);

      // 10. Footer Details: Date, Verification, City
      ctx.fillStyle = '#94a3b8';
      ctx.font = '16px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`Date: ${dateStr}`, 90, 710);
      ctx.fillText('Trichy Safe Corridors & Green Roads', 90, 735);

      ctx.textAlign = 'right';
      ctx.fillText('Verified by CALM-Miles Platform', width - 90, 710);
      ctx.fillStyle = '#38bdf8';
      ctx.fillText('Tiruchirappalli, Tamil Nadu', width - 90, 735);

      // Download
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `CALM-Miles-${badge.id}-photo.png`;
      a.click();
    } catch (err) {
      console.error('Failed to generate image:', err);
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Achievement: ${badge.title}`,
        text: `I just unlocked the "${badge.title}" achievement on CALM-Miles in Trichy!`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(
        `🎉 I just unlocked the "${badge.title}" achievement on CALM-Miles in Trichy!`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="achievement-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <Confetti durationMs={4500} />

      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-amber-300/60 dark:border-amber-700/60 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-amber-500 via-violet-600 to-indigo-600 p-4 text-white flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-200 animate-spin" style={{ animationDuration: '6s' }} />
            <div>
              <span className="text-[10px] uppercase font-black tracking-widest text-amber-200 block">
                Congratulations!
              </span>
              <h2 id="achievement-modal-title" className="text-base sm:text-lg font-black leading-tight">
                Achievement Unlocked
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

        {/* The Official Photo / Certificate Card */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          <div
            ref={cardRef}
            className="rounded-2xl p-5 sm:p-6 bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white border-2 border-amber-400 shadow-xl relative overflow-hidden text-center space-y-3.5"
          >
            {/* Background watermarks */}
            <div className="absolute top-2 right-2 text-white/5 font-black text-6xl select-none pointer-events-none">
              TRICHY
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-[11px] font-bold border border-amber-400/40">
              <Award className="w-3.5 h-3.5" />
              <span>Official Achievement Photo Recognition</span>
            </div>

            {/* Giant Badge Icon */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 via-indigo-600 to-cyan-500 mx-auto flex items-center justify-center text-4xl shadow-xl ring-4 ring-amber-400/50">
              {badge.icon}
            </div>

            {/* Achievement Name */}
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {badge.title}
              </h3>
              <p className="text-xs text-amber-200 font-medium mt-0.5">
                Presented to: <strong>{user.name}</strong>
              </p>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed px-2">
              "{badge.description}"
            </p>

            {/* Metric pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 border border-white/15 text-xs text-emerald-300 font-mono font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Milestone: {badge.goal} {badge.metric}</span>
            </div>

            {/* Footer details */}
            <div className="pt-3 border-t border-white/15 flex items-center justify-between text-[11px] text-slate-400">
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>{dateStr}</span>
              </div>
              <div className="flex items-center gap-1 text-cyan-300">
                <MapPin className="w-3.5 h-3.5" />
                <span>Trichy, Tamil Nadu</span>
              </div>
            </div>
          </div>

          {/* Congratulations voice speech replay button */}
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
            <span>🎉 Voice celebration played automatically.</span>
            <button
              type="button"
              onClick={() => {
                speechSpeaker.playFanfare();
                speechSpeaker.speak(
                  `Congratulations ${user.name}! You unlocked ${badge.title}! Fantastic milestone in Trichy!`
                );
              }}
              className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Replay Voice</span>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex flex-col sm:flex-row items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleDownloadPhoto}
            disabled={downloading}
            className="w-full sm:flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{downloading ? 'Generating Photo...' : '📸 Save Achievement Photo'}</span>
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
