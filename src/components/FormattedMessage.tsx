import React from 'react';

interface FormattedMessageProps {
  text: string;
  isStreaming?: boolean;
}

/**
 * Lightweight, high-performance inline Markdown parser for Maybank AI messages.
 * Formats headers, bullet lists, numbered points, bold highlights, and code blocks
 * without bulky third-party dependencies.
 */
export const FormattedMessage: React.FC<FormattedMessageProps> = ({ text, isStreaming = false }) => {
  if (!text) {
    return isStreaming ? (
      <span className="inline-block w-2 h-4 bg-amber-400 dark:bg-amber-300 rounded-xs animate-pulse align-middle shadow-[0_0_10px_rgba(245,158,11,0.6)]" />
    ) : null;
  }

  // Parse inline styles: **bold**, `code`
  const renderInline = (content: string): React.ReactNode[] => {
    // Regex matches **bold** or `code`
    const regex = /(\*\*[^*]+\*\*|`[^`]+`)/g;
    const parts = content.split(regex);

    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={idx} className="font-bold text-slate-900 dark:text-white break-words [overflow-wrap:anywhere] [word-break:break-word]">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code 
            key={idx} 
            className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-white/10 text-amber-600 dark:text-amber-300 font-mono text-xs break-words [overflow-wrap:anywhere] [word-break:break-word]"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    const isLastLine = idx === lines.length - 1;

    // Header 3 or 2
    if (trimmed.startsWith('### ') || trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
      const headerText = trimmed.replace(/^#+\s*/, '');
      elements.push(
        <h4 key={idx} className="text-[14px] sm:text-[15px] font-bold text-slate-900 dark:text-white mt-2.5 mb-1 tracking-tight break-words [overflow-wrap:anywhere] [word-break:break-word]">
          {renderInline(headerText)}
          {isLastLine && isStreaming && (
            <span className="inline-block w-2 h-4 ml-1 bg-amber-400 dark:bg-amber-300 rounded-xs animate-pulse align-middle shadow-[0_0_10px_rgba(245,158,11,0.6)]" />
          )}
        </h4>
      );
      return;
    }

    // Bullet points: * or - or •
    if (/^(\*|-|•)\s+/.test(trimmed)) {
      const bulletText = trimmed.replace(/^(\*|-|•)\s+/, '');
      elements.push(
        <div key={idx} className="flex items-start gap-2 sm:gap-2.5 my-1 pl-0.5 sm:pl-1 min-w-0 max-w-full">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400 mt-2 shrink-0" />
          <div className="flex-1 text-[13.5px] sm:text-[14px] leading-relaxed text-slate-800 dark:text-slate-200 min-w-0 max-w-full break-words [overflow-wrap:anywhere] [word-break:break-word]">
            {renderInline(bulletText)}
            {isLastLine && isStreaming && (
              <span className="inline-block w-2 h-4 ml-1 bg-amber-400 dark:bg-amber-300 rounded-xs animate-pulse align-middle shadow-[0_0_10px_rgba(245,158,11,0.6)]" />
            )}
          </div>
        </div>
      );
      return;
    }

    // Numbered list: 1. or 2.
    if (/^\d+\.\s+/.test(trimmed)) {
      const match = trimmed.match(/^(\d+)\.\s+(.+)$/);
      const num = match ? match[1] : '1';
      const numText = match ? match[2] : trimmed;
      elements.push(
        <div key={idx} className="flex items-start gap-2 sm:gap-2.5 my-1.5 pl-0.5 sm:pl-1 min-w-0 max-w-full">
          <span className="w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 font-mono text-[10px] sm:text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
            {num}
          </span>
          <div className="flex-1 text-[13.5px] sm:text-[14px] leading-relaxed text-slate-800 dark:text-slate-200 min-w-0 max-w-full break-words [overflow-wrap:anywhere] [word-break:break-word]">
            {renderInline(numText)}
            {isLastLine && isStreaming && (
              <span className="inline-block w-2 h-4 ml-1 bg-amber-400 dark:bg-amber-300 rounded-xs animate-pulse align-middle shadow-[0_0_10px_rgba(245,158,11,0.6)]" />
            )}
          </div>
        </div>
      );
      return;
    }

    // Empty line / paragraph break
    if (!trimmed) {
      elements.push(<div key={idx} className="h-1.5 sm:h-2" />);
      return;
    }

    // Regular paragraph
    elements.push(
      <p key={idx} className="text-[13.5px] sm:text-[14px] leading-relaxed text-slate-800 dark:text-slate-200 my-0.5 min-w-0 max-w-full break-words [overflow-wrap:anywhere] [word-break:break-word]">
        {renderInline(line)}
        {isLastLine && isStreaming && (
          <span className="inline-block w-2 h-4 ml-1 bg-amber-400 dark:bg-amber-300 rounded-xs animate-pulse align-middle shadow-[0_0_10px_rgba(245,158,11,0.6)]" />
        )}
      </p>
    );
  });

  return <div className="space-y-0.5 min-w-0 max-w-full break-words [overflow-wrap:anywhere] [word-break:break-word]">{elements}</div>;
};
