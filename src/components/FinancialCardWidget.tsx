import React, { useState, useRef } from 'react';
import { Plane, Award, Sparkles, ExternalLink, ShieldCheck, ChevronRight } from 'lucide-react';
import { sounds } from '../utils/audio';

interface FinancialCardWidgetProps {
  onOpenCanvas?: () => void;
}

export const FinancialCardWidget: React.FC<FinancialCardWidgetProps> = ({ onOpenCanvas }) => {
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

  return (
    <div className="mt-3 space-y-3 select-none">
      
      {/* 3D Spatial Credit Card Presentation */}
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
        className="w-full max-w-lg p-5 rounded-3xl bg-gradient-to-br from-slate-900 via-[#10141E] to-[#1E2333] dark:from-[#141824] dark:via-[#0F131D] dark:to-[#1A2030] text-white border border-white/20 dark:border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative overflow-hidden group cursor-pointer"
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
              Singapore
            </span>
          </div>

          <span className="text-[10px] font-bold text-sky-400 bg-sky-500/10 border border-sky-400/20 px-2 py-0.5 rounded-full">
            Visa Signature
          </span>
        </div>

        {/* Card Title & Chip */}
        <div className="flex items-end justify-between relative z-10 my-3">
          <div>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
              Air Miles & Travel
            </p>
            <h4 className="text-base md:text-lg font-extrabold tracking-tight text-white flex items-center gap-2">
              Horizon Visa Signature
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
          <span className="font-sans font-semibold text-white/90 text-xs">MANIKANDAN</span>
        </div>
      </div>

      {/* 3 Pillar Benefit Chips */}
      <div className="grid grid-cols-3 gap-2 max-w-lg">
        <div className="p-2.5 rounded-2xl bg-white/70 dark:bg-[#151924]/80 backdrop-blur-md border border-slate-200/70 dark:border-white/10 text-center shadow-xs">
          <div className="flex items-center justify-center text-sky-500 mb-1">
            <Plane className="w-3.5 h-3.5" />
          </div>
          <p className="text-xs font-extrabold text-slate-900 dark:text-white">3.24 mpd</p>
          <p className="text-[10px] text-slate-400 font-medium">Air Miles</p>
        </div>

        <div className="p-2.5 rounded-2xl bg-white/70 dark:bg-[#151924]/80 backdrop-blur-md border border-slate-200/70 dark:border-white/10 text-center shadow-xs">
          <div className="flex items-center justify-center text-amber-500 mb-1">
            <Award className="w-3.5 h-3.5" />
          </div>
          <p className="text-xs font-extrabold text-slate-900 dark:text-white">Free Lounge</p>
          <p className="text-[10px] text-slate-400 font-medium">Airport Access</p>
        </div>

        <div className="p-2.5 rounded-2xl bg-white/70 dark:bg-[#151924]/80 backdrop-blur-md border border-slate-200/70 dark:border-white/10 text-center shadow-xs">
          <div className="flex items-center justify-center text-emerald-500 mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <p className="text-xs font-extrabold text-slate-900 dark:text-white">S$0 Fee</p>
          <p className="text-[10px] text-slate-400 font-medium">3-Yr Waiver</p>
        </div>
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
          <span>View Privileges Canvas</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        <button 
          type="button"
          onClick={() => {
            sounds.playGlassClick();
            window.open('https://www.maybank2u.com.sg', '_blank');
          }}
          className="py-2 px-3 rounded-xl bg-white/80 dark:bg-white/10 hover:bg-white dark:hover:bg-white/15 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-white/10 text-xs font-semibold flex items-center gap-1.5 shadow-xs active:scale-95 transition-all cursor-pointer"
        >
          <span>Singpass Apply</span>
          <ExternalLink className="w-3 h-3 text-slate-400" />
        </button>
      </div>

    </div>
  );
};
