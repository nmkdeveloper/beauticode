import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Sparkles, Check } from 'lucide-react';
import { LANGUAGES, AUTO_DETECT_ID } from '../constants/languages';

interface LanguageSelectorProps {
  currentLanguageId: string;
  effectiveLanguageId: string;
  onSelectLanguage: (id: string) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  currentLanguageId,
  effectiveLanguageId,
  onSelectLanguage,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const isAuto = currentLanguageId === AUTO_DETECT_ID;
  const currentLangObj = LANGUAGES.find((l) => l.id === (isAuto ? effectiveLanguageId : currentLanguageId));

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const filteredLanguages = LANGUAGES.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700/60 text-xs font-medium text-zinc-200 transition-all focus:outline-none focus:ring-1 focus:ring-zinc-500"
        title="Select Language"
      >
        {isAuto && <Sparkles className="w-3.5 h-3.5 text-amber-400" />}
        <span className="truncate max-w-[100px]">
          {isAuto ? `Auto (${currentLangObj?.name || 'TS'})` : currentLangObj?.name || 'TypeScript'}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
      </button>

      {isOpen && (
        <div className="absolute bottom-full mb-2 left-0 w-56 rounded-xl bg-zinc-900 border border-zinc-800 shadow-2xl z-50 p-1.5 flex flex-col max-h-72">
          {/* Search bar */}
          <div className="flex items-center space-x-2 px-2.5 py-1.5 mb-1 bg-zinc-950/60 rounded-lg border border-zinc-800/80 text-xs text-zinc-300">
            <Search className="w-3.5 h-3.5 text-zinc-500" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search language..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none w-full"
            />
          </div>

          <div className="overflow-y-auto flex-1 space-y-0.5">
            {/* Auto Detect Option */}
            {!search && (
              <button
                onClick={() => {
                  onSelectLanguage(AUTO_DETECT_ID);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                  isAuto ? 'bg-zinc-800 text-white font-medium' : 'text-zinc-300 hover:bg-zinc-800/50'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Auto-detect</span>
                </div>
                {isAuto && <Check className="w-3.5 h-3.5 text-emerald-400" />}
              </button>
            )}

            {filteredLanguages.map((lang) => {
              const isSelected = !isAuto && currentLanguageId === lang.id;
              return (
                <button
                  key={lang.id}
                  onClick={() => {
                    onSelectLanguage(lang.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                    isSelected ? 'bg-zinc-800 text-white font-medium' : 'text-zinc-300 hover:bg-zinc-800/50'
                  }`}
                >
                  <span>{lang.name}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </button>
              );
            })}

            {filteredLanguages.length === 0 && (
              <div className="px-3 py-3 text-center text-xs text-zinc-500">
                No languages found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
