import React, { useState } from 'react';
import {
  Mail,
  Building,
  Flame,
  Leaf,
  Bike,
  Footprints,
  Trophy,
  Lock,
  LogIn,
  LogOut,
  PenLine,
  Check,
  ShieldCheck,
  Phone
} from 'lucide-react';
import { UserProfile } from '../types';
import {
  getUserProfile,
  saveUserProfile,
  signOutActiveUser
} from '../utils/storage';
import { AchievementPhotoModal } from './AchievementPhotoModal';

interface ProfileModalProps {
  onProfileUpdated?: (profile: UserProfile) => void;
  onOpenAuth?: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  onProfileUpdated,
  onOpenAuth
}) => {
  const [profile, setProfile] = useState<UserProfile>(getUserProfile());
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [selectedBadgeForPhoto, setSelectedBadgeForPhoto] = useState<any | null>(null);

  // Edit fields
  const [editName, setEditName] = useState<string>(profile.name);
  const [editEmail, setEditEmail] = useState<string>(profile.email);
  const [editOrg, setEditOrg] = useState<string>(profile.schoolOrOrg);

  const [flashMsg, setFlashMsg] = useState<string | null>(null);

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...profile,
      name: editName.trim() || profile.name,
      email: editEmail.trim() || profile.email,
      schoolOrOrg: editOrg.trim() || profile.schoolOrOrg
    };
    saveUserProfile(updated);
    setProfile(updated);
    setIsEditing(false);
    onProfileUpdated?.(updated);
    setFlashMsg('Profile updated!');
    setTimeout(() => setFlashMsg(null), 3000);
  };

  const handleSignOut = () => {
    signOutActiveUser();
    const fresh = getUserProfile();
    setProfile(fresh);
    onProfileUpdated?.(fresh);
    onOpenAuth?.();
  };

  const unlockedCount = profile.badges.filter((b) => b.unlocked).length;

  return (
    <div className="max-w-4xl mx-auto space-y-5 pb-12">
      {flashMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{flashMsg}</span>
        </div>
      )}

      {/* Profile Card */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-teal-500 text-white font-black text-xl flex items-center justify-center shadow-lg ring-4 ring-teal-500/20">
              {profile.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100">
                  {profile.name}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-900 dark:text-teal-200 text-[10px] font-black uppercase flex items-center gap-1 border border-teal-200 dark:border-teal-800">
                  <ShieldCheck className="w-3 h-3 text-teal-600" />
                  {profile.isLoggedIn ? 'Active Account' : 'Guest'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{profile.email}</span>
              </p>
              <p className="text-xs text-teal-800 dark:text-teal-300 font-bold mt-0.5 flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-teal-600" />
                <span>{profile.schoolOrOrg}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => {
                setEditName(profile.name);
                setEditEmail(profile.email);
                setEditOrg(profile.schoolOrOrg);
                setIsEditing((v) => !v);
              }}
              className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <PenLine className="w-3.5 h-3.5" />
              <span>{isEditing ? 'Cancel' : 'Edit Info'}</span>
            </button>

            {profile.isLoggedIn ? (
              <button
                type="button"
                onClick={handleSignOut}
                className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-500" />
                <span>Sign Out</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenAuth}
                className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In / Register</span>
              </button>
            )}

            <button
              type="button"
              onClick={onOpenAuth}
              className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-indigo-600" />
              <span>Switch Account</span>
            </button>
          </div>
        </div>

        {/* Edit Form */}
        {isEditing && (
          <form
            onSubmit={handleSaveEdit}
            className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3"
          >
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase">
              Edit Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Email ID
                </label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  School / Workplace
                </label>
                <input
                  type="text"
                  value={editOrg}
                  onChange={(e) => setEditOrg(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-indigo-600 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                Save Changes
              </button>
            </div>
          </form>
        )}

        {/* 4 Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200/60 dark:border-teal-900/40">
            <div className="flex items-center gap-1.5 text-xs text-teal-900 dark:text-teal-300 font-bold mb-0.5">
              <Bike className="w-3.5 h-3.5 text-teal-600" />
              <span>Cycling</span>
            </div>
            <div className="text-xl font-black font-mono text-teal-950 dark:text-teal-100">
              {profile.totalKmCycled.toFixed(1)} <span className="text-xs font-normal">km</span>
            </div>
            <p className="text-[10px] text-teal-700 dark:text-teal-400">Total bike distance</p>
          </div>

          <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-900/40">
            <div className="flex items-center gap-1.5 text-xs text-indigo-800 dark:text-indigo-300 font-bold mb-0.5">
              <Footprints className="w-3.5 h-3.5 text-indigo-600" />
              <span>Walking</span>
            </div>
            <div className="text-xl font-black font-mono text-indigo-950 dark:text-indigo-100">
              {profile.totalKmWalked.toFixed(1)} <span className="text-xs font-normal">km</span>
            </div>
            <p className="text-[10px] text-indigo-600 dark:text-indigo-400">Total walk distance</p>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40">
            <div className="flex items-center gap-1.5 text-xs text-emerald-800 dark:text-emerald-300 font-bold mb-0.5">
              <Leaf className="w-3.5 h-3.5 text-emerald-600" />
              <span>CO₂ Saved</span>
            </div>
            <div className="text-xl font-black font-mono text-emerald-900 dark:text-emerald-100">
              {profile.co2SavedKg.toFixed(1)} <span className="text-xs font-normal">kg</span>
            </div>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400">Clean air saved</p>
          </div>

          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40">
            <div className="flex items-center gap-1.5 text-xs text-amber-800 dark:text-amber-300 font-bold mb-0.5">
              <Flame className="w-3.5 h-3.5 text-amber-600" />
              <span>Calories</span>
            </div>
            <div className="text-xl font-black font-mono text-amber-900 dark:text-amber-100">
              {profile.caloriesBurned} <span className="text-xs font-normal">kcal</span>
            </div>
            <p className="text-[10px] text-amber-600 dark:text-amber-400">Active energy</p>
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">
              Achievements & Badges
            </h3>
          </div>
          <span className="text-xs font-black font-mono text-amber-600 dark:text-amber-400">
            {unlockedCount} / {profile.badges.length} Won 🏆
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {profile.badges.map((b) => (
            <div
              key={b.id}
              onClick={() => {
                if (b.unlocked) {
                  setSelectedBadgeForPhoto(b);
                }
              }}
              className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3 ${
                b.unlocked
                  ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/60 hover:border-amber-400 cursor-pointer shadow-xs hover:ring-2 hover:ring-amber-400/30'
                  : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-80'
              }`}
            >
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 shadow-xs ${
                  b.unlocked
                    ? 'bg-amber-400 text-amber-950 ring-2 ring-amber-300'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                }`}
              >
                {b.unlocked ? b.icon : <Lock className="w-4 h-4 text-slate-400" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 truncate">
                    {b.title}
                  </h4>
                  {b.unlocked && (
                    <span className="text-[9px] font-black uppercase text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/60 px-2 py-0.5 rounded-full shrink-0">
                      Won 🏆
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                  {b.description}
                </p>
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        b.unlocked ? 'bg-amber-500' : 'bg-teal-600'
                      }`}
                      style={{
                        width: `${Math.min(100, (b.progress / b.goal) * 100)}%`
                      }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0">
                    {b.progress}/{b.goal}
                  </span>
                </div>

                {b.unlocked && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedBadgeForPhoto(b);
                    }}
                    className="mt-2 text-[11px] font-black text-amber-800 dark:text-amber-200 bg-amber-100/80 dark:bg-amber-900/40 hover:bg-amber-200 dark:hover:bg-amber-800/60 px-2.5 py-1 rounded-xl border border-amber-300 dark:border-amber-700 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>📸 View Photo & Congrats</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Helplines */}
      <div className="rounded-3xl border border-teal-200 dark:border-teal-900/60 bg-teal-50/40 dark:bg-teal-950/20 p-4 sm:p-5 shadow-sm space-y-3">
        <h3 className="text-xs font-black text-teal-900 dark:text-teal-200 uppercase tracking-wider flex items-center gap-1.5">
          <Phone className="w-4 h-4 text-teal-600" />
          <span>Trichy City Helplines</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60 shadow-2xs">
            <p className="font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1">
              <span>🚑 Emergency Ambulance</span>
            </p>
            <a href="tel:108" className="text-rose-600 dark:text-rose-400 font-black text-sm mt-0.5 block hover:underline">
              108 (Free 24x7)
            </a>
          </div>

          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
            <p className="font-bold text-slate-900 dark:text-slate-100">Police & SOS</p>
            <a href="tel:112" className="text-indigo-600 dark:text-indigo-400 font-black text-sm mt-0.5 block hover:underline">
              112 / 100
            </a>
          </div>

          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
            <p className="font-bold text-slate-900 dark:text-slate-100">GH Trauma & Ambulance</p>
            <a href="tel:04312701201" className="text-teal-700 dark:text-teal-400 font-black text-sm mt-0.5 block hover:underline">
              0431-2701201
            </a>
          </div>
        </div>
      </div>

      {/* Achievement Photo & Congratulations Modal */}
      <AchievementPhotoModal
        badge={selectedBadgeForPhoto}
        user={profile}
        isOpen={!!selectedBadgeForPhoto}
        onClose={() => setSelectedBadgeForPhoto(null)}
      />
    </div>
  );
};
