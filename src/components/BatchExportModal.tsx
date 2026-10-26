import React, { useState } from 'react';
import { X, Layers, Archive, Plus, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { DEFAULT_PRESETS } from '../constants/presets';
import { ExportPreset, Theme } from '../types';
import { PresetItem } from './PresetItem';
import { exportBatchZip, renderPresetImage } from '../services/batchExporter';
import { saveAs } from 'file-saver';

interface BatchExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  canvasRef: React.RefObject<HTMLDivElement>;
  theme: Theme;
  showBackground: boolean;
  title: string;
}

export const BatchExportModal: React.FC<BatchExportModalProps> = ({
  isOpen,
  onClose,
  canvasRef,
  theme,
  showBackground,
  title,
}) => {
  const [presets, setPresets] = useState<ExportPreset[]>(DEFAULT_PRESETS);
  const [selectedIds, setSelectedIds] = useState<string[]>(
    DEFAULT_PRESETS.map((p) => p.id)
  );

  // Custom preset form
  const [customName, setCustomName] = useState('');
  const [customWidth, setCustomWidth] = useState('1200');
  const [customHeight, setCustomHeight] = useState('630');
  const [showAddCustom, setShowAddCustom] = useState(false);

  // Export progress and errors
  const [isExporting, setIsExporting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ current: number; total: number; name: string } | null>(
    null
  );
  const [singleDownloadingId, setSingleDownloadingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === presets.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(presets.map((p) => p.id));
    }
  };

  const handleAddCustomPreset = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseInt(customWidth, 10);
    const h = parseInt(customHeight, 10);
    if (!w || !h || w <= 0 || h <= 0) return;

    const newPreset: ExportPreset = {
      id: `custom-${Date.now()}`,
      name: customName.trim() || `Custom ${w}×${h}`,
      width: w,
      height: h,
      aspectRatio: `${w}×${h}`,
      category: 'custom',
      description: `${w} × ${h} custom dimensions`,
      enabled: true,
    };

    setPresets((prev) => [...prev, newPreset]);
    setSelectedIds((prev) => [...prev, newPreset.id]);
    setCustomName('');
    setShowAddCustom(false);
  };

  const getCodeCardNode = (): HTMLElement | null => {
    if (!canvasRef.current) return null;
    return (
      (canvasRef.current.querySelector('.code-card') as HTMLElement) ||
      canvasRef.current
    );
  };

  const handleDownloadSingle = async (preset: ExportPreset) => {
    const cardNode = getCodeCardNode();
    if (!cardNode || singleDownloadingId) return;

    try {
      setErrorMessage(null);
      setSingleDownloadingId(preset.id);
      const blob = await renderPresetImage(
        cardNode,
        canvasRef.current,
        preset,
        theme,
        showBackground
      );
      const cleanTitle = (title || 'beauticode')
        .replace(/[<>:"/\\|?*]/g, '_')
        .replace(/\.[^/.]+$/, '')
        .trim() || 'beauticode';
      const filename = `${cleanTitle}-${preset.id}-${preset.width || 'auto'}x${
        preset.height || 'auto'
      }.png`;
      saveAs(blob, filename);
    } catch (err) {
      console.error(err);
      setErrorMessage(`Failed to export ${preset.name}`);
    } finally {
      setSingleDownloadingId(null);
    }
  };

  const handleBatchExport = async () => {
    const cardNode = getCodeCardNode();
    if (!cardNode || isExporting) return;

    const selectedPresets = presets.filter((p) => selectedIds.includes(p.id));
    if (selectedPresets.length === 0) return;

    try {
      setErrorMessage(null);
      setIsExporting(true);
      await exportBatchZip(
        cardNode,
        canvasRef.current,
        selectedPresets,
        theme,
        showBackground,
        title || 'beauticode',
        (current, total, name) => {
          setProgress({ current, total, name });
        }
      );
      // Wait momentarily on success
      setTimeout(() => {
        setIsExporting(false);
        setProgress(null);
        onClose();
      }, 1000);
    } catch (err) {
      console.error(err);
      setErrorMessage('Batch export failed. Please verify browser memory or select fewer presets.');
      setIsExporting(false);
      setProgress(null);
    }
  };

  const selectedCount = selectedIds.length;
  const progressPercent = progress ? Math.round((progress.current / progress.total) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-100">
                Batch Multi-Preset Export (.ZIP)
              </h2>
              <p className="text-[11px] text-zinc-400">
                Auto-containment keeps your code perfectly framed for all aspect ratios.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isExporting}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Error Message */}
          {errorMessage && (
            <div className="flex items-center space-x-2 p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Action Row */}
          <div className="flex items-center justify-between text-xs">
            <button
              onClick={handleSelectAll}
              className="text-sky-400 hover:text-sky-300 font-medium"
            >
              {selectedCount === presets.length ? 'Deselect All' : 'Select All'}
            </button>
            <span className="text-zinc-500 font-mono">
              {selectedCount} of {presets.length} selected
            </span>
          </div>

          {/* Presets List */}
          <div className="space-y-2">
            {presets.map((preset) => (
              <PresetItem
                key={preset.id}
                preset={preset}
                isSelected={selectedIds.includes(preset.id)}
                onToggleSelect={handleToggleSelect}
                onDownloadSingle={handleDownloadSingle}
                isDownloading={singleDownloadingId === preset.id}
              />
            ))}
          </div>

          {/* Custom Size Form */}
          {!showAddCustom ? (
            <button
              onClick={() => setShowAddCustom(true)}
              className="w-full flex items-center justify-center space-x-1.5 py-2.5 rounded-xl border border-dashed border-zinc-800 hover:border-zinc-700 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom Dimension (Twitter Header, OG Image, etc.)</span>
            </button>
          ) : (
            <form
              onSubmit={handleAddCustomPreset}
              className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-300">Custom Preset</span>
                <button
                  type="button"
                  onClick={() => setShowAddCustom(false)}
                  className="text-zinc-500 hover:text-zinc-300"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Label (e.g. OG Image)"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700/80 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-sky-500"
                />
                <input
                  type="number"
                  placeholder="Width (px)"
                  value={customWidth}
                  onChange={(e) => setCustomWidth(e.target.value)}
                  required
                  className="px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700/80 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-sky-500"
                />
                <input
                  type="number"
                  placeholder="Height (px)"
                  value={customHeight}
                  onChange={(e) => setCustomHeight(e.target.value)}
                  required
                  className="px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700/80 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddCustom(false)}
                  className="px-3 py-1 text-xs text-zinc-400 hover:text-zinc-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 bg-sky-500 hover:bg-sky-400 text-zinc-950 font-medium text-xs rounded-lg transition-colors"
                >
                  Add Preset
                </button>
              </div>
            </form>
          )}

          {/* Progress Indicator */}
          {isExporting && progress && (
            <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2 text-zinc-300">
                  <Loader2 className="w-3.5 h-3.5 text-sky-400 animate-spin" />
                  <span>Rendering: {progress.name}</span>
                </div>
                <span className="font-mono text-sky-400">{progressPercent}%</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-sky-500 transition-all duration-200"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-zinc-800/80 bg-zinc-950/50 flex items-center justify-between">
          <div className="flex items-center space-x-1.5 text-xs text-zinc-500">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500/80" />
            <span>High-DPI safe containment</span>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={onClose}
              disabled={isExporting}
              className="px-3 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleBatchExport}
              disabled={isExporting || selectedCount === 0}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-semibold shadow-md transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              {isExporting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Archive className="w-4 h-4 stroke-[2.5]" />
              )}
              <span>
                {isExporting
                  ? 'Generating ZIP...'
                  : `Download All (${selectedCount}) as .ZIP`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
