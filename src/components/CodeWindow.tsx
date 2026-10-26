import React, { useEffect, useState, useRef } from 'react';
import { Theme } from '../types';
import { MacControls } from './MacControls';
import { highlightCode } from '../services/highlighter';

interface CodeWindowProps {
  code: string;
  onCodeChange: (code: string) => void;
  language: string;
  theme: Theme;
  showLineNumbers: boolean;
  title: string;
  onTitleChange: (title: string) => void;
  fontSize?: number;
  darkMode?: boolean;
  isReadOnly?: boolean;
}

export const CodeWindow: React.FC<CodeWindowProps> = ({
  code,
  onCodeChange,
  language,
  theme,
  showLineNumbers,
  title,
  onTitleChange,
  fontSize = 14,
  darkMode = true,
  isReadOnly = false,
}) => {
  const [highlightedHtml, setHighlightedHtml] = useState<string>('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lines = code.split('\n');

  // Highlight code on change
  useEffect(() => {
    let isCancelled = false;
    const shikiTheme = darkMode ? theme.shikiDarkTheme : theme.shikiLightTheme;

    highlightCode(code, language, shikiTheme).then((html) => {
      if (!isCancelled) {
        setHighlightedHtml(html);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [code, language, theme, darkMode]);

  // Handle Tab key in textarea
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newCode = code.substring(0, start) + '  ' + code.substring(end);
      onCodeChange(newCode);

      // Restore cursor position after state update
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  return (
    <div
      className="code-card rounded-xl overflow-hidden transition-all duration-300 relative select-text"
      style={{
        backgroundColor: theme.cardBg,
        border: `1px solid ${theme.cardBorder}`,
        boxShadow: theme.cardShadow,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      {/* macOS Window Title Bar */}
      <MacControls
        title={title}
        onTitleChange={onTitleChange}
        textColor={theme.textColor}
        isEditable={!isReadOnly}
      />

      {/* Code Container with Gutter & Overlay */}
      <div
        className="flex p-4 sm:p-5 relative code-font overflow-x-auto"
        style={{
          fontSize: `${fontSize}px`,
          lineHeight: '1.65',
        }}
      >
        {/* Line Numbers Gutter */}
        {showLineNumbers && (
          <div
            className="flex flex-col pr-4 select-none text-right font-mono opacity-30 text-xs sm:text-sm border-r border-white/10 mr-4"
            style={{
              lineHeight: '1.65',
              minWidth: '2.5rem',
            }}
          >
            {lines.map((_, i) => (
              <span key={i} className="leading-[1.65]">
                {i + 1}
              </span>
            ))}
          </div>
        )}

        {/* Code Content Area */}
        <div className="relative flex-1 min-w-0">
          {/* Highlighted Render Layer */}
          <div
            className="shiki-container select-none pointer-events-none whitespace-pre"
            style={{
              lineHeight: '1.65',
            }}
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          />

          {/* Interactive Textarea Layer */}
          {!isReadOnly && (
            <textarea
              ref={textareaRef}
              value={code}
              onChange={(e) => onCodeChange(e.target.value)}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              className="absolute inset-0 w-full h-full resize-none bg-transparent text-transparent caret-white focus:outline-none whitespace-pre overflow-hidden"
              style={{
                fontFamily: 'inherit',
                fontSize: 'inherit',
                lineHeight: '1.65',
                padding: 0,
                margin: 0,
                border: 'none',
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};
