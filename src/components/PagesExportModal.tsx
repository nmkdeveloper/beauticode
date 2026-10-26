import React, { useState } from 'react';
import {
  X,
  Archive,
  Download,
  Loader2,
  Check,
} from 'lucide-react';
import { CodePage } from '../services/pagination';
import { ExportPreset, Theme } from '../types';
import { renderPresetImage } from '../services/batchExporter';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

interface PagesExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  pages: CodePage[];
  canvasRef: React.RefObject<HTMLDivElement>;
  preset: ExportPreset;
  theme: Theme;
  showBackground: boolean;
  title: string;
  currentPageIndex: number;
  onSelectPage: (index: number) => void;
}

export const PagesExportModal: React.FC<PagesExportModalProps> = ({
  isOpen,
  onClose,
  pages,
  canvasRef,
  preset,
  theme,
  showBackground,
  title,
  currentPageIndex,
  onSelectPage,
}) => {
  const [selectedPageIndices, setSelectedPageIndices] = useState<number[]>(
    pages.map((_, i) => i)
  );
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const [singleDownloadingIndex, setSingleDownloadingIndex] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const cleanTitle = (title || 'beauticode')
    .replace(/[<>:"/\\|?*]/g, '_')
    .replace(/\.[^/.]+$/, '')
    .trim() || 'beauticode';

  const handleTogglePage = (index: number) => {
    setSelectedPageIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleSelectAll = () => {
    if (selectedPageIndices.length === pages.length) {
      setSelectedPageIndices([]);
    } else {
      setSelectedPageIndices(pages.map((_, i) => i));
    }
  };

  const getCodeCardNode = (): HTMLElement | null => {
    if (!canvasRef.current) return null;
    return (
      (canvasRef.current.querySelector('.code-card') as HTMLElement) ||
      canvasRef.current
    );
  };

  // Download a single page
  const handleDownloadSinglePage = async (index: number) => {
    if (singleDownloadingIndex !== null || isExporting) return;
    try {
      setSingleDownloadingIndex(index);
      setErrorMessage(null);
      // Temporarily switch preview to target page
      onSelectPage(index);
      await new Promise((r) => setTimeout(r, 120));

      const cardNode = getCodeCardNode();
      if (!cardNode) throw new Error('Code card not found');

      const blob = await renderPresetImage(
        cardNode,
        canvasRef.current,
        preset,
        theme,
        showBackground
      );

      const filename = `${cleanTitle}-page-${index + 1}.png`;
      saveAs(blob, filename);
    } catch (err) {
      console.error(err);
      setErrorMessage(`Failed to export page ${index + 1}`);
    } finally {
      setSingleDownloadingIndex(null);
    }
  };

  // Download selected pages as ZIP
  const handleDownloadZip = async (indicesToExport: number[]) => {
    if (indicesToExport.length === 0 || isExporting) return;

    try {
      setIsExporting(true);
      setErrorMessage(null);
      setProgress({ current: 0, total: indicesToExport.length });

      const zip = new JSZip();
      const folderName = `${cleanTitle}-${preset.aspectRatio.replace(':', 'x')}`;
      const folder = zip.folder(folderName) || zip;

      const previousIndex = currentPageIndex;

      for (let i = 0; i < indicesToExport.length; i++) {
        const pageIdx = indicesToExport[i];
        setProgress({ current: i + 1, total: indicesToExport.length });

        // Switch to page and wait for DOM update & fonts
        onSelectPage(pageIdx);
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

        const filename = `${cleanTitle}-page-${pageIdx + 1}.png`;
        folder.file(filename, blob);
      }

      // Restore previous page index
      onSelectPage(previousIndex);

      const zipBlob = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 },
      });

      const zipFilename = `${cleanTitle}-${indicesToExport.length}-pages.zip`;
      saveAs(zipBlob, zipFilename);

      setTimeout(() => {
        setIsExporting(false);
        setProgress(null);
        onClose();
      }, 500);
    } catch (err) {
      console.error(err);
      setErrorMessage('Failed to package pages into ZIP');
      setIsExporting(false);
      setProgress(null);
    }
  };

  const progressPercent = progress ? Math.round((progress.current / progress.total) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in select-none">
      <div
        className="w-full max-w-lg rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-950/60 border border-sky-800/60 flex items-center justify-center text-sky-400">
              <Archive className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Download Pages</h2>
              <p className="text-xs text-zinc-400">
                {preset.name} ({preset.width ? `${preset.width}×${preset.height}` : 'Auto-Fit'})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-red-950/50 border border-red-800/60 text-red-200 text-xs">
            {errorMessage}
          </div>
        )}

        {/* Page List Controls */}
        <div className="px-6 pt-3 pb-1 flex items-center justify-between text-xs text-zinc-400">
          <span>Select pages to download ({selectedPageIndices.length}/{pages.length}):</span>
          <button
            type="button"
            onClick={handleSelectAll}
            className="text-sky-400 hover:text-sky-300 font-medium"
          >
            {selectedPageIndices.length === pages.length ? 'Deselect All' : 'Select All'}
          </button>
        </div>

        {/* Pages List */}
        <div className="flex-1 overflow-y-auto px-6 py-2 space-y-2">
          {pages.map((page, idx) => {
            const isSelected = selectedPageIndices.includes(idx);
            const isCurrent = currentPageIndex === idx;

            return (
              <div
                key={page.pageNumber}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-zinc-800/80 border-zinc-700 text-white'
                    : 'bg-zinc-950/40 border-zinc-800/80 text-zinc-400 hover:bg-zinc-800/40'
                }`}
              >
                <div
                  className="flex items-center space-x-3 cursor-pointer flex-1 min-w-0"
                  onClick={() => handleTogglePage(idx)}
                >
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center border transition-colors flex-shrink-0 ${
                      isSelected
                        ? 'bg-sky-500 border-sky-500 text-black'
                        : 'border-zinc-700 bg-zinc-900'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-semibold text-white">
                        Page {page.pageNumber}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-sky-950 border border-sky-800/60 text-sky-300">
                          Viewing
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-zinc-500 font-mono">
                      Lines {page.startLine} – {page.startLine + page.lineCount - 1} ({page.lineCount} lines)
                    </span>
                  </div>
                </div>

                {/* Individual Download Button */}
                <button
                  type="button"
                  onClick={() => handleDownloadSinglePage(idx)}
                  disabled={singleDownloadingIndex !== null || isExporting}
                  className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700/60 transition-colors ml-3 flex-shrink-0 disabled:opacity-40"
                  title={`Download Page ${page.pageNumber} PNG`}
                >
                  {singleDownloadingIndex === idx ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  <span>PNG</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Progress Bar */}
        {isExporting && progress && (
          <div className="px-6 py-2">
            <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
              <span>Packaging page {progress.current} of {progress.total}...</span>
              <span className="font-mono">{progressPercent}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-200"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800 bg-zinc-950/40">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center space-x-2">
            {/* Download Selected Pages as ZIP */}
            <button
              type="button"
              onClick={() => handleDownloadZip(selectedPageIndices)}
              disabled={isExporting || selectedPageIndices.length === 0}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-zinc-950 text-xs font-semibold shadow-md transition-all disabled:opacity-40"
            >
              {isExporting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Archive className="w-3.5 h-3.5" />
              )}
              <span>
                Download {selectedPageIndices.length === pages.length ? 'All Pages' : 'Selected'} (ZIP)
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
