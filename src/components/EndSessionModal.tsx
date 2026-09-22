import React from 'react';
import { ShieldAlert } from 'lucide-react';

interface EndSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const EndSessionModal: React.FC<EndSessionModalProps> = ({
  isOpen,
  onClose,
  onConfirm
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#181B22] rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-700 shadow-2xl space-y-4">
        
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>

        <div className="text-center space-y-1">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            End Kiosk Session?
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            For your privacy and security at this public kiosk, all conversational history, credit card details, and uploaded documents will be permanently purged.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button 
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors"
          >
            Continue Chat
          </button>
          <button 
            onClick={onConfirm}
            className="py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition-colors"
          >
            Yes, End Session
          </button>
        </div>

      </div>
    </div>
  );
};
