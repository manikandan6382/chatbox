import React, { useState, useEffect, useRef } from 'react';
import { ShieldAlert, RefreshCw, Hand, Sparkles } from 'lucide-react';
import { sounds } from '../utils/audio';

interface KioskSessionGuardProps {
  isActiveSession: boolean;
  onResetSession: () => void;
  idleTimeoutSeconds?: number;
  warningDurationSeconds?: number;
}

export const KioskSessionGuard: React.FC<KioskSessionGuardProps> = ({
  isActiveSession,
  onResetSession,
  idleTimeoutSeconds = 60,
  warningDurationSeconds = 10
}) => {
  const [isWarningVisible, setIsWarningVisible] = useState(false);
  const [countdown, setCountdown] = useState(warningDurationSeconds);
  const lastActivityRef = useRef<number>(Date.now());
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Record user activity to keep session alive
  const handleUserActivity = () => {
    lastActivityRef.current = Date.now();
    if (isWarningVisible) {
      sounds.playGlassClick();
      setIsWarningVisible(false);
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
      }
    }
  };

  useEffect(() => {
    if (!isActiveSession) {
      setIsWarningVisible(false);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      return;
    }

    const activityEvents = ['mousedown', 'mousemove', 'keydown', 'touchstart', 'scroll'];
    activityEvents.forEach(evt => window.addEventListener(evt, handleUserActivity, { passive: true }));

    // Check idle status every 2 seconds
    const interval = setInterval(() => {
      const elapsedSeconds = (Date.now() - lastActivityRef.current) / 1000;

      if (elapsedSeconds >= idleTimeoutSeconds && !isWarningVisible) {
        // Trigger 10-second warning countdown
        setIsWarningVisible(true);
        setCountdown(warningDurationSeconds);
        sounds.playGlassClick();

        let remaining = warningDurationSeconds;
        countdownTimerRef.current = setInterval(() => {
          remaining -= 1;
          setCountdown(remaining);

          if (remaining <= 0) {
            if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
            setIsWarningVisible(false);
            sounds.playDeleteSwoosh();
            onResetSession();
          }
        }, 1000);
      }
    }, 2000);

    return () => {
      activityEvents.forEach(evt => window.removeEventListener(evt, handleUserActivity));
      clearInterval(interval);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, [isActiveSession, isWarningVisible, idleTimeoutSeconds, warningDurationSeconds, onResetSession]);

  if (!isWarningVisible) return null;

  return (
    <div 
      onClick={handleUserActivity}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300 select-none cursor-pointer"
    >
      <div 
        onClick={(e) => { e.stopPropagation(); handleUserActivity(); }}
        className="max-w-md w-full bg-white/95 dark:bg-[#141824]/95 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-white/80 dark:border-white/15 shadow-2xl text-center space-y-4"
      >
        
        {/* Pulsing Countdown Ring */}
        <div className="mx-auto w-16 h-16 rounded-full bg-amber-500/10 dark:bg-amber-400/15 border-2 border-amber-500/40 flex items-center justify-center relative">
          <span className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
            {countdown}
          </span>
          <span className="absolute inset-0 rounded-full border-2 border-amber-500 animate-ping opacity-30" />
        </div>

        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block mb-1">
            MAS TRM Privacy Guard • Public Kiosk Security
          </span>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            Are you still there?
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1">
            To safeguard your financial privacy on this public terminal, this conversation will automatically clear in <strong className="text-amber-600 dark:text-amber-400 font-mono">{countdown} seconds</strong>.
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            onClick={handleUserActivity}
            className="w-full py-3 px-5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all cursor-pointer"
          >
            <Hand className="w-4 h-4" />
            <span>Tap Screen to Continue Session</span>
          </button>
        </div>

        <p className="text-[10px] text-slate-400">
          Or tap anywhere outside to keep banking
        </p>

      </div>
    </div>
  );
};
