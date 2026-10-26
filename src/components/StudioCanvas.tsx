import React from 'react';
import { Theme } from '../types';
import { CodeWindow } from './CodeWindow';

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
}) => {
  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-8 md:p-12 overflow-auto">
      {/* Target export container */}
      <div
        ref={canvasRef}
        id="export-canvas"
        className="transition-all duration-300 rounded-2xl flex items-center justify-center max-w-full"
        style={{
          background: showBackground ? theme.background : 'transparent',
          padding: `${padding}px`,
        }}
      >
        <div className="w-full min-w-[320px] max-w-4xl">
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
  );
};
