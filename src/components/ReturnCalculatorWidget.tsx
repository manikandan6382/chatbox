import React, { useState } from 'react';
import { Calculator, TrendingUp, ShieldCheck, ArrowRight, Sparkles, RefreshCw } from 'lucide-react';
import { sounds } from '../utils/audio';

interface ReturnCalculatorWidgetProps {
  onAskAboutPlan?: (summary: string) => void;
}

export const ReturnCalculatorWidget: React.FC<ReturnCalculatorWidgetProps> = ({ onAskAboutPlan }) => {
  const [depositAmount, setDepositAmount] = useState<number>(10000);

  const presets = [5000, 10000, 20000, 50000];

  // Calculated Annual Yields
  // 1. Maybank SaveUp: ~3.00% p.a.
  const saveUpYield = depositAmount * 0.03;
  // 2. Maybank e-Fixed Deposit (12M promo): ~3.80% p.a.
  const fdYield = depositAmount * 0.038;
  // 3. ASNB Fixed Funds (ASB / ASM historical avg): ~5.00% p.a.
  const asnbYield = depositAmount * 0.05;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="my-3 w-full max-w-xl rounded-3xl bg-white/90 dark:bg-[#141824]/90 backdrop-blur-2xl border border-slate-200/80 dark:border-white/10 p-5 shadow-[0_12px_36px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.12)]">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 dark:bg-amber-400/15 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Calculator className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
              Interactive Returns & Yield Simulator
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            </h4>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
              Slide deposit amount to project annual earnings
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            sounds.playGlassClick();
            setDepositAmount(10000);
          }}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          title="Reset to RM10,000"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Slider & Presets */}
      <div className="space-y-3 mb-5">
        <div className="flex items-baseline justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Initial Capital Deposit:
          </span>
          <span className="text-xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">
            {formatCurrency(depositAmount)}
          </span>
        </div>

        {/* Range Slider */}
        <input 
          type="range"
          min={1000}
          max={100000}
          step={1000}
          value={depositAmount}
          onChange={(e) => {
            setDepositAmount(Number(e.target.value));
          }}
          className="w-full h-2 bg-slate-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-sky-500"
        />

        {/* Preset Chips */}
        <div className="flex items-center gap-2 pt-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Quick:
          </span>
          {presets.map((amt) => (
            <button
              key={amt}
              onClick={() => {
                sounds.playGlassClick();
                setDepositAmount(amt);
              }}
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                depositAmount === amt
                  ? 'bg-sky-500 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/20'
              }`}
            >
              {formatCurrency(amt)}
            </button>
          ))}
        </div>
      </div>

      {/* 3 Pillar Comparison Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-4">
        
        {/* SaveUp Card */}
        <div className="p-3 rounded-2xl bg-amber-500/5 dark:bg-amber-400/5 border border-amber-500/20 dark:border-amber-400/15 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Maybank SaveUp
              </span>
              <span className="text-[9px] font-bold text-slate-400">3.00% p.a.</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Projected 1-Yr Yield:</p>
            <p className="text-base font-extrabold text-amber-600 dark:text-amber-400 font-mono mt-0.5">
              +{formatCurrency(saveUpYield)}
            </p>
          </div>
          <div className="mt-2 pt-2 border-t border-amber-500/10 text-[10px] text-slate-400 space-y-0.5">
            <p>• High liquid access</p>
            <p>• PIDM insured</p>
          </div>
        </div>

        {/* e-Fixed Deposit Card */}
        <div className="p-3 rounded-2xl bg-emerald-500/5 dark:bg-emerald-400/5 border border-emerald-500/20 dark:border-emerald-400/15 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                e-Fixed Deposit
              </span>
              <span className="text-[9px] font-bold text-slate-400">3.80% p.a.</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Projected 1-Yr Yield:</p>
            <p className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
              +{formatCurrency(fdYield)}
            </p>
          </div>
          <div className="mt-2 pt-2 border-t border-emerald-500/10 text-[10px] text-slate-400 space-y-0.5">
            <p>• 100% Capital guaranteed</p>
            <p>• Locked for 12 months</p>
          </div>
        </div>

        {/* ASNB Fixed Funds Card */}
        <div className="p-3 rounded-2xl bg-sky-500/5 dark:bg-sky-400/5 border border-sky-500/20 dark:border-sky-400/15 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                ASNB (ASB / ASM)
              </span>
              <span className="text-[9px] font-bold text-slate-400">~5.00% p.a.</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Projected 1-Yr Yield:</p>
            <p className="text-base font-extrabold text-sky-600 dark:text-sky-400 font-mono mt-0.5">
              +{formatCurrency(asnbYield)}
            </p>
          </div>
          <div className="mt-2 pt-2 border-t border-sky-500/10 text-[10px] text-slate-400 space-y-0.5">
            <p>• Capital preserved @ RM1</p>
            <p>• Zero withdrawal penalty</p>
          </div>
        </div>

      </div>

      {/* CTA Button */}
      {onAskAboutPlan && (
        <button
          onClick={() => {
            sounds.playSendChime();
            onAskAboutPlan(`How can I optimize returns for my deposit of ${formatCurrency(depositAmount)} across SaveUp, FD, and ASNB?`);
          }}
          className="w-full py-2.5 px-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold flex items-center justify-center gap-2 shadow-sm hover:opacity-95 active:scale-98 transition-all cursor-pointer"
        >
          <span>Ask AI to optimize my {formatCurrency(depositAmount)} allocation</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      )}

    </div>
  );
};
