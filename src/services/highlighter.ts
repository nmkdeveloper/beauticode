import { createHighlighter, type Highlighter, type BundledLanguage, type BundledTheme } from 'shiki';

let highlighterInstance: Highlighter | null = null;
let highlighterPromise: Promise<Highlighter> | null = null;

const loadedLanguages = new Set<string>();
const loadedThemes = new Set<string>();

const INITIAL_LANGUAGES: BundledLanguage[] = ['typescript', 'javascript', 'python', 'json', 'bash'];
const INITIAL_THEMES: BundledTheme[] = ['tokyo-night', 'github-dark', 'github-light', 'dracula', 'vitesse-dark'];

INITIAL_LANGUAGES.forEach((l) => loadedLanguages.add(l));
INITIAL_THEMES.forEach((t) => loadedThemes.add(t));

export async function getHighlighterInstance(): Promise<Highlighter> {
  if (highlighterInstance) return highlighterInstance;
  if (highlighterPromise) return highlighterPromise;

  highlighterPromise = createHighlighter({
    themes: INITIAL_THEMES,
    langs: INITIAL_LANGUAGES,
  }).then((highlighter) => {
    highlighterInstance = highlighter;
    return highlighter;
  });

  return highlighterPromise;
}

export async function highlightCode(code: string, lang: string, theme: string): Promise<string> {
  try {
    const highlighter = await getHighlighterInstance();

    // Ensure theme is loaded
    if (!loadedThemes.has(theme)) {
      try {
        await highlighter.loadTheme(theme as BundledTheme);
        loadedThemes.add(theme);
      } catch {
        theme = 'github-dark';
      }
    }

    // Ensure language is loaded
    const targetLang = lang === 'auto' ? 'typescript' : lang;
    if (!loadedLanguages.has(targetLang)) {
      try {
        await highlighter.loadLanguage(targetLang as BundledLanguage);
        loadedLanguages.add(targetLang);
      } catch {
        // Fallback if not recognized
        return fallbackEscapeHtml(code);
      }
    }

    return highlighter.codeToHtml(code || ' ', {
      lang: targetLang,
      theme,
    });
  } catch (error) {
    console.error('Highlighter error:', error);
    return fallbackEscapeHtml(code);
  }
}

function fallbackEscapeHtml(str: string): string {
  const escaped = str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
  return `<pre class="shiki"><code>${escaped}</code></pre>`;
}
