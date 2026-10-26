import { useState, useRef, useEffect, useCallback } from 'react';
import { useEditorState } from './hooks/useEditorState';
import { getThemeById } from './constants/themes';
import { getPresetById } from './constants/presets';
import { Header } from './components/Header';
import { StudioCanvas } from './components/StudioCanvas';
import { ControlBar } from './components/ControlBar';
import { SizeSelector } from './components/SizeSelector';
import { ExportDropdown } from './components/ExportDropdown';
import { BatchExportModal } from './components/BatchExportModal';
import { ShortcutsModal } from './components/ShortcutsModal';
import { copyImageToClipboard } from './services/imageExporter';
import { renderPresetImage } from './services/batchExporter';
import { saveAs } from 'file-saver';
import { Check } from 'lucide-react';

export function App() {
  const editor = useEditorState();
  const canvasRef = useRef<HTMLDivElement>(null);
  const currentTheme = getThemeById(editor.theme);
  const activePreset = getPresetById(editor.preset);

  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  }, []);

  const handleQuickExport = useCallback(async () => {
    if (!canvasRef.current) return;
    try {
      const cardNode =
        (canvasRef.current.querySelector('.code-card') as HTMLElement) ||
        canvasRef.current;
      const blob = await renderPresetImage(
        cardNode,
        canvasRef.current,
        activePreset,
        currentTheme,
        editor.showBackground
      );
      const cleanTitle = (editor.title || 'beauticode')
        .replace(/[<>:"/\\|?*]/g, '_')
        .replace(/\.[^/.]+$/, '')
        .trim() || 'beauticode';
      const ext = activePreset.width ? `${activePreset.width}x${activePreset.height}` : '2x';
      saveAs(blob, `${cleanTitle}-${activePreset.id || ext}.png`);
      showToast(`Exported ${activePreset.name}!`);
    } catch (err) {
      console.error(err);
      showToast('Export failed');
    }
  }, [editor.title, activePreset, currentTheme, editor.showBackground, showToast]);

  const handleCopyImage = useCallback(async () => {
    if (!canvasRef.current) return;
    try {
      const success = await copyImageToClipboard(canvasRef.current, 2);
      if (success) {
        showToast('Image copied to clipboard!');
      } else {
        showToast('Clipboard access denied');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to copy image');
    }
  }, [showToast]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
      const isModifier = isMac ? e.metaKey : e.ctrlKey;

      if (e.key === 'Escape') {
        setIsBatchModalOpen(false);
        setIsShortcutsOpen(false);
        return;
      }

      const activeEl = document.activeElement;
      const isInputFocused =
        activeEl?.tagName === 'INPUT' || activeEl?.tagName === 'TEXTAREA';

      if (e.key === '?' && !isInputFocused) {
        setIsShortcutsOpen((prev) => !prev);
        return;
      }

      if (isModifier && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (e.shiftKey) {
          setIsBatchModalOpen(true);
        } else {
          handleQuickExport();
        }
      } else if (isModifier && e.key.toLowerCase() === 'c') {
        // If outside editor and not selecting text, trigger copy image
        const selection = window.getSelection()?.toString();

        if (!selection && !isInputFocused) {
          e.preventDefault();
          handleCopyImage();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleQuickExport, handleCopyImage]);

  return (
    <div className="min-h-screen flex flex-col bg-[#09090b] text-zinc-100 selection:bg-zinc-800 selection:text-white">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-16 right-6 z-50 flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs shadow-2xl animate-fade-in">
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <Header
        onReset={editor.resetSnippet}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        renderSizeSelector={() => (
          <SizeSelector
            currentPresetId={editor.preset}
            onSelectPreset={editor.setPreset}
            onOpenBatchModal={() => setIsBatchModalOpen(true)}
          />
        )}
        renderExportButton={() => (
          <ExportDropdown
            canvasRef={canvasRef}
            title={editor.title}
            preset={activePreset}
            theme={currentTheme}
            showBackground={editor.showBackground}
            onOpenBatchModal={() => setIsBatchModalOpen(true)}
          />
        )}
      />

      {/* Main Studio Viewport */}
      <main className="flex-1 flex flex-col relative pb-28">
        <StudioCanvas
          canvasRef={canvasRef}
          code={editor.code}
          onCodeChange={editor.setCode}
          language={editor.effectiveLanguage}
          theme={currentTheme}
          padding={editor.padding}
          showBackground={editor.showBackground}
          darkMode={editor.darkMode}
          showLineNumbers={editor.showLineNumbers}
          title={editor.title}
          onTitleChange={editor.setTitle}
          fontSize={editor.fontSize}
          preset={activePreset}
        />

        {/* Floating Bottom Control Bar */}
        <ControlBar
          themeId={editor.theme}
          onThemeChange={editor.setTheme}
          languageId={editor.language}
          effectiveLanguageId={editor.effectiveLanguage}
          onLanguageChange={editor.setLanguage}
          padding={editor.padding}
          onPaddingChange={editor.setPadding}
          showBackground={editor.showBackground}
          onToggleBackground={() => editor.setShowBackground(!editor.showBackground)}
          darkMode={editor.darkMode}
          onToggleDarkMode={() => editor.setDarkMode(!editor.darkMode)}
          showLineNumbers={editor.showLineNumbers}
          onToggleLineNumbers={() => editor.setShowLineNumbers(!editor.showLineNumbers)}
        />
      </main>

      {/* Batch Export Modal */}
      <BatchExportModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        canvasRef={canvasRef}
        theme={currentTheme}
        showBackground={editor.showBackground}
        title={editor.title}
      />

      {/* Keyboard Shortcuts Modal */}
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
}

export default App;
