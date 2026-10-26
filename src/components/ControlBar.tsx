import React from 'react';
import { Eye, EyeOff, Sun, Moon, Hash } from 'lucide-react';
import { ThemeSelector } from './ThemeSelector';
import { LanguageSelector } from './LanguageSelector';
import { FontSelector } from './FontSelector';

interface ControlBarProps {
  themeId: string;
  onThemeChange: (id: string) => void;
  languageId: string;
  effectiveLanguageId: string;
  onLanguageChange: (id: string) => void;
  fontFamily: string;
  onFontFamilyChange: (font: string) => void;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  padding: number;
  onPaddingChange: (padding: number) => void;
  showBackground: boolean;
  onToggleBackground: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  showLineNumbers: boolean;
  onToggleLineNumbers: () => void;
}

export const ControlBar: React.FC<ControlBarProps> = ({
  themeId,
  onThemeChange,
  languageId,
  effectiveLanguageId,
  onLanguageChange,
  fontFamily,
  onFontFamilyChange,
  fontSize,
  onFontSizeChange,
  padding,
  onPaddingChange,
  showBackground,
  onToggleBackground,
  darkMode,
  onToggleDarkMode,
  showLineNumbers,
  onToggleLineNumbers,
}) => {
  const paddingOptions = [16, 32, 64, 128];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-[95vw] sm:max-w-max">
      <div className="flex items-center space-x-2 sm:space-x-3 px-3 py-2 rounded-2xl bg-zinc-900/95 border border-zinc-800/90 shadow-2xl backdrop-blur-xl text-zinc-300 overflow-visible">
        {/* Theme Selector */}
        <ThemeSelector currentThemeId={themeId} onSelectTheme={onThemeChange} />

        {/* Divider */}
        <div className="w-[1px] h-5 bg-zinc-800 flex-shrink-0" />

        {/* Background Toggle */}
        <button
          onClick={onToggleBackground}
          className={`p-1.5 rounded-lg border transition-all text-xs flex items-center justify-center flex-shrink-0 ${
            showBackground
              ? 'bg-zinc-800 text-white border-zinc-700'
              : 'bg-zinc-950/40 text-zinc-400 border-zinc-800 hover:text-zinc-200'
          }`}
          title={showBackground ? 'Hide background' : 'Show background'}
        >
          {showBackground ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </button>

        {/* Dark / Light Mode Toggle */}
        <button
          onClick={onToggleDarkMode}
          className={`p-1.5 rounded-lg border transition-all text-xs flex items-center justify-center flex-shrink-0 ${
            darkMode
              ? 'bg-zinc-800 text-white border-zinc-700'
              : 'bg-zinc-950/40 text-zinc-400 border-zinc-800 hover:text-zinc-200'
          }`}
          title={darkMode ? 'Switch to light code syntax' : 'Switch to dark code syntax'}
        >
          {darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
        </button>

        {/* Line Numbers Toggle */}
        <button
          onClick={onToggleLineNumbers}
          className={`p-1.5 rounded-lg border transition-all text-xs flex items-center justify-center flex-shrink-0 ${
            showLineNumbers
              ? 'bg-zinc-800 text-white border-zinc-700'
              : 'bg-zinc-950/40 text-zinc-400 border-zinc-800 hover:text-zinc-200'
          }`}
          title={showLineNumbers ? 'Hide line numbers' : 'Show line numbers'}
        >
          <Hash className="w-4 h-4" />
        </button>

        {/* Divider */}
        <div className="w-[1px] h-5 bg-zinc-800 flex-shrink-0" />

        {/* Padding Presets */}
        <div className="flex items-center space-x-1 bg-zinc-950/60 p-1 rounded-xl border border-zinc-800/80 flex-shrink-0">
          <span className="text-[10px] text-zinc-500 font-medium px-1 select-none">PAD</span>
          {paddingOptions.map((p) => (
            <button
              key={p}
              onClick={() => onPaddingChange(p)}
              className={`text-xs px-2 py-0.5 rounded-lg transition-all ${
                padding === p
                  ? 'bg-zinc-700 text-white font-medium shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="w-[1px] h-5 bg-zinc-800 flex-shrink-0" />

        {/* Font & Size Selector */}
        <FontSelector
          currentFont={fontFamily}
          onSelectFont={onFontFamilyChange}
          fontSize={fontSize}
          onFontSizeChange={onFontSizeChange}
        />

        {/* Divider */}
        <div className="w-[1px] h-5 bg-zinc-800 flex-shrink-0" />

        {/* Language Selector */}
        <LanguageSelector
          currentLanguageId={languageId}
          effectiveLanguageId={effectiveLanguageId}
          onSelectLanguage={onLanguageChange}
        />
      </div>
    </div>
  );
};
