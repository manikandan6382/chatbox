import React, { useState, useEffect, useCallback } from 'react';
import { Fingerprint, Lock } from 'lucide-react';
import { sounds } from '../utils/audio';

interface KioskPrivacyCurtainProps {
  isLocked: boolean;
  onUnlock: () => void;
  theme?: 'light' | 'dark';
}

export const KioskPrivacyCurtain: React.FC<KioskPrivacyCurtainProps> = ({ 
  isLocked, 
  onUnlock, 
  theme = 'dark' 
}) => {
  const [time, setTime] = useState<{
    hours: string;
    minutes: string;
    seconds: string;
    ampm: string;
    date: string;
    timeZone: string;
  }>({
    hours: '--',
    minutes: '--',
    seconds: '--',
    ampm: '',
    date: '',
    timeZone: ''
  });

  const updateTime = useCallback(() => {
    const now = new Date();
    
    // Accurate local device time (12-hour format)
    let rawHours = now.getHours();
    const ampm = rawHours >= 12 ? 'PM' : 'AM';
    rawHours = rawHours % 12;
    const displayHours = rawHours ? String(rawHours).padStart(2, '0') : '12';
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    const date = now.toLocaleDateString(undefined, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    let timeZone = 'Local Time';
    try {
      const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (detected) {
        timeZone = detected.replace(/_/g, ' ');
      }
    } catch {
      timeZone = 'Local Time';
    }

    setTime({
      hours: displayHours,
      minutes,
      seconds,
      ampm,
      date,
      timeZone
    });
  }, []);

  // Clock tick + visibilitychange tab resync
  useEffect(() => {
    updateTime();
    const interval = setInterval(updateTime, 1000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        updateTime();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [updateTime]);

  // Immediate unlock handler
  const handleSafeUnlock = () => {
    sounds.playWinkPop();
    onUnlock();
  };

  // Keyboard escape unlock
  useEffect(() => {
    if (!isLocked) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        handleSafeUnlock();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLocked, onUnlock]);

  if (!isLocked) return null;

  const isLight = theme === 'light';

  return (
    <div 
      onClick={handleSafeUnlock}
      className={`fixed inset-0 z-50 overflow-hidden flex flex-col justify-between items-center select-none cursor-pointer p-6 sm:p-10 md:p-12 animate-in fade-in duration-300 font-sans ${
        isLight ? 'bg-[#F4F5F8] text-slate-900' : 'bg-[#06080D] text-white'
      }`}
      style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", Roboto, system-ui, sans-serif'
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Maybank Kiosk Privacy Screen"
    >
      {/* ========================================================================= */}
      {/* ACT 1: 100% OPAQUE SPATIAL STAGING (ZERO BLEED-THROUGH OF UNDERLYING CHAT) */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Solid Undercoat Guarantee */}
        <div className={`absolute inset-0 ${isLight ? 'bg-[#F4F5F8]' : 'bg-[#06080D]'}`} />

        {/* High-Definition Sculpted Wave Artwork */}
        <img 
          src={isLight ? "/assets/ceramic-waves.png" : "/assets/dark-waves.png"} 
          alt="Luxury Backdrop" 
          className={`w-full h-full object-cover object-center transition-all duration-700 scale-105 ${
            isLight ? 'opacity-35 mix-blend-multiply' : 'opacity-75'
          }`}
        />

        {/* High-Key Studio Spotlights */}
        <div 
          className="absolute inset-0"
          style={{
            background: isLight 
              ? 'radial-gradient(ellipse at 50% 18%, rgba(245, 158, 11, 0.12), transparent 60%)'
              : 'radial-gradient(ellipse at 50% 15%, rgba(245, 158, 11, 0.18), transparent 65%)'
          }}
        />

        {/* Ambient Vignette */}
        <div 
          className={`absolute inset-0 ${
            isLight 
              ? 'bg-gradient-to-b from-white/40 via-transparent to-white/60' 
              : 'bg-gradient-to-b from-black/50 via-transparent to-black/70'
          }`} 
        />
      </div>

      {/* ========================================================================= */}
      {/* ACT 2: MINIMALIST TOP TELEMETRY PILL (APPLE SPATIAL STATUS)               */}
      {/* ========================================================================= */}
      <header className="relative z-10 w-full max-w-4xl flex items-center justify-center animate-in slide-in-from-top-4 duration-500">
        
        {/* Discrete Status Capsule (Centered Apple Dynamic Island) */}
        <div className={`flex items-center gap-2.5 px-5 py-2 rounded-full border backdrop-blur-xl shadow-xs transition-colors ${
          isLight 
            ? 'bg-white/80 border-slate-200/80 text-slate-800 shadow-sm' 
            : 'bg-white/10 border-white/15 text-white/90 shadow-[0_4px_20px_rgba(0,0,0,0.3)]'
        }`}>
          <div className="relative flex items-center justify-center">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping absolute" />
            <span className="w-2 h-2 rounded-full bg-emerald-400 relative" />
          </div>
          <span className="text-[11px] font-bold tracking-wider uppercase">
            MAS TRM Compliant Session Guard
          </span>
        </div>

      </header>

      {/* ========================================================================= */}
      {/* ACT 2 (CONTINUED): THE GRAND HOROLOGICAL CENTERPIECE (APPLE WATCHOS/SONOMA)*/}
      {/* ========================================================================= */}
      <main className="relative z-10 flex flex-col items-center justify-center text-center max-w-3xl px-4 py-4 my-auto">
        
        {/* 3D Golden Maybank Emblem with Breathing Spatial Aura */}
        <div className="relative group mb-6 sm:mb-8">
          {/* Pulsing Aura */}
          <div className="absolute -inset-6 rounded-full bg-amber-400/20 blur-2xl animate-pulse pointer-events-none" />
          
          {/* Glass Disc Pedestal */}
          <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1.5 shadow-[0_20px_50px_rgba(245,158,11,0.25)] relative z-10 flex items-center justify-center transition-transform duration-500 group-hover:scale-105 ${
            isLight 
              ? 'bg-gradient-to-tr from-amber-400 to-amber-200 ring-4 ring-white shadow-xl' 
              : 'bg-gradient-to-tr from-amber-400 to-amber-200 ring-4 ring-white/20'
          }`}>
            <img 
              src="/assets/maybank-tiger-circle.png" 
              alt="Maybank Sovereign Crest" 
              className="w-full h-full object-cover rounded-full shadow-inner" 
            />
          </div>
        </div>

        {/* Spatial Typography: Giant Precision Clock */}
        <div className="flex flex-col items-center justify-center space-y-3 mb-8 sm:mb-10">
          <div className="flex items-baseline justify-center gap-2 sm:gap-4">
            <h1 className={`text-7xl sm:text-9xl md:text-[130px] font-extralight tracking-tighter tabular-nums leading-none drop-shadow-sm flex items-baseline select-none ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}>
              <span>{time.hours}</span>
              <span className="text-amber-500 dark:text-amber-400 animate-pulse px-1">:</span>
              <span>{time.minutes}</span>
            </h1>

            {/* Subtle AM/PM Badge */}
            <span className={`text-xs sm:text-sm md:text-base font-mono font-bold tracking-widest uppercase px-2.5 py-1 rounded-lg border backdrop-blur-md self-center ${
              isLight 
                ? 'bg-slate-900/5 border-slate-300 text-slate-700' 
                : 'bg-white/10 border-white/20 text-amber-300'
            }`}>
              {time.ampm}
            </span>
          </div>

          {/* Local Date */}
          <p className={`text-xs sm:text-sm md:text-base font-semibold tracking-[0.25em] uppercase transition-colors ${
            isLight ? 'text-slate-500' : 'text-slate-400'
          }`}>
            {time.date}
          </p>
        </div>

      </main>

      {/* ========================================================================= */}
      {/* ACT 3: FLOATING VISIONOS DYNAMIC CAPSULE (UNIFIED ACTION CENTER)          */}
      {/* ========================================================================= */}
      <footer className="relative z-10 w-full max-w-md flex flex-col items-center gap-3.5 pb-2 animate-in slide-in-from-bottom-4 duration-500">
        
        {/* Floating VisionOS Pill Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleSafeUnlock();
          }}
          className={`group flex items-center justify-center gap-3 px-8 py-4 rounded-full border transition-all duration-300 cursor-pointer shadow-xl hover:scale-105 active:scale-95 ${
            isLight 
              ? 'bg-slate-900 text-white hover:bg-slate-800 border-slate-800 shadow-[0_15px_35px_rgba(0,0,0,0.15)]' 
              : 'bg-white/10 hover:bg-white/20 border-white/25 text-white shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.2)] backdrop-blur-2xl'
          }`}
          aria-label="Tap anywhere to resume your session"
        >
          <div className="p-1 rounded-full bg-amber-400/20 text-amber-400 group-hover:bg-amber-400 group-hover:text-slate-950 transition-colors">
            <Fingerprint className="w-5 h-5 animate-pulse" />
          </div>
          <span className="text-xs sm:text-sm font-bold tracking-widest uppercase">
            Tap anywhere to resume
          </span>
        </button>

        {/* Reassurance Micro-Copy */}
        <div className={`flex items-center gap-2 text-[11px] tracking-wide text-center transition-colors ${
          isLight ? 'text-slate-500' : 'text-slate-400/80'
        }`}>
          <Lock className="w-3 h-3 text-amber-400 shrink-0" />
          <span>Customer records masked for privacy • Maybank Singapore</span>
        </div>

      </footer>

    </div>
  );
};
