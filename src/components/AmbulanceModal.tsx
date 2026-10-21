import React, { useState } from 'react';
import {
  X,
  Phone,
  PhoneCall,
  Clock,
  MapPin,
  ShieldAlert,
  Copy,
  Check,
  AlertTriangle,
  HeartPulse,
  Info
} from 'lucide-react';
import { AMBULANCE_CONTACTS, AmbulanceContact } from '../data/ambulanceDirectory';

interface AmbulanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectHospitalLocation?: (lat: number, lon: number, name: string) => void;
}

export const AmbulanceModal: React.FC<AmbulanceModalProps> = ({
  isOpen,
  onClose,
  onSelectHospitalLocation
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');

  if (!isOpen) return null;

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredContacts = AMBULANCE_CONTACTS.filter((c) => {
    if (filterType === 'all') return true;
    if (filterType === 'govt') return c.type === 'Govt Free';
    if (filterType === 'trauma') return c.type === 'Trauma / Critical';
    return true;
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ambulance-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-rose-200 dark:border-rose-950 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 p-4 sm:p-5 text-white flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shadow-inner text-xl">
              🚑
            </div>
            <div>
              <h2 id="ambulance-modal-title" className="text-lg font-black tracking-tight flex items-center gap-1.5">
                Emergency Ambulance Directory
              </h2>
              <p className="text-xs text-rose-100 font-medium">
                Tiruchirappalli 24/7 Rapid Medical Response & Helplines
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white cursor-pointer"
            aria-label="Close ambulance modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Primary Instant 108 Emergency Banner */}
        <div className="bg-rose-50 dark:bg-rose-950/40 border-b border-rose-200 dark:border-rose-900/60 p-3 sm:p-4 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5 animate-pulse">
                <HeartPulse className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-rose-900 dark:text-rose-100 text-sm">
                    Toll-Free National 108 Emergency
                  </span>
                  <span className="text-[10px] bg-rose-600 text-white font-bold px-1.5 py-0.5 rounded-full uppercase">
                    Immediate
                  </span>
                </div>
                <p className="text-xs text-rose-800 dark:text-rose-300">
                  Dial 108 for free Tamil Nadu emergency medical, accident & life support dispatch.
                </p>
              </div>
            </div>

            <a
              href="tel:108"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-black text-sm shadow-md transition-transform active:scale-95 text-center shrink-0"
            >
              <PhoneCall className="w-4 h-4 animate-bounce" />
              <span>Call 108 Now</span>
            </a>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 text-xs bg-slate-50/50 dark:bg-slate-900/50 shrink-0 overflow-x-auto">
          <span className="text-[11px] font-bold text-slate-400 shrink-0">Filter:</span>
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              filterType === 'all'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}
          >
            All Numbers ({AMBULANCE_CONTACTS.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('govt')}
            className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              filterType === 'govt'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}
          >
            Free Govt Services
          </button>
          <button
            type="button"
            onClick={() => setFilterType('trauma')}
            className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              filterType === 'trauma'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}
          >
            Trauma & Critical Care
          </button>
        </div>

        {/* Ambulance Cards List */}
        <div className="overflow-y-auto p-4 space-y-3 flex-1">
          {filteredContacts.map((contact) => {
            const isCopied = copiedId === contact.id;

            return (
              <div
                key={contact.id}
                className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 hover:border-rose-400 dark:hover:border-rose-700 transition-all shadow-xs space-y-2.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                        {contact.name}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {contact.type}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                      {contact.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400 flex-wrap">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-rose-500" />
                    <span>{contact.available}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-emerald-600 font-semibold">⚡ Response:</span>
                    <span>{contact.avgResponseTime}</span>
                  </div>
                  <div className="flex items-center gap-1 truncate">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{contact.location}</span>
                  </div>
                </div>

                {/* Call and Copy Actions */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-rose-700 dark:text-rose-400 tracking-wide font-mono">
                      📞 {contact.displayPhone}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(contact.id, contact.phone)}
                      className="text-[11px] px-2 py-1 rounded-md text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                      title="Copy phone number"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-600 font-bold">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5 ml-auto">
                    {onSelectHospitalLocation && (
                      <button
                        type="button"
                        onClick={() => {
                          onSelectHospitalLocation(contact.lat, contact.lon, contact.shortName);
                          onClose();
                        }}
                        className="text-xs px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60 flex items-center gap-1 transition-colors cursor-pointer"
                        title="Show location on map"
                      >
                        <MapPin className="w-3 h-3 text-indigo-500" />
                        <span>Map View</span>
                      </button>
                    )}
                    <a
                      href={`tel:${contact.phone}`}
                      className="text-xs px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer"
                    >
                      <Phone className="w-3 h-3" />
                      <span>Call Now</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Emergency Protocol Note */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-2 shrink-0">
          <Info className="w-4 h-4 text-rose-500 shrink-0" />
          <span>
            <strong>Emergency Tip:</strong> Stay calm, state your exact street or nearest landmark in Trichy, and keep your phone line open for the dispatch driver.
          </span>
        </div>
      </div>
    </div>
  );
};
