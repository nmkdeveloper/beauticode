import React from 'react';
import { Theme, ExportPreset } from '../types';
import { CodeWindow } from './CodeWindow';
import { Sparkles, Monitor, Smartphone, Square } from 'lucide-react';

interface StudioCanvasProps {
  canvasRef: React.RefObject<HTMLDivElement>;
  code: string;
  onCodeChange: (code: string) => void;
  language: string;
  theme: Theme;
  padding: number;
  showBackground: boolean;
  darkMode: boolean;
  showLineNumbers: boolean;
  title: string;
  onTitleChange: (title: string) => void;
  fontSize: number;
  preset: ExportPreset;
}

export const StudioCanvas: React.FC<StudioCanvasProps> = ({
  canvasRef,
  code,
  onCodeChange,
  language,
  theme,
  padding,
  showBackground,
  darkMode,
  showLineNumbers,
  title,
  onTitleChange,
  fontSize,
  preset,
}) => {
  const isAuto = preset.category === 'auto' || preset.width === 0;

  const getPresetBadge = () => {
    if (isAuto) {
      return (
        <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-zinc-900/80 border border-zinc-800 text-[11px] text-zinc-400 font-mono shadow-sm">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>Auto-Fit (Native)</span>
        </div>
      );
    }

    let Icon = Monitor;
    if (preset.aspectRatio === '9:16') Icon = Smartphone;
    if (preset.aspectRatio === '1:1') Icon = Square;

    return (
      <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-zinc-900/90 border border-zinc-700/80 text-[11px] text-zinc-300 font-mono shadow-md backdrop-blur-md">
        <Icon className="w-3 h-3 text-sky-400" />
        <span className="font-semibold text-white">{preset.aspectRatio}</span>
        <span className="text-zinc-500">·</span>
        <span>
          {preset.width} × {preset.height}
        </span>
        <span className="text-zinc-500">·</span>
        <span className="text-emerald-400 font-sans font-medium text-[10px]">LIVE PREVIEW</span>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-3 sm:p-6 md:p-8 overflow-auto min-h-0">
      {/* Aspect Ratio Live Badge */}
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
              code={code}
              onCodeChange={onCodeChange}
              language={language}
              theme={theme}
              showLineNumbers={showLineNumbers}
              title={title}
              onTitleChange={onTitleChange}
              fontSize={fontSize}
              darkMode={darkMode}
            />
          </div>
        </div>
      ) : (
        /* Fixed Aspect Ratio Live Preview (16:9, 9:16, 1:1, etc.) */
        <div
          ref={canvasRef}
          id="export-canvas"
          className="transition-all duration-300 rounded-2xl flex items-center justify-center relative overflow-hidden shadow-2xl border border-white/10"
          style={{
            background: showBackground ? theme.background : 'transparent',
            aspectRatio: `${preset.width} / ${preset.height}`,
            width: preset.width >= preset.height ? '100%' : 'auto',
            maxWidth: preset.width >= preset.height ? '1060px' : '440px',
            height: preset.height > preset.width ? '700px' : 'auto',
            maxHeight: '75vh',
            padding: `${Math.min(padding, 40)}px`,
          }}
        >
          <div className="w-full h-full flex items-center justify-center overflow-auto p-2">
            <div className="w-full max-w-[95%] transition-all">
              <CodeWindow
                code={code}
                onCodeChange={onCodeChange}
                language={language}
                theme={theme}
                showLineNumbers={showLineNumbers}
                title={title}
                onTitleChange={onTitleChange}
                fontSize={fontSize}
                darkMode={darkMode}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
