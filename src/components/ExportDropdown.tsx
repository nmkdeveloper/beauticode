import React, { useState, useRef, useEffect } from 'react';
import {
  Download,
  Copy,
  Link,
  ChevronDown,
  Archive,
  Layers,
  Check,
  Loader2,
  FileDown,
} from 'lucide-react';
import { copyImageToClipboard, copyTextToClipboard } from '../services/imageExporter';
import { renderPresetImage } from '../services/batchExporter';
import { CodePage } from '../services/pagination';
import { ExportPreset, Theme } from '../types';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

interface ExportDropdownProps {
  canvasRef: React.RefObject<HTMLDivElement>;
  title: string;
  preset: ExportPreset;
  theme: Theme;
  showBackground: boolean;
  pages: CodePage[];
  currentPageIndex: number;
  onSelectPage: (index: number) => void;
  onOpenPagesModal: () => void;
}

export const ExportDropdown: React.FC<ExportDropdownProps> = ({
  canvasRef,
  title,
  preset,
  theme,
  showBackground,
  pages,
  currentPageIndex,
  onSelectPage,
  onOpenPagesModal,
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

  // 1. Download Current Page as PNG
  const handleDownloadCurrentPage = async () => {
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
      const pageSuffix = pages.length > 1 ? `-page-${currentPageIndex + 1}` : '';
      saveAs(blob, `${cleanTitle}${pageSuffix}.png`);
      showToast(`Page ${currentPageIndex + 1} downloaded!`);
      setIsOpen(false);
    } catch (err) {
      console.error(err);
      showToast('Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  // 2. Download All Pages as ZIP
  const handleDownloadAllPagesZip = async () => {
    if (isExporting || pages.length === 0) return;

    // If only 1 page, simply download the single PNG
    if (pages.length === 1) {
      return handleDownloadCurrentPage();
    }

    try {
      setIsExporting(true);
      showToast(`Rendering ${pages.length} pages to ZIP...`);

      const zip = new JSZip();
      const folderName = `${cleanTitle}-${preset.aspectRatio.replace(':', 'x')}`;
      const folder = zip.folder(folderName) || zip;
      const initialIndex = currentPageIndex;

      for (let i = 0; i < pages.length; i++) {
        onSelectPage(i);
        await new Promise((r) => setTimeout(r, 120));

        const cardNode = getCodeCardNode();
        if (!cardNode) continue;

        const blob = await renderPresetImage(
          cardNode,
          canvasRef.current,
          preset,
          theme,
          showBackground
        );

        folder.file(`${cleanTitle}-page-${i + 1}.png`, blob);
      }

      onSelectPage(initialIndex);

      const zipBlob = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 },
      });

      saveAs(zipBlob, `${cleanTitle}-${pages.length}-pages.zip`);
      showToast(`All ${pages.length} pages downloaded (.ZIP)!`);
      setIsOpen(false);
    } catch (err) {
      console.error(err);
      showToast('Batch ZIP export failed');
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
        showToast('Current page copied to clipboard!');
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

  const hasMultiplePages = pages.length > 1;

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
          onClick={hasMultiplePages ? handleDownloadAllPagesZip : handleDownloadCurrentPage}
          disabled={isExporting}
          className="flex items-center space-x-1.5 px-3 py-1.5 focus:outline-none"
          title={hasMultiplePages ? 'Download All Pages (.ZIP)' : 'Download PNG'}
        >
          {isExporting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : hasMultiplePages ? (
            <Archive className="w-3.5 h-3.5 stroke-[2.5]" />
          ) : (
            <Download className="w-3.5 h-3.5 stroke-[2.5]" />
          )}
          <span>
            {hasMultiplePages ? `Download All (${pages.length} Pages .ZIP)` : 'Download PNG'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="px-1.5 py-1.5 border-l border-sky-600/30 hover:bg-sky-400/80 rounded-r-lg focus:outline-none"
          title="More download options"
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
          {/* Download All Pages (ZIP) */}
          <button
            type="button"
            onClick={handleDownloadAllPagesZip}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold text-emerald-400 hover:bg-emerald-950/40 border border-emerald-900/40 transition-colors"
          >
            <div className="flex items-center space-x-2.5">
              <Archive className="w-4 h-4 text-emerald-400" />
              <span>Download All Pages (.ZIP)</span>
            </div>
            <span className="text-[10px] font-mono bg-emerald-900/60 px-1.5 py-0.5 rounded text-emerald-300">
              {pages.length}P .ZIP
            </span>
          </button>

          {/* Download Current Page */}
          <button
            type="button"
            onClick={handleDownloadCurrentPage}
            className="flex items-center justify-between px-3 py-2 rounded-lg text-xs text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <div className="flex items-center space-x-2.5">
              <FileDown className="w-4 h-4 text-sky-400" />
              <span>Download Current Page ({currentPageIndex + 1}/{pages.length})</span>
            </div>
            <span className="text-[10px] text-zinc-500 font-mono">PNG</span>
          </button>

          {/* Download Selected Pages... */}
          {hasMultiplePages && (
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onOpenPagesModal();
              }}
              className="flex items-center justify-between px-3 py-2 rounded-lg text-xs text-zinc-200 hover:bg-zinc-800 transition-colors"
            >
              <div className="flex items-center space-x-2.5">
                <Layers className="w-4 h-4 text-zinc-400" />
                <span>Download Pages (Selected Pages)...</span>
              </div>
            </button>
          )}

          <div className="my-1 border-t border-zinc-800" />

          {/* Copy Image */}
          <button
            type="button"
            onClick={handleCopyImage}
            className="flex items-center justify-between px-3 py-2 rounded-lg text-xs text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <div className="flex items-center space-x-2.5">
              <Copy className="w-4 h-4 text-zinc-400" />
              <span>Copy Current Page to Clipboard</span>
            </div>
          </button>

          {/* Copy URL */}
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
        </div>
      )}
    </div>
  );
};
