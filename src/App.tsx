import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { StarterCards } from './components/StarterCards';
import { FlowCard } from './components/FlowCard';
import { FinancialCardWidget } from './components/FinancialCardWidget';
import { KioskPrivacyCurtain } from './components/KioskPrivacyCurtain';
import { Composer } from './components/Composer';
import { VoiceOverlay } from './components/VoiceOverlay';
import { CardDetailModal } from './components/CardDetailModal';
import { RobotAvatar } from './components/RobotAvatar';
import { LoginScreen } from './components/LoginScreen';
import { RightNavigation } from './components/RightNavigation';
import { MobileHeader } from './components/MobileHeader';
import { MobileTabBar, MobileTab } from './components/MobileTabBar';
import { sounds } from './utils/audio';
import { ChatThreadItem } from './types';
import { FormattedMessage } from './components/FormattedMessage';
import { streamGeminiResponse, ChatMessageContext } from './services/aiService';
import { 
  ChevronDown, Sun, Moon, Copy, Check, Volume2, VolumeX, 
  ThumbsUp, Sparkles, Lock, Shield, LogOut, X, RotateCcw,
  PanelLeft, PanelRight, Smartphone, Monitor
} from 'lucide-react';

interface Message {
  sender: 'user' | 'ai';
  text: string;
  image?: string;
  time?: string;
  hasFlow?: boolean;
  hasCardWidget?: boolean;
  canRetry?: boolean;
}

