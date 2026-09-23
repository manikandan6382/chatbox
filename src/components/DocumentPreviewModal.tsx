import React from 'react';
import { X, FileText, CheckCircle2, ArrowRight, ShieldCheck, Download, Sparkles } from 'lucide-react';
import { sounds } from '../utils/audio';

export interface DocumentDetails {
  id: string;
  name: string;
  type: 'pdf' | 'doc';
  size: string;
  title: string;
  summary: string;
  keyPoints: string[];
  classification: string;
  prompt: string;
}

interface DocumentPreviewModalProps {
  document: DocumentDetails | null;
  isOpen: boolean;
  onClose: () => void;
  onAskAi: (prompt: string) => void;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  document,
  isOpen,
  onClose,
  onAskAi
}) => {
  if (!isOpen || !document) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white/95 dark:bg-[#151822]/95 backdrop-blur-2xl rounded-3xl max-w-xl w-full p-6 border border-white/80 dark:border-white/15 shadow-2xl space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md ${
              document.type === 'pdf' ? 'bg-rose-500 shadow-rose-500/20' : 'bg-blue-600 shadow-blue-600/20'
            }`}>
              <FileText className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-600 dark:text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full">
                  {document.classification}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">{document.size}</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight mt-0.5">
                {document.name}
              </h3>
            </div>
          </div>

          <button 
            onClick={() => {
              sounds.playGlassClick();
              onClose();
            }}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 active:scale-95 transition-all cursor-pointer"
            title="Close Preview"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Executive Summary Section */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#191E2A] border border-slate-100 dark:border-slate-800">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block mb-1">
            Executive Summary
          </span>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
            {document.summary}
          </p>
        </div>

        {/* Key Product Highlights */}
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block mb-2 px-1">
            Key Disclosures & Verification Points
          </span>
          <div className="space-y-2">
            {document.keyPoints.map((pt, i) => (
              <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/70 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-800 dark:text-slate-200 font-medium">{pt}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Regulatory Badge */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-300 text-[11px] font-semibold">
          <ShieldCheck className="w-4 h-4 flex-shrink-0" />
          <span>Verified banking documentation compliant with PIDM & Central Bank disclosure frameworks.</span>
        </div>

        {/* Action Dock */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-white/10">
          <button
            onClick={() => {
              sounds.playGlassClick();
              onClose();
            }}
            className="py-2.5 px-4 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 text-xs font-semibold transition-all cursor-pointer"
          >
            Dismiss
          </button>
          
          <button
            onClick={() => {
              sounds.playSendChime();
              onClose();
              onAskAi(document.prompt);
            }}
            className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold flex items-center justify-center gap-2 shadow-sm hover:opacity-95 active:scale-98 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Ask Maybank AI About This Guide</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
