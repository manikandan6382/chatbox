import React from 'react';
import { X, CheckCircle, Shield, Award, Plane } from 'lucide-react';
import { sounds } from '../utils/audio';

interface CardDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CardDetailModal: React.FC<CardDetailModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white/95 dark:bg-[#151822]/95 backdrop-blur-2xl rounded-3xl max-w-lg w-full p-6 border border-white/80 dark:border-white/15 shadow-2xl space-y-5">
        
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Maybank Horizon Visa Signature
              </h3>
              <p className="text-[11px] text-slate-400">Singapore Tier-1 Privileges</p>
            </div>
          </div>
          <button 
            onClick={() => {
              sounds.playGlassClick();
              onClose();
            }}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 active:scale-95 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Card Visual Badge */}
        <div className="flex justify-center py-1">
          <img 
            src="/assets/maybank-horizon-card.svg" 
            alt="Maybank Horizon Card" 
            className="w-72 h-auto rounded-xl shadow-lg border border-slate-700/20" 
          />
        </div>

        {/* Key Privileges List */}
        <div className="space-y-2.5 text-xs">
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-[#20242D] border border-slate-100 dark:border-slate-700/60">
            <Plane className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-800 dark:text-slate-200 block">3.2 Air Miles per S$1</span>
              <span className="text-slate-500 dark:text-slate-400">Valid on overseas spending, air tickets, travel bookings, and weekend dining.</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-[#20242D] border border-slate-100 dark:border-slate-700/60">
            <Shield className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-800 dark:text-slate-200 block">S$1,000,000 Travel Protection</span>
              <span className="text-slate-500 dark:text-slate-400">Automatic complimentary medical emergency & travel inconvenience insurance coverage.</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-[#20242D] border border-slate-100 dark:border-slate-700/60">
            <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-800 dark:text-slate-200 block">Complimentary Changi Airport Lounges</span>
              <span className="text-slate-500 dark:text-slate-400">3 free visits per calendar year at Ambassador Transit and Plaza Premium lounges.</span>
            </div>
          </div>
        </div>

        <button 
          onClick={() => {
            sounds.playGlassClick();
            onClose();
          }}
          className="w-full py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-2xl active:scale-[0.98] transition-all shadow-sm cursor-pointer"
        >
          Close Preview
        </button>

      </div>
    </div>
  );
};
