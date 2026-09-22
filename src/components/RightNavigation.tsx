import React, { useState, useEffect } from 'react';
import { 
  FileText, Layers, Users, Mail, HelpCircle, 
  ChevronRight, Info, Wrench, X, ArrowRight,
  CreditCard, Calculator, Play
} from 'lucide-react';
import { sounds } from '../utils/audio';

export interface ContextDoc {
  id: string;
  name: string;
  type: 'pdf' | 'doc';
  size: string;
  prompt: string;
}

export interface SuggestionTool {
  id: string;
  name: string;
  icon: 'flow' | 'persona' | 'email' | 'faq' | 'card' | 'loan';
  prompt: string;
}

interface RightNavigationProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSuggestion: (prompt: string, runImmediately?: boolean, contextDocName?: string) => void;
}

export const RightNavigation: React.FC<RightNavigationProps> = ({
  isOpen,
  onClose,
  onSelectSuggestion
}) => {
  const [activeContextId, setActiveContextId] = useState<string | null>(null);
  const [showAllContext, setShowAllContext] = useState(false);
  const [showAllTools, setShowAllTools] = useState(false);

  // Keyboard Escape listener for drawer dismissal on laptop/tablet viewports
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        sounds.playGlassClick();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const contextDocs: ContextDoc[] = [
    {
      id: 'doc-1',
      name: 'Maybank_Premier_Overview.pdf',
      type: 'pdf',
      size: 'PDF • 12 MB',
      prompt: 'Review Maybank_Premier_Overview.pdf and summarize wealth management privileges, investment thresholds, and exclusive client benefits.'
    },
    {
      id: 'doc-2',
      name: 'Onboarding_Requirements.doc',
      type: 'doc',
      size: 'DOC • 2.4 MB',
      prompt: 'According to Onboarding_Requirements.doc, what are the mandatory Singpass MyInfo verification steps for new Singapore accounts?'
    },
    {
      id: 'doc-3',
      name: 'Competitor_Analysis.doc',
      type: 'doc',
      size: 'DOC • 1.8 MB',
      prompt: 'Based on Competitor_Analysis.doc, compare Maybank Horizon Visa Signature with DBS Altitude and OCBC 90°N air miles earn rates.'
    },
    {
      id: 'doc-4',
      name: 'MAS_TRM_Guidelines_2025.pdf',
      type: 'pdf',
      size: 'PDF • 3.5 MB',
      prompt: 'Highlight the key MAS Technology Risk Management (TRM) compliance requirements for physical branch kiosk sessions.'
    }
  ];

  const tools: SuggestionTool[] = [
    {
      id: 'tool-flow',
      name: 'Create flow diagram',
      icon: 'flow',
      prompt: 'Generate an interactive step-by-step customer onboarding flow diagram for Singapore kiosk users.'
    },
    {
      id: 'tool-persona',
      name: 'Generate user personas',
      icon: 'persona',
      prompt: 'Generate detailed user personas for Singapore wealth banking clients, tech-savvy millennials, and expatriates.'
    },
    {
      id: 'tool-email',
      name: 'Draft email templates',
      icon: 'email',
      prompt: 'Draft a professional branch advisory follow-up email welcoming a high-net-worth client to Maybank Premier.'
    },
    {
      id: 'tool-faq',
      name: 'Build FAQ',
      icon: 'faq',
      prompt: 'Build a comprehensive FAQ covering Maybank Horizon Visa card benefits, miles redemption, and overseas fee waivers.'
    },
    {
      id: 'tool-card',
      name: 'Compare credit cards',
      icon: 'card',
      prompt: 'Show a side-by-side financial card widget comparing Maybank Horizon Visa Signature and Maybank FC Barcelona Visa.'
    },
    {
      id: 'tool-loan',
      name: 'Home loan calculator',
      icon: 'loan',
      prompt: 'Calculate monthly mortgage repayment and TDSR limits for a S$1,500,000 private property in Singapore.'
    }
  ];

  const displayedDocs = showAllContext ? contextDocs : contextDocs.slice(0, 3);
  const displayedTools = showAllTools ? tools : tools.slice(0, 4);

  // Click card body: insert prompt into composer for review/editing
  const handleDocInsert = (doc: ContextDoc) => {
    sounds.playGlassClick();
    setActiveContextId(doc.id);
    onSelectSuggestion(doc.prompt, false, doc.name);
  };

  // Click fast run button: execute immediately
  const handleDocFastRun = (e: React.MouseEvent, doc: ContextDoc) => {
    e.stopPropagation();
    sounds.playSendChime();
    setActiveContextId(doc.id);
    onSelectSuggestion(doc.prompt, true, doc.name);
  };

  const handleToolInsert = (tool: SuggestionTool) => {
    sounds.playGlassClick();
    onSelectSuggestion(tool.prompt, false);
  };

  const handleToolFastRun = (e: React.MouseEvent, tool: SuggestionTool) => {
    e.stopPropagation();
    sounds.playSendChime();
    onSelectSuggestion(tool.prompt, true);
  };

  const renderToolIcon = (icon: SuggestionTool['icon']) => {
    switch (icon) {
      case 'flow':
        return <Layers className="w-4 h-4 text-sky-500 dark:text-sky-400" />;
      case 'persona':
        return <Users className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />;
      case 'email':
        return <Mail className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />;
      case 'faq':
        return <HelpCircle className="w-4 h-4 text-amber-500 dark:text-amber-400" />;
      case 'card':
        return <CreditCard className="w-4 h-4 text-violet-500 dark:text-violet-400" />;
      case 'loan':
        return <Calculator className="w-4 h-4 text-rose-500 dark:text-rose-400" />;
    }
  };

  return (
    <>
      {/* Mobile/Tablet Backdrop Dimming Overlay (Only active when opened as slide-over on screens < 1280px) */}
      <div 
        onClick={() => {
          sounds.playGlassClick();
          onClose();
        }}
        className="fixed inset-0 bg-black/30 backdrop-blur-xs z-30 xl:hidden animate-in fade-in duration-200"
      />

      <aside 
        className="fixed xl:relative right-2 sm:right-4 top-2 sm:top-4 bottom-2 sm:bottom-4 xl:right-auto xl:top-auto xl:bottom-auto w-[calc(100vw-20px)] max-w-[340px] xl:w-[300px] 2xl:w-[330px] flex-shrink-0 flex flex-col gap-3.5 h-[calc(100dvh-20px)] xl:h-full overflow-y-auto custom-scrollbar z-50 xl:z-20 animate-in slide-in-from-right-8 duration-300 pointer-events-auto p-0.5 gpu-layer ios-scroll safe-top safe-bottom"
        aria-label="Context & Tool Suggestions"
      >
        
        {/* ======================================================================= */}
        {/* 1. HERO BANNER CARD (Mockup Match: "Turn conversations into growth.")   */}
        {/* ======================================================================= */}
        <div className="relative rounded-3xl overflow-hidden p-6 min-h-[195px] flex flex-col justify-between border border-white/80 dark:border-white/10 shadow-[0_16px_36px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] dark:shadow-[0_20px_45px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.12)] group">
          
          {/* User-Provided 3D Architectural Arch Background Artwork */}
          {/* Light Mode Arch */}
          <img 
            src="/assets/nav-hero-arch.png" 
            alt="Architectural Portal Light"
            className="absolute inset-0 w-full h-full object-cover object-right-top transition-transform duration-700 group-hover:scale-105 pointer-events-none block dark:hidden"
          />
          {/* Dark Mode Arch (User Provided) */}
          <img 
            src="/assets/nav-hero-dark-arch.png" 
            alt="Architectural Portal Dark"
            className="absolute inset-0 w-full h-full object-cover object-right-top transition-transform duration-700 group-hover:scale-105 pointer-events-none hidden dark:block"
          />

          {/* Theme-Reactive Night/Day Glass Shader Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-transparent dark:from-[#080B13]/90 dark:via-[#080B13]/65 dark:to-transparent pointer-events-none" />

          {/* Close Button on Mobile / Floating Drawer */}
          <button
            onClick={() => {
              sounds.playGlassClick();
              onClose();
            }}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/75 dark:bg-black/40 hover:bg-white dark:hover:bg-black/60 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer z-20 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-xs"
            title="Close Suggestions Panel"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          <div className="relative z-10">
            <div className="flex items-center gap-1.5 mb-2.5">
              <span className="text-[10px] font-black tracking-widest uppercase text-slate-500 dark:text-slate-400">
                ENGAGEAI
              </span>
            </div>

            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white leading-tight tracking-tight mb-2">
              Turn<br />conversations<br />into growth.
            </h3>

            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed max-w-[190px]">
              AI agents. Real business impact.
            </p>
          </div>

          {/* Circular Action Arrow Button matching Mockup */}
          <div className="relative z-10 flex justify-end mt-2">
            <button
              onClick={() => {
                sounds.playSendChime();
                onSelectSuggestion('Analyze Maybank business solutions and enterprise financing capabilities.', true);
              }}
              className="w-9 h-9 rounded-full bg-white dark:bg-white text-slate-900 shadow-md hover:shadow-lg hover:scale-110 active:scale-95 flex items-center justify-center transition-all cursor-pointer border border-slate-100 dark:border-white/20"
              title="Execute Maybank AI Business Overview"
            >
              <ArrowRight className="w-4 h-4 stroke-[2.4]" />
            </button>
          </div>
        </div>

        {/* ======================================================================= */}
        {/* 2. CONTEXT GROUPING CARD (Mockup Match: PDF/DOC Context Documents)      */}
        {/* ======================================================================= */}
        <div className="rounded-3xl p-5 bg-white/80 dark:bg-[#151922]/80 backdrop-blur-2xl border border-white/80 dark:border-white/10 shadow-[0_12px_28px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.8)] dark:shadow-[0_16px_36px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.08)]">
          
          {/* Header with info icon and View all */}
          <div className="flex items-center justify-between mb-3 px-0.5">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-500 dark:text-slate-400">
                <Info className="w-3 h-3 stroke-[2.2]" />
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 tracking-tight">
                Context
              </span>
            </div>

            <button 
              onClick={() => {
                sounds.playGlassClick();
                setShowAllContext(!showAllContext);
              }}
              className="text-[11px] font-medium text-slate-400 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors cursor-pointer"
            >
              {showAllContext ? 'Show less' : 'View all'}
            </button>
          </div>

          {/* Document Items List with Dual-Mode (Insert vs Fast Run) */}
          <div className="flex flex-col gap-2">
            {displayedDocs.map((doc) => {
              const isSelected = activeContextId === doc.id;
              return (
                <div
                  key={doc.id}
                  onClick={() => handleDocInsert(doc)}
                  className={`group flex items-center justify-between p-2.5 rounded-2xl transition-all duration-200 cursor-pointer border ${
                    isSelected
                      ? 'bg-sky-50/90 dark:bg-sky-500/15 border-sky-300 dark:border-sky-500/30 shadow-xs'
                      : 'bg-white/60 dark:bg-white/5 border-transparent hover:bg-white/95 dark:hover:bg-white/10 hover:border-white/80 dark:hover:border-white/10 hover:shadow-xs'
                  }`}
                  title="Click to insert prompt into composer, or click play to run immediately"
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    
                    {/* PDF or DOC File Icon Badge */}
                    <div 
                      className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-xs ${
                        doc.type === 'pdf'
                          ? 'bg-rose-500 text-white shadow-rose-500/20'
                          : 'bg-blue-600 text-white shadow-blue-600/20'
                      }`}
                    >
                      <FileText className="w-4 h-4 stroke-[2]" />
                    </div>

                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 tracking-tight truncate max-w-[160px] group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                        {doc.name}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-400 font-medium">
                        {doc.size}
                      </span>
                    </div>
                  </div>

                  {/* Dual Action: Fast Run Button on hover, else chevron */}
                  <div className="flex items-center flex-shrink-0">
                    <button
                      onClick={(e) => handleDocFastRun(e, doc)}
                      className="p-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500 text-sky-600 hover:text-white dark:text-sky-400 opacity-0 group-hover:opacity-100 transition-all cursor-pointer mr-1"
                      title="Run query immediately"
                    >
                      <Play className="w-3 h-3 fill-current" />
                    </button>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-200 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* ======================================================================= */}
        {/* 3. TOOLS / SUGGESTION PROMPTS CARD (Mockup Match: Flow, Personas, etc.) */}
        {/* ======================================================================= */}
        <div className="rounded-3xl p-5 bg-white/80 dark:bg-[#151922]/80 backdrop-blur-2xl border border-white/80 dark:border-white/10 shadow-[0_12px_28px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.8)] dark:shadow-[0_16px_36px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.08)]">
          
          {/* Header with tool icon and View all */}
          <div className="flex items-center justify-between mb-3 px-0.5">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-500 dark:text-slate-400">
                <Wrench className="w-3 h-3 stroke-[2.2]" />
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 tracking-tight">
                Tools
              </span>
            </div>

            <button 
              onClick={() => {
                sounds.playGlassClick();
                setShowAllTools(!showAllTools);
              }}
              className="text-[11px] font-medium text-slate-400 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors cursor-pointer"
            >
              {showAllTools ? 'Show less' : 'View all'}
            </button>
          </div>

          {/* Tools Items List with Dual-Mode (Insert vs Fast Run) */}
          <div className="flex flex-col gap-2">
            {displayedTools.map((tool) => (
              <div
                key={tool.id}
                onClick={() => handleToolInsert(tool)}
                className="group flex items-center justify-between p-2.5 rounded-2xl bg-white/60 dark:bg-white/5 border border-transparent hover:bg-white/95 dark:hover:bg-white/10 hover:border-white/80 dark:hover:border-white/10 hover:shadow-xs transition-all duration-200 cursor-pointer"
                title="Click to insert prompt into composer, or click play to run immediately"
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  
                  {/* Outlined Tool Icon Box matching Mockup */}
                  <div className="w-8 h-8 rounded-xl bg-slate-100/90 dark:bg-white/10 border border-slate-200/80 dark:border-white/10 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    {renderToolIcon(tool.icon)}
                  </div>

                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 tracking-tight truncate max-w-[160px] group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                    {tool.name}
                  </span>
                </div>

                {/* Dual Action: Fast Run Button on hover, else chevron */}
                <div className="flex items-center flex-shrink-0">
                  <button
                    onClick={(e) => handleToolFastRun(e, tool)}
                    className="p-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500 text-sky-600 hover:text-white dark:text-sky-400 opacity-0 group-hover:opacity-100 transition-all cursor-pointer mr-1"
                    title="Run tool immediately"
                  >
                    <Play className="w-3 h-3 fill-current" />
                  </button>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-200 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* ======================================================================= */}
        {/* 4. INSPIRATION / IMPACT QUOTE CARD (Mockup Match: “From ideas to impact”)*/}
        {/* ======================================================================= */}
        <div className="rounded-3xl p-5 relative overflow-hidden min-h-[115px] flex flex-col justify-end border border-white/80 dark:border-white/10 shadow-[0_12px_28px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.8)] dark:shadow-[0_16px_36px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.08)] group">
          
          {/* User-Provided Silk Ceramic Waves Artwork */}
          {/* Light Mode Silk Waves */}
          <img 
            src="/assets/nav-quote-waves.png" 
            alt="Ceramic Silk Waves Light"
            className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105 pointer-events-none block dark:hidden"
          />
          {/* Dark Mode Silk Waves (User Provided) */}
          <img 
            src="/assets/nav-quote-dark-waves.png" 
            alt="Dark Silk Waves"
            className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105 pointer-events-none hidden dark:block"
          />

          {/* Theme-Reactive Ambient Gradient Shader Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/70 to-white/30 dark:from-[#080B13]/90 dark:via-[#080B13]/60 dark:to-transparent pointer-events-none" />

          <div className="relative z-10">
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight mb-1">
              “From ideas to impact.”
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              — iNextLabs
            </p>
          </div>
        </div>

      </aside>
    </>
  );
};
