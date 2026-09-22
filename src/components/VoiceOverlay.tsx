import React, { useState, useEffect, useRef } from 'react';
import { RobotAvatar } from './RobotAvatar';
import { sounds } from '../utils/audio';
import { Mic, MicOff, Send, X, AlertCircle } from 'lucide-react';

interface VoiceOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPrompt: (prompt: string) => void;
}

export const VoiceOverlay: React.FC<VoiceOverlayProps> = ({
  isOpen,
  onClose,
  onSelectPrompt
}) => {
  const [transcript, setTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [errorNote, setErrorNote] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const autoSendTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isOpen) {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
      }
      setIsRecording(false);
      setTranscript('');
      setErrorNote(null);
      return;
    }

    // Initialize Web Speech API
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setErrorNote('Speech recognition is not supported in this browser. Please use Chrome/Edge or tap a preset prompt.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-SG';

      recognition.onstart = () => {
        setIsRecording(true);
        setErrorNote(null);
        sounds.playSendChime();
      };

      recognition.onresult = (event: any) => {
        let currentText = '';
        for (let i = 0; i < event.results.length; i++) {
          currentText += event.results[i][0].transcript;
        }
        setTranscript(currentText);

        // Reset auto-submit timer on fresh speech
        if (autoSendTimerRef.current) clearTimeout(autoSendTimerRef.current);
        autoSendTimerRef.current = setTimeout(() => {
          if (currentText.trim().length > 3) {
            sounds.playWinkPop();
            onSelectPrompt(currentText.trim());
          }
        }, 4000);
      };

      recognition.onerror = (event: any) => {
        if (event.error === 'not-allowed') {
          setErrorNote('Microphone access was denied. Please allow microphone permissions in your browser address bar.');
        } else if (event.error !== 'no-speech') {
          setErrorNote(`Voice note: ${event.error}`);
        }
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();

    } catch (err) {
      console.warn('Voice overlay recognition init error:', err);
      setErrorNote('Could not activate microphone. Tap any of the preset prompts below.');
    }

    return () => {
      if (autoSendTimerRef.current) clearTimeout(autoSendTimerRef.current);
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const presets = [
    { label: '“Travel benefits?”', prompt: 'What are my card travel benefits?' },
    { label: '“Replace my card”', prompt: 'How do I replace my lost card?' },
    { label: '“Recent transactions”', prompt: 'Show my recent transactions.' },
    { label: '“Branch services”', prompt: 'Where is the nearest Maybank branch in Singapore?' }
  ];

  const handleManualSubmit = () => {
    if (transcript.trim()) {
      sounds.playSendChime();
      onSelectPrompt(transcript.trim());
    }
  };

  return (
    <div className="absolute inset-0 bg-white/95 dark:bg-[#0E1013]/95 backdrop-blur-2xl z-30 flex flex-col items-center justify-center p-8 transition-all animate-in fade-in duration-300">
      
      {/* Center 3D Interactive Cyber Robot Avatar with Pulsing Aura */}
      <div className="relative mb-5 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-sky-500/20 dark:bg-sky-400/25 scale-150 filter blur-xl animate-pulse" />
        <RobotAvatar 
          isCurrent={true} 
          size="xl" 
          className="relative z-10 drop-shadow-2xl scale-125 cursor-pointer" 
        />
      </div>

      {/* Header & Status */}
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1.5 tracking-tight">
        Maybank AI Voice Kiosk
      </h2>
      
      <p className="text-amber-600 dark:text-maybank-yellow text-sm font-semibold mb-6 tracking-wide flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
        {isRecording ? 'Listening to your voice...' : 'Processing speech...'}
      </p>

      {/* Dynamic Acoustic Sound Waveform */}
      <div className="flex items-center gap-2 h-12 mb-6">
        <span className="wave-bar-1 w-2 bg-amber-500 rounded-full"></span>
        <span className="wave-bar-2 w-2 bg-amber-500 rounded-full"></span>
        <span className="wave-bar-3 w-2 bg-amber-500 rounded-full"></span>
        <span className="wave-bar-4 w-2 bg-amber-500 rounded-full"></span>
        <span className="wave-bar-2 w-2 bg-amber-500 rounded-full"></span>
        <span className="wave-bar-1 w-2 bg-amber-500 rounded-full"></span>
        <span className="wave-bar-4 w-2 bg-amber-500 rounded-full"></span>
        <span className="wave-bar-3 w-2 bg-amber-500 rounded-full"></span>
        <span className="wave-bar-2 w-2 bg-amber-500 rounded-full"></span>
      </div>

      {/* Live Voice-to-Text Transcription Box */}
      <div className="min-h-[64px] max-w-md w-full px-5 py-3.5 mb-6 rounded-2xl bg-slate-100/90 dark:bg-[#161A24]/90 border border-slate-200/80 dark:border-white/10 text-center flex flex-col items-center justify-center shadow-inner">
        {transcript ? (
          <p className="text-base font-medium text-slate-800 dark:text-slate-100 tracking-tight leading-relaxed animate-in fade-in">
            “{transcript}”
          </p>
        ) : (
          <p className="text-sm text-slate-400 dark:text-slate-500 italic">
            Speak clearly into your microphone...
          </p>
        )}
      </div>

      {errorNote && (
        <div className="mb-6 px-4 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/50 text-amber-800 dark:text-amber-300 text-xs font-medium max-w-md text-center flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorNote}</span>
        </div>
      )}

      {/* Action Buttons: Submit Speech or Cancel */}
      <div className="flex items-center gap-3 mb-6">
        {transcript && (
          <button
            onClick={handleManualSubmit}
            className="px-5 py-2.5 rounded-full bg-slate-900 dark:bg-white hover:bg-black dark:hover:bg-slate-200 text-white dark:text-slate-900 text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-2"
          >
            <Send className="w-3.5 h-3.5" />
            Send Voice Inquiry
          </button>
        )}

        <button 
          onClick={() => {
            sounds.playGlassClick();
            onClose();
          }}
          className="px-5 py-2.5 rounded-full bg-slate-200/80 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer flex items-center gap-1.5"
        >
          <X className="w-3.5 h-3.5" />
          Close
        </button>
      </div>

      {/* Quick Voice Simulation Buttons */}
      <div className="flex flex-col items-center">
        <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2.5">
          Or Tap a Suggested Inquiry
        </span>
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-md">
          {presets.map((preset) => (
            <button
              key={preset.label}
              onClick={() => {
                sounds.playGlassClick();
                onSelectPrompt(preset.prompt);
              }}
              className="px-3.5 py-1.5 rounded-full bg-slate-100/90 dark:bg-white/5 hover:bg-sky-50 dark:hover:bg-sky-950/40 text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-200/70 dark:border-white/10 hover:border-sky-300 dark:hover:border-sky-500/30 transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};
