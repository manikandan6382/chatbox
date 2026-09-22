import React from 'react';
import { Sparkles, Moon, Sun, Plus, ShieldCheck } from 'lucide-react';
import { sounds } from '../utils/audio';

interface MobileHeaderProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  darkWallpaper?: 'waves' | 'arch';
  onToggleWallpaper?: () => void;
  onNewChat: () => void;
  activeChatTitle?: string;
  onOpenSidebar: () => void;
  embedded?: boolean;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  theme,
  onToggleTheme,
  darkWallpaper = 'waves',
  onToggleWallpaper,
  onNewChat,
  activeChatTitle = 'Maybank AI Assistant',
  onOpenSidebar,
  embedded = false
}) => {
  return (
    <header className={`${embedded ? 'flex' : 'md:hidden sticky top-0 inset-x-0 z-30 safe-top'} gpu-layer flex-col bg-white/80 dark:bg-[#080B12]/85 backdrop-blur-2xl border-b border-slate-200/80 dark:border-white/10 shadow-xs transition-colors duration-300 select-none`}>
      <div className="flex items-center justify-between px-3.5 py-2.5 gap-2">
        
        {/* Left: Brand Crest & Thread Indicator (Tapping opens chats drawer) */}
        <button
          onClick={() => {
            sounds.playGlassClick();
            onOpenSidebar();
          }}
          className="flex items-center gap-2.5 min-w-0 text-left cursor-pointer ios-press group"
          title="Open Conversation History"
        >
          <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 ring-1 ring-slate-200/80 dark:ring-white/20 shadow-xs">
            <img 
              src="/assets/maybank-tiger-circle.png" 
              alt="Maybank Tiger Crest" 
              className="w-full h-full object-cover" 
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-900 dark:text-white tracking-tight truncate">
                Maybank AI
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[140px] sm:max-w-[200px] font-medium leading-none mt-0.5">
              {activeChatTitle}
            </p>
          </div>
        </button>

        {/* Center / Right: Apple Dynamic Island Capsule & Fast Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          
          {/* Dynamic Island Session Guard Pill */}
          <div className="hidden xs:flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900/5 dark:bg-white/10 border border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-slate-200 text-[10px] font-bold tracking-wider uppercase">
            <ShieldCheck className="w-3 h-3 text-emerald-500" />
            <span>MAS TRM</span>
          </div>

          {/* Dark Wallpaper Motif Toggle (Waves <-> Arch) */}
          {theme === 'dark' && onToggleWallpaper && (
            <button
              onClick={onToggleWallpaper}
              className="p-2 rounded-full text-amber-400 hover:bg-white/10 active:scale-90 transition-all ios-press cursor-pointer"
              title={`Motif: ${darkWallpaper === 'waves' ? 'Silk Waves' : 'Architectural Arch'}`}
              aria-label="Toggle Dark Wallpaper"
            >
              <Sparkles className="w-4 h-4" />
            </button>
          )}

          {/* Theme Switcher */}
          <button
            onClick={() => {
              sounds.playGlassClick();
              onToggleTheme();
            }}
            className="p-2 rounded-full text-slate-600 dark:text-amber-400 hover:bg-slate-100 dark:hover:bg-white/10 active:scale-90 transition-all ios-press cursor-pointer"
            title="Toggle Light/Dark Theme"
            aria-label="Toggle Light/Dark Theme"
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4" />
            ) : (
              <Sun className="w-4 h-4" />
            )}
          </button>

          {/* New Conversation Button */}
          <button
            onClick={() => {
              sounds.playGlassClick();
              onNewChat();
            }}
            className="p-2 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm active:scale-90 transition-all ios-press cursor-pointer"
            title="Start New Conversation"
            aria-label="New Conversation"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
          </button>

        </div>

      </div>
    </header>
  );
};
