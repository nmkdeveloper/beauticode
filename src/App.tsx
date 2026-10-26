import { useRef } from 'react';
import { useEditorState } from './hooks/useEditorState';
import { getThemeById } from './constants/themes';
import { Header } from './components/Header';
import { StudioCanvas } from './components/StudioCanvas';
import { ControlBar } from './components/ControlBar';

export function App() {
  const editor = useEditorState();
  const canvasRef = useRef<HTMLDivElement>(null);
  const currentTheme = getThemeById(editor.theme);

  return (
    <div className="min-h-screen flex flex-col bg-[#09090b] text-zinc-100 selection:bg-zinc-800 selection:text-white">
      {/* Top Header */}
      <Header onReset={editor.resetSnippet} />

      {/* Main Studio Viewport */}
      <main className="flex-1 flex flex-col relative pb-24">
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
    </div>
  );
}

export default App;
