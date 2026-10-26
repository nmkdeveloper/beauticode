import React from 'react';
import { Download, Check } from 'lucide-react';
import { ExportPreset } from '../types';

interface PresetItemProps {
  preset: ExportPreset;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onDownloadSingle?: (preset: ExportPreset) => void;
  isDownloading?: boolean;
}

export const PresetItem: React.FC<PresetItemProps> = ({
  preset,
  isSelected,
  onToggleSelect,
  onDownloadSingle,
  isDownloading = false,
}) => {
  const getBadgeColor = (category: ExportPreset['category']) => {
    switch (category) {
      case '4k':
        return 'bg-purple-950/80 text-purple-300 border-purple-800/80';
      case 'fhd':
        return 'bg-blue-950/80 text-blue-300 border-blue-800/80';
      case 'square':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80';
      case 'custom':
        return 'bg-amber-950/80 text-amber-300 border-amber-800/80';
      default:
        return 'bg-zinc-800 text-zinc-300 border-zinc-700';
    }
  };

  return (
    <div
      onClick={() => onToggleSelect(preset.id)}
      className={`group flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
        isSelected
          ? 'bg-zinc-800/70 border-sky-500/50 shadow-sm'
          : 'bg-zinc-950/40 border-zinc-800/80 hover:bg-zinc-800/30 hover:border-zinc-700/60'
      }`}
    >
      {/* Checkbox and info */}
      <div className="flex items-center space-x-3 min-w-0">
        <div
          className={`w-4 h-4 rounded border flex items-center justify-center transition-colors flex-shrink-0 ${
            isSelected
              ? 'bg-sky-500 border-sky-400 text-zinc-950'
              : 'border-zinc-700 bg-zinc-900 group-hover:border-zinc-500'
          }`}
        >
          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
        </div>

        <div className="min-w-0">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-zinc-200 truncate">
              {preset.name}
            </span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${getBadgeColor(
                preset.category
              )}`}
            >
              {preset.aspectRatio}
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 truncate mt-0.5">
            {preset.description}
          </p>
        </div>
      </div>

      {/* Single preset download action */}
      {onDownloadSingle && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDownloadSingle(preset);
          }}
          disabled={isDownloading}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-700/60 transition-colors ml-2 flex-shrink-0"
          title={`Download single ${preset.name}`}
        >
          <Download className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
