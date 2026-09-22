import React from 'react';
import { Plane, Coffee, Shield, ArrowRight, CreditCard, Sparkles } from 'lucide-react';
import { BenefitCardItem } from '../types';

interface BenefitCardsProps {
  cards: BenefitCardItem[];
  onSelectBenefit?: (benefit: BenefitCardItem) => void;
}

export const BenefitCards: React.FC<BenefitCardsProps> = ({ cards, onSelectBenefit }) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'plane': return <Plane className="w-4 h-4" />;
      case 'lounge': return <Coffee className="w-4 h-4" />;
      case 'shield': return <Shield className="w-4 h-4" />;
      case 'credit-card': return <CreditCard className="w-4 h-4" />;
      default: return <Sparkles className="w-4 h-4" />;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
      {cards.map((card) => (
        <div 
          key={card.id}
          onClick={() => onSelectBenefit && onSelectBenefit(card)}
          className="bg-white dark:bg-[#20242D] p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/60 shadow-sm flex flex-col justify-between hover:border-amber-400 dark:hover:border-amber-400/50 hover:shadow-md transition-all cursor-pointer group"
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-maybank-yellow">
                {getIcon(card.icon)}
              </div>
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                {card.title}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-normal">
              {card.description}
            </p>
          </div>

          <div className="text-[11px] font-semibold text-amber-600 dark:text-maybank-yellow mt-3 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
            <span>{card.actionText}</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      ))}
    </div>
  );
};
