import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronDown,
  Check,
  Maximize2,
  Smartphone,
  Monitor,
  Square,
  Sparkles,
  Layers,
} from 'lucide-react';
import { DEFAULT_PRESETS } from '../constants/presets';
import { ExportPreset } from '../types';

interface SizeSelectorProps {
  currentPresetId: string;
  onSelectPreset: (id: string) => void;
  onOpenBatchModal?: () => void;
}

export const SizeSelector: React.FC<SizeSelectorProps> = ({
  currentPresetId,
  onSelectPreset,
  onOpenBatchModal,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activePreset =
    DEFAULT_PRESETS.find((p) => p.id === currentPresetId) || DEFAULT_PRESETS[0];

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

  const getPresetIcon = (preset: ExportPreset) => {
    if (preset.category === 'auto') return <Sparkles className="w-3.5 h-3.5 text-amber-400" />;
    if (preset.aspectRatio === '9:16') return <Smartphone className="w-3.5 h-3.5 text-sky-400" />;
    if (preset.aspectRatio === '1:1') return <Square className="w-3.5 h-3.5 text-purple-400" />;
    return <Monitor className="w-3.5 h-3.5 text-emerald-400" />;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700/60 text-xs font-medium text-zinc-200 transition-all focus:outline-none focus:ring-1 focus:ring-zinc-500 shadow-sm"
        title="Choose canvas size & aspect ratio"
      >
        {getPresetIcon(activePreset)}
        <span className="font-medium truncate max-w-[120px]">{activePreset.name}</span>
        <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          onMouseDown={(e) => e.stopPropagation()}
          className="absolute right-0 top-full mt-2 w-72 rounded-xl bg-zinc-900 border border-zinc-800 shadow-2xl z-50 p-1.5 flex flex-col backdrop-blur-xl animate-fade-in"
        >
          <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 flex items-center justify-between border-b border-zinc-800/80 mb-1">
            <span>Canvas Size & Ratio</span>
            <Maximize2 className="w-3 h-3 text-zinc-500" />
          </div>

          <div className="space-y-0.5">
            {DEFAULT_PRESETS.map((preset) => {
              const isSelected = preset.id === currentPresetId;
              return (
                <button
                  key={preset.id}
                  onClick={() => {
                    onSelectPreset(preset.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors text-left ${
                    isSelected
                      ? 'bg-zinc-800 text-white font-medium border border-zinc-700'
                      : 'text-zinc-300 hover:bg-zinc-800/60'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    {getPresetIcon(preset)}
                    <div className="flex flex-col min-w-0">
                      <span className="truncate">{preset.name}</span>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {preset.width ? `${preset.width} × ${preset.height}` : 'Tightly fitted'}
                      </span>
                    </div>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />}
                </button>
              );
            })}
          </div>

          {onOpenBatchModal && (
            <>
              <div className="my-1 border-t border-zinc-800/80" />
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenBatchModal();
                }}
                className="flex items-center justify-between px-3 py-2 rounded-lg text-xs text-emerald-400 hover:bg-emerald-950/40 font-medium transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <Layers className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Batch Export All to ZIP</span>
                </div>
                <span className="text-[10px] font-mono bg-emerald-900/60 px-1.5 py-0.5 rounded text-emerald-300">
                  .ZIP
                </span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};
