import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  User,
  Building,
  LogIn,
  UserPlus,
  Eye,
  EyeOff,
  Compass
} from 'lucide-react';
import { UserProfile } from '../types';
import {
  signInUserWithPassword,
  signUpUserWithPassword,
  signInWithGoogleAccount
} from '../utils/storage';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [schoolOrOrg, setSchoolOrOrg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage('Please provide both email and password.');
      return;
    }

    if (mode === 'signup') {
      if (password.length < 6) {
        setErrorMessage('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match.');
        return;
      }

      const res = signUpUserWithPassword({
        email,
        password,
        name: name || email.split('@')[0],
        schoolOrOrg: schoolOrOrg || 'Trichy'
      });

      if (res.success && res.user) {
        onSuccess(res.user);
        onClose();
      } else {
        setErrorMessage(res.error || 'Could not create account.');
      }
    } else {
      const res = signInUserWithPassword(email, password);
      if (res.success && res.user) {
        onSuccess(res.user);
        onClose();
      } else {
        setErrorMessage(res.error || 'Invalid email or password.');
      }
    }
  };

  const handleGoogleSignIn = () => {
    setErrorMessage(null);
    const googleUser = signInWithGoogleAccount('yashwinrockyboy@gmail.com', 'Yashwin');
    onSuccess(googleUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-700 via-violet-700 to-cyan-600 text-white p-5 sm:p-6 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-400 to-indigo-300 text-indigo-950 flex items-center justify-center shadow-lg ring-4 ring-cyan-300/30 shrink-0">
              <Compass className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight text-white">
                  CALM-Miles
                </h2>
                <span className="text-[10px] bg-cyan-400 text-cyan-950 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  Trichy
                </span>
              </div>
              <p className="text-xs text-indigo-100 mt-0.5">
                Safe routes & clean mobility for everyone
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-4">
          {/* Toggle */}
          <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'signin'
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'signup'
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Create Account</span>
            </button>
          </div>

          {/* Quick Sign In with Google */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full py-2.5 px-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-2.5 shadow-xs transition-all cursor-pointer"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
            <span className="bg-white dark:bg-slate-900 px-3 text-[11px] uppercase tracking-wider text-slate-400 font-bold absolute">
              or email & password
            </span>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 font-medium">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <div className="relative flex items-center rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus-within:ring-2 focus-within:ring-indigo-600">
                  <div className="pl-3.5 pr-1.5 text-slate-400">
                    <User className="w-4 h-4 text-indigo-600" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full py-2.5 px-2 text-xs sm:text-sm text-slate-900 dark:text-slate-100 bg-transparent outline-none font-medium"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative flex items-center rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus-within:ring-2 focus-within:ring-indigo-600">
                <div className="pl-3.5 pr-1.5 text-slate-400">
                  <Mail className="w-4 h-4 text-indigo-600" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full py-2.5 px-2 text-xs sm:text-sm text-slate-900 dark:text-slate-100 bg-transparent outline-none font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Password
              </label>
              <div className="relative flex items-center rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus-within:ring-2 focus-within:ring-indigo-600">
                <div className="pl-3.5 pr-1.5 text-slate-400">
                  <Lock className="w-4 h-4 text-indigo-600" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder={mode === 'signup' ? 'Min. 6 characters' : 'Enter password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full py-2.5 px-2 text-xs sm:text-sm text-slate-900 dark:text-slate-100 bg-transparent outline-none font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative flex items-center rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus-within:ring-2 focus-within:ring-indigo-600">
                    <div className="pl-3.5 pr-1.5 text-slate-400">
                      <Lock className="w-4 h-4 text-indigo-600" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Repeat password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full py-2.5 px-2 text-xs sm:text-sm text-slate-900 dark:text-slate-100 bg-transparent outline-none font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Community / School / Org
                  </label>
                  <div className="relative flex items-center rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800">
                    <div className="pl-3.5 pr-1.5 text-slate-400">
                      <Building className="w-4 h-4 text-indigo-500" />
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. Trichy Resident or Cantonment Commuter"
                      value={schoolOrOrg}
                      onChange={(e) => setSchoolOrOrg(e.target.value)}
                      className="w-full py-2.5 px-2 text-xs sm:text-sm text-slate-900 dark:text-slate-100 bg-transparent outline-none font-medium"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 rounded-2xl text-white font-bold text-sm bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 shadow-md shadow-indigo-600/25 transition-all cursor-pointer"
              >
                {mode === 'signup' ? 'Create Account' : 'Sign In'}
              </button>
            </div>
          </form>

          {/* Continue as guest */}
          <div className="pt-1 text-center">
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 underline cursor-pointer"
            >
              Continue without signing in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
