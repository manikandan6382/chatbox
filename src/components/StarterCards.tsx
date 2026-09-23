import React from 'react';
import { 
  PiggyBank, ShieldCheck, TrendingUp, Smartphone, ArrowUpRight, 
  Sparkles, Wallet, FileText, Scale, CheckCircle2 
} from 'lucide-react';
import { sounds } from '../utils/audio';

interface StarterCardsProps {
  onSelectPrompt: (prompt: string) => void;
  compact?: boolean;
  onHoverTopic?: (topic: string | null) => void;
}

export const StarterCards: React.FC<StarterCardsProps> = ({ 
  onSelectPrompt,
  compact = false,
  onHoverTopic
}) => {
  // 4 Primary Visual Pillar Cards
  const mainCards = [
    {
      id: 'savings',
      topicId: 'savings',
      tag: 'Smart Savings',
      title: 'Choose a Savings Account',
      prompt: 'Help me choose a savings account',
      icon: PiggyBank,
      accent: 'text-amber-500'
    },
    {
      id: 'fd',
      topicId: 'fd',
      tag: 'Guaranteed Returns',
      title: 'Fixed Deposit (FD)',
      prompt: 'I’m interested in Fixed Deposit',
      icon: ShieldCheck,
      accent: 'text-emerald-500'
    },
    {
      id: 'asnb',
      topicId: 'asnb',
      tag: 'Unit Trust & Wealth',
      title: 'Show ASNB Options',
      prompt: 'Show me my ASNB options',
      icon: TrendingUp,
      accent: 'text-sky-500'
    },
    {
      id: 'onboarding',
      topicId: 'onboarding',
      tag: 'Digital Onboarding',
      title: 'Open an Account',
      prompt: 'How can I open an account?',
      icon: Smartphone,
      accent: 'text-indigo-500'
    }
  ];

  // Complete 10 Marketing Team Inquiries for 1-Click Quick Pills
  const allMarketingPills = [
    { id: 'p1', label: 'Help me choose a savings account', prompt: 'Help me choose a savings account', icon: PiggyBank, topic: 'savings' },
    { id: 'p2', label: 'I want to start saving', prompt: 'I want to start saving', icon: Wallet, topic: 'savings' },
    { id: 'p3', label: 'I’m interested in Fixed Deposit', prompt: 'I’m interested in Fixed Deposit', icon: ShieldCheck, topic: 'fd' },
    { id: 'p4', label: 'I want to invest in ASNB', prompt: 'I want to invest in ASNB', icon: TrendingUp, topic: 'asnb' },
    { id: 'p5', label: 'Show me my ASNB options', prompt: 'Show me my ASNB options', icon: Sparkles, topic: 'asnb' },
    { id: 'p6', label: 'How can I open an account?', prompt: 'How can I open an account?', icon: Smartphone, topic: 'onboarding' },
    { id: 'p7', label: 'What documents do I need?', prompt: 'What documents do I need?', icon: FileText, topic: 'onboarding' },
    { id: 'p8', label: 'Which account gives better returns?', prompt: 'Which account gives better returns?', icon: Scale, topic: 'savings' },
    { id: 'p9', label: 'Can I do everything in the app?', prompt: 'Can I do everything in the app?', icon: CheckCircle2, topic: 'onboarding' },
    { id: 'p10', label: 'Help me compare FD and ASNB', prompt: 'Help me compare FD and ASNB', icon: Scale, topic: 'fd' }
  ];

  if (compact) {
    return (
      <div className="flex items-center gap-2 overflow-x-auto py-1 my-1.5 max-w-4xl no-scrollbar">
        <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider pl-1 flex-shrink-0">
          Suggested:
        </span>
        {allMarketingPills.map((pill) => {
          const Icon = pill.icon;
          return (
            <button
              key={pill.id}
              onClick={() => {
                sounds.playGlassClick();
                onSelectPrompt(pill.prompt);
              }}
              onMouseEnter={() => onHoverTopic?.(pill.topic)}
              onMouseLeave={() => onHoverTopic?.(null)}
              onFocus={() => onHoverTopic?.(pill.topic)}
              onBlur={() => onHoverTopic?.(null)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 dark:bg-[#151821]/90 backdrop-blur-md border border-slate-200/80 dark:border-white/10 shadow-xs hover:border-slate-300 dark:hover:border-white/25 active:scale-95 transition-all text-xs font-semibold text-slate-700 dark:text-slate-200 flex-shrink-0 cursor-pointer min-h-[36px]"
            >
              <Icon className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
              <span>{pill.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl flex flex-col items-center gap-2.5 my-2">
      {/* 4 Core Pillar Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 w-full">
        {mainCards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.id}
              onClick={() => {
                sounds.playGlassClick();
                onSelectPrompt(card.prompt);
              }}
              onMouseEnter={() => onHoverTopic?.(card.topicId)}
              onMouseLeave={() => onHoverTopic?.(null)}
              onFocus={() => onHoverTopic?.(card.topicId)}
              onBlur={() => onHoverTopic?.(null)}
              className="relative overflow-hidden p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl bg-white/85 dark:bg-[#131722]/85 backdrop-blur-2xl border border-white/80 dark:border-white/10 shadow-[0_8px_24px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.95)] dark:shadow-[0_12px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.15)] text-left transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] hover:-translate-y-1 hover:scale-[1.015] hover:border-sky-300/80 dark:hover:border-sky-500/30 active:scale-[0.98] group cursor-pointer flex flex-col justify-center min-h-[76px] sm:min-h-[82px]"
            >
              {/* Specular Light Sheen Overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent dark:from-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

              <div className="relative z-10 w-full min-w-0">
                <div className="flex items-center justify-between mb-1.5">
                  <div className={`w-7 h-7 sm:w-8 h-8 rounded-xl bg-slate-100/90 dark:bg-white/10 border border-slate-200/50 dark:border-white/10 flex items-center justify-center ${card.accent} group-hover:scale-110 transition-transform duration-200 shadow-xs flex-shrink-0`}>
                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.2]" />
                  </div>
                  <div className="w-5 h-5 rounded-full bg-slate-100/80 dark:bg-white/10 flex items-center justify-center text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white group-hover:scale-110 transition-all flex-shrink-0">
                    <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </div>

                <span className="text-[9px] font-extrabold uppercase tracking-[0.06em] text-slate-400 dark:text-slate-500 block truncate mb-0.5">
                  {card.tag}
                </span>
                <h4 className="text-xs sm:text-[13px] font-bold text-slate-900 dark:text-white tracking-tight truncate group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                  {card.title}
                </h4>
              </div>
            </button>
          );
        })}
      </div>

      {/* Quick Inquiries Pill Bar (Horizontal Scrollable Carousel for All 10 Marketing Prompts) */}
      <div className="w-full flex items-center gap-2 overflow-x-auto py-1 no-scrollbar">
        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider pl-1 flex-shrink-0">
          Popular:
        </span>
        {allMarketingPills.map((pill) => (
          <button
            key={pill.id}
            onClick={() => {
              sounds.playGlassClick();
              onSelectPrompt(pill.prompt);
            }}
            onMouseEnter={() => onHoverTopic?.(pill.topic)}
            onMouseLeave={() => onHoverTopic?.(null)}
            onFocus={() => onHoverTopic?.(pill.topic)}
            onBlur={() => onHoverTopic?.(null)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/70 dark:bg-white/5 hover:bg-white dark:hover:bg-white/15 border border-slate-200/60 dark:border-white/10 text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all flex-shrink-0 cursor-pointer active:scale-95 shadow-2xs"
          >
            <Sparkles className="w-3 h-3 text-amber-500/80 flex-shrink-0" />
            <span className="truncate max-w-[220px]">{pill.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
