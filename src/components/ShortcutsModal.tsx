import React from 'react';
import { X, Command, Keyboard } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
  const modKey = isMac ? '⌘' : 'Ctrl';

  const shortcuts = [
    { key: `${modKey} + S`, desc: 'Quick save High-Res PNG (2x)' },
    { key: `${modKey} + Shift + S`, desc: 'Open Batch Export Multi-Size ZIP modal' },
    { key: `${modKey} + C`, desc: 'Copy formatted code image to clipboard (when outside editor)' },
    { key: 'Tab', desc: 'Insert 2-space indentation in code editor' },
    { key: 'Esc', desc: 'Close modals & menus' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300">
              <Keyboard className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-semibold text-zinc-100 uppercase tracking-wider">
              Keyboard Shortcuts
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-2.5">
          {shortcuts.map((s, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-zinc-800/40"
            >
              <span className="text-xs text-zinc-300">{s.desc}</span>
              <kbd className="flex items-center space-x-1 px-2 py-1 rounded bg-zinc-950 border border-zinc-800 text-[11px] font-mono text-zinc-400 shadow-sm">
                {s.key.includes('⌘') && <Command className="w-3 h-3 mr-0.5 inline" />}
                <span>{s.key.replace('⌘ + ', '')}</span>
              </kbd>
            </div>
          ))}
        </div>

        <div className="px-5 py-3 border-t border-zinc-800/80 bg-zinc-950/40 text-center">
          <button
            onClick={onClose}
            className="text-xs text-zinc-400 hover:text-zinc-200 font-medium"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
