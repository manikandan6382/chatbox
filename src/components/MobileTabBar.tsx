import React from 'react';
import { MessageSquare, Clock, Compass, Lock } from 'lucide-react';
import { sounds } from '../utils/audio';

export type MobileTab = 'chat' | 'chats' | 'explore' | 'lock';

interface MobileTabBarProps {
  activeTab: MobileTab;
  onSelectTab: (tab: MobileTab) => void;
  onOpenSidebar: () => void;
  onOpenExplore: () => void;
  onLockSession: () => void;
  embedded?: boolean;
}

export const MobileTabBar: React.FC<MobileTabBarProps> = ({
  activeTab,
  onSelectTab,
  onOpenSidebar,
  onOpenExplore,
  onLockSession,
  embedded = false
}) => {
  const handleTabPress = (tab: MobileTab) => {
    sounds.playGlassClick();
    onSelectTab(tab);

    if (tab === 'chats') {
      onOpenSidebar();
    } else if (tab === 'explore') {
      onOpenExplore();
    } else if (tab === 'lock') {
      onLockSession();
    }
  };

  return (
    <nav 
      className={`${
        embedded 
          ? 'shrink-0 z-30 bg-white/90 dark:bg-[#0A0D14]/90 backdrop-blur-3xl border-t border-white/80 dark:border-white/10 shadow-lg select-none pb-2 pt-1' 
          : 'md:hidden fixed bottom-0 inset-x-0 z-40 gpu-layer bg-white/85 dark:bg-[#0A0D14]/90 backdrop-blur-3xl border-t border-white/80 dark:border-white/10 shadow-[0_-10px_35px_rgba(0,0,0,0.1)] dark:shadow-[0_-12px_45px_rgba(0,0,0,0.6)] safe-bottom transition-colors duration-300 select-none'
      }`}
      aria-label="Mobile Application Navigation"
    >
      <div className="flex items-center justify-around px-2 pt-2 pb-1.5 max-w-md mx-auto">
        
        {/* Tab 1: Active Chat */}
        <button
          type="button"
          onClick={() => handleTabPress('chat')}
          className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-2xl transition-all duration-200 cursor-pointer ios-press min-w-[64px] ${
            activeTab === 'chat'
              ? 'text-slate-950 dark:text-white font-bold scale-105'
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
          aria-label="Active Conversation"
        >
          <div className={`p-1 rounded-xl transition-colors ${
            activeTab === 'chat' 
              ? 'bg-amber-400/20 text-amber-600 dark:text-amber-400' 
              : ''
          }`}>
            <MessageSquare className="w-5 h-5 stroke-[2.2]" />
          </div>
          <span className="text-[10px] tracking-tight">Chat</span>
        </button>

        {/* Tab 2: Conversations History */}
        <button
          type="button"
          onClick={() => handleTabPress('chats')}
          className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-2xl transition-all duration-200 cursor-pointer ios-press min-w-[64px] ${
            activeTab === 'chats'
              ? 'text-slate-950 dark:text-white font-bold scale-105'
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
          aria-label="Conversation History"
        >
          <div className={`p-1 rounded-xl transition-colors ${
            activeTab === 'chats' 
              ? 'bg-sky-500/20 text-sky-600 dark:text-sky-400' 
              : ''
          }`}>
            <Clock className="w-5 h-5 stroke-[2.2]" />
          </div>
          <span className="text-[10px] tracking-tight">Chats</span>
        </button>

        {/* Tab 3: Explore & Context Tools */}
        <button
          type="button"
          onClick={() => handleTabPress('explore')}
          className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-2xl transition-all duration-200 cursor-pointer ios-press min-w-[64px] ${
            activeTab === 'explore'
              ? 'text-slate-950 dark:text-white font-bold scale-105'
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
          aria-label="Explore Banking Tools & Documents"
        >
          <div className={`p-1 rounded-xl transition-colors ${
            activeTab === 'explore' 
              ? 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-400' 
              : ''
          }`}>
            <Compass className="w-5 h-5 stroke-[2.2]" />
          </div>
          <span className="text-[10px] tracking-tight">Explore</span>
        </button>

        {/* Tab 4: MAS Session Lock */}
        <button
          type="button"
          onClick={() => handleTabPress('lock')}
          className="flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-2xl transition-all duration-200 cursor-pointer ios-press min-w-[64px] text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
          aria-label="Lock Kiosk Session"
        >
          <div className="p-1 rounded-xl hover:bg-amber-400/20 hover:text-amber-500 transition-colors">
            <Lock className="w-5 h-5 stroke-[2.2]" />
          </div>
          <span className="text-[10px] tracking-tight">Lock</span>
        </button>

      </div>
    </nav>
  );
};
