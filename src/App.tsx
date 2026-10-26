import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useEditorState } from './hooks/useEditorState';
import { getThemeById } from './constants/themes';
import { getPresetById } from './constants/presets';
import {
  splitCodeIntoPages,
  getRecommendedLinesPerPage,
  updateFullCodeWithPage,
} from './services/pagination';
import { Header } from './components/Header';
import { StudioCanvas } from './components/StudioCanvas';
import { ControlBar } from './components/ControlBar';
import { SizeSelector } from './components/SizeSelector';
import { ExportDropdown } from './components/ExportDropdown';
import { PagesExportModal } from './components/PagesExportModal';
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

  const [isPagesModalOpen, setIsPagesModalOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  // Dynamic pagination based on active ratio
  const linesPerPage = useMemo(
    () => getRecommendedLinesPerPage(activePreset.aspectRatio),
    [activePreset.aspectRatio]
  );

  const pages = useMemo(
    () => splitCodeIntoPages(editor.code, linesPerPage),
    [editor.code, linesPerPage]
  );

  const safePageIndex = Math.min(currentPageIndex, Math.max(0, pages.length - 1));

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  }, []);

  const handlePageCodeChange = useCallback(
    (newPageCode: string) => {
      const updated = updateFullCodeWithPage(
        editor.code,
        safePageIndex,
        pages,
        newPageCode
      );
      editor.setCode(updated);
    },
    [editor.code, safePageIndex, pages, editor.setCode]
  );

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
      const pageSuffix = pages.length > 1 ? `-page-${safePageIndex + 1}` : '';
      saveAs(blob, `${cleanTitle}${pageSuffix}.png`);
      showToast(`Page ${safePageIndex + 1} exported!`);
    } catch (err) {
      console.error(err);
      showToast('Export failed');
    }
  }, [editor.title, activePreset, currentTheme, editor.showBackground, pages.length, safePageIndex, showToast]);

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
        setIsPagesModalOpen(false);
        setIsShortcutsOpen(false);
        return;
      }

      const activeEl = document.activeElement;
      const isInputFocused =
        activeEl?.tagName === 'INPUT' || activeEl?.tagName === 'TEXTAREA';

      if (!isInputFocused) {
        if (e.key === 'ArrowLeft') {
          setCurrentPageIndex((prev) => Math.max(0, prev - 1));
          return;
        } else if (e.key === 'ArrowRight') {
          setCurrentPageIndex((prev) => Math.min(pages.length - 1, prev + 1));
          return;
        }
      }

      if (e.key === '?' && !isInputFocused) {
        setIsShortcutsOpen((prev) => !prev);
        return;
      }

      if (isModifier && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        editor.setFontSize((prev) => Math.min(28, prev + 1));
      } else if (isModifier && (e.key === '-' || e.key === '_')) {
        e.preventDefault();
        editor.setFontSize((prev) => Math.max(10, prev - 1));
      }

      if (isModifier && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (e.shiftKey) {
          setIsPagesModalOpen(true);
        } else {
          handleQuickExport();
        }
      } else if (isModifier && e.key.toLowerCase() === 'c') {
        const selection = window.getSelection()?.toString();
        if (!selection && !isInputFocused) {
          e.preventDefault();
          handleCopyImage();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleQuickExport, handleCopyImage, pages.length]);

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
        onReset={() => {
          editor.resetSnippet();
          setCurrentPageIndex(0);
        }}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        renderSizeSelector={() => (
          <SizeSelector
            currentPresetId={editor.preset}
            onSelectPreset={(p) => {
              editor.setPreset(p);
              setCurrentPageIndex(0);
            }}
            onOpenBatchModal={() => setIsPagesModalOpen(true)}
          />
        )}
        renderExportButton={() => (
          <ExportDropdown
            canvasRef={canvasRef}
            title={editor.title}
            preset={activePreset}
            theme={currentTheme}
            showBackground={editor.showBackground}
            pages={pages}
            currentPageIndex={safePageIndex}
            onSelectPage={setCurrentPageIndex}
            onOpenPagesModal={() => setIsPagesModalOpen(true)}
          />
        )}
      />

      {/* Main Studio Viewport */}
      <main className="flex-1 flex flex-col relative pb-28">
        <StudioCanvas
          canvasRef={canvasRef}
          pages={pages}
          currentPageIndex={safePageIndex}
          onSelectPage={setCurrentPageIndex}
          onPageCodeChange={handlePageCodeChange}
          language={editor.effectiveLanguage}
          theme={currentTheme}
          padding={editor.padding}
          showBackground={editor.showBackground}
          darkMode={editor.darkMode}
          showLineNumbers={editor.showLineNumbers}
          title={editor.title}
          onTitleChange={editor.setTitle}
          fontSize={editor.fontSize}
          fontFamily={editor.fontFamily}
          preset={activePreset}
        />

        {/* Floating Bottom Control Bar */}
        <ControlBar
          themeId={editor.theme}
          onThemeChange={editor.setTheme}
          languageId={editor.language}
          effectiveLanguageId={editor.effectiveLanguage}
          onLanguageChange={editor.setLanguage}
          fontFamily={editor.fontFamily}
          onFontFamilyChange={editor.setFontFamily}
          fontSize={editor.fontSize}
          onFontSizeChange={editor.setFontSize}
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

      {/* Multi-Pages Export Modal */}
      <PagesExportModal
        isOpen={isPagesModalOpen}
        onClose={() => setIsPagesModalOpen(false)}
        pages={pages}
        canvasRef={canvasRef}
        preset={activePreset}
        theme={currentTheme}
        showBackground={editor.showBackground}
        title={editor.title}
        currentPageIndex={safePageIndex}
        onSelectPage={setCurrentPageIndex}
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
