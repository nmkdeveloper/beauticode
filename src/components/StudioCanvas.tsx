import React from 'react';
import { Theme, ExportPreset } from '../types';
import { CodeWindow } from './CodeWindow';
import { CodePage } from '../services/pagination';
import {
  Sparkles,
  Monitor,
  Smartphone,
  Square,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface StudioCanvasProps {
  canvasRef: React.RefObject<HTMLDivElement>;
  pages: CodePage[];
  currentPageIndex: number;
  onSelectPage: (index: number) => void;
  onPageCodeChange: (code: string) => void;
  language: string;
  theme: Theme;
  padding: number;
  showBackground: boolean;
  darkMode: boolean;
  showLineNumbers: boolean;
  title: string;
  onTitleChange: (title: string) => void;
  fontSize: number;
  fontFamily: string;
  preset: ExportPreset;
}

export const StudioCanvas: React.FC<StudioCanvasProps> = ({
  canvasRef,
  pages,
  currentPageIndex,
  onSelectPage,
  onPageCodeChange,
  language,
  theme,
  padding,
  showBackground,
  darkMode,
  showLineNumbers,
  title,
  onTitleChange,
  fontSize,
  fontFamily,
  preset,
}) => {
  const isAuto = preset.category === 'auto' || preset.width === 0;
  const currentPage = pages[currentPageIndex] || pages[0] || {
    pageNumber: 1,
    totalPages: 1,
    code: '',
    startLine: 1,
    lineCount: 1,
  };

  const getPresetBadge = () => {
    if (isAuto) {
      return (
        <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-zinc-900/90 border border-zinc-700/80 text-[11px] text-zinc-300 font-mono shadow-md backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Auto-Fit (Native)</span>
          {pages.length > 1 && (
            <>
              <span className="text-zinc-600">·</span>
              <span className="text-sky-400">{pages.length} Pages</span>
            </>
          )}
        </div>
      );
    }

    let Icon = Monitor;
    if (preset.aspectRatio === '9:16') Icon = Smartphone;
    if (preset.aspectRatio === '1:1') Icon = Square;

    return (
      <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-zinc-900/90 border border-zinc-700/80 text-[11px] text-zinc-300 font-mono shadow-md backdrop-blur-md">
        <Icon className="w-3.5 h-3.5 text-sky-400" />
        <span className="font-semibold text-white">{preset.aspectRatio}</span>
        <span className="text-zinc-600">·</span>
        <span>
          {preset.width} × {preset.height}
        </span>
        {pages.length > 1 && (
          <>
            <span className="text-zinc-600">·</span>
            <span className="text-sky-400 font-medium">
              Page {currentPage.pageNumber}/{pages.length}
            </span>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-3 sm:p-6 md:p-8 overflow-auto min-h-0">
      {/* Aspect Ratio & Page Badge */}
      <div className="mb-3 select-none flex items-center justify-center">
        {getPresetBadge()}
      </div>

      {/* Target export container */}
      {isAuto ? (
        <div
          ref={canvasRef}
          id="export-canvas"
          className="transition-all duration-300 rounded-2xl flex items-center justify-center max-w-full"
          style={{
            background: showBackground ? theme.background : 'transparent',
            padding: `${padding}px`,
          }}
        >
          <div className="w-full min-w-[320px] max-w-5xl transition-all">
            <CodeWindow
              code={currentPage.code}
              onCodeChange={onPageCodeChange}
              language={language}
              theme={theme}
              showLineNumbers={showLineNumbers}
              title={title}
              onTitleChange={onTitleChange}
              fontSize={fontSize}
              fontFamily={fontFamily}
              darkMode={darkMode}
              startLineNumber={currentPage.startLine}
              pageBadge={pages.length > 1 ? `${currentPage.pageNumber} / ${pages.length}` : undefined}
            />
          </div>
        </div>
      ) : (
        /* Fixed Aspect Ratio Live Preview (16:9, 9:16, 1:1, etc.) */
        <div
          ref={canvasRef}
          id="export-canvas"
          className="transition-all duration-300 rounded-2xl flex items-center justify-center relative shadow-2xl border border-white/10"
          style={{
            background: showBackground ? theme.background : 'transparent',
            aspectRatio: `${preset.width} / ${preset.height}`,
            width: preset.width >= preset.height ? '100%' : 'auto',
            maxWidth: preset.width >= preset.height ? '1060px' : '440px',
            height: preset.height > preset.width ? '700px' : 'auto',
            maxHeight: '75vh',
            padding: `${Math.min(padding, 36)}px`,
          }}
        >
          <div className="w-full h-full flex items-center justify-center p-1 sm:p-2">
            <div className="w-full max-w-[96%] transition-all">
              <CodeWindow
                code={currentPage.code}
                onCodeChange={onPageCodeChange}
                language={language}
                theme={theme}
                showLineNumbers={showLineNumbers}
                title={title}
                onTitleChange={onTitleChange}
                fontSize={fontSize}
                fontFamily={fontFamily}
                darkMode={darkMode}
                startLineNumber={currentPage.startLine}
                pageBadge={pages.length > 1 ? `${currentPage.pageNumber} / ${pages.length}` : undefined}
              />
            </div>
          </div>
        </div>
      )}

      {/* Multi-Page Navigation Bar (if > 1 page) */}
      {pages.length > 1 && (
        <div className="flex items-center space-x-2.5 mt-4 px-3.5 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-700/80 shadow-xl text-xs backdrop-blur-xl select-none animate-fade-in">
          <button
            type="button"
            disabled={currentPageIndex === 0}
            onClick={() => onSelectPage(currentPageIndex - 1)}
            className="p-1 rounded-md text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-400 transition-colors"
            title="Previous Page (Left Arrow)"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center space-x-1.5 font-mono">
            {pages.map((p, idx) => (
              <button
                key={p.pageNumber}
                type="button"
                onClick={() => onSelectPage(idx)}
                className={`w-6 h-6 rounded-md flex items-center justify-center text-xs transition-all ${
                  currentPageIndex === idx
                    ? 'bg-sky-500 text-zinc-950 font-bold shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
                title={`Go to Page ${p.pageNumber}`}
              >
                {p.pageNumber}
              </button>
            ))}
          </div>

          <button
            type="button"
            disabled={currentPageIndex === pages.length - 1}
            onClick={() => onSelectPage(currentPageIndex + 1)}
            className="p-1 rounded-md text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-400 transition-colors"
            title="Next Page (Right Arrow)"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
