export interface FontOption {
  id: string;
  name: string;
  googleFontFamily: string;
  category: 'monospace' | 'clean' | 'retro' | 'display' | 'custom';
  description: string;
  ligatures?: boolean;
}

export const POPULAR_GOOGLE_FONTS: FontOption[] = [
  {
    id: 'jetbrains-mono',
    name: 'JetBrains Mono',
    googleFontFamily: 'JetBrains Mono',
    category: 'monospace',
    description: 'Modern, high-legibility developer font with ligatures',
    ligatures: true,
  },
  {
    id: 'fira-code',
    name: 'Fira Code',
    googleFontFamily: 'Fira Code',
    category: 'monospace',
    description: 'Classic iconic code font with comprehensive programming ligatures',
    ligatures: true,
  },
  {
    id: 'source-code-pro',
    name: 'Source Code Pro',
    googleFontFamily: 'Source Code Pro',
    category: 'monospace',
    description: "Adobe's clean, balanced monospace for coding environments",
    ligatures: false,
  },
  {
    id: 'roboto-mono',
    name: 'Roboto Mono',
    googleFontFamily: 'Roboto Mono',
    category: 'monospace',
    description: 'Crisp geometric monospace by Google',
    ligatures: false,
  },
  {
    id: 'space-mono',
    name: 'Space Mono',
    googleFontFamily: 'Space Mono',
    category: 'monospace',
    description: 'Brutalist, eccentric editorial monospace by Colophon',
    ligatures: false,
  },
  {
    id: 'ibm-plex-mono',
    name: 'IBM Plex Mono',
    googleFontFamily: 'IBM Plex Mono',
    category: 'monospace',
    description: 'Industrial engineered neo-grotesque monospace',
    ligatures: false,
  },
  {
    id: 'inconsolata',
    name: 'Inconsolata',
    googleFontFamily: 'Inconsolata',
    category: 'monospace',
    description: 'Humanist monospace designed for both print and screen',
    ligatures: false,
  },
  {
    id: 'ubuntu-mono',
    name: 'Ubuntu Mono',
    googleFontFamily: 'Ubuntu Mono',
    category: 'monospace',
    description: 'Distinctive rounded Linux terminal aesthetic',
    ligatures: false,
  },
  {
    id: 'victor-mono',
    name: 'Victor Mono',
    googleFontFamily: 'Victor Mono',
    category: 'monospace',
    description: 'Semi-connected cursive script style for comments & code',
    ligatures: true,
  },
  {
    id: 'dm-mono',
    name: 'DM Mono',
    googleFontFamily: 'DM Mono',
    category: 'monospace',
    description: 'Minimalist contemporary geometric code font',
    ligatures: false,
  },
  {
    id: 'red-hat-mono',
    name: 'Red Hat Mono',
    googleFontFamily: 'Red Hat Mono',
    category: 'monospace',
    description: 'Contemporary tech monospace engineered for Red Hat',
    ligatures: false,
  },
  {
    id: 'anonymous-pro',
    name: 'Anonymous Pro',
    googleFontFamily: 'Anonymous Pro',
    category: 'monospace',
    description: 'Classic hacker-era typewriter terminal feel',
    ligatures: false,
  },
  {
    id: 'share-tech-mono',
    name: 'Share Tech Mono',
    googleFontFamily: 'Share Tech Mono',
    category: 'monospace',
    description: 'Futuristic sci-fi terminal monospace',
    ligatures: false,
  },
  {
    id: 'vt323',
    name: 'VT323',
    googleFontFamily: 'VT323',
    category: 'retro',
    description: 'Authentic 1980s DEC VT323 CRT terminal pixel font',
    ligatures: false,
  },
  {
    id: 'cascadia-code',
    name: 'Cascadia Code',
    googleFontFamily: '',
    category: 'monospace',
    description: 'Microsoft Windows Terminal default code font',
    ligatures: true,
  },
];

export const DEFAULT_FONT_NAME = 'JetBrains Mono';

export function getFontByName(name: string): FontOption | undefined {
  return POPULAR_GOOGLE_FONTS.find(
    (f) => f.name.toLowerCase() === name.toLowerCase() || f.id.toLowerCase() === name.toLowerCase()
  );
}