export const App: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  const [activeSidebarItem, setActiveSidebarItem] = useState<string>('onboarding-flow');
  const [isVoiceOpen, setIsVoiceOpen] = useState<boolean>(false);
  const [isCardDetailOpen, setIsCardDetailOpen] = useState<boolean>(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
  const [isCompactCards, setIsCompactCards] = useState<boolean>(true);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [lockWarningCountdown, setLockWarningCountdown] = useState<number | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  
  // Right Navigation Suggestions & Context Drawer State (Mockup Match)
  const [isRightNavOpen, setIsRightNavOpen] = useState<boolean>(true);
  const [externalInsertedText, setExternalInsertedText] = useState<string>('');
  const [selectedPreviewImage, setSelectedPreviewImage] = useState<string | null>(null);
  const [activeContextDoc, setActiveContextDoc] = useState<string | null>(null);

  // Workspace Viewport States (Desktop 3-Column Workstation vs Apple iPhone Simulator)
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile-preview'>('desktop');

  // Mobile Native App State (Thumb-Reach Tabs & Slide-Over Drawer)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [activeMobileTab, setActiveMobileTab] = useState<MobileTab>('chat');

  const [darkWallpaper, setDarkWallpaper] = useState<'waves' | 'arch'>(() => {
    try {
      const saved = localStorage.getItem('maybank_dark_wallpaper');
      if (saved === 'waves' || saved === 'arch') return saved;
    } catch {}
    return 'waves';
  });

  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const speechWatchdogRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Sidebar Threads Metadata State (Single source of truth with LocalStorage persistence)
  const [chatThreads, setChatThreads] = useState<ChatThreadItem[]>(() => {
    try {
      const saved = localStorage.getItem('maybank_chat_threads_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      { id: 'onboarding-flow', title: 'Customer Onboarding Flow', time: 'Just now', isPinned: true },
      { id: 'product-strategy-2025', title: 'Product Strategy 2025', time: '1d ago', isPinned: true },
      { id: 'learning-plan', title: 'Learning Plan', time: '3d ago', isPinned: true },
      { id: 'marketing-campaign', title: 'Marketing Campaign Ideas', time: '2h ago', isPinned: false },
      { id: 'product-roadmap', title: 'Product Roadmap', time: '1d ago', isPinned: false },
      { id: 'competitor-analysis', title: 'Competitor Analysis', time: '2d ago', isPinned: false },
      { id: 'meeting-summary', title: 'Meeting Summary', time: '3d ago', isPinned: false },
      { id: 'ui-ux-feedback', title: 'UI/UX Feedback', time: '4d ago', isPinned: false }
    ];
  });

  // Multi-Thread State Machine
  const [threads, setThreads] = useState<Record<string, Message[]>>(() => {
    try {
      const saved = localStorage.getItem('maybank_threads_history_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
    'onboarding-flow': [
      {
        sender: 'user',
        text: 'What are the privileges for Maybank Horizon Visa Signature cardholders in Singapore?',
        time: '10:20 AM'
      },
      {
        sender: 'ai',
        text: 'Maybank Horizon Visa Signature cardholders enjoy 3.24 air miles per S$1 on dining, petrol, and travel bookings, complimentary airport lounge access worldwide, and zero foreign transaction fees on promotional overseas retail.',
        time: '10:21 AM',
        hasCardWidget: true
      },
      {
        sender: 'user',
        text: 'Help me design a customer onboarding flow for Maybank. Focus on simplicity, personalization, and quick value.',
        time: '10:24 AM'
      },
      {
        sender: 'ai',
        text: "Here's a streamlined onboarding flow for Maybank, designed to help new users reach value quickly while feeling personally guided.",
        time: '10:25 AM',
        hasFlow: true
      }
    ],
    'product-strategy-2025': [
      {
        sender: 'user',
        text: 'Review the 2025 Product Strategy roadmap and core milestones for Maybank Singapore.',
        time: 'Yesterday'
      },
      {
        sender: 'ai',
        text: 'Here is the 2025 Product Strategy breakdown focusing on autonomous physical branch kiosks, AI-assisted wealth advisory, and MAS-compliant spatial branch computing.',
        time: 'Yesterday'
      }
    ],
    'learning-plan': [
      {
        sender: 'user',
        text: 'Generate a focused 4-week wealth and portfolio management onboarding plan.',
        time: '3d ago'
      },
      {
        sender: 'ai',
        text: 'Here is your structured 4-week onboarding plan covering Singapore equities, high-yield fixed deposits, and SRS tax-optimized investment vehicles.',
        time: '3d ago'
      }
    ],
    'marketing-campaign': [
      {
        sender: 'user',
        text: 'Brainstorm marketing campaign ideas for Maybank Premier Wealth Launch in Southeast Asia.',
        time: '2h ago'
      },
      {
        sender: 'ai',
        text: "Here are 3 high-impact luxury marketing pillars: 1. 'Legacy Beyond Borders' cross-border family office campaign; 2. Exclusive airport lounge spatial experiences; 3. Private wealth concierge dinner roadshows in Singapore, Kuala Lumpur, and Jakarta.",
        time: '2h ago'
      }
    ],
    'product-roadmap': [
      {
        sender: 'user',
        text: 'Show me the Q3-Q4 product roadmap for branch kiosk AI automation.',
        time: '1d ago'
      },
      {
        sender: 'ai',
        text: 'Q3 focuses on voice-guided biometrics and multilingual advisory in Mandarin, Malay, Tamil, and English. Q4 launches spatial gesture HUDs and instant debit card issuance.',
        time: '1d ago'
      }
    ],
    'competitor-analysis': [
      {
        sender: 'user',
        text: 'Compare Maybank Horizon Visa Signature with DBS Altitude and OCBC 90°N.',
        time: '2d ago'
      },
      {
        sender: 'ai',
        text: 'Maybank Horizon delivers an industry-leading 3.24 miles per S$1 on dining and petrol (min. spend S$300), outperforming DBS Altitude (1.3 mpd) and OCBC 90°N (1.3 mpd) on everyday lifestyle categories.',
        time: '2d ago'
      }
    ],
    'meeting-summary': [
      {
        sender: 'user',
        text: 'Summarize the MAS Compliance & Cybersecurity sync from yesterday.',
        time: '3d ago'
      },
      {
        sender: 'ai',
        text: 'Key takeaways: 1. TRM guidelines require 120s auto-lock on physical kiosks; 2. All biometric facial data must be processed on-device with zero cloud persistence; 3. Zero-trust token rotation passed MAS penetration audit.',
        time: '3d ago'
      }
    ],
    'ui-ux-feedback': [
      {
        sender: 'user',
        text: 'Review user feedback on the newly deployed spatial kiosk UI.',
        time: '4d ago'
      },
      {
        sender: 'ai',
        text: 'Customer satisfaction scored 96.4%. Users loved the expressive robot avatar winking interactions and instant credit card eligibility previews.',
        time: '4d ago'
      }
    ]
  };
});

  // Auto-sync persistent storage with Quota Safety Guard & FIFO Retention
  useEffect(() => {
    try {
      // FIFO retention: Guarantee pinned threads are saved, and cap total stored threads at 25
      let sanitizedList = chatThreads;
      if (sanitizedList.length > 25) {
        const pinned = sanitizedList.filter(t => t.isPinned);
        const unpinned = sanitizedList.filter(t => !t.isPinned).slice(0, Math.max(0, 25 - pinned.length));
        sanitizedList = [...pinned, ...unpinned];
      }
      localStorage.setItem('maybank_chat_threads_v1', JSON.stringify(sanitizedList));
    } catch (err) {
      console.warn('LocalStorage chatThreads quota notice:', err);
    }
  }, [chatThreads]);

  useEffect(() => {
    try {
      // Create a lightweight sanitized snapshot for localStorage
      // Keep full images only for the latest 2 messages per thread, pruning older large base64 blobs
      const validThreadIds = new Set(chatThreads.map(t => t.id));
      const sanitizedThreads: Record<string, Message[]> = {};
      for (const [key, msgList] of Object.entries(threads)) {
        if (!validThreadIds.has(key)) continue; // Garbage collect deleted threads
        sanitizedThreads[key] = msgList.map((m, idx) => {
          if (m.image && idx < msgList.length - 2) {
            return { ...m, image: undefined };
          }
          return m;
        });
      }
      localStorage.setItem('maybank_threads_history_v1', JSON.stringify(sanitizedThreads));
    } catch (err) {
      console.warn('LocalStorage threads quota warning, pruning older image cache:', err);
      try {
        // Fallback: strip all images from storage to guarantee zero-crash persistence
        const validThreadIds = new Set(chatThreads.map(t => t.id));
        const textOnlyThreads: Record<string, Message[]> = {};
        for (const [key, msgList] of Object.entries(threads)) {
          if (!validThreadIds.has(key)) continue;
          textOnlyThreads[key] = msgList.map(m => ({ ...m, image: undefined }));
        }
        localStorage.setItem('maybank_threads_history_v1', JSON.stringify(textOnlyThreads));
      } catch {}
    }
  }, [threads, chatThreads]);

  const messages = threads[activeSidebarItem] || [];
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Singapore Time Greeting Calculation (UTC+8)
  const getSingaporeGreeting = () => {
    const now = new Date();
    const sgHour = (now.getUTCHours() + 8) % 24;
    if (sgHour < 12) return 'Good morning';
    if (sgHour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Sync theme
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [theme]);

  // iOS Background Tab Sleeping Watchdog: Abort stalled stream on app backgrounding to prevent frozen UI
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && isStreaming && abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
        setIsStreaming(false);
        setIsThinking(false);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isStreaming]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming, isThinking]);

  // Kiosk Inactivity Lock Screen Timer (MAS TRM Compliant with 10s Grace Warning HUD)
  useEffect(() => {
    let warningTimer: number;
    let lockTimer: number;
    let countdownInterval: number;

    const clearAllTimers = () => {
      clearTimeout(warningTimer);
      clearTimeout(lockTimer);
      clearInterval(countdownInterval);
      setLockWarningCountdown(null);
    };

    const resetIdle = () => {
      clearAllTimers();
      if (isLocked) return;

      // At 110s, initiate 10s grace warning countdown
      warningTimer = window.setTimeout(() => {
        let remaining = 10;
        setLockWarningCountdown(remaining);

        countdownInterval = window.setInterval(() => {
          remaining -= 1;
          if (remaining <= 0) {
            clearInterval(countdownInterval);
            setLockWarningCountdown(null);
          } else {
            setLockWarningCountdown(remaining);
          }
        }, 1000);
      }, 110000);

      // Auto lock after 120s of total inactivity
      lockTimer = window.setTimeout(() => {
        setIsLocked(true);
        clearAllTimers();
      }, 120000);
    };

    window.addEventListener('pointermove', resetIdle);
    window.addEventListener('keydown', resetIdle);
    window.addEventListener('touchstart', resetIdle);
    resetIdle();

    return () => {
      clearAllTimers();
      window.removeEventListener('pointermove', resetIdle);
      window.removeEventListener('keydown', resetIdle);
      window.removeEventListener('touchstart', resetIdle);
    };
  }, [isLocked]);

  const toggleTheme = () => {
    sounds.playGlassClick();
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleToggleWallpaper = () => {
    sounds.playGlassClick();
    setDarkWallpaper(prev => {
      const next = prev === 'waves' ? 'arch' : 'waves';
      try {
        localStorage.setItem('maybank_dark_wallpaper', next);
      } catch {}
      return next;
    });
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
    setIsThinking(false);
    sounds.playGlassClick();
  };

  const handleSendMessage = async (text: string, image?: string) => {
    const promptText = text.trim() || (image ? 'Please analyze this uploaded document / screenshot.' : '');
    if (!promptText || isThinking || isStreaming) return;
    sounds.playSendChime();
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const targetThreadId = activeSidebarItem;
    
    // Auto-rename 'New Conversation' on first message
    setChatThreads(prev =>
      prev.map(t =>
        t.id === targetThreadId && t.title === 'New Conversation'
          ? { ...t, title: promptText.length > 26 ? `${promptText.substring(0, 26)}...` : promptText }
          : t
      )
    );

    // Cancel any previous in-flight stream
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // 1. Optimistic user message append bound strictly to targetThreadId
    const currentThreadMessages = threads[targetThreadId] || [];
    setThreads(prev => ({
      ...prev,
      [targetThreadId]: [
        ...(prev[targetThreadId] || []),
        { sender: 'user', text: promptText, image, time: timeStr }
      ]
    }));
    setIsThinking(true);

    const lowerText = promptText.toLowerCase();
    const hasFlow = lowerText.includes('flow') || lowerText.includes('onboarding') || lowerText.includes('diagram');
    const hasCardWidget = lowerText.includes('card') || lowerText.includes('horizon') || lowerText.includes('privilege') || lowerText.includes('miles');
    const newAiMessageTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Prepare message history context for Gemini
    const chatHistoryContext: ChatMessageContext[] = currentThreadMessages.map(m => ({
      sender: m.sender,
      text: m.text
    }));

    try {
      let fullStreamedText = '';
      let isFirstChunk = true;

      for await (const chunk of streamGeminiResponse(promptText, image, chatHistoryContext, controller.signal)) {
        if (isFirstChunk) {
          setIsThinking(false);
          setIsStreaming(true);
          // Append blank AI message to stream into
          setThreads(prev => ({
            ...prev,
            [targetThreadId]: [
              ...(prev[targetThreadId] || []),
              { 
                sender: 'ai', 
                text: '', 
                time: newAiMessageTime,
                hasFlow,
                hasCardWidget
              }
            ]
          }));
          isFirstChunk = false;
        }

        fullStreamedText += chunk;
        const currentText = fullStreamedText;

        setThreads(prev => {
          const list = prev[targetThreadId] || [];
          if (list.length === 0) return prev;
          const updated = [...list];
          const lastIdx = updated.length - 1;
          if (updated[lastIdx]?.sender === 'ai') {
            updated[lastIdx] = { ...updated[lastIdx], text: currentText };
          }
          return { ...prev, [targetThreadId]: updated };
        });
      }

      setIsStreaming(false);
      setIsThinking(false);
      abortControllerRef.current = null;
      sounds.playWinkPop();
    } catch (err: any) {
      if (err?.name === 'AbortError' || controller.signal.aborted) {
        console.log('Stream generation canceled by user.');
        setIsStreaming(false);
        setIsThinking(false);
        abortControllerRef.current = null;
        return;
      }

      console.warn('Gemini stream error, switching to resilient fallback:', err);
      setIsThinking(false);
      setIsStreaming(false);
      abortControllerRef.current = null;

      const fallbackText = `I encountered a momentary connectivity issue contacting the AI engine (${err?.message || 'Network error'}). Maybank Singapore's offline branch protocol is active. Please verify your API key or network connection.`;
      
      setThreads(prev => ({
        ...prev,
        [targetThreadId]: [
          ...(prev[targetThreadId] || []),
          {
            sender: 'ai',
            text: fallbackText,
            time: newAiMessageTime,
            hasCardWidget
          }
        ]
      }));
    }
  };

  const handleCopyText = (text: string, index: number) => {
    sounds.playGlassClick();
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleRegenerateResponse = () => {
    if (isThinking || isStreaming) return;
    const currentMessages = threads[activeSidebarItem] || [];
    for (let i = currentMessages.length - 1; i >= 0; i--) {
      if (currentMessages[i].sender === 'user') {
        const userPrompt = currentMessages[i].text;
        const userImage = currentMessages[i].image;
        sounds.playGlassClick();
        handleSendMessage(userPrompt, userImage);
        return;
      }
    }
  };

  const handleSpeak = (text: string, index: number) => {
    if (!('speechSynthesis' in window)) return;
    sounds.playGlassClick();

    if (speechWatchdogRef.current) {
      clearInterval(speechWatchdogRef.current);
      speechWatchdogRef.current = null;
    }

    if (speakingIndex === index) {
      window.speechSynthesis.cancel();
      setSpeakingIndex(null);
      activeUtteranceRef.current = null;
      return;
    }

    window.speechSynthesis.cancel();
    window.speechSynthesis.resume();

    // Clean markdown characters for natural speech synthesis
    const cleanText = text
      .replace(/[*_#`~[\]()]/g, '')
      .replace(/---+/g, '')
      .replace(/\n+/g, '. ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    activeUtteranceRef.current = utterance;

    const cleanup = () => {
      setSpeakingIndex(null);
      activeUtteranceRef.current = null;
      if (speechWatchdogRef.current) {
        clearInterval(speechWatchdogRef.current);
        speechWatchdogRef.current = null;
      }
    };

    utterance.onend = cleanup;
    utterance.onerror = cleanup;

    // Chromium watchdog: periodical resume prevents speech engine from freezing on long text
    speechWatchdogRef.current = setInterval(() => {
      if (!window.speechSynthesis.speaking) {
        cleanup();
      } else {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      }
    }, 8000);

    setSpeakingIndex(index);
    window.speechSynthesis.speak(utterance);
  };

  const handleSelectSidebarItem = (id: string) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsStreaming(false);
      setIsThinking(false);
    }
    sounds.playGlassClick();
    setActiveSidebarItem(id);
    setIsMobileSidebarOpen(false);
    setActiveMobileTab('chat');
  };

  const handleTogglePin = (id: string) => {
    sounds.playGlassClick();
    setChatThreads(prev =>
      prev.map(item =>
        item.id === id ? { ...item, isPinned: !item.isPinned } : item
      )
    );
  };

  const handleRenameChat = (id: string, newTitle: string) => {
    sounds.playGlassClick();
    setChatThreads(prev =>
      prev.map(item =>
        item.id === id ? { ...item, title: newTitle } : item
      )
    );
  };

  const handleDeleteChat = (id: string) => {
    sounds.playDeleteSwoosh();
    setChatThreads(prev => {
      const updated = prev.filter(item => item.id !== id);
      if (activeSidebarItem === id) {
        if (updated.length > 0) {
          setActiveSidebarItem(updated[0].id);
        } else {
          // If all chats were deleted, spawn a fresh clean conversation
          const fallbackId = `chat-${Date.now()}`;
          const fallbackThread: ChatThreadItem = {
            id: fallbackId,
            title: 'New Conversation',
            time: 'Just now',
            isPinned: false
          };
          setTimeout(() => {
            setChatThreads([fallbackThread]);
            setActiveSidebarItem(fallbackId);
            setThreads(p => ({ ...p, [fallbackId]: [] }));
          }, 0);
        }
      }
      return updated;
    });

    setThreads(prev => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  const handleNewChat = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsStreaming(false);
      setIsThinking(false);
    }
    sounds.playGlassClick();
    const newId = `chat-${Date.now()}`;
    const newThread: ChatThreadItem = {
      id: newId,
      title: 'New Conversation',
      time: 'Just now',
      isPinned: false
    };
    setChatThreads(prev => [newThread, ...prev]);
    setThreads(prev => ({ ...prev, [newId]: [] }));
    setActiveSidebarItem(newId);
    setIsMobileSidebarOpen(false);
    setActiveMobileTab('chat');
  };

  const handleLogout = () => {
    sounds.playGlassClick();
    setIsLoggedIn(false);
  };

  const handleLogin = (_userName?: string) => {
    sounds.playCuteSmile();
    setIsLoggedIn(true);
  };

  const handleSelectSuggestion = (prompt: string, runImmediately = false, contextDocName?: string) => {
    if (contextDocName) {
      setActiveContextDoc(contextDocName);
    }
    if (runImmediately) {
      sounds.playSendChime();
      handleSendMessage(prompt);
    } else {
      sounds.playGlassClick();
      setExternalInsertedText(prompt);
    }
  };

  return (
    <div className="relative h-full h-[100dvh] w-screen overflow-hidden font-sans antialiased bg-[#F5F6F8] dark:bg-[#08090C] text-slate-900 dark:text-white transition-colors duration-300">
      
      {/* ========================================================================= */}
      {/* OVERALL FIXED BACKGROUND (Retained across Logged In and Login screens)    */}
      {/* ========================================================================= */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#F5F6F8] dark:bg-[#08090C]">
        {/* Light Mode Silk Waves */}
        <img 
          src="/assets/ceramic-waves.png" 
          alt="Ceramic Waves Light" 
          className={`w-full h-full object-cover object-right-top transition-opacity duration-700 absolute inset-0 ${
            theme === 'light' ? 'opacity-95' : 'opacity-0'
          }`} 
        />
        {/* Dark Mode Obsidian Waves (User Provided) */}
        <img 
          src="/assets/dark-waves.png" 
          alt="Dark Obsidian Waves" 
          className={`w-full h-full object-cover object-center transition-opacity duration-700 absolute inset-0 ${
            theme === 'dark' && darkWallpaper === 'waves' ? 'opacity-100' : 'opacity-0'
          }`} 
        />
        {/* Dark Mode Architectural Portal (User Provided) */}
        <div 
          className={`absolute inset-0 transition-opacity duration-700 pointer-events-none ${
            theme === 'dark' && darkWallpaper === 'arch' ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img 
            src="/assets/dark-arch.png" 
            alt="Dark Architectural Portal" 
            className="w-full h-full object-cover object-right-top opacity-90" 
          />
          {/* Soft Atmospheric Moonlight Horizon Shader */}
          <div 
            className="absolute inset-0" 
            style={{
              background: 'radial-gradient(ellipse at 85% 25%, rgba(56, 189, 248, 0.12), transparent 60%)'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#08090C]/90 via-[#08090C]/50 to-transparent" />
        </div>
        
        {/* Ambient Overlays */}
        <div className={`absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-white/40 pointer-events-none transition-opacity duration-700 ${theme === 'light' ? 'opacity-100' : 'opacity-0'}`} />
        <div className={`absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 pointer-events-none transition-opacity duration-700 ${theme === 'dark' ? 'opacity-100' : 'opacity-0'}`} />
      </div>

      {/* ========================================================================= */}
      {/* MAIN VIEW: RESPONSIVE NATIVE APP WORKSPACE OR DUMMY LOGIN SCREEN          */}
      {/* ========================================================================= */}
      {isLoggedIn ? (
        <div 
          aria-hidden={isLocked ? "true" : undefined}
          {...(isLocked ? { inert: '' } : {})}
          className="relative z-10 flex h-full w-full p-0 sm:p-3 lg:p-5 gap-0 lg:gap-5 box-border animate-in fade-in duration-300 overflow-hidden"
        >
          
          {/* COLUMN 1: LEFT SIDEBAR (Desktop Fixed / Mobile Slide-Over Drawer) */}
          <Sidebar 
            activeItemId={activeSidebarItem}
            threads={chatThreads}
            onSelectItem={handleSelectSidebarItem}
            onNewChat={handleNewChat}
            onTogglePin={handleTogglePin}
            onRenameChat={handleRenameChat}
            onDeleteChat={handleDeleteChat}
            onLogout={handleLogout}
            isDesktopOpen={isDesktopSidebarOpen}
            isMobileOpen={isMobileSidebarOpen}
            onCloseMobile={() => {
              setIsMobileSidebarOpen(false);
              setActiveMobileTab('chat');
            }}
          />

          {/* COLUMN 2: EXPANSIVE CHAT & WORKSPACE CANVAS */}
          <main className="flex-1 flex flex-col justify-between overflow-hidden relative min-w-0 h-full pb-16 md:pb-0">

            {/* Mobile Native Apple Header (Smartphones < 768px) */}
            <MobileHeader 
              theme={theme}
              onToggleTheme={toggleTheme}
              darkWallpaper={darkWallpaper}
              onToggleWallpaper={handleToggleWallpaper}
              onNewChat={handleNewChat}
              activeChatTitle={chatThreads.find(t => t.id === activeSidebarItem)?.title || 'Maybank AI'}
              onOpenSidebar={() => setIsMobileSidebarOpen(true)}
            />

            {/* Unified Responsive Telemetry Header Bar (Tablets, Laptops & Desktops >= 768px) */}
            <header className="hidden md:flex items-center justify-between gap-2.5 pt-1 px-3 sm:px-4 z-20">
          
              {/* Top Left: Sidebar Toggle & Companion Status */}
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    sounds.playGlassClick();
                    setIsDesktopSidebarOpen(!isDesktopSidebarOpen);
                  }}
                  className={`p-2 rounded-xl border transition-all cursor-pointer active:scale-90 duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                    isDesktopSidebarOpen 
                      ? 'bg-amber-400/15 border-amber-400/40 text-amber-600 dark:text-amber-400 shadow-xs' 
                      : 'bg-white/80 dark:bg-[#181B22] border-slate-200/70 dark:border-[#272B35] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#20242D]'
                  }`}
                  title={isDesktopSidebarOpen ? "Hide Chat History (Left Sidebar)" : "Show Chat History (Left Sidebar)"}
                  aria-label="Toggle Left Sidebar"
                >
                  <PanelLeft className="w-4 h-4" />
                </button>

                {messages.length > 0 && (
                  <div 
                    onClick={() => sounds.playCuteSmile()}
                    className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-white/80 dark:bg-[#181B22]/80 backdrop-blur-xl border border-white/80 dark:border-white/10 shadow-xs cursor-pointer group hover:scale-[1.02] active:scale-95 transition-all"
                    title="Maybank AI Companion (Click to interact)"
                  >
                    <div className="relative">
                      <RobotAvatar size="sm" />
                      <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-white dark:ring-black animate-pulse" />
                    </div>
                    <div className="flex flex-col min-w-0 pr-1">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 tracking-tight truncate max-w-[140px] lg:max-w-[190px]">
                        {chatThreads.find(t => t.id === activeSidebarItem)?.title || 'Active Session'}
                      </span>
                      <span className="text-[9px] text-slate-400 font-medium">AI Active</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Top Center: MAS TRM Compliance Capsule & Viewport Mode Switcher */}
              <div className="flex items-center gap-2">
                <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100/90 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-xs font-semibold backdrop-blur-xl shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[11px] text-slate-700 dark:text-slate-300 font-medium">MAS TRM Guard • Online</span>
                </div>

                {/* Viewport Mode Switcher: Desktop Workstation <-> iPhone Simulator */}
                <button 
                  onClick={() => {
                    sounds.playGlassClick();
                    setViewMode(viewMode === 'desktop' ? 'mobile-preview' : 'desktop');
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer active:scale-90 duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] shadow-xs ${
                    viewMode === 'mobile-preview'
                      ? 'bg-sky-500 text-white border-sky-400 shadow-sky-500/25 ring-2 ring-sky-400/30'
                      : 'bg-white/80 dark:bg-[#181B22] border-slate-200/70 dark:border-[#272B35] text-slate-700 dark:text-slate-200 hover:border-amber-400/50'
                  }`}
                  title={viewMode === 'desktop' ? "Switch to Apple iPhone Mobile App Simulator" : "Switch to Full 3-Column Desktop Workstation"}
                >
                  {viewMode === 'desktop' ? (
                    <>
                      <Smartphone className="w-3.5 h-3.5 text-amber-500" />
                      <span className="hidden xl:inline font-bold">iPhone Mode</span>
                    </>
                  ) : (
                    <>
                      <Monitor className="w-3.5 h-3.5 text-white" />
                      <span>Desktop Mode</span>
                    </>
                  )}
                </button>
              </div>

              {/* Top Right Hardware Controls */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                
                {/* Right Context & Suggestions Toggle Button */}
                <button 
                  onClick={() => {
                    sounds.playGlassClick();
                    setIsRightNavOpen(!isRightNavOpen);
                  }}
                  className={`p-2 rounded-xl border transition-all cursor-pointer active:scale-90 duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                    isRightNavOpen 
                      ? 'bg-amber-400/15 border-amber-400/40 text-amber-600 dark:text-amber-400 shadow-xs' 
                      : 'bg-white/80 dark:bg-[#181B22] border-slate-200/70 dark:border-[#272B35] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#20242D]'
                  }`}
                  title={isRightNavOpen ? "Hide Context & Suggestions Panel" : "Show Context & Suggestions Panel"}
                  aria-label="Toggle Context & Suggestions Panel"
                >
                  <PanelRight className="w-4 h-4" />
                </button>

                {/* Google Gemini AI Live Engine Status Badge */}
                <div 
                  className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-400/10 border border-amber-400/25 text-amber-700 dark:text-amber-300 shadow-xs select-none"
                  title="Google Gemini 2.5 Flash Live Engine Active"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-xs font-bold tracking-tight hidden lg:inline">Gemini 2.5 Flash</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </div>

                {/* Mute/Sound Toggle Button */}
                <button 
                  onClick={() => {
                    const next = !soundEnabled;
                    setSoundEnabled(next);
                    if (next) sounds.playCuteSmile();
                  }}
                  className="p-2 rounded-xl bg-white/80 dark:bg-[#181B22] border border-slate-200/70 dark:border-[#272B35] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#20242D] shadow-xs cursor-pointer active:scale-90 transition-all duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                  title={soundEnabled ? "Mute Acoustic Feedback" : "Enable Acoustic Feedback"}
                >
                  {soundEnabled ? (
                    <Volume2 className="w-4 h-4 text-sky-500" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-slate-400" />
                  )}
                </button>

                {/* MAS Session Privacy Lock Button */}
                <button 
                  onClick={() => {
                    sounds.playGlassClick();
                    setIsLocked(true);
                  }}
                  className="p-2 rounded-xl bg-white/80 dark:bg-[#181B22] border border-slate-200/70 dark:border-[#272B35] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#20242D] shadow-xs cursor-pointer group active:scale-90 transition-all duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                  title="Lock Kiosk Session (MAS Compliance)"
                >
                  <Lock className="w-4 h-4 group-hover:text-amber-500 transition-colors" />
                </button>

                {/* Theme Toggle Button */}
                <button 
                  onClick={toggleTheme}
                  className="p-2 rounded-xl bg-white/80 dark:bg-[#181B22] border border-slate-200/70 dark:border-[#272B35] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#20242D] shadow-xs cursor-pointer active:scale-90 transition-all duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                  title={theme === 'light' ? "Switch to Dark Mode" : "Switch to Light Mode"}
                >
                  {theme === 'light' ? (
                    <Moon className="w-4 h-4 text-slate-600" />
                  ) : (
                    <Sun className="w-4 h-4 text-amber-400" />
                  )}
                </button>

                {/* Dark Wallpaper Motif Toggle (Obsidian Waves <-> Architectural Portal) */}
                {theme === 'dark' && (
                  <button 
                    onClick={handleToggleWallpaper}
                    className="p-2 rounded-xl bg-white/80 dark:bg-[#181B22] border border-slate-200/70 dark:border-[#272B35] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#20242D] shadow-xs cursor-pointer group active:scale-90 transition-all duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                    title={`Backdrop Motif: ${darkWallpaper === 'waves' ? 'Obsidian Waves' : 'Architectural Arch'} (Click to switch)`}
                    aria-label="Toggle Dark Wallpaper Backdrop"
                  >
                    <Sparkles className="w-4 h-4 text-amber-400 group-hover:rotate-12 transition-transform" />
                  </button>
                )}

                {/* User Profile Avatar */}
                <div 
                  onClick={() => sounds.playGlassClick()}
                  className="w-8 h-8 rounded-xl bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-800 flex items-center justify-center font-bold text-xs shadow-xs border border-slate-700/50 cursor-pointer active:scale-90 transition-all duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                  title="Branch Officer: Manikandan"
                >
                  M
                </div>

                {/* Session Logout Action Button */}
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold hover:bg-rose-100 dark:hover:bg-rose-500/20 cursor-pointer shadow-xs ml-1 active:scale-90 transition-all duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                  title="Logout from Maybank Kiosk Session"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Exit</span>
                </button>

              </div>

            </header>

        {/* Conversation Canvas & Adaptive iPhone Simulator */}
        {(() => {
          const renderChatMessages = (isCompact = false) => (
            <>
              {/* Empty Greeting State */}
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center my-auto py-8 animate-in fade-in duration-500 text-center">
                  
                  {/* 🤖 Apple VisionOS Staged Robot Avatar Pedestal */}
                  <div 
                    onClick={() => sounds.playCuteSmile()}
                    className="group/avatar relative mb-6 cursor-pointer transform hover:scale-105 active:scale-95 transition-all duration-300"
                    title="Maybank AI Companion (Click to interact)"
                  >
                    {/* Frosted Multi-Tone VisionOS Ambient Aura */}
                    <div className="absolute -inset-4 rounded-[40px] bg-gradient-to-tr from-sky-400/20 via-blue-500/15 to-amber-400/20 blur-xl opacity-80 group-hover/avatar:opacity-100 transition-opacity duration-500 animate-pulse" />
                    
                    {/* Frosted Ceramic Glass Pedestal Capsule */}
                    <div className="relative flex flex-col items-center p-6 rounded-[36px] bg-gradient-to-b from-white/95 to-white/70 dark:from-[#181B22]/95 dark:to-[#181B22]/70 backdrop-blur-2xl border border-white/90 dark:border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)]">
                      <RobotAvatar isCurrent={true} size={isCompact ? "lg" : "xl"} />
                      
                      {/* Floating Status Pill */}
                      <div className="mt-3.5 px-3 py-1 rounded-full bg-slate-100/90 dark:bg-white/10 border border-slate-200/80 dark:border-white/10 flex items-center gap-1.5 shadow-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200 tracking-wider uppercase">
                          AI Online • Ready
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-8">
                    <div className="text-center">
                      <span className="text-xs uppercase tracking-widest text-slate-400 dark:text-slate-400 font-bold">
                        {getSingaporeGreeting()}
                      </span>
                      <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        Hello, <span className="text-blue-600 dark:text-sky-400 font-black">Manikandan.</span>
                      </h2>
                      <p className="text-lg sm:text-xl md:text-2xl font-normal text-slate-400 dark:text-slate-500 mt-1">
                        What can I help you with today?
                      </p>
                    </div>
                  </div>

                  <StarterCards onSelectPrompt={handleSendMessage} compact={isCompact} />
                </div>
              )}

              {/* Conversation Messages */}
              {messages.length > 0 && (() => {
                const lastAiIndex = isThinking ? -1 : messages.map(m => m.sender).lastIndexOf('ai');
                return (
                  <div className="space-y-6 pt-2 w-full">
                    {messages.map((msg, index) => (
                      <div key={index}>
                        {msg.sender === 'user' ? (
                          /* Apple Royal Obsidian User Bubble */
                          <div className="flex justify-end items-start gap-3 max-w-2xl ml-auto group">
                            <div className="flex flex-col items-end">
                              {/* Attached Image Glass Thumbnail */}
                              {msg.image && (
                                <div 
                                  onClick={() => setSelectedPreviewImage(msg.image || null)}
                                  className="mb-2 max-w-xs sm:max-w-sm rounded-2xl overflow-hidden border border-white/20 shadow-md cursor-pointer hover:opacity-95 transition-opacity group/img relative bg-slate-950/20 backdrop-blur-md"
                                  title="Click to expand full image"
                                >
                                  <img 
                                    src={msg.image} 
                                    alt="Attached document or screenshot" 
                                    className="w-full max-h-60 object-cover rounded-2xl" 
                                  />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold backdrop-blur-xs gap-1.5">
                                    <span>Tap to zoom</span>
                                  </div>
                                </div>
                              )}

                              {/* Text Message Bubble with Apple Spring & Micro-interactivity */}
                              <div className="px-5 py-3.5 rounded-3xl rounded-tr-sm bg-gradient-to-r from-slate-900 to-[#12151D] dark:from-[#1E222D] dark:to-[#171A23] text-white border border-white/10 shadow-[0_12px_28px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.15)] text-sm leading-relaxed max-w-xl break-words group/bubble relative select-text transition-all duration-300">
                                <FormattedMessage text={msg.text} />
                              </div>

                              {/* Timestamp and Delivery Status */}
                              <div className="flex items-center gap-1.5 mt-1 mr-1 text-[11px] text-slate-400 font-medium">
                                <span>{msg.time}</span>
                                {copiedIndex === index ? (
                                  <span className="text-emerald-500 font-semibold flex items-center gap-0.5">
                                    <Check className="w-3 h-3" /> Copied
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => handleCopyText(msg.text, index)}
                                    className="opacity-0 group-hover:opacity-100 hover:text-slate-600 dark:hover:text-slate-200 transition-opacity ml-1 cursor-pointer p-0.5"
                                    title="Copy message"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* User Avatar Badge */}
                            <div className="w-8 h-8 rounded-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center font-bold text-xs shadow-md border border-white/20 flex-shrink-0 mt-1">
                              M
                            </div>
                          </div>
                        ) : (
                          /* 🤖 Apple Spatial VisionOS Sovereign AI Response Bubble */
                          <div className="flex items-start gap-3.5 max-w-3xl mr-auto group">
                            
                            {/* Staged Sovereign Robot Avatar Pod */}
                            <div 
                              onClick={() => sounds.playCuteSmile()}
                              className="relative cursor-pointer mt-1 flex-shrink-0 group/pod"
                              title="Maybank AI (Click for acoustic smile)"
                            >
                              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-amber-400/30 to-sky-400/20 blur-md opacity-0 group-hover/pod:opacity-100 transition-opacity duration-300" />
                              <RobotAvatar isCurrent={index === lastAiIndex} size="md" />
                            </div>

                            <div className="flex flex-col items-start min-w-0 flex-1 space-y-3">
                              
                              {/* Main AI Frosted Ceramic Card */}
                              <div className="w-full px-6 py-5 rounded-3xl rounded-tl-sm bg-white/90 dark:bg-[#12151D]/90 backdrop-blur-3xl border border-white/80 dark:border-white/10 shadow-[0_12px_32px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.9)] dark:shadow-[0_16px_36px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)] text-slate-800 dark:text-slate-100 text-sm leading-relaxed transition-all duration-300">
                                
                                {/* AI Author Heading with Model Badge */}
                                <div className="flex items-center justify-between gap-2 mb-3 pb-2.5 border-b border-slate-100 dark:border-white/5">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-xs text-slate-900 dark:text-white tracking-tight">
                                      Maybank AI
                                    </span>
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20">
                                      Sovereign Kiosk
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-slate-400 font-medium">
                                    {msg.time}
                                  </span>
                                </div>

                                {/* Formatted Response Body */}
                                <div className="text-slate-700 dark:text-slate-200 select-text">
                                  {msg.text ? (
                                    <FormattedMessage text={msg.text} isStreaming={isStreaming && index === messages.length - 1} />
                                  ) : isThinking ? (
                                    <div className="flex items-center gap-2 py-1 text-slate-400 italic text-xs">
                                      <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
                                      <span>Formulating Singapore wealth advisory response...</span>
                                    </div>
                                  ) : null}
                                </div>

                                {/* Interactive Horizon Visa Widget (if prompt mentions cards/privileges) */}
                                {msg.hasCardWidget && (
                                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/10">
                                    <FinancialCardWidget onOpenCanvas={() => setIsCardDetailOpen(true)} />
                                  </div>
                                )}

                                {/* AI Action Bar: Copy, Listen, Retry, Feedback */}
                                <div className="flex items-center gap-1 mt-4 pt-3 border-t border-slate-100 dark:border-white/5 text-slate-400">
                                  <button 
                                    onClick={() => handleCopyText(msg.text, index)}
                                    title="Copy response"
                                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 active:scale-90 transition-all duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] cursor-pointer min-h-[38px] touch-manipulation"
                                  >
                                    {copiedIndex === index ? (
                                      <>
                                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                                        <span className="text-emerald-500 font-semibold text-[12px]">Copied</span>
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="w-3.5 h-3.5" />
                                        <span className="text-[12px] font-medium">Copy</span>
                                      </>
                                    )}
                                  </button>

                                  <button 
                                    onClick={() => handleSpeak(msg.text, index)}
                                    title={speakingIndex === index ? "Stop voice playback" : "Listen to response"}
                                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs active:scale-90 transition-all duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] cursor-pointer min-h-[38px] touch-manipulation ${
                                      speakingIndex === index 
                                        ? 'text-sky-500 bg-sky-500/10 font-semibold' 
                                        : 'hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10'
                                    }`}
                                  >
                                    <Volume2 className={`w-3.5 h-3.5 ${speakingIndex === index ? 'animate-bounce' : ''}`} />
                                    <span className="text-[12px] font-medium">
                                      {speakingIndex === index ? 'Speaking...' : 'Listen'}
                                    </span>
                                  </button>

                                  {/* Inline Regenerate / Retry Pill for AI Message */}
                                  {index === messages.length - 1 && !isStreaming && !isThinking && (
                                    <button 
                                      onClick={handleRegenerateResponse}
                                      title="Regenerate this response"
                                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs hover:text-amber-500 dark:hover:text-amber-400 hover:bg-amber-500/10 active:scale-90 transition-all duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] cursor-pointer min-h-[38px] touch-manipulation"
                                    >
                                      <RotateCcw className="w-3.5 h-3.5" />
                                      <span className="text-[12px] font-semibold">Retry</span>
                                    </button>
                                  )}

                                  <button 
                                    onClick={() => sounds.playGlassClick()}
                                    title="Helpful"
                                    className="p-2 rounded-xl hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 active:scale-90 transition-all duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] cursor-pointer min-w-[38px] min-h-[38px] flex items-center justify-center touch-manipulation ml-auto"
                                  >
                                    <ThumbsUp className="w-4 h-4" />
                                  </button>
                                </div>

                              </div>

                              {/* Process Flow Card (if applicable) */}
                              {msg.hasFlow && (
                                <FlowCard onOpenCanvas={() => setIsCardDetailOpen(true)} />
                              )}

                            </div>

                          </div>
                        )}
                      </div>
                    ))}

                    {/* Real-time AI Thinking Shimmer Indicator */}
                    {isThinking && (
                      <div className="flex items-start gap-4 w-full animate-in fade-in duration-300">
                        <RobotAvatar isCurrent={true} size="lg" className="mt-0.5" />
                        <div className="bg-white/85 dark:bg-[#131722]/85 backdrop-blur-2xl text-slate-800 dark:text-slate-100 px-5 py-4 rounded-3xl rounded-tl-sm border border-white/80 dark:border-white/10 shadow-sm flex items-center gap-3">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-sky-500 animate-bounce" style={{ animationDuration: '0.6s' }} />
                            <span className="w-2 h-2 rounded-full bg-sky-500 animate-bounce" style={{ animationDuration: '0.6s', animationDelay: '0.15s' }} />
                            <span className="w-2 h-2 rounded-full bg-sky-500 animate-bounce" style={{ animationDuration: '0.6s', animationDelay: '0.3s' }} />
                          </div>
                          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium tracking-tight">
                            Maybank AI is querying Singapore banking telemetry & advisory guidelines...
                          </span>
                        </div>
                      </div>
                    )}

                  </div>
                );
              })()}
            </>
          );

          if (viewMode === 'mobile-preview') {
            return (
              <div className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4 overflow-hidden relative animate-in zoom-in-95 duration-300">
                {/* VisionOS Ambient Glow Aura */}
                <div className="absolute w-[440px] h-[780px] rounded-full bg-gradient-to-tr from-amber-400/20 via-sky-400/20 to-purple-400/15 blur-3xl pointer-events-none" />

                {/* iPhone 16 Pro Titanium Hardware Chassis */}
                <div className="relative w-[385px] h-[820px] max-h-[92vh] bg-black rounded-[54px] p-2.5 ring-[10px] ring-[#1E222B] shadow-[0_30px_90px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.15)] flex flex-col overflow-hidden gpu-layer border border-white/20">
                  
                  {/* Dynamic Island Cutout */}
                  <div className="absolute top-3.5 left-1/2 -translate-x-1/2 z-50 w-28 h-7 bg-black rounded-full flex items-center justify-between px-3 shadow-inner">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#151515] ring-1 ring-white/10" />
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[9px] font-bold text-white/80 tracking-widest">MAS</span>
                    </div>
                  </div>

                  {/* Inner Phone Screen */}
                  <div className="relative flex-1 rounded-[44px] overflow-hidden flex flex-col justify-between bg-[#F5F6F8] dark:bg-[#08090C] text-slate-900 dark:text-white pt-9 pb-1">
                    
                    {/* Embedded Mobile Header */}
                    <MobileHeader 
                      embedded={true}
                      theme={theme}
                      onToggleTheme={toggleTheme}
                      darkWallpaper={darkWallpaper}
                      onToggleWallpaper={handleToggleWallpaper}
                      onNewChat={handleNewChat}
                      activeChatTitle={chatThreads.find(t => t.id === activeSidebarItem)?.title || 'Maybank AI'}
                      onOpenSidebar={() => setIsMobileSidebarOpen(true)}
                    />

                    {/* Chat Conversation Scroll Area */}
                    <div className="flex-1 overflow-y-auto px-3.5 py-2 custom-scrollbar ios-scroll">
                      <div className="max-w-md mx-auto min-h-full flex flex-col justify-end">
                        {renderChatMessages(true)}
                      </div>
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Composer */}
                    <Composer 
                      onSendMessage={handleSendMessage}
                      onOpenVoice={() => setIsVoiceOpen(true)}
                      isRightNavOpen={false}
                      onToggleRightNav={() => {
                        sounds.playGlassClick();
                        setIsRightNavOpen(prev => !prev);
                      }}
                      externalInsertedText={externalInsertedText}
                      activeContextDoc={activeContextDoc}
                      onRemoveContextDoc={() => setActiveContextDoc(null)}
                      isStreaming={isStreaming}
                      onStopGeneration={handleStopGeneration}
                    />

                    {/* Mobile Tab Bar inside phone frame */}
                    <MobileTabBar 
                      embedded={true}
                      activeTab={activeMobileTab}
                      onSelectTab={(tab) => {
                        setActiveMobileTab(tab);
                        if (tab === 'chat') {
                          setIsMobileSidebarOpen(false);
                          setIsRightNavOpen(false);
                        }
                      }}
                      onOpenSidebar={() => {
                        setIsMobileSidebarOpen(true);
                        setIsRightNavOpen(false);
                      }}
                      onOpenExplore={() => {
                        setIsRightNavOpen(true);
                        setIsMobileSidebarOpen(false);
                      }}
                      onLockSession={() => setIsLocked(true)}
                    />
                  </div>

                  {/* Home Indicator */}
                  <div className="w-32 h-1 bg-white/40 rounded-full mx-auto mt-2 shrink-0" />
                </div>
              </div>
            );
          }

          /* Full-Bleed Desktop Workstation Canvas */
          return (
            <>
              <div className="flex-1 overflow-y-auto px-4 md:px-8 py-2 custom-scrollbar">
                <div className="max-w-4xl mx-auto min-h-full flex flex-col justify-end">
                  {renderChatMessages(false)}
                </div>
                <div ref={messagesEndRef} />
              </div>

              <Composer 
                onSendMessage={handleSendMessage}
                onOpenVoice={() => setIsVoiceOpen(true)}
                isRightNavOpen={isRightNavOpen}
                onToggleRightNav={() => {
                  sounds.playGlassClick();
                  setIsRightNavOpen(prev => !prev);
                }}
                externalInsertedText={externalInsertedText}
                activeContextDoc={activeContextDoc}
                onRemoveContextDoc={() => setActiveContextDoc(null)}
                isStreaming={isStreaming}
                onStopGeneration={handleStopGeneration}
              />
            </>
          );
        })()}

        {/* Voice Overlay */}
        <VoiceOverlay 
          isOpen={isVoiceOpen}
          onClose={() => setIsVoiceOpen(false)}
          onSelectPrompt={(prompt) => {
            setIsVoiceOpen(false);
            handleSendMessage(prompt);
          }}
        />

        {/* Card Privileges Modal */}
        <CardDetailModal 
          isOpen={isCardDetailOpen}
          onClose={() => setIsCardDetailOpen(false)}
        />


        {/* Pre-Lock Grace Warning Toast HUD (10s Countdown) */}
        {lockWarningCountdown !== null && !isLocked && (
          <div 
            onClick={() => setLockWarningCountdown(null)}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-5 py-2.5 rounded-full bg-slate-900/90 dark:bg-black/90 text-white border border-amber-400/40 shadow-[0_15px_40px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.15)] backdrop-blur-2xl animate-in fade-in slide-in-from-top-4 duration-300 cursor-pointer"
            role="status"
            aria-live="polite"
          >
            <div className="relative flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping absolute" />
              <span className="w-2 h-2 rounded-full bg-amber-400 relative" />
            </div>
            <span className="text-xs font-medium text-slate-200">
              Session auto-locking in <strong className="text-amber-400 font-mono text-sm">{lockWarningCountdown}s</strong> due to inactivity
            </span>
            <span className="text-[11px] text-slate-400 border-l border-white/20 pl-2.5 hidden sm:inline">
              Move cursor to stay active
            </span>
          </div>
        )}

      </main>

      {/* COLUMN 3: RIGHT NAVIGATION SUGGESTIONS & CONTEXT DRAWER (Mockup Match) */}
      <RightNavigation 
        isOpen={isRightNavOpen}
        onClose={() => setIsRightNavOpen(false)}
        onSelectSuggestion={handleSelectSuggestion}
      />

      {/* High-Definition Image Lightbox Modal */}
      {selectedPreviewImage && (
        <div 
          onClick={() => setSelectedPreviewImage(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[85vh] rounded-3xl overflow-hidden shadow-2xl border border-white/20 bg-slate-900/90 flex flex-col items-center"
          >
            <img 
              src={selectedPreviewImage} 
              alt="Expanded Document Preview" 
              className="max-w-full max-h-[80vh] object-contain rounded-2xl" 
            />
            <button 
              onClick={() => setSelectedPreviewImage(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors cursor-pointer border border-white/20"
              title="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Apple iOS Floating Frosted Glass Tab Bar (Mobile Only) */}
      <MobileTabBar 
          activeTab={activeMobileTab}
          onSelectTab={(tab) => {
            setActiveMobileTab(tab);
            if (tab === 'chat') {
              setIsMobileSidebarOpen(false);
              setIsRightNavOpen(false);
            }
          }}
          onOpenSidebar={() => {
            setIsMobileSidebarOpen(true);
            setIsRightNavOpen(false);
          }}
          onOpenExplore={() => {
            setIsRightNavOpen(true);
            setIsMobileSidebarOpen(false);
          }}
          onLockSession={() => setIsLocked(true)}
        />

      </div>
    ) : (
      <LoginScreen 
        onLogin={handleLogin}
        theme={theme}
        toggleTheme={toggleTheme}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
      />
    )}

    {/* MAS TRM Kiosk Privacy Curtain Lock Screen (Global Overlay outside inert workspace) */}
    <KioskPrivacyCurtain 
      isLocked={isLocked}
      onUnlock={() => setIsLocked(false)}
      theme={theme}
    />
  </div>
);
};

export default App;
