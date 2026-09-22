import React, { useState, useRef, useEffect } from 'react';
import { Plus, MessageSquare, Pin, PinOff, Trash2, MoreHorizontal, Maximize2, ChevronDown, ChevronRight, LogOut, Pencil, X } from 'lucide-react';
import { ChatThreadItem } from '../types';
import { sounds } from '../utils/audio';

interface SidebarProps {
  activeItemId: string;
  threads: ChatThreadItem[];
  onSelectItem: (id: string) => void;
  onNewChat: () => void;
  onTogglePin: (id: string) => void;
  onDeleteChat: (id: string) => void;
  onRenameChat: (id: string, newTitle: string) => void;
  onLogout: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeItemId,
  threads,
  onSelectItem,
  onNewChat,
  onTogglePin,
  onDeleteChat,
  onRenameChat,
  onLogout,
  isMobileOpen = false,
  onCloseMobile
}) => {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isPinnedExpanded, setIsPinnedExpanded] = useState<boolean>(true);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState<string>('');
  const menuRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close context menu & profile menu on outside click or Escape key
  useEffect(() => {
    if (!activeMenuId && !isProfileMenuOpen) return;

    const handlePointerDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenuId(null);
        setConfirmDeleteId(null);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveMenuId(null);
        setConfirmDeleteId(null);
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeMenuId, isProfileMenuOpen]);

  const pinnedItems = threads.filter(t => t.isPinned);
  const recentItems = threads.filter(t => !t.isPinned);

  const renderChatItem = (item: ChatThreadItem) => {
    const isActive = activeItemId === item.id;
    const isMenuOpen = activeMenuId === item.id;

    return (
      <div key={item.id} className="relative group">
        <div
          onClick={() => onSelectItem(item.id)}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-left transition-all cursor-pointer select-none ${
            isActive 
              ? 'bg-slate-100 dark:bg-[#1C2028] text-slate-900 dark:text-white shadow-xs' 
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#1C2028]/60'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-1">
            <MessageSquare className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`} />
            <div className="min-w-0 flex-1">
              {editingId === item.id ? (
                <input
                  type="text"
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  onBlur={() => {
                    if (editingTitle.trim() && editingTitle.trim() !== item.title) {
                      onRenameChat(item.id, editingTitle.trim());
                    }
                    setEditingId(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      if (editingTitle.trim() && editingTitle.trim() !== item.title) {
                        onRenameChat(item.id, editingTitle.trim());
                        sounds.playGlassClick();
                      }
                      setEditingId(null);
                    } else if (e.key === 'Escape') {
                      setEditingId(null);
                    }
                  }}
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                  className="w-full text-xs font-semibold bg-white dark:bg-[#20242D] text-slate-900 dark:text-white px-1.5 py-0.5 rounded border border-sky-400 focus:outline-none shadow-xs"
                />
              ) : (
                <p className={`text-xs truncate ${isActive ? 'font-semibold text-slate-900 dark:text-white' : 'font-medium'}`}>
                  {item.title}
                </p>
              )}
              <div className="flex items-center gap-1.5 mt-0.5">
                {item.isPinned && (
                  <Pin className="w-2.5 h-2.5 text-amber-500 fill-amber-500/30 flex-shrink-0" />
                )}
                <span className="text-[10px] text-slate-400">
                  {item.time}
                </span>
              </div>
            </div>
          </div>

          {/* Action Controls Cluster */}
          <div 
            className={`flex items-center gap-0.5 transition-opacity ${
              isActive || isMenuOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Quick Pin Toggle Button */}
            <button
              onClick={() => {
                sounds.playGlassClick();
                onTogglePin(item.id);
              }}
              className="p-1 rounded-lg hover:bg-slate-200/70 dark:hover:bg-white/10 text-slate-400 hover:text-amber-500 transition-colors cursor-pointer"
              title={item.isPinned ? "Unpin chat" : "Pin chat"}
              aria-label={item.isPinned ? "Unpin chat" : "Pin chat"}
            >
              {item.isPinned ? (
                <PinOff className="w-3.5 h-3.5 text-amber-500" />
              ) : (
                <Pin className="w-3.5 h-3.5" />
              )}
            </button>

            {/* More Options / Context Menu Trigger */}
            <button
              onClick={() => {
                sounds.playGlassClick();
                setActiveMenuId(prev => prev === item.id ? null : item.id);
                setConfirmDeleteId(null);
              }}
              className={`p-1 rounded-lg hover:bg-slate-200/70 dark:hover:bg-white/10 transition-colors cursor-pointer ${
                isMenuOpen ? 'bg-slate-200 dark:bg-white/20 text-slate-900 dark:text-white' : 'text-slate-400'
              }`}
              title="Chat options"
              aria-label="Chat options"
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Floating Apple Glass Context Menu Popover */}
        {isMenuOpen && (
          <div 
            ref={menuRef}
            className="absolute right-1 top-full mt-1 w-48 z-50 bg-white/95 dark:bg-[#1A1D24]/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-slate-200/80 dark:border-white/10 p-1.5 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {confirmDeleteId === item.id ? (
              /* Inline Confirmation Dialog */
              <div className="p-2 space-y-2 bg-rose-50/80 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-900/60">
                <p className="text-[11px] font-semibold text-rose-700 dark:text-rose-300 leading-snug">
                  Delete this conversation?
                </p>
                <div className="flex items-center gap-1.5 pt-0.5">
                  <button
                    onClick={() => {
                      sounds.playGlassClick();
                      setConfirmDeleteId(null);
                    }}
                    className="flex-1 py-1 px-2 text-[10px] font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-[#20242D] rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-[#2A2F3B] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      onDeleteChat(item.id);
                      setActiveMenuId(null);
                      setConfirmDeleteId(null);
                    }}
                    className="flex-1 py-1 px-2 text-[10px] font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition-colors cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ) : (
              /* Standard Menu Actions */
              <div className="space-y-0.5">
                {/* Pin / Unpin */}
                <button
                  onClick={() => {
                    sounds.playGlassClick();
                    onTogglePin(item.id);
                    setActiveMenuId(null);
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors text-left cursor-pointer"
                >
                  {item.isPinned ? (
                    <>
                      <PinOff className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                      <span>Unpin from top</span>
                    </>
                  ) : (
                    <>
                      <Pin className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 flex-shrink-0" />
                      <span>Pin to top</span>
                    </>
                  )}
                </button>

                {/* Rename Chat */}
                <button
                  onClick={() => {
                    sounds.playGlassClick();
                    setEditingId(item.id);
                    setEditingTitle(item.title);
                    setActiveMenuId(null);
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors text-left cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5 text-sky-500 flex-shrink-0" />
                  <span>Rename chat</span>
                </button>

                <div className="h-px bg-slate-100 dark:bg-white/10 my-1" />

                {/* Delete Chat */}
                <button
                  onClick={() => {
                    sounds.playGlassClick();
                    setConfirmDeleteId(item.id);
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs font-semibold rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors text-left cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Delete chat</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div 
          onClick={() => {
            sounds.playGlassClick();
            if (onCloseMobile) onCloseMobile();
          }}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 lg:hidden animate-in fade-in duration-200"
        />
      )}

      <aside className={`
        ${isMobileOpen 
          ? 'fixed inset-y-0 left-0 z-50 w-[300px] max-w-[85vw] h-[100dvh] rounded-r-3xl animate-in slide-in-from-left duration-300 shadow-2xl safe-top safe-bottom flex' 
          : 'hidden lg:flex w-[280px] h-full rounded-3xl'
        }
        flex-shrink-0 flex-col justify-between bg-white/90 dark:bg-[#12151D]/95 backdrop-blur-3xl p-4 shadow-xl dark:shadow-black/50 border border-white/80 dark:border-white/10 transition-all select-none gpu-layer
      `}>
      
      {/* Top Header & Thread Lists */}
      <div className="flex-1 flex flex-col min-h-0 space-y-4">
        
        {/* Brand Header */}
        <div className="flex items-center justify-between px-1 pt-1 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            {/* Maybank Tiger Head Logo Emblem */}
            <img 
              src="/assets/maybank-tiger-circle.png" 
              alt="Maybank Logo" 
              className="w-8 h-8 rounded-full object-cover shadow-xs flex-shrink-0"
            />
            <span className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Maybank
            </span>
          </div>
          
          <div className="flex items-center gap-1">
            {onCloseMobile && (
              <button 
                onClick={() => {
                  sounds.playGlassClick();
                  onCloseMobile();
                }}
                className="lg:hidden p-1.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/20 transition-colors cursor-pointer ios-press"
                title="Close Conversations Menu"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button className="hidden lg:block p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer">
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* + New Chat CTA */}
        <button 
          onClick={onNewChat}
          className="w-full py-2.5 px-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold rounded-xl flex items-center justify-between shadow-sm active:scale-[0.98] transition-all cursor-pointer group flex-shrink-0"
        >
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="text-xs font-bold">New Chat</span>
          </div>
          <span className="text-[10px] font-semibold opacity-70 bg-slate-800 dark:bg-slate-200 px-1.5 py-0.5 rounded">
            ⌘ N
          </span>
        </button>

        {/* Scrollable Conversation Items Container */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4 min-h-0 custom-scrollbar">
          
          {/* PINNED SECTION */}
          <div className="space-y-1">
            <button
              onClick={() => setIsPinnedExpanded(prev => !prev)}
              className="w-full flex items-center justify-between px-2 py-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-1.5">
                <Pin className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-[11px] font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400">
                  Pinned ({pinnedItems.length})
                </span>
              </div>
              {isPinnedExpanded ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
            
            {isPinnedExpanded && (
              <div className="space-y-1 animate-in fade-in duration-200">
                {pinnedItems.length > 0 ? (
                  pinnedItems.map(renderChatItem)
                ) : (
                  <p className="px-3 py-2 text-[11px] text-slate-400 dark:text-slate-500 italic">
                    No pinned chats
                  </p>
                )}
              </div>
            )}
          </div>

          {/* RECENT SECTION */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 px-2 py-1">
              <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                Recent ({recentItems.length})
              </span>
            </div>

            <div className="space-y-1">
              {recentItems.length > 0 ? (
                recentItems.map(renderChatItem)
              ) : (
                <p className="px-3 py-2 text-[11px] text-slate-400 dark:text-slate-500 italic">
                  No recent chats
                </p>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* User Profile at Bottom */}
      <div className="border-t border-slate-100 dark:border-[#222630] pt-3 flex items-center justify-between flex-shrink-0 mt-2 relative">
        <div 
          onClick={() => {
            sounds.playGlassClick();
            setIsProfileMenuOpen(prev => !prev);
          }}
          className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer hover:opacity-85 transition-opacity"
        >
          <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs ring-2 ring-slate-200 dark:ring-slate-700 flex-shrink-0 shadow-xs">
            M
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
              Manikandan
            </span>
            <span className="text-[10px] text-slate-400 truncate">
              manikandan@maybank.com.sg
            </span>
          </div>
        </div>

        <button 
          onClick={() => {
            sounds.playGlassClick();
            setIsProfileMenuOpen(prev => !prev);
          }}
          className={`p-1.5 rounded-lg transition-colors flex-shrink-0 cursor-pointer ${
            isProfileMenuOpen 
              ? 'bg-slate-200 dark:bg-white/20 text-slate-900 dark:text-white' 
              : 'hover:bg-slate-100 dark:hover:bg-[#1C2028] text-slate-400'
          }`}
          title="Account & Session Menu"
          aria-label="Account & Session Menu"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>

        {/* Floating Profile & Logout Popover */}
        {isProfileMenuOpen && (
          <div
            ref={profileMenuRef}
            className="absolute bottom-full left-0 right-0 mb-2 z-50 bg-white/95 dark:bg-[#1A1D24]/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-slate-200/80 dark:border-white/10 p-2 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-2.5 py-2 border-b border-slate-100 dark:border-white/10 mb-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white">Manikandan</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Online
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Staff Advisor • Maybank SG</p>
            </div>

            <button
              onClick={() => {
                sounds.playGlassClick();
                setIsProfileMenuOpen(false);
                onLogout();
              }}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs font-semibold rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors text-left cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Log Out of Session</span>
            </button>
          </div>
        )}
      </div>

    </aside>
    </>
  );
};
