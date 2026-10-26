import React from 'react';
import { Code2, RotateCcw, Keyboard } from 'lucide-react';

interface HeaderProps {
  onReset: () => void;
  onOpenShortcuts?: () => void;
  renderExportButton?: () => React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  onReset,
  onOpenShortcuts,
  renderExportButton,
}) => {
  return (
    <header className="h-14 border-b border-zinc-800/80 bg-zinc-950/70 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between select-none z-30 sticky top-0">
      {/* Brand Identity */}
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-sky-400 shadow-sm">
          <Code2 className="w-4 h-4" />
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="font-semibold text-sm tracking-tight text-zinc-100">
            Beauti<span className="text-sky-400">Code</span>
          </span>
          <span className="hidden sm:inline-block text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
            Studio
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-1.5 sm:space-x-2">
        {onOpenShortcuts && (
          <button
            onClick={onOpenShortcuts}
            className="flex items-center space-x-1.5 px-2 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 border border-transparent hover:border-zinc-700/60 transition-all"
            title="Keyboard Shortcuts"
          >
            <Keyboard className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Shortcuts</span>
          </button>
        )}

        <button
          onClick={onReset}
          className="flex items-center space-x-1.5 px-2 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 border border-transparent hover:border-zinc-700/60 transition-all"
          title="Reset snippet to default"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </button>

        {renderExportButton && renderExportButton()}
      </div>
    </header>
  );
};
