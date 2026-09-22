import React from 'react';
import { CreditCard, Compass, Briefcase, Globe, ArrowUpRight } from 'lucide-react';
import { sounds } from '../utils/audio';

interface StarterCardsProps {
  onSelectPrompt: (title: string) => void;
  compact?: boolean;
}

export const StarterCards: React.FC<StarterCardsProps> = ({ 
  onSelectPrompt,
  compact = false 
}) => {
  const starters = [
    {
      id: '1',
      tag: 'Card Privileges',
      title: 'Horizon Visa Signature',
      subtitle: '3.24 air miles per S$1, airport lounges & zero FX promo fees.',
      prompt: 'What are the privileges for Maybank Horizon Visa Signature cardholders in Singapore?',
      icon: CreditCard,
      accent: 'text-amber-500'
    },
    {
      id: '2',
      tag: 'Journey Design',
      title: 'Customer Onboarding',
      subtitle: 'Streamlined wealth & cardholder journey with instant Singpass value.',
      prompt: 'Help me design a customer onboarding flow for Maybank. Focus on simplicity, personalization, and quick value.',
      icon: Compass,
      accent: 'text-sky-500'
    },
    {
      id: '3',
      tag: 'Singapore Roadmap',
      title: '2025 Branch Strategy',
      subtitle: 'Autonomous spatial kiosks, MAS TRM compliance & advisory milestones.',
      prompt: 'Review the 2025 Product Strategy roadmap and core milestones for Maybank Singapore.',
      icon: Briefcase,
      accent: 'text-emerald-500'
    },
    {
      id: '4',
      tag: 'Global Spend',
      title: 'Overseas Activation',
      subtitle: 'Instant contactless FX activation, lounge access & insurance coverage.',
      prompt: 'Explain the 4-step overseas travel journey and contactless FX activation for Maybank cards.',
      icon: Globe,
      accent: 'text-indigo-500'
    }
  ];

  if (compact) {
    return (
      <div className="flex items-center gap-2 overflow-x-auto py-1 my-2 max-w-4xl no-scrollbar">
        <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider pl-1 flex-shrink-0">
          Suggested:
        </span>
        {starters.map((starter) => {
          const Icon = starter.icon;
          return (
            <button
              key={starter.id}
              onClick={() => {
                sounds.playGlassClick();
                onSelectPrompt(starter.prompt);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 dark:bg-[#151821]/90 backdrop-blur-md border border-slate-200/80 dark:border-white/10 shadow-xs hover:border-slate-300 dark:hover:border-white/25 active:scale-95 transition-all text-xs font-semibold text-slate-700 dark:text-slate-200 flex-shrink-0 cursor-pointer min-h-[40px]"
            >
              <Icon className={`w-3.5 h-3.5 ${starter.accent}`} />
              <span>{starter.title}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-6 w-full max-w-4xl">
      {starters.map((starter) => {
        const Icon = starter.icon;
        return (
          <button
            key={starter.id}
            onClick={() => {
              sounds.playGlassClick();
              onSelectPrompt(starter.prompt);
            }}
            className="p-5 rounded-3xl bg-white/90 dark:bg-[#131722]/90 backdrop-blur-2xl border border-slate-200/90 dark:border-white/10 shadow-[0_12px_36px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,0.9)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)] text-left transition-all hover:-translate-y-1 hover:shadow-lg active:scale-[0.97] group cursor-pointer flex flex-col justify-between min-h-[160px]"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-2xl bg-slate-100 dark:bg-white/10 flex items-center justify-center ${starter.accent} group-hover:scale-110 transition-transform shadow-xs`}>
                  <Icon className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div className="w-6 h-6 rounded-full bg-slate-100/60 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </div>

              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
                {starter.tag}
              </span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight mb-1 group-hover:text-blue-600 dark:group-hover:text-sky-400 transition-colors">
                {starter.title}
              </h4>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug font-normal mt-2">
              {starter.subtitle}
            </p>
          </button>
        );
      })}
    </div>
  );
};
