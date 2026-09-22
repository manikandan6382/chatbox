import React, { useState } from 'react';
import { 
  ScanFace, Fingerprint, KeyRound, QrCode, ArrowRight, ShieldCheck, 
  Sun, Moon, Volume2, VolumeX, Eye, EyeOff, Sparkles, CheckCircle2, Lock
} from 'lucide-react';
import { sounds } from '../utils/audio';

interface LoginScreenProps {
  onLogin: (userName?: string) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLogin,
  theme,
  toggleTheme,
  soundEnabled,
  setSoundEnabled
}) => {
  const [authMode, setAuthMode] = useState<'biometric' | 'credentials' | 'singpass'>('biometric');
  const [staffId, setStaffId] = useState('SG-884920');
  const [password, setPassword] = useState('Maybank@2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);
  const [authFeedbackText, setAuthFeedbackText] = useState('Verifying biometric hash...');

  const handleBiometricAuth = (userName: string = 'Manikandan') => {
    if (isAuthenticating || authSuccess) return;
    sounds.playGlassClick();
    setIsAuthenticating(true);
    setAuthFeedbackText('Scanning Face ID via Apple VisionOS Sensor...');

    setTimeout(() => {
      setAuthFeedbackText('Verifying MAS TRM Hardware Token...');
    }, 350);

    setTimeout(() => {
      setIsAuthenticating(false);
      setAuthSuccess(true);
      sounds.playCuteSmile();
      setTimeout(() => {
        onLogin(userName);
      }, 400);
    }, 750);
  };

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAuthenticating || authSuccess) return;
    sounds.playGlassClick();
    setIsAuthenticating(true);
    setAuthFeedbackText('Authenticating Maybank LDAP credentials...');

    setTimeout(() => {
      setIsAuthenticating(false);
      setAuthSuccess(true);
      sounds.playCuteSmile();
      setTimeout(() => {
        onLogin('Manikandan');
      }, 400);
    }, 600);
  };

  const handleSingpassScan = () => {
    if (isAuthenticating || authSuccess) return;
    sounds.playGlassClick();
    setIsAuthenticating(true);
    setAuthFeedbackText('Simulating Singpass Mobile App Approval...');

    setTimeout(() => {
      setIsAuthenticating(false);
      setAuthSuccess(true);
      sounds.playCuteSmile();
      setTimeout(() => {
        onLogin('Manikandan (Singpass)');
      }, 400);
    }, 700);
  };

  return (
    <div className="relative z-10 flex flex-col justify-between h-full w-full p-5 md:p-8 box-border select-none animate-in fade-in duration-500">
      
      {/* Top Floating Telemetry Header */}
      <header className="flex items-center justify-between w-full max-w-5xl mx-auto z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/90 dark:bg-[#181B22]/90 backdrop-blur-xl border border-white/80 dark:border-white/10 p-1 shadow-md flex items-center justify-center">
            <img 
              src="/assets/maybank-tiger-circle.png" 
              alt="Maybank Logo" 
              className="w-full h-full rounded-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                Maybank Singapore
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                HSM Tier-3
              </span>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
              Humanising Financial Services • Secure Terminal Gateway
            </p>
          </div>
        </div>

        {/* Controls Pill */}
        <div className="flex items-center gap-2 bg-white/80 dark:bg-[#181B22]/80 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 p-1.5 rounded-2xl shadow-sm">
          {/* Acoustic Haptics Toggle */}
          <button
            onClick={() => {
              const next = !soundEnabled;
              setSoundEnabled(next);
              sounds.enabled = next;
              if (next) sounds.playGlassClick();
            }}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
            title={soundEnabled ? "Mute Acoustic Haptics" : "Enable Acoustic Haptics"}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-sky-500" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
            title="Toggle Light / Dark"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>
        </div>
      </header>

      {/* Center Floating Apple Spatial Login Pedestal */}
      <main className="flex-1 flex items-center justify-center py-6 px-4">
        <div className="w-full max-w-[440px] bg-white/85 dark:bg-[#12141A]/90 backdrop-blur-3xl rounded-[32px] p-7 md:p-8 shadow-2xl dark:shadow-black/70 border border-white/90 dark:border-white/10 relative overflow-hidden transition-all">
          
          {/* Subtle Golden Ambient Halo at Top */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-32 bg-amber-400/20 dark:bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

          {/* Brand Icon & Welcome */}
          <div className="text-center relative z-10 mb-6">
            <div className="relative inline-block mb-3">
              <img 
                src="/assets/maybank-tiger-circle.png" 
                alt="Maybank Tiger" 
                className="w-16 h-16 rounded-full object-cover shadow-xl ring-4 ring-amber-400/40 dark:ring-amber-400/20 mx-auto"
              />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center ring-2 ring-white dark:ring-[#12141A] shadow-xs">
                <ShieldCheck className="w-3 h-3 stroke-[2.5]" />
              </div>
            </div>
            
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Sign in to Maybank AI
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Select your dummy authentication method to enter workspace
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100/90 dark:bg-[#1B1E26]/90 rounded-2xl mb-6 relative z-10">
            <button
              onClick={() => {
                sounds.playGlassClick();
                setAuthMode('biometric');
              }}
              className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                authMode === 'biometric'
                  ? 'bg-white dark:bg-[#252A36] text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <ScanFace className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
              <span>Passkey</span>
            </button>

            <button
              onClick={() => {
                sounds.playGlassClick();
                setAuthMode('credentials');
              }}
              className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                authMode === 'credentials'
                  ? 'bg-white dark:bg-[#252A36] text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5 text-sky-500 flex-shrink-0" />
              <span>Staff ID</span>
            </button>

            <button
              onClick={() => {
                sounds.playGlassClick();
                setAuthMode('singpass');
              }}
              className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                authMode === 'singpass'
                  ? 'bg-white dark:bg-[#252A36] text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <QrCode className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
              <span>Singpass</span>
            </button>
          </div>

          {/* TAB 1: PASSKEY / BIOMETRIC AUTH */}
          {authMode === 'biometric' && (
            <div className="space-y-4 animate-in fade-in duration-200 relative z-10">
              
              {/* Active Profile Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/60 dark:from-[#181B23] dark:to-[#14161D] border border-slate-200/80 dark:border-white/10 flex items-center gap-3.5 shadow-xs">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 flex items-center justify-center font-black text-base shadow-sm ring-2 ring-amber-400/40 flex-shrink-0">
                  M
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      Manikandan
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      Active
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    manikandan@maybank.com.sg
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                    Senior Wealth Advisor • Singapore Branch
                  </p>
                </div>
              </div>

              {/* Main Passkey Biometric Action */}
              <button
                onClick={() => handleBiometricAuth('Manikandan')}
                disabled={isAuthenticating || authSuccess}
                className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-2xl font-bold text-sm shadow-lg active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 group disabled:opacity-70"
              >
                {authSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Authenticated! Entering Workspace...</span>
                  </>
                ) : isAuthenticating ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white dark:border-slate-900 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs">{authFeedbackText}</span>
                  </div>
                ) : (
                  <>
                    <ScanFace className="w-4 h-4 text-amber-400 dark:text-amber-500 group-hover:scale-110 transition-transform" />
                    <span>Instant Face ID Passkey</span>
                    <ArrowRight className="w-4 h-4 text-slate-400 dark:text-slate-600 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              {/* Alternative Guest Kiosk Session */}
              <button
                onClick={() => handleBiometricAuth('Branch Walk-In Client')}
                disabled={isAuthenticating || authSuccess}
                className="w-full py-2.5 px-4 bg-transparent hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Or enter as Public Branch Kiosk Client</span>
              </button>

            </div>
          )}

          {/* TAB 2: STAFF ID & PASSWORD */}
          {authMode === 'credentials' && (
            <form onSubmit={handleCredentialsSubmit} className="space-y-3.5 animate-in fade-in duration-200 relative z-10">
              
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">
                  Staff ID / Email
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={staffId}
                    onChange={(e) => setStaffId(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#181B23] border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-400/50"
                  />
                  <span className="absolute right-3 top-2.5 text-[10px] font-bold text-slate-400">
                    SG Branch
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">
                    Security Password
                  </label>
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold cursor-pointer hover:underline">
                    Reset Token
                  </span>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-slate-50 dark:bg-[#181B23] border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-400/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isAuthenticating || authSuccess}
                className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-2xl font-bold text-sm shadow-lg active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 mt-4 disabled:opacity-70"
              >
                {authSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Credentials Verified! Entering...</span>
                  </>
                ) : isAuthenticating ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white dark:border-slate-900 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs">{authFeedbackText}</span>
                  </div>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4 text-amber-400 dark:text-amber-500" />
                    <span>Sign In to Maybank AI</span>
                    <ArrowRight className="w-4 h-4 text-slate-400 dark:text-slate-600" />
                  </>
                )}
              </button>

            </form>
          )}

          {/* TAB 3: SINGPASS NATIONAL DIGITAL IDENTITY */}
          {authMode === 'singpass' && (
            <div className="space-y-4 text-center animate-in fade-in duration-200 relative z-10">
              
              <div 
                onClick={handleSingpassScan}
                className="p-5 bg-gradient-to-b from-rose-50/50 to-white dark:from-rose-950/20 dark:to-[#181B23] rounded-2xl border border-rose-200/80 dark:border-rose-900/40 cursor-pointer group hover:shadow-md transition-all flex flex-col items-center"
              >
                {/* Singpass Red Banner */}
                <div className="px-3 py-1 rounded-full bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider mb-3 shadow-xs">
                  Singpass App Login
                </div>

                {/* Mock QR Code Container */}
                <div className="relative p-3 bg-white rounded-xl shadow-xs border border-slate-200 group-hover:scale-105 transition-transform">
                  <div className="w-36 h-36 border-2 border-dashed border-rose-400/80 rounded-lg flex flex-col items-center justify-center p-2 relative bg-slate-50">
                    <QrCode className="w-24 h-24 text-slate-900 stroke-[1.5]" />
                    <div className="absolute inset-0 bg-rose-600/10 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[10px] font-bold text-rose-700 bg-white px-2 py-1 rounded-full shadow-xs">
                        Click to Scan
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-3">
                  Scan QR code with your Singpass app
                </p>
                <p className="text-[10px] text-slate-400 max-w-xs mt-0.5">
                  Click the QR code to simulate instant biometric verification via the Singpass Mobile API.
                </p>
              </div>

              {isAuthenticating && (
                <div className="flex items-center justify-center gap-2 text-xs font-semibold text-rose-600 dark:text-rose-400">
                  <div className="w-3.5 h-3.5 border-2 border-rose-600 border-t-transparent rounded-full animate-spin" />
                  <span>{authFeedbackText}</span>
                </div>
              )}

            </div>
          )}

          {/* Card Footer Security Guarantee */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <div className="flex items-center gap-1.5">
              <Lock className="w-3 h-3 text-emerald-500" />
              <span>MAS TRM Compliant</span>
            </div>
            <span>256-bit HSM Encrypted</span>
          </div>

        </div>
      </main>

      {/* Bottom Legal & Telemetry Footer */}
      <footer className="w-full max-w-5xl mx-auto flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 z-20 px-2">
        <span>© 2026 Maybank Singapore Limited. All rights reserved.</span>
        <div className="flex items-center gap-3">
          <span className="hover:underline cursor-pointer">Security Policy</span>
          <span>•</span>
          <span className="hover:underline cursor-pointer">Singapore Banking Act S47</span>
        </div>
      </footer>

    </div>
  );
};
