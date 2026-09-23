import React, { useState, useRef, useEffect } from 'react';
import { Plus, Lightbulb, Mic, MicOff, ArrowUp, X, Image as ImageIcon, AlertCircle, Square } from 'lucide-react';
import { sounds } from '../utils/audio';

interface AttachedImage {
  dataUrl: string;
  name: string;
  sizeKb: number;
}

interface ComposerProps {
  onSendMessage: (text: string, image?: string) => void;
  onOpenVoice?: () => void;
  isRightNavOpen?: boolean;
  onToggleRightNav?: () => void;
  externalInsertedText?: string;
  activeContextDoc?: string | null;
  onRemoveContextDoc?: () => void;
  isStreaming?: boolean;
  onStopGeneration?: () => void;
}

export const Composer: React.FC<ComposerProps> = ({ 
  onSendMessage, 
  onOpenVoice,
  isRightNavOpen = false,
  onToggleRightNav,
  externalInsertedText,
  activeContextDoc,
  onRemoveContextDoc,
  isStreaming = false,
  onStopGeneration
}) => {
  const [inputText, setInputText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [attachedImage, setAttachedImage] = useState<AttachedImage | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Voice-to-Text (SpeechRecognition) State
  const [isListening, setIsListening] = useState(false);
  const [speechInterim, setSpeechInterim] = useState('');
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Elastic textarea dual-pass RAF recalculation to eliminate iOS / WebKit ghost height and layout jitter
  const adjustHeight = (resetToAuto = false) => {
    if (!textareaRef.current) return;
    if (resetToAuto) {
      textareaRef.current.style.height = 'auto';
      requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
        }
      });
      return;
    }

    textareaRef.current.style.height = 'auto';
    requestAnimationFrame(() => {
      if (textareaRef.current) {
        const nextHeight = Math.min(textareaRef.current.scrollHeight, 128);
        textareaRef.current.style.height = `${nextHeight}px`;
      }
    });
  };

  // Sync externally selected suggestions (e.g. from RightNavigation)
  useEffect(() => {
    if (externalInsertedText) {
      setInputText(prev => {
        const next = prev ? `${prev} ${externalInsertedText}` : externalInsertedText;
        return next;
      });
      setTimeout(() => {
        adjustHeight();
        textareaRef.current?.focus();
      }, 30);
    }
  }, [externalInsertedText]);

  // Apple Mobile Visual Viewport tracking for virtual keyboard smoothness
  const [viewportBottomOffset, setViewportBottomOffset] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) return;

    const handleVisualResize = () => {
      const vv = window.visualViewport;
      if (!vv) return;
      const offset = window.innerHeight - (vv.height + vv.offsetTop);
      setViewportBottomOffset(Math.max(0, Math.round(offset)));
    };

    window.visualViewport.addEventListener('resize', handleVisualResize);
    window.visualViewport.addEventListener('scroll', handleVisualResize);
    return () => {
      window.visualViewport?.removeEventListener('resize', handleVisualResize);
      window.visualViewport?.removeEventListener('scroll', handleVisualResize);
    };
  }, []);

  // Clean up timers & recognition on unmount
  useEffect(() => {
    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, []);

  // Auto-resize elastic textarea to match multi-line content
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    adjustHeight();
  };

  // Image-only upload handler with strict MIME type validation and compression
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Strict Image-Only Guard: Reject any non-image file
    if (!file.type.startsWith('image/')) {
      sounds.playGlassClick();
      setErrorMessage('Only image files (.png, .jpg, .webp, .gif, .svg) are supported.');
      setTimeout(() => setErrorMessage(null), 4000);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Size limit check (8MB)
    if (file.size > 8 * 1024 * 1024) {
      sounds.playGlassClick();
      setErrorMessage('Image size exceeds 8MB limit. Please upload a smaller image.');
      setTimeout(() => setErrorMessage(null), 4000);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const rawDataUrl = event.target?.result as string;
      if (!rawDataUrl) return;

      // Client-side canvas compression to avoid localStorage / memory bloat
      const img = new Image();
      img.onload = () => {
        const maxWidth = 1280;
        const maxHeight = 1280;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.78);
          
          sounds.playGlassClick();
          setAttachedImage({
            dataUrl: compressedDataUrl,
            name: file.name,
            sizeKb: Math.round(compressedDataUrl.length / 1024)
          });
          setErrorMessage(null);
        }
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachedImage = () => {
    sounds.playGlassClick();
    setAttachedImage(null);
  };

  // Voice-to-Text Dictation Toggle (Web Speech API)
  const toggleVoiceToText = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      sounds.playGlassClick();
      setErrorMessage('Voice-to-text is not supported by your browser engine. Please use Chrome or Edge.');
      setTimeout(() => setErrorMessage(null), 5000);
      // Fallback: open voice overlay if provided
      if (onOpenVoice) onOpenVoice();
      return;
    }

    if (isListening) {
      // Stop listening manually
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      setIsListening(false);
      setSpeechInterim('');
      sounds.playWinkPop();
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-SG'; // Singapore locale

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechInterim('');
        setErrorMessage(null);
        sounds.playSendChime();

        // 6-second silence safety watchdog
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
          try {
            recognition.stop();
          } catch {}
        }, 6000);
      };

      recognition.onresult = (event: any) => {
        // Reset silence timer on fresh speech input
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
          try {
            recognition.stop();
          } catch {}
        }, 5000);

        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += transcript;
          } else {
            interim += transcript;
          }
        }

        if (final) {
          setInputText(prev => {
            const trimmedPrev = prev.trim();
            const next = trimmedPrev ? `${trimmedPrev} ${final.trim()}` : final.trim();
            return next;
          });
          setSpeechInterim('');
        } else {
          setSpeechInterim(interim);
        }

        // Auto-expand elastic textarea
        adjustHeight();
      };

      recognition.onerror = (event: any) => {
        console.warn('SpeechRecognition error:', event.error);
        if (event.error === 'not-allowed') {
          setErrorMessage('Microphone access blocked. Please enable microphone permissions in your browser.');
        } else if (event.error === 'no-speech') {
          // Normal timeout on quiet room
        } else {
          setErrorMessage(`Voice recognition note: ${event.error}`);
        }
        setTimeout(() => setErrorMessage(null), 4000);
        setIsListening(false);
        setSpeechInterim('');
      };

      recognition.onend = () => {
        setIsListening(false);
        setSpeechInterim('');
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        sounds.playWinkPop();
      };

      recognitionRef.current = recognition;
      recognition.start();

    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setIsListening(false);
      setErrorMessage('Could not initialize microphone. Please check permissions.');
      setTimeout(() => setErrorMessage(null), 4000);
    }
  };

  const handleSend = () => {
    let textToSend = inputText.trim();
    const imageToSend = attachedImage?.dataUrl;

    if (textToSend || imageToSend || activeContextDoc) {
      // If voice is still listening, stop it
      if (isListening && recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }

      sounds.playSendChime();

      // Auto-cite context document if active and not already mentioned in prompt
      if (activeContextDoc && !textToSend.includes(activeContextDoc)) {
        textToSend = textToSend 
          ? `[Context: ${activeContextDoc}]\n${textToSend}`
          : `Please analyze and summarize the key requirements in ${activeContextDoc}.`;
      }

      onSendMessage(
        textToSend || 'Please analyze this uploaded document / screenshot.', 
        imageToSend
      );

      setInputText('');
      setAttachedImage(null);
      setSpeechInterim('');
      if (onRemoveContextDoc) onRemoveContextDoc();
      adjustHeight(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const hasTopChips = !!attachedImage || !!activeContextDoc;
  const isMultiLine = hasTopChips || inputText.includes('\n') || (textareaRef.current && textareaRef.current.scrollHeight > 36);

  return (
    <div 
      className="p-4 flex flex-col items-center justify-center z-20 pointer-events-auto w-full transition-[padding-bottom] duration-150 ease-out"
      style={{
        paddingBottom: viewportBottomOffset > 0 ? `${viewportBottomOffset + 12}px` : undefined
      }}
    >
      
      {/* Hidden Strict Image File Input */}
      <input 
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp, image/gif, image/svg+xml"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Floating Error Toast Notification */}
      {errorMessage && (
        <div className="mb-2 px-4 py-2 rounded-2xl bg-rose-500/90 text-white text-xs font-semibold backdrop-blur-xl shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
          <button 
            onClick={() => setErrorMessage(null)}
            className="ml-2 hover:opacity-80 p-0.5"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Voice Dictation Active HUD Bar */}
      {isListening && (
        <div className="mb-2.5 px-4 py-2 rounded-2xl bg-amber-500/90 dark:bg-amber-600/90 text-white text-xs font-semibold backdrop-blur-xl shadow-lg flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            <span className="w-1.5 h-3 bg-white/90 rounded-full animate-bounce" style={{ animationDuration: '0.4s' }} />
            <span className="w-1.5 h-4 bg-white/90 rounded-full animate-bounce" style={{ animationDuration: '0.5s', animationDelay: '0.1s' }} />
            <span className="w-1.5 h-2.5 bg-white/90 rounded-full animate-bounce" style={{ animationDuration: '0.3s', animationDelay: '0.2s' }} />
          </div>
          <span className="tracking-tight">
            Listening... Speak now {speechInterim ? `(“${speechInterim}”)` : '(Tap mic to stop)'}
          </span>
          <button
            onClick={toggleVoiceToText}
            className="px-2 py-0.5 rounded-full bg-black/20 hover:bg-black/40 text-[10px] uppercase tracking-wider font-bold cursor-pointer transition-colors"
          >
            Stop
          </button>
        </div>
      )}

      {/* Dynamic Floating Apple Dock Pill with Siri / Apple Intelligence Aurora */}
      <div className="relative w-full max-w-4xl group">
        
        {/* Apple Intelligence Aurora Glow Layer */}
        {(isFocused || isListening) && (
          <div 
            className={`absolute -inset-[1.5px] blur-[5px] opacity-80 animate-pulse pointer-events-none transition-all duration-500 ${
              isMultiLine || hasTopChips ? 'rounded-[28px]' : 'rounded-full'
            }`}
            style={{
              background: isListening 
                ? 'linear-gradient(90deg, #FF3B30, #FF9500, #FFCC00, #FF2D55)'
                : 'linear-gradient(90deg, #FF6B6B, #9B51E0, #00C9FF, #FFC800)'
            }}
          />
        )}

        <div 
          className={`relative w-full backdrop-blur-3xl px-3 sm:px-4 py-2 sm:py-2.5 flex flex-col gap-2 transition-all duration-300 ${
            isMultiLine || hasTopChips ? 'rounded-[28px]' : 'rounded-full'
          } ${
            isFocused || isListening
              ? 'bg-white/95 dark:bg-[#131722]/95 border-white/90 dark:border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.95),inset_0_-1px_0_rgba(0,0,0,0.03)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.16),inset_0_-1px_0_rgba(0,0,0,0.4)]' 
              : 'bg-white/85 dark:bg-[#121620]/85 border-white/80 dark:border-white/12 shadow-[0_16px_40px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.9),inset_0_-1px_0_rgba(0,0,0,0.03)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.12),inset_0_-1px_0_rgba(0,0,0,0.35)]'
          } border`}
        >
          
          {/* ================================================================= */}
          {/* Active Chips Dock: Attached Image & Active Context Document        */}
          {/* ================================================================= */}
          {hasTopChips && (
            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              
              {/* Image Preview Dock */}
              {attachedImage && (
                <div className="flex items-center gap-3 p-1.5 px-3 rounded-2xl bg-slate-100/90 dark:bg-white/10 border border-slate-200/80 dark:border-white/10 w-fit max-w-full animate-in fade-in zoom-in-95 duration-200">
                  <div className="relative w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 bg-slate-200 dark:bg-black/40 border border-white/40">
                    <img 
                      src={attachedImage.dataUrl} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col min-w-0 pr-2">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[160px]">
                      {attachedImage.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      Image • {attachedImage.sizeKb} KB
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={removeAttachedImage}
                    className="w-5 h-5 rounded-full bg-slate-200 dark:bg-white/20 hover:bg-rose-500 hover:text-white text-slate-500 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
                    title="Remove Attached Image"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Active Context Document Citation Badge */}
              {activeContextDoc && (
                <div className="flex items-center gap-2 p-1.5 px-3 rounded-2xl bg-sky-50 dark:bg-sky-500/15 border border-sky-300 dark:border-sky-500/30 text-sky-700 dark:text-sky-300 text-xs font-semibold backdrop-blur-md animate-in fade-in zoom-in-95 duration-200 shadow-xs">
                  <span className="text-[9px] uppercase font-bold tracking-wider opacity-60">Context:</span>
                  <span className="truncate max-w-[170px]">{activeContextDoc}</span>
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playGlassClick();
                      if (onRemoveContextDoc) onRemoveContextDoc();
                    }}
                    className="w-5 h-5 rounded-full hover:bg-sky-200 dark:hover:bg-sky-400/20 text-sky-600 dark:text-sky-300 flex items-center justify-center transition-colors cursor-pointer"
                    title="Remove Context Citation"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

            </div>
          )}

          {/* Primary Input Row */}
          <div className="flex items-end gap-2 sm:gap-3 w-full min-w-0">
            
            {/* (+) Image Attachment Button (Strict Image-Only) */}
            <button 
              type="button"
              onClick={() => {
                sounds.playGlassClick();
                fileInputRef.current?.click();
              }}
              title="Attach financial screenshot or document (Images only)"
              className="w-8 h-8 rounded-full bg-slate-100/90 hover:bg-slate-200/90 dark:bg-white/10 dark:hover:bg-white/20 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white border border-slate-200/70 dark:border-white/10 shadow-xs flex items-center justify-center flex-shrink-0 active:scale-95 transition-all duration-200 cursor-pointer mb-0.5 group"
            >
              <Plus className="w-4 h-4 stroke-[2] group-hover:rotate-90 transition-transform duration-200" />
            </button>

            {/* Elastic Multi-Line Textarea */}
            <textarea 
              ref={textareaRef}
              rows={1}
              value={inputText}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              onFocus={() => { setIsFocused(true); sounds.playGlassClick(); }}
              onBlur={() => setIsFocused(false)}
              placeholder={
                isListening 
                  ? "Listening..." 
                  : "Message Maybank..."
              }
              className="flex-1 min-w-0 bg-transparent border-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 placeholder:truncate placeholder:whitespace-nowrap placeholder:overflow-hidden text-[14px] font-normal tracking-tight focus:outline-none px-1.5 sm:px-2 resize-none max-h-32 min-h-[24px] py-1 leading-relaxed custom-scrollbar"
            />

            {/* Right Action Icons Dock — Apple Luxury Spatial Minimalism */}
            <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0 mb-0.5">
              
              {/* Lightbulb Icon: Toggles Right Suggestions Drawer */}
              <button 
                type="button"
                onClick={() => {
                  sounds.playGlassClick();
                  if (onToggleRightNav) onToggleRightNav();
                }}
                title={isRightNavOpen ? "Hide Suggestions & Guidance" : "Show Suggestions & Guidance"}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer ${
                  isRightNavOpen 
                    ? 'bg-slate-100 dark:bg-white/15 text-amber-500 dark:text-amber-400 border border-slate-200/90 dark:border-white/15 shadow-xs' 
                    : 'text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-white/10'
                }`}
                aria-label="Toggle Suggestions & Guidance"
              >
                <Lightbulb className="w-4 h-4 stroke-[1.8]" />
              </button>

              {/* Real Voice-to-Text Dictation Toggle (Web Speech API) */}
              <button 
                type="button"
                onClick={toggleVoiceToText}
                title={isListening ? "Stop Voice Dictation" : "Start Voice-to-Text Dictation"}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer group relative ${
                  isListening
                    ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/25 animate-pulse'
                    : 'text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-white/10'
                }`}
              >
                {isListening ? (
                  <MicOff className="w-4 h-4 stroke-[1.8]" />
                ) : (
                  <Mic className="w-4 h-4 stroke-[1.8] group-hover:scale-110 transition-transform" />
                )}
                {isListening && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-400 animate-ping" />
                )}
              </button>

              {/* Dynamic Send / Stop Button */}
              {isStreaming ? (
                <button 
                  type="button"
                  onClick={() => {
                    sounds.playGlassClick();
                    if (onStopGeneration) onStopGeneration();
                  }}
                  title="Stop Generating (Cancel)"
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200 bg-rose-500 hover:bg-rose-600 text-white shadow-sm shadow-rose-500/25 active:scale-95 cursor-pointer animate-pulse"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                </button>
              ) : (
                <button 
                  type="button"
                  onClick={handleSend}
                  disabled={!inputText.trim() && !attachedImage}
                  title="Send Message (Enter)"
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                    inputText.trim() || attachedImage
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm hover:opacity-90 active:scale-95 cursor-pointer' 
                      : 'bg-slate-100 dark:bg-white/10 text-slate-300 dark:text-slate-600 cursor-not-allowed'
                  }`}
                >
                  <ArrowUp className="w-4 h-4 stroke-[2.2]" />
                </button>
              )}

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
