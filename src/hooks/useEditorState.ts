import { useState, useEffect, useCallback, useMemo } from 'react';
import { EditorSettings } from '../types';
import { DEFAULT_THEME_ID } from '../constants/themes';
import { AUTO_DETECT_ID, detectLanguage } from '../constants/languages';

const DEFAULT_SNIPPET = `// Welcome to BeautiCode ✨
// Create gorgeous, studio-quality code images in seconds.

interface BeautifierOptions {
  theme: string;
  padding: number;
  highDpi: boolean;
  watermark: boolean;
}

export async function captureSnippet(code: string, opts: BeautifierOptions) {
  const result = await renderToImage(code, {
    scale: opts.highDpi ? 4 : 2,
    background: opts.theme,
    padding: opts.padding,
  });

  return {
    success: true,
    dataUrl: result.toDataURL('image/png'),
    resolution: '4K Ultra-HD',
  };
}`;

function encodeState(state: Partial<EditorSettings>): string {
  try {
    const json = JSON.stringify({
      c: state.code,
      l: state.language,
      t: state.theme,
      p: state.padding,
      bg: state.showBackground,
      d: state.darkMode,
      ln: state.showLineNumbers,
      tt: state.title,
    });
    // Safe Unicode to base64
    return btoa(
      encodeURIComponent(json).replace(/%([0-9A-F]{2})/g, (_, p1) =>
        String.fromCharCode(parseInt(p1, 16))
      )
    );
  } catch {
    return '';
  }
}

function decodeState(hash: string): Partial<EditorSettings> | null {
  try {
    const raw = hash.replace(/^#/, '');
    if (!raw) return null;
    const jsonStr = decodeURIComponent(
      Array.prototype.map
        .call(atob(raw), (c: string) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const data = JSON.parse(jsonStr);
    return {
      code: data.c,
      language: data.l,
      theme: data.t,
      padding: data.p,
      showBackground: data.bg,
      darkMode: data.d,
      showLineNumbers: data.ln,
      title: data.tt,
    };
  } catch {
    return null;
  }
}

export function useEditorState() {
  const [code, setCode] = useState<string>(() => {
    const saved = decodeState(window.location.hash);
    return saved?.code ?? DEFAULT_SNIPPET;
  });

  const [language, setLanguage] = useState<string>(() => {
    const saved = decodeState(window.location.hash);
    return saved?.language ?? AUTO_DETECT_ID;
  });

  const [theme, setTheme] = useState<string>(() => {
    const saved = decodeState(window.location.hash);
    return saved?.theme ?? DEFAULT_THEME_ID;
  });

  const [padding, setPadding] = useState<number>(() => {
    const saved = decodeState(window.location.hash);
    return saved?.padding ?? 64;
  });

  const [showBackground, setShowBackground] = useState<boolean>(() => {
    const saved = decodeState(window.location.hash);
    return saved?.showBackground ?? true;
  });

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = decodeState(window.location.hash);
    return saved?.darkMode ?? true;
  });

  const [showLineNumbers, setShowLineNumbers] = useState<boolean>(() => {
    const saved = decodeState(window.location.hash);
    return saved?.showLineNumbers ?? true;
  });

  const [title, setTitle] = useState<string>(() => {
    const saved = decodeState(window.location.hash);
    return saved?.title ?? 'BeautiCode.ts';
  });

  const [fontSize, setFontSize] = useState<number>(14);

  // Compute effective language if auto-detect is enabled
  const effectiveLanguage = useMemo(() => {
    if (language === AUTO_DETECT_ID) {
      return detectLanguage(code);
    }
    return language;
  }, [language, code]);

  // Sync state to URL hash on change
  useEffect(() => {
    const timeout = setTimeout(() => {
      const encoded = encodeState({
        code,
        language,
        theme,
        padding,
        showBackground,
        darkMode,
        showLineNumbers,
        title,
      });
      if (encoded) {
        window.history.replaceState(null, '', `#${encoded}`);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [code, language, theme, padding, showBackground, darkMode, showLineNumbers, title]);

  const resetSnippet = useCallback(() => {
    setCode(DEFAULT_SNIPPET);
    setLanguage(AUTO_DETECT_ID);
    setTheme(DEFAULT_THEME_ID);
    setPadding(64);
    setShowBackground(true);
    setDarkMode(true);
    setShowLineNumbers(true);
    setTitle('BeautiCode.ts');
  }, []);

  return {
    code,
    setCode,
    language,
    setLanguage,
    effectiveLanguage,
    theme,
    setTheme,
    padding,
    setPadding,
    showBackground,
    setShowBackground,
    darkMode,
    setDarkMode,
    showLineNumbers,
    setShowLineNumbers,
    title,
    setTitle,
    fontSize,
    setFontSize,
    resetSnippet,
  };
}
