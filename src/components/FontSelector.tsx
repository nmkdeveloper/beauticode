import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Type, Search, Check, Plus, Minus, Sparkles, ExternalLink } from 'lucide-react';
import { POPULAR_GOOGLE_FONTS, FontOption } from '../constants/fonts';
import { loadGoogleFont } from '../services/fontLoader';

interface FontSelectorProps {
  currentFont: string;
  onSelectFont: (font: string) => void;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
}

export const FontSelector: React.FC<FontSelectorProps> = ({
  currentFont,
  onSelectFont,
  fontSize,
  onFontSizeChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [customFontInput, setCustomFontInput] = useState('');
  const [recentlyLoadedFonts, setRecentlyLoadedFonts] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Combined font options: popular + custom loaded
  const allFonts: FontOption[] = useMemo(() => {
    const customOptions: FontOption[] = recentlyLoadedFonts
      .filter((name) => !POPULAR_GOOGLE_FONTS.some((p) => p.name.toLowerCase() === name.toLowerCase()))
      .map((name) => ({
        id: name.toLowerCase().replace(/\s+/g, '-'),
        name,
        googleFontFamily: name,
        category: 'custom',
        description: 'Loaded custom Google Font',
        ligatures: false,
      }));
    return [...POPULAR_GOOGLE_FONTS, ...customOptions];
  }, [recentlyLoadedFonts]);

  // Filter fonts
  const filteredFonts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return allFonts;
    return allFonts.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q) ||
        f.description.toLowerCase().includes(q)
    );
  }, [allFonts, searchQuery]);

  const handleSelectFont = async (fontName: string) => {
    await loadGoogleFont(fontName);
    onSelectFont(fontName);
    if (!recentlyLoadedFonts.includes(fontName)) {
      setRecentlyLoadedFonts((prev) => [fontName, ...prev]);
    }
  };

  const handleAddCustomGoogleFont = async () => {
    const name = (searchQuery.trim() || customFontInput.trim());
    if (!name) return;
    await loadGoogleFont(name);
    if (!recentlyLoadedFonts.includes(name)) {
      setRecentlyLoadedFonts((prev) => [name, ...prev]);
    }
    onSelectFont(name);
    setSearchQuery('');
    setCustomFontInput('');
  };

  const sizePresets = [12, 13, 14, 15, 16, 18, 20];

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-950/60 hover:bg-zinc-800/90 border border-zinc-800/80 hover:border-zinc-700/80 transition-all text-xs font-medium text-zinc-300 hover:text-white"
        title="Customize Font & Size"
      >
        <Type className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
        <span className="truncate max-w-[90px] sm:max-w-[110px]">{currentFont}</span>
        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-800/90 text-zinc-400">
          {fontSize}px
        </span>
      </button>

      {/* Popover Dropdown (Opens upward) */}
      {isOpen && (
        <div
          onMouseDown={(e) => e.stopPropagation()}
          className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0 w-80 sm:w-96 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl z-50 p-3.5 flex flex-col backdrop-blur-xl animate-fade-in text-zinc-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800/80">
            <div className="flex items-center space-x-2">
              <Type className="w-4 h-4 text-sky-400" />
              <span className="text-xs font-semibold text-white">Typography & Size</span>
            </div>
            <a
              href="https://fonts.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-zinc-400 hover:text-sky-400 flex items-center space-x-1 transition-colors"
            >
              <span>Google Fonts</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Font Size Control Section */}
          <div className="mb-3.5 bg-zinc-950/50 p-2.5 rounded-xl border border-zinc-800/60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-medium text-zinc-400">Font Size</span>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => onFontSizeChange(Math.max(10, fontSize - 1))}
                  className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                  title="Decrease Size"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="text-xs font-mono font-bold text-sky-400 w-8 text-center">
                  {fontSize}px
                </span>
                <button
                  type="button"
                  onClick={() => onFontSizeChange(Math.min(28, fontSize + 1))}
                  className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                  title="Increase Size"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Quick Size Chips */}
            <div className="flex items-center space-x-1.5 justify-between">
              {sizePresets.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onFontSizeChange(s)}
                  className={`text-[10px] font-mono px-2 py-0.5 rounded transition-all ${
                    fontSize === s
                      ? 'bg-sky-500 text-zinc-950 font-bold shadow-sm'
                      : 'bg-zinc-800/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Search Google Fonts */}
          <div className="relative mb-2.5">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search or enter any Google Font..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  handleAddCustomGoogleFont();
                }
              }}
              className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-sky-500 transition-colors"
            />
          </div>

          {/* Curated Font Options List */}
          <div className="max-h-56 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
            {filteredFonts.map((font) => {
              const isSelected = currentFont.toLowerCase() === font.name.toLowerCase();
              return (
                <button
                  key={font.name}
                  type="button"
                  onClick={() => handleSelectFont(font.name)}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all ${
                    isSelected
                      ? 'bg-sky-950/60 border border-sky-600/50 text-white shadow-sm'
                      : 'hover:bg-zinc-800/70 border border-transparent text-zinc-300'
                  }`}
                >
                  <div className="min-w-0 flex-1 mr-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-semibold">{font.name}</span>
                      {font.ligatures && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500/15 text-amber-300 font-mono">
                          ligatures
                        </span>
                      )}
                      {font.category === 'retro' && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-purple-500/15 text-purple-300 font-mono">
                          retro
                        </span>
                      )}
                    </div>
                    {/* Live Font Sample */}
                    <div
                      className="text-[11px] opacity-70 truncate mt-0.5"
                      style={{
                        fontFamily: `"${font.name}", monospace`,
                      }}
                    >
                      const code = (a, b) =&gt; a + b;
                    </div>
                  </div>

                  {isSelected && <Check className="w-4 h-4 text-sky-400 flex-shrink-0" />}
                </button>
              );
            })}

            {/* If search query has no match, offer to load it from Google Fonts */}
            {searchQuery.trim() && (
              <button
                type="button"
                onClick={handleAddCustomGoogleFont}
                className="w-full flex items-center justify-center space-x-2 p-2.5 rounded-xl border border-dashed border-sky-600/60 bg-sky-950/30 text-sky-400 hover:bg-sky-900/40 text-xs font-medium transition-colors mt-2"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Load &ldquo;{searchQuery.trim()}&rdquo; from Google Fonts</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
