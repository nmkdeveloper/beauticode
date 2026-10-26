import React, { useState, useRef, useEffect } from 'react';
import {
  Download,
  Copy,
  Link,
  ChevronDown,
  Layers,
  FileCode,
  Check,
  Loader2,
} from 'lucide-react';
import {
  exportSingleImage,
  copyImageToClipboard,
  copyTextToClipboard,
} from '../services/imageExporter';
import { renderPresetImage } from '../services/batchExporter';
import { saveAs } from 'file-saver';
import { ExportPreset, Theme } from '../types';

interface ExportDropdownProps {
  canvasRef: React.RefObject<HTMLDivElement>;
  title: string;
  preset: ExportPreset;
  theme: Theme;
  showBackground: boolean;
  onOpenBatchModal: () => void;
}

export const ExportDropdown: React.FC<ExportDropdownProps> = ({
  canvasRef,
  title,
  preset,
  theme,
  showBackground,
  onOpenBatchModal,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const cleanTitle =
    (title || 'beauticode')
      .replace(/[<>:"/\\|?*]/g, '_')
      .replace(/\.[^/.]+$/, '')
      .trim() || 'beauticode';

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

  const showToast = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 2500);
  };

  const getCodeCardNode = (): HTMLElement | null => {
    if (!canvasRef.current) return null;
    return (
      (canvasRef.current.querySelector('.code-card') as HTMLElement) ||
      canvasRef.current
    );
  };

  // Main Export: uses the active preset
  const handleExportCurrent = async () => {
    const cardNode = getCodeCardNode();
    if (!cardNode || isExporting) return;

    try {
      setIsExporting(true);
      const blob = await renderPresetImage(
        cardNode,
        canvasRef.current,
        preset,
        theme,
        showBackground
      );
      const ext = preset.width ? `${preset.width}x${preset.height}` : '2x';
      saveAs(blob, `${cleanTitle}-${preset.id || ext}.png`);
      showToast(`Exported ${preset.name}!`);
      setIsOpen(false);
    } catch (err) {
      console.error(err);
      showToast('Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPngScaled = async (scale: number = 2) => {
    if (!canvasRef.current || isExporting) return;
    try {
      setIsExporting(true);
      await exportSingleImage(canvasRef.current, {
        format: 'png',
        pixelRatio: scale,
        filename: `${cleanTitle}-${scale}x.png`,
      });
      showToast(`PNG (${scale}x) downloaded!`);
      setIsOpen(false);
    } catch (err) {
      console.error(err);
      showToast('Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportSvg = async () => {
    if (!canvasRef.current || isExporting) return;
    try {
      setIsExporting(true);
      await exportSingleImage(canvasRef.current, {
        format: 'svg',
        filename: `${cleanTitle}.svg`,
      });
      showToast('SVG downloaded!');
      setIsOpen(false);
    } catch (err) {
      console.error(err);
      showToast('Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyImage = async () => {
    if (!canvasRef.current || isExporting) return;
    try {
      setIsExporting(true);
      const success = await copyImageToClipboard(canvasRef.current, 2);
      if (success) {
        showToast('Image copied to clipboard!');
      } else {
        showToast('Clipboard access denied');
      }
      setIsOpen(false);
    } catch (err) {
      console.error(err);
      showToast('Failed to copy image');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyUrl = async () => {
    const success = await copyTextToClipboard(window.location.href);
    if (success) {
      showToast('Shareable link copied!');
    } else {
      showToast('Failed to copy link');
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Toast Notification */}
      {statusMessage && (
        <div className="fixed top-16 right-6 z-50 flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs shadow-2xl animate-fade-in">
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Main Export Button */}
      <div className="flex items-center rounded-lg bg-sky-500 hover:bg-sky-400 text-zinc-950 text-xs font-semibold shadow-md transition-all">
        <button
          type="button"
          onClick={handleExportCurrent}
          disabled={isExporting}
          className="flex items-center space-x-1.5 px-3 py-1.5 focus:outline-none"
          title={`Export image (${preset.name})`}
        >
          {isExporting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Download className="w-3.5 h-3.5 stroke-[2.5]" />
          )}
          <span>Export</span>
        </button>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="px-1.5 py-1.5 border-l border-sky-600/30 hover:bg-sky-400/80 rounded-r-lg focus:outline-none"
          title="Export options"
        >
          <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          onMouseDown={(e) => e.stopPropagation()}
          className="absolute right-0 top-full mt-2 w-72 rounded-xl bg-zinc-900 border border-zinc-800 shadow-2xl z-50 p-1.5 flex flex-col backdrop-blur-xl animate-fade-in"
        >
          <button
            type="button"
            onClick={handleExportCurrent}
            className="flex items-center justify-between px-3 py-2 rounded-lg text-xs text-white font-medium bg-zinc-800/80 hover:bg-zinc-800 transition-colors"
          >
            <div className="flex items-center space-x-2.5">
              <Download className="w-4 h-4 text-sky-400" />
              <span>Save {preset.name}</span>
            </div>
            <span className="text-[10px] text-sky-400 font-mono font-medium">PNG</span>
          </button>

          <button
            type="button"
            onClick={() => handleExportPngScaled(2)}
            className="flex items-center justify-between px-3 py-2 rounded-lg text-xs text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <div className="flex items-center space-x-2.5">
              <Download className="w-4 h-4 text-zinc-400" />
              <span>Save PNG (2x High-Res)</span>
            </div>
            <span className="text-[10px] text-zinc-500 font-mono">2x</span>
          </button>

          <button
            type="button"
            onClick={() => handleExportPngScaled(4)}
            className="flex items-center justify-between px-3 py-2 rounded-lg text-xs text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <div className="flex items-center space-x-2.5">
              <Download className="w-4 h-4 text-sky-400" />
              <span>Save PNG (4K Ultra-Res)</span>
            </div>
            <span className="text-[10px] text-sky-400 font-mono font-medium">4K</span>
          </button>

          <button
            type="button"
            onClick={handleExportSvg}
            className="flex items-center justify-between px-3 py-2 rounded-lg text-xs text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <div className="flex items-center space-x-2.5">
              <FileCode className="w-4 h-4 text-zinc-400" />
              <span>Save Vector (SVG)</span>
            </div>
            <span className="text-[10px] text-zinc-500 font-mono">SVG</span>
          </button>

          <div className="my-1 border-t border-zinc-800" />

          <button
            type="button"
            onClick={handleCopyImage}
            className="flex items-center justify-between px-3 py-2 rounded-lg text-xs text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <div className="flex items-center space-x-2.5">
              <Copy className="w-4 h-4 text-zinc-400" />
              <span>Copy Image to Clipboard</span>
            </div>
          </button>

          <button
            type="button"
            onClick={handleCopyUrl}
            className="flex items-center justify-between px-3 py-2 rounded-lg text-xs text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <div className="flex items-center space-x-2.5">
              <Link className="w-4 h-4 text-zinc-400" />
              <span>Copy Shareable URL</span>
            </div>
          </button>

          <div className="my-1 border-t border-zinc-800" />

          {/* Batch Exporter Trigger */}
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onOpenBatchModal();
            }}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium text-emerald-400 hover:bg-emerald-950/40 border border-emerald-900/40 transition-colors group"
          >
            <div className="flex items-center space-x-2.5">
              <Layers className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span>Batch Export Multi-Size ZIP</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-900/60 text-emerald-300 font-mono">
              .ZIP
            </span>
          </button>
        </div>
      )}
    </div>
  );
};
