export type ThemeCategory = 'gradient' | 'minimal' | 'tech';

export interface Theme {
  id: string;
  name: string;
  category: ThemeCategory;
  background: string;
  cardBg: string;
  cardBorder: string;
  cardShadow: string;
  shikiDarkTheme: string;
  shikiLightTheme: string;
  previewColors: [string, string];
  textColor: string;
  accentColor: string;
}

export interface Language {
  id: string;
  name: string;
  shikiLang: string;
  extensions: string[];
  detectPatterns?: RegExp[];
}

export interface ExportPreset {
  id: string;
  name: string;
  width: number;
  height: number;
  aspectRatio: string;
  category: '4k' | 'fhd' | 'square' | 'custom' | 'auto';
  description: string;
  enabled?: boolean;
}

export interface EditorSettings {
  code: string;
  language: string;
  theme: string;
  padding: number;
  showBackground: boolean;
  darkMode: boolean;
  showLineNumbers: boolean;
  title: string;
  fontSize: number;
}

export interface ExportOptions {
  format: 'png' | 'svg';
  pixelRatio?: number;
  fileName?: string;
}

export interface BatchExportProgress {
  currentPresetName: string;
  completed: number;
  total: number;
  isExporting: boolean;
}
