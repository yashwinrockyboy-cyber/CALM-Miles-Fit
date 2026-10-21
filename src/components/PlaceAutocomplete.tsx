import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, LoaderCircle, X, School, Sparkles } from 'lucide-react';
import { Landmark } from '../types';
import { TRICHY_LANDMARKS } from '../data/landmarks';
import { searchLandmarks } from '../utils/routing';

interface PlaceAutocompleteProps {
  label: string;
  placeholder: string;
  value: Landmark | null;
  onChange: (place: Landmark | null) => void;
  isFromField?: boolean;
  onUseCurrentLocation?: () => void;
  isLocating?: boolean;
  accentColor?: 'cyan' | 'indigo' | 'teal';
}

export const PlaceAutocomplete: React.FC<PlaceAutocompleteProps> = ({
  label,
  placeholder,
  value,
  onChange,
  isFromField = false,
  onUseCurrentLocation,
  isLocating = false,
  accentColor = 'cyan'
}) => {
  const [text, setText] = useState<string>(value ? value.name : '');
  const [suggestions, setSuggestions] = useState<Landmark[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setText(value ? value.name : '');
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    if (!text || text.trim().length < 2) {
      setSuggestions(TRICHY_LANDMARKS.slice(0, 8));
      setIsLoading(false);
      return;
    }

    if (value && value.name === text) {
      return;
    }

    setIsLoading(true);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const timer = setTimeout(async () => {
      try {
        const results = await searchLandmarks(text, controller.signal);
        setSuggestions(results);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }, 350);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [text, isOpen, value]);

  const handleSelect = (place: Landmark) => {
    onChange(place);
    setText(place.name);
    setIsOpen(false);
  };

  const isCyan = accentColor === 'cyan' || accentColor === 'teal';

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isCyan ? 'bg-cyan-500' : 'bg-indigo-600'
            }`}
          />
          {label}
        </label>
        {isFromField && onUseCurrentLocation && (
          <button
            type="button"
            onClick={onUseCurrentLocation}
            disabled={isLocating}
            className="text-xs font-bold text-cyan-700 dark:text-cyan-400 hover:text-cyan-900 dark:hover:text-cyan-200 flex items-center gap-1.5 transition-colors disabled:opacity-60 cursor-pointer bg-cyan-50 dark:bg-cyan-950/40 px-2 py-0.5 rounded-lg border border-cyan-200 dark:border-cyan-800"
            title="Use current GPS position"
          >
            {isLocating ? (
              <LoaderCircle className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Navigation className="w-3.5 h-3.5 text-cyan-600" />
            )}
            <span>My Location</span>
          </button>
        )}
      </div>

      <div
        className={`relative flex items-center w-full rounded-2xl border bg-white dark:bg-slate-900 transition-all shadow-xs ${
          isCyan
            ? 'border-slate-300 dark:border-slate-700 focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-500/20'
            : 'border-slate-300 dark:border-slate-700 focus-within:border-indigo-600 focus-within:ring-2 focus-within:ring-indigo-600/20'
        }`}
      >
        <div className="pl-3.5 pr-1.5 text-slate-400">
          <MapPin className={`w-4 h-4 ${isCyan ? 'text-cyan-600' : 'text-indigo-600'}`} />
        </div>

        <input
          type="text"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            setIsOpen(true);
            if (!text) setSuggestions(TRICHY_LANDMARKS.slice(0, 8));
          }}
          placeholder={placeholder}
          className="w-full py-2.5 px-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 bg-transparent outline-none font-medium"
        />

        {isLoading && (
          <div className="pr-3 text-slate-400">
            <LoaderCircle className="w-4 h-4 animate-spin text-cyan-600" />
          </div>
        )}

        {text && !isLoading && (
          <button
            type="button"
            onClick={() => {
              onChange(null);
              setText('');
              setSuggestions(TRICHY_LANDMARKS.slice(0, 8));
              setIsOpen(true);
            }}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            title="Clear"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-64 overflow-y-auto">
          {suggestions.length > 0 ? (
            <div className="py-1">
              {!text && (
                <div className="px-3.5 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>Popular Spots in Trichy</span>
                </div>
              )}
              {suggestions.map((item, idx) => {
                const isHospital = item.category === 'Hospital';
                return (
                  <button
                    type="button"
                    key={`${item.name}-${item.lat}-${idx}`}
                    onClick={() => handleSelect(item)}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-indigo-50/70 dark:hover:bg-slate-800/80 flex items-start gap-2.5 transition-colors border-b border-slate-100 dark:border-slate-800 last:border-b-0 cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-xl bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                      {isHospital ? (
                        <span className="text-sm">🏥</span>
                      ) : (
                        <MapPin className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                          {item.name}
                        </span>
                        {item.category && (
                          <span className={`text-[10px] px-2 py-0.2 rounded-full font-bold uppercase ${
                            isHospital
                              ? 'bg-rose-600 text-white'
                              : 'bg-indigo-100 dark:bg-slate-700 text-indigo-700 dark:text-slate-300'
                          }`}>
                            {item.category}
                          </span>
                        )}
                      </div>
                      {item.displayName && (
                        <div className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {item.displayName}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400 text-center">
              No matching place found for "{text}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};
