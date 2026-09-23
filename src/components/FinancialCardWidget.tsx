import React, { useState, useRef } from 'react';
import { TrendingUp, Award, Sparkles, ShieldCheck, ChevronRight, Lock, BarChart3 } from 'lucide-react';
import { sounds } from '../utils/audio';

export type FinancialWidgetType = 'saveup' | 'fd' | 'asnb';

interface FinancialCardWidgetProps {
  type?: FinancialWidgetType;
  onOpenCanvas?: () => void;
}

export const FinancialCardWidget: React.FC<FinancialCardWidgetProps> = ({ 
  type = 'saveup',
  onOpenCanvas 
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const rotateX = (y / (rect.height / 2)) * -8;
    const rotateY = (x / (rect.width / 2)) * 8;
    setRotate({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
    setIsHovered(false);
  };

  // Polymorphic Metadata
  const config = {
    saveup: {
      badge: 'High-Yield Account',
      badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-400/20',
      category: 'Smart Savings & Returns',
      title: 'Maybank SaveUp Account',
      holder: 'VALUED ACCOUNT HOLDER',
      accentGlow: 'from-slate-900 via-[#10141E] to-[#1E2333]',
      chip1: { icon: TrendingUp, val: 'Up to 3.00%', label: 'Interest p.a.', color: 'text-emerald-500' },
      chip2: { icon: Award, val: 'RM0 Monthly', label: 'Fee Waiver', color: 'text-amber-500' },
      chip3: { icon: ShieldCheck, val: 'PIDM Insured', label: 'Up to RM250k', color: 'text-sky-500' }
    },
    fd: {
      badge: 'Guaranteed Return',
      badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-400/20',
      category: 'e-Fixed Deposit Certificate',
      title: 'Maybank Fixed Deposit',
      holder: 'CERTIFICATE HOLDER',
      accentGlow: 'from-[#191612] via-[#241F16] to-[#17140F]',
      chip1: { icon: TrendingUp, val: 'Up to 3.80%', label: 'Annual Return', color: 'text-amber-500' },
      chip2: { icon: Lock, val: '1 to 60 Months', label: 'Flexible Tenures', color: 'text-emerald-500' },
      chip3: { icon: ShieldCheck, val: 'PIDM Insured', label: 'Up to RM250k', color: 'text-sky-500' }
    },
    asnb: {
      badge: 'Unit Trust & Wealth',
      badgeColor: 'text-sky-400 bg-sky-500/10 border-sky-400/20',
      category: 'PNB Amanah Saham',
      title: 'ASNB Investment Portfolio',
      holder: 'REGISTERED INVESTOR',
      accentGlow: 'from-[#0D1624] via-[#101F36] to-[#0A1220]',
      chip1: { icon: BarChart3, val: '~5.00% p.a.', label: 'Historical Yield', color: 'text-sky-500' },
      chip2: { icon: Award, val: 'RM1.00 Fixed', label: 'Zero NAV Risk', color: 'text-amber-500' },
      chip3: { icon: ShieldCheck, val: '0% Sales Fee', label: 'Via Maybank2u', color: 'text-emerald-500' }
    }
  }[type];

  return (
    <div className="mt-3 space-y-3 select-none">
      
      {/* 3D Spatial Credit/Deposit Card Presentation */}
      <div 
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => { setIsHovered(true); sounds.playGlassClick(); }}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `perspective(800px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
          transformStyle: 'preserve-3d',
          transition: isHovered ? 'transform 0.08s ease-out' : 'transform 0.5s ease-out'
        }}
        className={`w-full max-w-lg p-5 rounded-3xl bg-gradient-to-br ${config.accentGlow} text-white border border-white/20 dark:border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative overflow-hidden group cursor-pointer`}
        onClick={() => {
          sounds.playGlassClick();
          if (onOpenCanvas) onOpenCanvas();
        }}
      >
        {/* Specular Glare Layer */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-40 group-hover:opacity-75 transition-opacity"
          style={{
            background: 'radial-gradient(circle at 60% 20%, rgba(255,255,255,0.25) 0%, transparent 65%)'
          }}
        />

        {/* Maybank Header Strip */}
        <div className="flex items-center justify-between relative z-10 mb-4">
          <div className="flex items-center gap-2">
            <img 
              src="/assets/maybank-tiger-circle.png" 
              alt="Maybank" 
              className="w-6 h-6 rounded-full object-cover shadow-xs" 
            />
            <span className="text-xs font-black tracking-wider uppercase text-amber-400">
              Maybank
            </span>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest pl-1 border-l border-white/20">
              Sovereign Wealth
            </span>
          </div>

          <span className={`text-[10px] font-bold border px-2 py-0.5 rounded-full ${config.badgeColor}`}>
            {config.badge}
          </span>
        </div>

        {/* Card Title & Chip */}
        <div className="flex items-end justify-between relative z-10 my-3">
          <div>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
              {config.category}
            </p>
            <h4 className="text-base md:text-lg font-extrabold tracking-tight text-white flex items-center gap-2">
              {config.title}
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            </h4>
          </div>

          {/* EMV Chip Icon */}
          <div className="w-8 h-6 rounded bg-gradient-to-tr from-amber-300 via-amber-400 to-amber-200 shadow-xs border border-amber-500/40 relative flex items-center justify-center">
            <div className="w-4 h-3 border border-amber-800/40 rounded-xs" />
          </div>
        </div>

        {/* Masked Number & Cardholder */}
        <div className="flex items-center justify-between relative z-10 pt-2 border-t border-white/10 text-[11px] text-slate-300 font-mono">
          <span>•••• •••• •••• 8824</span>
          <span className="font-sans font-semibold text-white/90 text-xs">{config.holder}</span>
        </div>
      </div>

      {/* 3 Pillar Benefit Chips */}
      <div className="grid grid-cols-3 gap-2 max-w-lg">
        {(() => {
          const Chip1Icon = config.chip1.icon;
          const Chip2Icon = config.chip2.icon;
          const Chip3Icon = config.chip3.icon;
          return (
            <>
              <div className="p-2.5 rounded-2xl bg-white/70 dark:bg-[#151924]/80 backdrop-blur-md border border-slate-200/70 dark:border-white/10 text-center shadow-xs">
                <div className={`flex items-center justify-center mb-1 ${config.chip1.color}`}>
                  <Chip1Icon className="w-3.5 h-3.5" />
                </div>
                <p className="text-xs font-extrabold text-slate-900 dark:text-white">{config.chip1.val}</p>
                <p className="text-[10px] text-slate-400 font-medium">{config.chip1.label}</p>
              </div>

              <div className="p-2.5 rounded-2xl bg-white/70 dark:bg-[#151924]/80 backdrop-blur-md border border-slate-200/70 dark:border-white/10 text-center shadow-xs">
                <div className={`flex items-center justify-center mb-1 ${config.chip2.color}`}>
                  <Chip2Icon className="w-3.5 h-3.5" />
                </div>
                <p className="text-xs font-extrabold text-slate-900 dark:text-white">{config.chip2.val}</p>
                <p className="text-[10px] text-slate-400 font-medium">{config.chip2.label}</p>
              </div>

              <div className="p-2.5 rounded-2xl bg-white/70 dark:bg-[#151924]/80 backdrop-blur-md border border-slate-200/70 dark:border-white/10 text-center shadow-xs">
                <div className={`flex items-center justify-center mb-1 ${config.chip3.color}`}>
                  <Chip3Icon className="w-3.5 h-3.5" />
                </div>
                <p className="text-xs font-extrabold text-slate-900 dark:text-white">{config.chip3.val}</p>
                <p className="text-[10px] text-slate-400 font-medium">{config.chip3.label}</p>
              </div>
            </>
          );
        })()}
      </div>

      {/* Quick Action Dock */}
      <div className="flex items-center gap-2 max-w-lg pt-1">
        <button 
          type="button"
          onClick={() => {
            sounds.playGlassClick();
            if (onOpenCanvas) onOpenCanvas();
          }}
          className="flex-1 py-2 px-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
        >
          <span>View Detailed Privileges Canvas</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
};
