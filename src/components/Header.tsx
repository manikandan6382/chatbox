import React from 'react';
import { Sun, Moon, HelpCircle, LogOut, ChevronDown } from 'lucide-react';

interface HeaderProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenHelp: () => void;
  onOpenEndSession: () => void;
  language: string;
  onChangeLanguage: (lang: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onToggleTheme,
  onOpenHelp,
  onOpenEndSession,
  language,
  onChangeLanguage
}) => {
  return (
    <header className="h-16 px-6 border-b border-slate-200/60 dark:border-[#222630] flex items-center justify-between flex-shrink-0 z-20">
      
      {/* Product Title & Status */}
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <span>Maybank AI</span>
        </h1>
        <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
          Beta
        </span>
      </div>

      {/* Utilities */}
      <div className="flex items-center gap-3">
        
        {/* Language Selector */}
        <div className="relative">
          <select 
            value={language}
            onChange={(e) => onChangeLanguage(e.target.value)}
            className="appearance-none bg-slate-100 dark:bg-[#1C2028] text-slate-700 dark:text-slate-300 text-xs font-semibold py-2 pl-3 pr-7 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="en">EN (English)</option>
            <option value="zh">ZH (中文)</option>
            <option value="ms">MS (Melayu)</option>
            <option value="ta">TA (தமிழ்)</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-2.5 pointer-events-none text-slate-400" />
        </div>

        {/* Light / Dark Mode Toggle */}
        <button 
          onClick={onToggleTheme}
          className="p-2.5 rounded-xl bg-slate-100 dark:bg-[#1C2028] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700/60 transition-colors" 
          title="Toggle Theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>

        {/* Help */}
        <button 
          onClick={onOpenHelp}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-[#1C2028] text-slate-600 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700/60 transition-colors"
        >
          <HelpCircle className="w-4 h-4" />
          <span>Help</span>
        </button>

        {/* End Session (Kiosk Privacy Guard) */}
        <button 
          onClick={onOpenEndSession}
          className="px-4 py-2 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/60 text-xs font-bold border border-red-200 dark:border-red-800/60 transition-all flex items-center gap-1.5 active:scale-95 shadow-sm"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>End Session</span>
        </button>

      </div>
    </header>
  );
};
