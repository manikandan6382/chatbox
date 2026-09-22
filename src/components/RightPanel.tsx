import React from 'react';
import { ArrowRight, FileText, ChevronRight, Calculator, RefreshCw, ShieldAlert, Calendar } from 'lucide-react';

interface RightPanelProps {
  onSelectDoc?: (name: string) => void;
  onSelectTool?: (tool: string) => void;
}

export const RightPanel: React.FC<RightPanelProps> = ({ onSelectDoc, onSelectTool }) => {
  const contextFiles = [
    {
      id: '1',
      name: 'Maybank_Horizon_Perks.pdf',
      meta: 'PDF • 1.2 MB',
      type: 'pdf'
    },
    {
      id: '2',
      name: 'Travel_Insurance_Policy.pdf',
      meta: 'PDF • 2.4 MB',
      type: 'pdf'
    },
    {
      id: '3',
      name: 'Singapore_FX_Rates_2026.pdf',
      meta: 'PDF • 850 KB',
      type: 'doc'
    }
  ];

  const tools = [
    { id: '1', name: 'Air miles accrual calculator', icon: Calculator },
    { id: '2', name: 'Real-time FX currency converter', icon: RefreshCw },
    { id: '3', name: 'Emergency card lock & replace', icon: ShieldAlert },
    { id: '4', name: 'Book Priority Banker appointment', icon: Calendar }
  ];

  return (
    <aside className="w-full h-full flex flex-col gap-4 overflow-y-auto pr-1 pb-6 scroll-smooth animate-in fade-in duration-300">
      
      {/* Top Banner Card with Architectural Arch */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-[#EDF2F7] to-[#DFE6EF] dark:from-[#1A1D24] dark:to-[#12141A] p-6 shadow-sm border border-slate-200/80 dark:border-[#242832] flex flex-col justify-between min-h-[220px] group">
        
        {/* Background Architectural Arch Graphic */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <img 
            src="/assets/ceramic-arch.png" 
            alt="Maybank Premier Arch" 
            className="w-full h-full object-cover object-center opacity-85 transition-transform duration-500 group-hover:scale-105 block dark:hidden" 
          />
          <img 
            src="/assets/dark-arch.png" 
            alt="Maybank Premier Arch Dark" 
            className="w-full h-full object-cover object-center opacity-70 transition-transform duration-500 group-hover:scale-105 hidden dark:block" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/40 to-transparent dark:from-[#14161B]/90 dark:via-[#14161B]/40 dark:to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold tracking-widest text-amber-600 dark:text-maybank-yellow uppercase">
              MAYBANK PREMIER
            </span>
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-snug">
            Turn conversations into wealth.
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Private wealth intelligence. Real financial impact.
          </p>
        </div>

        <div className="relative z-10 flex justify-end pt-3">
          <button 
            onClick={() => onSelectTool && onSelectTool("Explore Maybank Premier Wealth Privileges")}
            className="w-9 h-9 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Context Section */}
      <div className="bg-white/90 dark:bg-[#14161B] rounded-2xl p-4 shadow-sm border border-slate-200/80 dark:border-[#242832]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Context Documents</span>
          </div>
          <button className="text-[11px] font-medium text-amber-600 dark:text-maybank-yellow hover:underline">
            View all
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {contextFiles.map((file) => (
            <button
              key={file.id}
              onClick={() => onSelectDoc && onSelectDoc(file.name)}
              className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-[#1C2028] text-left transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  file.type === 'pdf' 
                    ? 'bg-rose-50 text-rose-500 dark:bg-rose-950/50' 
                    : 'bg-blue-50 text-blue-500 dark:bg-blue-950/50'
                }`}>
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {file.name}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {file.meta}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* Tools Section */}
      <div className="bg-white/90 dark:bg-[#14161B] rounded-2xl p-4 shadow-sm border border-slate-200/80 dark:border-[#242832]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Financial Tools</span>
          </div>
          <button className="text-[11px] font-medium text-amber-600 dark:text-maybank-yellow hover:underline">
            View all
          </button>
        </div>

        <div className="flex flex-col gap-1.5">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.id}
                onClick={() => onSelectTool && onSelectTool(tool.name)}
                className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-[#1C2028] text-left transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-700 dark:text-maybank-yellow flex items-center justify-center">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    {tool.name}
                  </span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Quote Card with Silk Wave */}
      <div className="relative rounded-2xl overflow-hidden bg-slate-100 dark:bg-[#14161B] p-5 shadow-sm border border-slate-200/80 dark:border-[#242832]">
        <div className="absolute inset-0 pointer-events-none opacity-50 dark:opacity-60 overflow-hidden">
          <img 
            src="/assets/ceramic-silk-2.png" 
            alt="Silk Wave Light" 
            className="w-full h-full object-cover block dark:hidden" 
          />
          <img 
            src="/assets/dark-waves.png" 
            alt="Dark Silk Wave" 
            className="w-full h-full object-cover hidden dark:block" 
          />
        </div>
        <div className="relative z-10">
          <p className="text-xs italic font-medium text-slate-700 dark:text-slate-300">
            “Human touch, elevated by intelligence.”
          </p>
          <p className="text-[10px] text-amber-600 dark:text-maybank-yellow mt-1 font-bold tracking-wide">
            — Maybank Singapore
          </p>
        </div>
      </div>

    </aside>
  );
};
