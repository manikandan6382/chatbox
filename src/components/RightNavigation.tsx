import React, { useState, useEffect } from 'react';
import { 
  FileText, Layers, Users, Mail, HelpCircle, 
  ChevronRight, Info, Wrench, X,
  CreditCard, Calculator, Play
} from 'lucide-react';
import { sounds } from '../utils/audio';
import { DocumentPreviewModal, DocumentDetails } from './DocumentPreviewModal';

export interface ContextDoc {
  id: string;
  name: string;
  type: 'pdf' | 'doc';
  size: string;
  prompt: string;
  topics?: string[];
}

export interface SuggestionTool {
  id: string;
  name: string;
  icon: 'flow' | 'persona' | 'email' | 'faq' | 'card' | 'loan';
  prompt: string;
  topics?: string[];
}

interface RightNavigationProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSuggestion: (prompt: string, runImmediately?: boolean, contextDocName?: string) => void;
  highlightedTopic?: string | null;
}

export const RightNavigation: React.FC<RightNavigationProps> = ({
  isOpen,
  onClose,
  onSelectSuggestion,
  highlightedTopic
}) => {
  const [activeContextId, setActiveContextId] = useState<string | null>(null);
  const [showAllContext, setShowAllContext] = useState(false);
  const [showAllTools, setShowAllTools] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<DocumentDetails | null>(null);

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
      name: 'Maybank_Savings_Accounts_Guide.pdf',
      type: 'pdf',
      size: 'PDF • 8.4 MB',
      prompt: 'Review Maybank_Savings_Accounts_Guide.pdf and help me choose a savings account that gives better returns based on my goals.',
      topics: ['savings']
    },
    {
      id: 'doc-2',
      name: 'Fixed_Deposit_vs_ASNB_Comparison.doc',
      type: 'doc',
      size: 'DOC • 3.2 MB',
      prompt: 'According to Fixed_Deposit_vs_ASNB_Comparison.doc, help me compare FD and ASNB in terms of returns, liquidity, and capital guarantee.',
      topics: ['fd', 'asnb']
    },
    {
      id: 'doc-3',
      name: 'ASNB_Investment_Funds_Handbook.pdf',
      type: 'pdf',
      size: 'PDF • 10.6 MB',
      prompt: 'Review ASNB_Investment_Funds_Handbook.pdf and show me my ASNB options, including fixed-price vs variable-price funds.',
      topics: ['asnb']
    },
    {
      id: 'doc-4',
      name: 'MAE_Digital_Onboarding_Checklist.doc',
      type: 'doc',
      size: 'DOC • 1.9 MB',
      prompt: 'Based on MAE_Digital_Onboarding_Checklist.doc, how can I open an account and what documents do I need for instant e-KYC?',
      topics: ['onboarding']
    }
  ];

  const tools: SuggestionTool[] = [
    {
      id: 'tool-compare-fd-asnb',
      name: 'Compare FD & ASNB',
      icon: 'loan',
      prompt: 'Help me compare FD and ASNB',
      topics: ['fd', 'asnb']
    },
    {
      id: 'tool-choose-savings',
      name: 'Choose savings account',
      icon: 'faq',
      prompt: 'Help me choose a savings account',
      topics: ['savings']
    },
    {
      id: 'tool-account-returns',
      name: 'Compare returns',
      icon: 'card',
      prompt: 'Which account gives better returns?',
      topics: ['savings', 'fd', 'asnb']
    },
    {
      id: 'tool-required-docs',
      name: 'Required documents',
      icon: 'email',
      prompt: 'What documents do I need to open an account?',
      topics: ['onboarding']
    },
    {
      id: 'tool-asnb-options',
      name: 'Show ASNB options',
      icon: 'flow',
      prompt: 'Show me my ASNB options',
      topics: ['asnb']
    },
    {
      id: 'tool-app-all',
      name: 'Do everything in app',
      icon: 'persona',
      prompt: 'Can I do everything in the app?',
      topics: ['onboarding']
    }
  ];

  const docDetailsMap: Record<string, DocumentDetails> = {
    'doc-1': {
      id: 'doc-1',
      name: 'Maybank_Savings_Accounts_Guide.pdf',
      type: 'pdf',
      size: 'PDF • 8.4 MB',
      title: 'Maybank Retail Savings Accounts & SaveUp Disclosure',
      summary: 'Comprehensive breakdown of Maybank SaveUp, M2U Premier, and Basic Savings accounts. Outlines booster interest tier qualifications, minimum deposit requirements, and automated Tabung savings options.',
      keyPoints: [
        'Up to 3.00% p.a. booster interest on Maybank SaveUp balances',
        'Daily interest accrual credited monthly on M2U Premier accounts',
        'PIDM insured statutory protection up to RM250,000 per depositor'
      ],
      classification: 'Maybank Retail Product Guide',
      prompt: 'Review Maybank_Savings_Accounts_Guide.pdf and help me choose a savings account that gives better returns based on my goals.'
    },
    'doc-2': {
      id: 'doc-2',
      name: 'Fixed_Deposit_vs_ASNB_Comparison.doc',
      type: 'doc',
      size: 'DOC • 3.2 MB',
      title: 'Capital Growth & Yield Comparative Matrix: FD vs ASNB',
      summary: 'Side-by-side analytical comparison between bank Fixed Deposits and Amanah Saham Nasional Berhad unit trusts, evaluating lock-in tenures, liquidity, early withdrawal terms, and historical dividend rates.',
      keyPoints: [
        'Fixed Deposit: Guaranteed 2.60%–3.80% p.a. return with PIDM statutory coverage',
        'ASNB Fixed Funds: Historically distributed ~4.50%–5.50% p.a. with fixed RM1.00 NAV',
        'Early withdrawal from FD forfeits interest; ASNB has zero withdrawal penalty'
      ],
      classification: 'Wealth Advisory Whitepaper',
      prompt: 'According to Fixed_Deposit_vs_ASNB_Comparison.doc, help me compare FD and ASNB in terms of returns, liquidity, and capital guarantee.'
    },
    'doc-3': {
      id: 'doc-3',
      name: 'ASNB_Investment_Funds_Handbook.pdf',
      type: 'pdf',
      size: 'PDF • 10.6 MB',
      title: 'Amanah Saham Nasional Berhad Unit Trust Handbook',
      summary: 'Operational prospectus detailing all 16 ASNB investment funds available through Maybank2u, covering Bumiputera funds (ASB, ASB 2), All-Malaysian funds (ASM, ASM 2, ASM 3), and variable price equity funds.',
      keyPoints: [
        '0.00% sales charge on all fixed-price ASNB funds subscribed via Maybank',
        'Instant subscription starting from RM10 via Maybank2u and MAE app',
        'Direct unit holding credited to PNB registry within 1 working day'
      ],
      classification: 'ASNB Master Prospectus',
      prompt: 'Review ASNB_Investment_Funds_Handbook.pdf and show me my ASNB options, including fixed-price vs variable-price funds.'
    },
    'doc-4': {
      id: 'doc-4',
      name: 'MAE_Digital_Onboarding_Checklist.doc',
      type: 'doc',
      size: 'DOC • 1.9 MB',
      title: 'MAE Digital Banking & e-KYC Compliance Checklist',
      summary: 'Step-by-step regulatory walkthrough for 100% digital account opening without branch visits. Outlines biometric facial matching requirements, MyKad anti-glare verification, and international passport validation.',
      keyPoints: [
        'Account active within 10 minutes via facial biometric e-KYC',
        'MyKad required for citizens; Passport + valid visa pass for expatriates',
        'Instant virtual debit card generation with home physical delivery'
      ],
      classification: 'Digital Onboarding Standard',
      prompt: 'Based on MAE_Digital_Onboarding_Checklist.doc, how can I open an account and what documents do I need for instant e-KYC?'
    }
  };

  const displayedDocs = showAllContext ? contextDocs : contextDocs.slice(0, 3);
  const displayedTools = showAllTools ? tools : tools.slice(0, 4);

  // Click card body: open document quick-preview modal
  const handleDocInsert = (doc: ContextDoc) => {
    sounds.playGlassClick();
    setActiveContextId(doc.id);
    const details = docDetailsMap[doc.id];
    if (details) {
      setPreviewDoc(details);
    } else {
      onSelectSuggestion(doc.prompt, false, doc.name);
    }
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
      {/* Mobile Drawer Backdrop (Dismisses drawer on mobile screens < 1024px) */}
      <div 
        onClick={() => {
          sounds.playGlassClick();
          onClose();
        }}
        className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden animate-in fade-in duration-200"
      />

      <aside 
        className="fixed lg:relative right-2 sm:right-4 top-2 sm:top-4 bottom-2 sm:bottom-4 lg:right-auto lg:top-auto lg:bottom-auto w-[calc(100vw-20px)] max-w-[340px] lg:w-[320px] 2xl:w-[340px] flex-shrink-0 flex flex-col gap-3.5 h-[calc(100dvh-20px)] lg:h-full overflow-y-auto custom-scrollbar z-50 lg:z-20 animate-in slide-in-from-right-8 duration-300 pointer-events-auto p-0.5 gpu-layer ios-scroll safe-top safe-bottom"
        aria-label="Context & Tool Suggestions"
      >
        
        {/* ======================================================================= */}
        {/* 1. HERO BANNER CARD (Mockup Match: "Turn conversations into growth.")   */}
        {/* ======================================================================= */}
        <div className="relative rounded-3xl overflow-hidden p-6 min-h-[195px] flex flex-col justify-between border border-white/80 dark:border-white/10 shadow-[0_16px_36px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] dark:shadow-[0_20px_45px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.12)] group">
          
          {/* User-Provided 3D Architectural Arch Background Artwork */}
          {/* Light Mode Arch */}
          <img 
            src="/assets/arch.png" 
            alt="Architectural Portal Light"
            className="absolute inset-0 w-full h-full object-cover object-right-top transition-transform duration-700 group-hover:scale-105 pointer-events-none block dark:hidden"
          />
          {/* Dark Mode Arch (User Provided) */}
          <img 
            src="/assets/dark-arch.png" 
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
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span className="text-[10px] font-black tracking-widest uppercase text-amber-600 dark:text-amber-400">
                MAYBANK · WEALTH ADVISORY
              </span>
            </div>

            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white leading-tight tracking-tight mb-2">
              Humanising<br />financial<br />services.
            </h3>

            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed max-w-[210px]">
              Empowering your financial journey with trusted advice and sustainable growth.
            </p>
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
              const isTopicMatched = !!highlightedTopic && doc.topics?.includes(highlightedTopic);
              return (
                <div
                  key={doc.id}
                  onClick={() => handleDocInsert(doc)}
                  className={`group relative flex items-center justify-between p-2.5 rounded-2xl transition-all duration-300 cursor-pointer border ${
                    isSelected
                      ? 'bg-sky-50/95 dark:bg-sky-500/20 border-sky-400 dark:border-sky-400/40 shadow-[0_4px_16px_rgba(56,189,248,0.2)]'
                      : isTopicMatched
                        ? 'bg-sky-50/90 dark:bg-sky-500/20 border-sky-400/80 dark:border-sky-400/60 shadow-[0_0_24px_rgba(56,189,248,0.35)] scale-[1.02] -translate-y-0.5'
                        : 'bg-white/70 dark:bg-white/5 border-white/60 dark:border-white/5 hover:bg-white/95 dark:hover:bg-white/10 hover:border-white/80 dark:hover:border-white/10 hover:shadow-xs'
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
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 tracking-tight truncate max-w-[160px] group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                        {doc.name}
                      </span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] text-slate-500 dark:text-slate-300 font-medium">
                          {doc.size}
                        </span>
                        {isTopicMatched && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full bg-sky-500/20 text-sky-700 dark:text-sky-300 text-[8px] font-black uppercase tracking-wider animate-pulse">
                            Doc Match
                          </span>
                        )}
                      </div>
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
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-200 group-hover:translate-x-0.5 transition-all" />
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
              className="text-[11px] font-medium text-slate-500 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 transition-colors cursor-pointer"
            >
              {showAllTools ? 'Show less' : 'View all'}
            </button>
          </div>

          {/* Tools Items List with Dual-Mode (Insert vs Fast Run) */}
          <div className="flex flex-col gap-2">
            {displayedTools.map((tool) => {
              const isTopicMatched = !!highlightedTopic && tool.topics?.includes(highlightedTopic);
              return (
                <div
                  key={tool.id}
                  onClick={() => handleToolInsert(tool)}
                  className={`group relative flex items-center justify-between p-2.5 rounded-2xl transition-all duration-300 cursor-pointer border ${
                    isTopicMatched
                      ? 'bg-sky-50/90 dark:bg-sky-500/20 border-sky-400/80 dark:border-sky-400/60 shadow-[0_0_24px_rgba(56,189,248,0.35)] scale-[1.02] -translate-y-0.5'
                      : 'bg-white/70 dark:bg-white/5 border-white/60 dark:border-white/5 hover:bg-white/95 dark:hover:bg-white/10 hover:border-white/80 dark:hover:border-white/10 hover:shadow-xs'
                  }`}
                  title="Click to insert prompt into composer, or click play to run immediately"
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    
                    {/* Outlined Tool Icon Box matching Mockup */}
                    <div className="w-8 h-8 rounded-xl bg-slate-100/90 dark:bg-white/10 border border-slate-200/80 dark:border-white/10 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                      {renderToolIcon(tool.icon)}
                    </div>

                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 tracking-tight truncate max-w-[160px] group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                        {tool.name}
                      </span>
                      {isTopicMatched && (
                        <span className="text-[8px] font-black uppercase tracking-wider text-sky-600 dark:text-sky-300 animate-pulse mt-0.5">
                          Suggested Action
                        </span>
                      )}
                    </div>
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
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-200 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* ======================================================================= */}
        {/* 4. INSPIRATION / IMPACT QUOTE CARD (Mockup Match: “From ideas to impact”)*/}
        {/* ======================================================================= */}
        <div className="rounded-3xl p-5 relative overflow-hidden min-h-[115px] flex flex-col justify-end border border-white/80 dark:border-white/10 shadow-[0_12px_28px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.8)] dark:shadow-[0_16px_36px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.08)] group">
          
          {/* User-Provided Silk Ceramic Waves Artwork */}
          {/* Light Mode Silk Waves */}
          <img 
            src="/assets/ceramic-silk.png" 
            alt="Ceramic Silk Waves Light"
            className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105 pointer-events-none block dark:hidden"
          />
          {/* Dark Mode Silk Waves (User Provided) */}
          <img 
            src="/assets/dark-ceramic-silk.png" 
            alt="Dark Silk Waves"
            className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105 pointer-events-none hidden dark:block"
          />

          {/* Theme-Reactive Ambient Gradient Shader Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/70 to-white/30 dark:from-[#080B13]/90 dark:via-[#080B13]/60 dark:to-transparent pointer-events-none" />

          <div className="relative z-10">
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight mb-1">
              “Building a better world together.”
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              — Malayan Banking Berhad
            </p>
          </div>
        </div>

      </aside>

      {/* Document Quick-Preview Modal */}
      <DocumentPreviewModal 
        document={previewDoc}
        isOpen={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
        onAskAi={(prompt) => {
          onSelectSuggestion(prompt, true, previewDoc?.name);
        }}
      />
    </>
  );
};
