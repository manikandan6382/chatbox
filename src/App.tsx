import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { StarterCards } from './components/StarterCards';
import { Composer } from './components/Composer';
import { VoiceOverlay } from './components/VoiceOverlay';
import { RobotAvatar } from './components/RobotAvatar';
import { UserAvatar } from './components/UserAvatar';
import { RightNavigation } from './components/RightNavigation';
import { MobileHeader } from './components/MobileHeader';
import { sounds } from './utils/audio';
import { ChatThreadItem } from './types';
import { FormattedMessage } from './components/FormattedMessage';
import { streamGeminiResponse, ChatMessageContext, generateContextualImageAnalysis } from './services/aiService';
import { 
  Sun, Moon, Copy, Check, Volume2, VolumeX, X, RotateCcw
} from 'lucide-react';

interface Message {
  sender: 'user' | 'ai';
  text: string;
  image?: string;
  time?: string;
  canRetry?: boolean;
}

export const App: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [activeSidebarItem, setActiveSidebarItem] = useState<string>('onboarding-flow');
  const [isVoiceOpen, setIsVoiceOpen] = useState<boolean>(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
  const [isCompactCards, setIsCompactCards] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  
  // Right Navigation Suggestions & Context Drawer State (Mockup Match)
  const [isRightNavOpen, setIsRightNavOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return false;
  });
  const [highlightedTopic, setHighlightedTopic] = useState<string | null>(null);
  const [externalInsertedText, setExternalInsertedText] = useState<string>('');
  const [selectedPreviewImage, setSelectedPreviewImage] = useState<string | null>(null);
  const [activeContextDoc, setActiveContextDoc] = useState<string | null>(null);

  // Mobile Native App State (Side Offcanvas Drawer)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // Auto-close drawers when resizing into desktop/tablet view (>= 1024px)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsRightNavOpen(false);
      } else {
        setIsMobileSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Apple Native Bidirectional edge-swipe gestures on mobile
  // Left edge swipe right -> opens conversation history drawer
  // Right edge swipe left -> opens suggestions & context drawer
  useEffect(() => {
    let startX = 0;
    let startY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches && e.touches[0]) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.changedTouches && e.changedTouches[0]) {
        const deltaX = e.changedTouches[0].clientX - startX;
        const deltaY = Math.abs(e.changedTouches[0].clientY - startY);
        const screenWidth = window.innerWidth;

        // Left edge swipe right (> 45px) opens left sidebar
        if (startX < 36 && deltaX > 45 && deltaY < 40) {
          (document.activeElement as HTMLElement)?.blur();
          sounds.playGlassClick();
          setIsMobileSidebarOpen(true);
        }

        // Right edge swipe left (< -45px) opens right suggestions drawer on mobile/tablet
        if (startX > screenWidth - 36 && deltaX < -45 && deltaY < 40) {
          (document.activeElement as HTMLElement)?.blur();
          sounds.playGlassClick();
          setIsRightNavOpen(true);
        }
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  // Pre-load and cache voices for instant high-quality female TTS across browsers
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      const onVoicesChanged = () => {
        window.speechSynthesis.getVoices();
      };
      window.speechSynthesis.addEventListener('voiceschanged', onVoicesChanged);
      return () => window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged);
    }
  }, []);

  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const speechWatchdogRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Sidebar Threads Metadata State (Single source of truth with LocalStorage persistence)
  const [chatThreads, setChatThreads] = useState<ChatThreadItem[]>(() => {
    try {
      const savedThreadsRaw = localStorage.getItem('maybank_threads_history_v1');
      const savedThreads: Record<string, Message[]> = savedThreadsRaw ? JSON.parse(savedThreadsRaw) : {};
      const saved = localStorage.getItem('maybank_chat_threads_v1');
      if (saved) {
        const parsed: ChatThreadItem[] = JSON.parse(saved);
        // Automatically prune empty ghost "New Conversation" entries that have no messages
        const cleaned = parsed.filter(t => {
          if (t.title === 'New Conversation' || t.title === 'New Chat') {
            const count = savedThreads[t.id]?.length || 0;
            return count > 0;
          }
          return true;
        });
        if (cleaned.length > 0) return cleaned;
      }
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
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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

  // Scroll to bottom on new messages without fighting user scroll gestures
  useEffect(() => {
    if (scrollContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 250;
      if (isNearBottom || !isStreaming) {
        scrollContainerRef.current.scrollTo({
          top: scrollHeight,
          behavior: isStreaming ? 'auto' : 'smooth'
        });
      }
    }
  }, [messages, isStreaming, isThinking]);

  // Instant scroll to bottom when switching active thread
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [activeSidebarItem]);

  const toggleTheme = () => {
    sounds.playGlassClick();
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
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
    
    // Auto-derive smart thread title from first message
    const threadTitle = promptText.length > 28 ? `${promptText.substring(0, 28)}...` : promptText;

    // Ensure thread is added to sidebar navigation only once user actually sends their message!
    setChatThreads(prev => {
      const exists = prev.some(t => t.id === targetThreadId);
      if (!exists) {
        const newThread: ChatThreadItem = {
          id: targetThreadId,
          title: threadTitle,
          time: 'Just now',
          isPinned: false
        };
        return [newThread, ...prev];
      }
      return prev.map(t =>
        t.id === targetThreadId && (t.title === 'New Conversation' || t.title === 'New Chat')
          ? { ...t, title: threadTitle }
          : t
      );
    });

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
    const newAiMessageTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Prepare message history context for Gemini
    const chatHistoryContext: ChatMessageContext[] = currentThreadMessages.map(m => ({
      sender: m.sender,
      text: m.text
    }));

    try {
      let fullStreamedText = '';
      let isFirstChunk = true;
      let chunksReceived = 0;

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
                hasFlow
              }
            ]
          }));
          isFirstChunk = false;
        }

        chunksReceived++;
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

      // Safety Guard: If stream completed with 0 chunks or blank text, guarantee an intelligent response
      if (chunksReceived === 0 || !fullStreamedText.trim()) {
        const smartResponse = generateContextualImageAnalysis(promptText, !!image);
        setThreads(prev => ({
          ...prev,
          [targetThreadId]: [
            ...(prev[targetThreadId] || []),
            { 
              sender: 'ai', 
              text: smartResponse, 
              time: newAiMessageTime,
              hasFlow
            }
          ]
        }));
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

      // Provide intelligent analysis cleanly without robotic debug notes or blockquote arrows
      const fallbackAnalysis = generateContextualImageAnalysis(promptText, !!image);

      setThreads(prev => ({
        ...prev,
        [targetThreadId]: [
          ...(prev[targetThreadId] || []),
          {
            sender: 'ai',
            text: fallbackAnalysis,
            time: newAiMessageTime
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

    // Clean markdown characters & table pipes for natural speech synthesis
    const cleanText = text
      .replace(/\|/g, ' ')
      .replace(/[*_#`~[\]()]/g, '')
      .replace(/-{3,}/g, '')
      .replace(/:---+/g, '')
      .replace(/\n+/g, '. ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.05;

    // Prioritize natural female/woman voices across operating systems and browsers
    const allVoices = window.speechSynthesis.getVoices();
    if (allVoices && allVoices.length > 0) {
      const topFemaleNames = [
        'Jenny', 'Aria', 'Michelle', 'Ava', 'Samantha', 'Victoria', 'Zira', 
        'Sonia', 'Libby', 'Karen', 'Moira', 'Tessa', 'Fiona', 'Heera', 'Neerja',
        'Google UK English Female', 'Google US English Female'
      ];
      
      // 1. Primary: Natural English female voice by name keyword
      let selectedVoice = allVoices.find(v => 
        v.lang.toLowerCase().startsWith('en') && 
        topFemaleNames.some(name => v.name.toLowerCase().includes(name.toLowerCase()))
      );

      // 2. Secondary: Any English voice with "female" or "woman" in its name or gender
      if (!selectedVoice) {
        selectedVoice = allVoices.find(v => 
          v.lang.toLowerCase().startsWith('en') && 
          (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('woman') || (v as any).gender === 'female')
        );
      }

      // 3. Tertiary: Any voice matching female names in any language
      if (!selectedVoice) {
        selectedVoice = allVoices.find(v => 
          topFemaleNames.some(name => v.name.toLowerCase().includes(name.toLowerCase())) ||
          v.name.toLowerCase().includes('female') ||
          v.name.toLowerCase().includes('woman')
        );
      }

      // 4. Fallback: English voice
      if (!selectedVoice) {
        selectedVoice = allVoices.find(v => v.lang.toLowerCase().startsWith('en'));
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
    }

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
    // Cancel pending speech synthesis and reset audio state on thread switch
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeakingIndex(null);
      activeUtteranceRef.current = null;
      if (speechWatchdogRef.current) {
        clearInterval(speechWatchdogRef.current);
        speechWatchdogRef.current = null;
      }
    }
    sounds.playGlassClick();

    // If leaving an empty draft that was never registered in chatThreads, discard it cleanly
    if (activeSidebarItem !== id) {
      setThreads(prev => {
        const prevMsgs = prev[activeSidebarItem] || [];
        if (prevMsgs.length === 0 && !chatThreads.some(t => t.id === activeSidebarItem)) {
          const copy = { ...prev };
          delete copy[activeSidebarItem];
          return copy;
        }
        return prev;
      });
    }

    setActiveSidebarItem(id);
    setIsMobileSidebarOpen(false);
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
          // If all chats were deleted, spawn a fresh clean draft without adding to sidebar
          const fallbackId = `chat-${Date.now()}`;
          setTimeout(() => {
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

    // If current conversation is ALREADY an empty draft (0 messages and not in chatThreads), simply stay on it!
    const currentMsgs = threads[activeSidebarItem] || [];
    if (currentMsgs.length === 0 && !chatThreads.some(t => t.id === activeSidebarItem)) {
      setIsMobileSidebarOpen(false);
      return;
    }

    // Set to fresh draft ID, but DO NOT add to chatThreads until user actually sends a message!
    const newDraftId = `chat-${Date.now()}`;
    setThreads(prev => ({ ...prev, [newDraftId]: [] }));
    setActiveSidebarItem(newDraftId);
    setIsMobileSidebarOpen(false);
  };

  // Scrub any empty ghost "New Conversation" entries on mount or hot-reload
  useEffect(() => {
    setChatThreads(prev => {
      const cleaned = prev.filter(t => {
        if (t.title === 'New Conversation' || t.title === 'New Chat') {
          const count = threads[t.id]?.length || 0;
          return count > 0;
        }
        return true;
      });
      return cleaned.length !== prev.length ? cleaned : prev;
    });
  }, [threads]);

  // Global ⌘N / Ctrl+N shortcut for New Chat
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handleNewChat();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [activeSidebarItem, chatThreads, threads]);

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
    <div className="relative h-[100dvh] w-screen overflow-hidden font-sans antialiased bg-[#F5F6F8] dark:bg-[#08090C] text-slate-900 dark:text-white transition-colors duration-300">
      
      {/* ========================================================================= */}
      {/* OVERALL FIXED BACKGROUND (Light & Dark Single Themes)                     */}
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
        {/* Dark Mode Obsidian Waves */}
        <img 
          src="/assets/dark-waves.png" 
          alt="Dark Obsidian Waves" 
          className={`w-full h-full object-cover object-center transition-opacity duration-700 absolute inset-0 ${
            theme === 'dark' ? 'opacity-100' : 'opacity-0'
          }`} 
        />
        
        {/* Ambient Overlays */}
        <div className={`absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-white/40 pointer-events-none transition-opacity duration-700 ${theme === 'light' ? 'opacity-100' : 'opacity-0'}`} />
        <div className={`absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 pointer-events-none transition-opacity duration-700 ${theme === 'dark' ? 'opacity-100' : 'opacity-0'}`} />
      </div>

      {/* ========================================================================= */}
      {/* MAIN VIEW: RESPONSIVE NATIVE APP WORKSPACE (Direct Access For All)        */}
      {/* ========================================================================= */}
      <div className="relative z-10 flex h-full min-h-0 w-full p-0 sm:p-3 lg:p-5 gap-0 lg:gap-5 box-border animate-in fade-in duration-300">
        
        {/* COLUMN 1: LEFT SIDEBAR (Desktop Fixed / Mobile Slide-Over Drawer) */}
        <Sidebar 
          activeItemId={activeSidebarItem}
          threads={chatThreads}
          onSelectItem={handleSelectSidebarItem}
          onNewChat={handleNewChat}
          onTogglePin={handleTogglePin}
          onRenameChat={handleRenameChat}
          onDeleteChat={handleDeleteChat}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* COLUMN 2: EXPANSIVE CHAT & WORKSPACE CANVAS */}
        <main 
          onWheel={(e) => {
            if (scrollContainerRef.current && !scrollContainerRef.current.contains(e.target as Node)) {
              scrollContainerRef.current.scrollTop += e.deltaY;
            }
          }}
          className="flex-1 min-w-0 min-h-0 h-full flex flex-col overflow-hidden relative pb-0"
        >

          {/* Mobile Native Apple Header */}
          <MobileHeader 
            theme={theme}
            onToggleTheme={toggleTheme}
            onNewChat={handleNewChat}
            activeChatTitle={chatThreads.find(t => t.id === activeSidebarItem)?.title || 'New Chat'}
            onOpenSidebar={() => setIsMobileSidebarOpen(true)}
          />

          {/* Desktop Telemetry Header Bar */}
          <header className="hidden lg:flex shrink-0 items-center justify-between gap-4 pt-1 px-4 z-20">
        
            {/* Top Left: Companion Capsule when chatting, or clean negative space when greeting */}
            <div className="flex items-center gap-2">
              {messages.length > 0 && (
                <div 
                  onClick={() => sounds.playCuteSmile()}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-white/85 dark:bg-[#181B22]/85 backdrop-blur-xl border border-white/90 dark:border-white/15 shadow-[0_4px_16px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.9)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.15)] cursor-pointer group hover:scale-[1.02] active:scale-95 transition-all duration-300 animate-in fade-in slide-in-from-top-2"
                  title="Maybank AI Companion (Click to interact)"
                >
                  <div className="relative">
                    <RobotAvatar size="sm" />
                    <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-white dark:ring-black animate-pulse shadow-xs" />
                  </div>
                  <div className="flex flex-col min-w-0 pr-1">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100 tracking-tight truncate max-w-[200px]">
                      {chatThreads.find(t => t.id === activeSidebarItem)?.title || 'Active Session'}
                    </span>
                    <span className="text-[9px] text-slate-500 dark:text-slate-300 font-medium">AI Active</span>
                  </div>
                </div>
              )}
            </div>

            {/* Top Right Hardware Controls */}
            <div className="flex items-center gap-2">

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

            </div>

          </header>

        {/* Center Conversation Canvas (Dynamic Zero-Scroll Fit when greeting, Smooth Scroll when chatting) */}
        <div 
          ref={scrollContainerRef}
          className={`flex-1 min-h-0 px-2.5 sm:px-6 md:px-8 py-1 ios-scroll overflow-x-hidden ${
            messages.length === 0 
              ? 'overflow-y-auto lg:overflow-hidden flex flex-col justify-center' 
              : 'overflow-y-auto custom-scrollbar pb-3 sm:pb-6'
          }`}
        >
          
          <div className={`max-w-4xl mx-auto w-full ${
            messages.length === 0 
              ? 'my-auto flex flex-col justify-center' 
              : 'min-h-full flex flex-col justify-start'
          }`}>
            
            {/* Empty Greeting State: Architected to fit 100% of visible screen with ZERO scrolling */}
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-1 sm:py-2 animate-in fade-in duration-500 text-center w-full min-h-0">
                
                {/* 🤖 Apple VisionOS Floating Expressive Robot Avatar Hero (Elevated 2xl Size) */}
                <div 
                  onClick={() => sounds.playCuteSmile()}
                  className="group/avatar relative mb-2 sm:mb-3 cursor-pointer transform hover:scale-105 active:scale-95 transition-all duration-300 flex flex-col items-center"
                  title="Maybank AI Companion (Click to interact)"
                >
                  {/* Frosted Multi-Tone VisionOS Caustic Ambient Glow */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-44 md:w-56 md:h-56 rounded-full bg-gradient-to-tr from-sky-400/25 via-blue-500/20 to-amber-400/20 blur-3xl opacity-85 group-hover/avatar:opacity-100 transition-opacity duration-500 animate-pulse pointer-events-none" />
                  
                  {/* Expressive Floating Robot Head (size 2xl: 144px-176px) */}
                  <RobotAvatar isCurrent={true} size="2xl" />
                  
                  {/* Specular Floating Status Pill */}
                  <div className="mt-2.5 px-3 py-1 rounded-full bg-white/80 dark:bg-white/10 backdrop-blur-xl border border-white/90 dark:border-white/15 flex items-center gap-1.5 shadow-[0_4px_16px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.9)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.15)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-extrabold text-slate-700 dark:text-slate-200 tracking-wider uppercase">
                      AI Online • Ready
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-2 sm:mb-3">
                  <div className="text-center">
                    <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 font-extrabold block">
                      {getSingaporeGreeting()}
                    </span>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-[-0.03em] mt-0.5">
                      Welcome <span className="bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 dark:from-sky-400 dark:via-blue-400 dark:to-cyan-300 bg-clip-text text-transparent">back.</span>
                    </h2>
                  </div>
                </div>

                <StarterCards 
                  onSelectPrompt={handleSendMessage} 
                  compact={false} 
                  onHoverTopic={setHighlightedTopic}
                />
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
                        <div className="flex justify-end items-start gap-1.5 sm:gap-2.5 max-w-[88%] sm:max-w-xl md:max-w-2xl ml-auto min-w-0 group">
                          <div className="flex flex-col items-end min-w-0 max-w-full">
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

                            <div className="bg-slate-900 text-white dark:bg-[#1E293B]/95 dark:text-slate-100 px-3.5 py-2.5 sm:px-5 sm:py-3.5 rounded-3xl rounded-tr-sm text-[13.5px] sm:text-[14px] leading-relaxed font-normal shadow-md border border-slate-800/10 dark:border-white/15 backdrop-blur-xl transition-all break-words [overflow-wrap:anywhere] min-w-0 max-w-full">
                              {msg.text}
                            </div>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 pr-1 font-medium">
                              {msg.time || '10:24 AM'}
                            </span>
                          </div>
                          <UserAvatar size="md" className="mt-0.5 flex-shrink-0" />
                        </div>
                      ) : (
                        /* Apple Luxury AI Bubble with 3D Cute Eye-Tracking Robot */
                        <div className="flex items-start gap-1.5 sm:gap-2.5 w-full min-w-0">
                          
                          {/* 3D Cute Interactive Cyber Robot Avatar with Blinking & Winking */}
                          <RobotAvatar 
                            isCurrent={index === lastAiIndex} 
                            size="lg" 
                            className="mt-1 flex-shrink-0" 
                          />

                          <div className="flex-1 space-y-3 min-w-0 max-w-full">
                            
                            {/* Ceramic Glass Response Card */}
                            <div className="bg-white/95 dark:bg-[#131722]/90 backdrop-blur-2xl text-slate-800 dark:text-slate-100 p-3.5 sm:p-5 rounded-3xl rounded-tl-sm text-[13.5px] sm:text-[14px] leading-relaxed border border-slate-200/90 dark:border-white/10 shadow-[0_12px_36px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.45)] transition-all min-w-0 max-w-full overflow-hidden">
                              
                              {/* Card Header */}
                              <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-100 dark:border-white/5">
                                <span className="text-xs font-bold text-slate-900 dark:text-white tracking-tight">Maybank AI</span>
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                                  {msg.time || '10:25 AM'}
                                </span>
                              </div>

                              {/* Rich Formatted Markdown Text with Horological Streaming Cursor */}
                              <FormattedMessage 
                                text={msg.text} 
                                isStreaming={isStreaming && index === messages.length - 1} 
                              />


                              {/* Apple Ghost Action Dock with Kiosk Touch Ergonomics */}
                              <div className="flex flex-wrap items-center gap-1 sm:gap-2 pt-2.5 mt-2 border-t border-slate-100 dark:border-white/5 text-slate-400">
                                <button 
                                  onClick={() => handleCopyText(msg.text, index)}
                                  title="Copy response"
                                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 active:scale-90 transition-all duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] cursor-pointer min-h-[36px] touch-manipulation"
                                >
                                  {copiedIndex === index ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                                  <span className="text-[11px] sm:text-[12px] font-semibold">{copiedIndex === index ? 'Copied' : 'Copy'}</span>
                                </button>
                                
                                <button 
                                  onClick={() => handleSpeak(msg.text, index)}
                                  title={speakingIndex === index ? "Stop audio" : "Listen to response"}
                                  className={`flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs active:scale-90 transition-all duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] cursor-pointer min-h-[36px] touch-manipulation ${
                                    speakingIndex === index 
                                      ? 'bg-sky-500/15 text-sky-600 dark:text-sky-300 ring-1 ring-sky-400/30' 
                                      : 'hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10'
                                  }`}
                                >
                                  {speakingIndex === index ? (
                                    <div className="flex items-center gap-0.5 h-3.5">
                                      <span className="w-0.5 h-3 bg-sky-500 rounded-full animate-bounce" style={{ animationDuration: '0.6s' }} />
                                      <span className="w-0.5 h-2 bg-sky-500 rounded-full animate-bounce" style={{ animationDuration: '0.8s', animationDelay: '0.15s' }} />
                                      <span className="w-0.5 h-3.5 bg-sky-500 rounded-full animate-bounce" style={{ animationDuration: '0.7s', animationDelay: '0.3s' }} />
                                    </div>
                                  ) : (
                                    <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                  )}
                                  <span className="text-[11px] sm:text-[12px] font-semibold">{speakingIndex === index ? 'Speaking...' : 'Listen'}</span>
                                </button>

                                {/* Inline Regenerate / Retry Pill for AI Message */}
                                {index === messages.length - 1 && !isStreaming && !isThinking && (
                                  <button 
                                    onClick={handleRegenerateResponse}
                                    title="Regenerate this response"
                                    className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs hover:text-amber-500 dark:hover:text-amber-400 hover:bg-amber-500/10 active:scale-90 transition-all duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] cursor-pointer min-h-[36px] touch-manipulation"
                                  >
                                    <RotateCcw className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                                    <span className="text-[11px] sm:text-[12px] font-semibold">Retry</span>
                                  </button>
                                )}
                              </div>

                            </div>
                          </div>

                        </div>
                      )}
                    </div>
                  ))}

                  {/* Real-time AI Thinking Shimmer Indicator */}
                  {isThinking && (
                    <div className="flex items-start gap-1.5 sm:gap-2.5 w-full animate-in fade-in duration-300">
                      <RobotAvatar isCurrent={true} size="lg" className="mt-0.5 flex-shrink-0" />
                      <div className="bg-white/85 dark:bg-[#131722]/85 backdrop-blur-2xl text-slate-800 dark:text-slate-100 px-4 py-3 sm:px-5 sm:py-4 rounded-3xl rounded-tl-sm border border-white/80 dark:border-white/10 shadow-sm flex items-center gap-3">
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

          </div>

          <div ref={messagesEndRef} />
        </div>

        {/* Floating Bottom Composer (Wide Floating Pill) */}
        <div className="shrink-0 w-full z-20 pb-1">
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
        </div>

        {/* Voice Overlay */}
        <VoiceOverlay 
          isOpen={isVoiceOpen}
          onClose={() => setIsVoiceOpen(false)}
          onSelectPrompt={(prompt) => {
            setIsVoiceOpen(false);
            handleSendMessage(prompt);
          }}
        />

      </main>

      {/* COLUMN 3: RIGHT NAVIGATION SUGGESTIONS & CONTEXT DRAWER (Mockup Match) */}
      <RightNavigation 
        isOpen={isRightNavOpen}
        onClose={() => setIsRightNavOpen(false)}
        onSelectSuggestion={handleSelectSuggestion}
        highlightedTopic={highlightedTopic}
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

    </div>
  </div>
);
};

export default App;
