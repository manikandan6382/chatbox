import React, { useState } from 'react';
import { ExternalLink, CreditCard, Plane, Coffee, ShieldCheck, Compass, Check } from 'lucide-react';
import { sounds } from '../utils/audio';

interface FlowCardProps {
  onOpenCanvas?: () => void;
}

export const FlowCard: React.FC<FlowCardProps> = ({ onOpenCanvas }) => {
  const [isActivated, setIsActivated] = useState(false);

  return (
    <div className="space-y-4">
      {/* Outer Card Container */}
      <div className="bg-white/95 dark:bg-[#151822]/90 backdrop-blur-2xl rounded-3xl p-5 border border-slate-200/90 dark:border-white/10 shadow-[0_12px_36px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_45px_rgba(0,0,0,0.4)] transition-all">
        
        {/* Card Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Maybank Overseas Travel & Spend Journey
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                From card activation to departure — four automated steps.
              </p>
            </div>
          </div>

          <button 
            onClick={() => {
              sounds.playGlassClick();
              if (onOpenCanvas) onOpenCanvas();
            }}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/60 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer"
          >
            <span>Open in Canvas</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>

        {/* 4 Connected Process Nodes */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 relative">
          
          {/* Step 1: Activation */}
          <div className="flex flex-col items-center text-center p-3.5 rounded-xl bg-slate-50/80 dark:bg-[#20242D] border border-slate-100 dark:border-slate-800 relative group">
            <div className="w-11 h-11 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center mb-2 shadow-xs">
              <CreditCard className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-900 dark:text-white mb-0.5">
              1. Enable FX
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
              Instant overseas contactless activation
            </p>
            <div className="hidden md:block absolute -right-3.5 top-1/2 -translate-y-1/2 z-10 text-slate-300 dark:text-slate-600 font-bold">
              →
            </div>
          </div>

          {/* Step 2: Spend & Earn */}
          <div className="flex flex-col items-center text-center p-3.5 rounded-xl bg-slate-50/80 dark:bg-[#20242D] border border-slate-100 dark:border-slate-800 relative group">
            <div className="w-11 h-11 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center mb-2 shadow-xs">
              <Plane className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-900 dark:text-white mb-0.5">
              2. 3.2 Miles / S$1
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
              Foreign currency spend & dining points
            </p>
            <div className="hidden md:block absolute -right-3.5 top-1/2 -translate-y-1/2 z-10 text-slate-300 dark:text-slate-600 font-bold">
              →
            </div>
          </div>

          {/* Step 3: Lounges */}
          <div className="flex flex-col items-center text-center p-3.5 rounded-xl bg-slate-50/80 dark:bg-[#20242D] border border-slate-100 dark:border-slate-800 relative group">
            <div className="w-11 h-11 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mb-2 shadow-xs">
              <Coffee className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-900 dark:text-white mb-0.5">
              3. Changi Lounge
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
              Priority Pass international entry
            </p>
            <div className="hidden md:block absolute -right-3.5 top-1/2 -translate-y-1/2 z-10 text-slate-300 dark:text-slate-600 font-bold">
              →
            </div>
          </div>

          {/* Step 4: Insurance */}
          <div className="flex flex-col items-center text-center p-3.5 rounded-xl bg-slate-50/80 dark:bg-[#20242D] border border-slate-100 dark:border-slate-800 relative group">
            <div className="w-11 h-11 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center mb-2 shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-900 dark:text-white mb-0.5">
              4. S$1M Policy
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
              Complimentary travel protection active
            </p>
          </div>

        </div>

      </div>

      {/* Actionable Follow-up Strip (Purged duplicate reaction icon row) */}
      <div className="flex items-center justify-between gap-3 px-1">
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Activate overseas contactless spending for card ending in <strong className="text-slate-900 dark:text-white">4829</strong>?
        </p>

        <button
          onClick={() => {
            sounds.playGlassClick();
            setIsActivated(!isActivated);
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 shadow-xs flex-shrink-0 ${
            isActivated
              ? 'bg-emerald-500 text-white shadow-emerald-500/20'
              : 'bg-amber-400 hover:bg-amber-500 text-slate-950 shadow-amber-400/20'
          }`}
        >
          {isActivated ? (
            <>
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Activated</span>
            </>
          ) : (
            <span>Enable FX Now</span>
          )}
        </button>
      </div>
    </div>
  );
};
