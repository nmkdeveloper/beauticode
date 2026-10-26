import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Palette } from 'lucide-react';
import { THEMES } from '../constants/themes';
import { Theme, ThemeCategory } from '../types';

interface ThemeSelectorProps {
  currentThemeId: string;
  onSelectTheme: (id: string) => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  currentThemeId,
  onSelectTheme,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<ThemeCategory | 'all'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentTheme = THEMES.find((t) => t.id === currentThemeId) || THEMES[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const filteredThemes = THEMES.filter((t) => {
    if (activeCategory === 'all') return true;
    return t.category === activeCategory;
  });

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700/60 text-xs font-medium text-zinc-200 transition-all focus:outline-none focus:ring-1 focus:ring-zinc-500"
        title="Select Theme"
      >
        <div
          className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-inner flex-shrink-0"
          style={{ background: currentTheme.background }}
        />
        <span className="truncate max-w-[90px]">{currentTheme.name}</span>
        <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
      </button>

      {isOpen && (
        <div
          onMouseDown={(e) => e.stopPropagation()}
          className="absolute bottom-full mb-3 left-0 sm:left-auto sm:-translate-x-1/4 w-80 rounded-2xl bg-zinc-900/95 border border-zinc-700/80 shadow-2xl z-50 p-3 flex flex-col max-h-[380px] backdrop-blur-xl animate-fade-in"
        >
          {/* Header & Category filter */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800">
            <div className="flex items-center space-x-1.5 text-xs font-semibold text-zinc-300">
              <Palette className="w-3.5 h-3.5 text-zinc-400" />
              <span>Studio Themes</span>
            </div>
            <div className="flex space-x-1">
              {(['all', 'gradient', 'minimal', 'tech'] as const).map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`text-[10px] px-2 py-0.5 rounded capitalize transition-colors ${
                    activeCategory === cat
                      ? 'bg-zinc-800 text-white font-medium'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Theme Grid */}
          <div className="grid grid-cols-2 gap-1.5 overflow-y-auto pr-1">
            {filteredThemes.map((theme: Theme) => {
              const isSelected = theme.id === currentThemeId;
              return (
                <button
                  type="button"
                  key={theme.id}
                  onClick={() => {
                    onSelectTheme(theme.id);
                    setIsOpen(false);
                  }}
                  className={`flex items-center space-x-2.5 p-2 rounded-xl text-left border transition-all ${
                    isSelected
                      ? 'bg-zinc-800/90 border-zinc-600 text-white shadow-sm'
                      : 'bg-zinc-950/40 border-zinc-800/80 text-zinc-300 hover:bg-zinc-800/50 hover:border-zinc-700'
                  }`}
                >
                  <div
                    className="w-5 h-5 rounded-full border border-white/20 shadow-sm flex-shrink-0"
                    style={{ background: theme.background }}
                  />
                  <span className="text-xs font-medium truncate flex-1">{theme.name}</span>
                  {isSelected && <Check className="w-3 h-3 text-emerald-400 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
