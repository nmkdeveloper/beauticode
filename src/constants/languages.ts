import { Language } from '../types';

export const LANGUAGES: Language[] = [
  {
    id: 'typescript',
    name: 'TypeScript',
    shikiLang: 'typescript',
    extensions: ['ts', 'tsx'],
    detectPatterns: [
      /\binterface\s+[A-Z]/,
      /\btype\s+[A-Z]\w*\s*=/,
      /:\s*(string|number|boolean|any|unknown|never)\b/,
      /import\s+type\b/,
      /<[A-Z]\w*>/,
    ],
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    shikiLang: 'javascript',
    extensions: ['js', 'jsx', 'mjs'],
    detectPatterns: [
      /\bconst\s+\w+\s*=/,
      /\blet\s+\w+\s*=/,
      /\bconsole\.log\(/,
      /\bfunction\s*\(/,
      /=>\s*\{/,
    ],
  },
  {
    id: 'python',
    name: 'Python',
    shikiLang: 'python',
    extensions: ['py'],
    detectPatterns: [
      /\bdef\s+\w+\s*\(/,
      /\bimport\s+[\w.]+(\s+as\s+\w+)?/,
      /\bfrom\s+[\w.]+\s+import/,
      /\belif\b/,
      /:\s*$/m,
      /\b__init__\b/,
      /\bprint\(/,
    ],
  },
  {
    id: 'rust',
    name: 'Rust',
    shikiLang: 'rust',
    extensions: ['rs'],
    detectPatterns: [
      /\bfn\s+\w+\s*\(/,
      /\blet\s+mut\b/,
      /\bimpl\s+\w+/,
      /\bmatch\s+\w+\s*\{/,
      /println!\(/,
      /->\s*(Result|Option|\w+)/,
    ],
  },
  {
    id: 'go',
    name: 'Go',
    shikiLang: 'go',
    extensions: ['go'],
    detectPatterns: [
      /\bpackage\s+\w+/,
      /\bfunc\s+(\(\w+\s+\*?\w+\)\s+)?\w+\(/,
      /\bimport\s*\(/,
      /:=\s*/,
      /\bdefer\b/,
      /\bfmt\.Print/,
    ],
  },
  {
    id: 'cpp',
    name: 'C++',
    shikiLang: 'cpp',
    extensions: ['cpp', 'cc', 'cxx', 'hpp'],
    detectPatterns: [
      /#include\s*<iostream>/,
      /#include\s*<\w+>/,
      /\bstd::/,
      /\bcout\s*<</,
      /\bnamespace\s+\w+/,
      /\btemplate\s*</,
    ],
  },
  {
    id: 'c',
    name: 'C',
    shikiLang: 'c',
    extensions: ['c', 'h'],
    detectPatterns: [
      /#include\s*<stdio\.h>/,
      /#include\s*<stdlib\.h>/,
      /\bprintf\(/,
      /\bmalloc\(/,
      /\bint\s+main\s*\(/,
    ],
  },
  {
    id: 'csharp',
    name: 'C#',
    shikiLang: 'csharp',
    extensions: ['cs'],
    detectPatterns: [
      /\busing\s+System/,
      /\bnamespace\s+[\w.]+/,
      /\bpublic\s+class\b/,
      /\bConsole\.WriteLine/,
    ],
  },
  {
    id: 'java',
    name: 'Java',
    shikiLang: 'java',
    extensions: ['java'],
    detectPatterns: [
      /\bpublic\s+static\s+void\s+main/,
      /\bpublic\s+class\s+\w+/,
      /\bSystem\.out\.println/,
      /\bpackage\s+[\w.]+;/,
    ],
  },
  {
    id: 'html',
    name: 'HTML',
    shikiLang: 'html',
    extensions: ['html', 'htm'],
    detectPatterns: [
      /<!DOCTYPE\s+html>/i,
      /<html[\s>]/i,
      /<div[\s>]/i,
      /<head[\s>]/i,
      /<\/\w+>/,
    ],
  },
  {
    id: 'css',
    name: 'CSS',
    shikiLang: 'css',
    extensions: ['css'],
    detectPatterns: [
      /[.#][\w-]+\s*\{[^}]*:[^}]*\}/,
      /@media\s*\(min-width/,
      /@keyframes\b/,
    ],
  },
  {
    id: 'json',
    name: 'JSON',
    shikiLang: 'json',
    extensions: ['json'],
    detectPatterns: [
      /^\s*\{\s*"[\w-]+":/m,
      /^\s*\[\s*\{/m,
    ],
  },
  {
    id: 'sql',
    name: 'SQL',
    shikiLang: 'sql',
    extensions: ['sql'],
    detectPatterns: [
      /\bSELECT\b.*\bFROM\b/i,
      /\bINSERT\s+INTO\b/i,
      /\bCREATE\s+TABLE\b/i,
      /\bUPDATE\b.*\bSET\b/i,
      /\bWHERE\b/i,
    ],
  },
  {
    id: 'bash',
    name: 'Bash / Shell',
    shikiLang: 'bash',
    extensions: ['sh', 'bash', 'zsh'],
    detectPatterns: [
      /^#!/,
      /\becho\s+["']/,
      /\bexport\s+\w+=/,
      /\bsudo\s+/,
      /\bchmod\s+[0-9+]/,
    ],
  },
  {
    id: 'markdown',
    name: 'Markdown',
    shikiLang: 'markdown',
    extensions: ['md', 'markdown'],
    detectPatterns: [
      /^#{1,6}\s+.+$/m,
      /\[.+\]\(https?:\/\/.+\)/,
      /```\w*\n[\s\S]*?\n```/,
    ],
  },
  {
    id: 'php',
    name: 'PHP',
    shikiLang: 'php',
    extensions: ['php'],
    detectPatterns: [
      /<\?php/,
      /\$\w+\s*=/,
      /\becho\s+\$/,
    ],
  },
  {
    id: 'swift',
    name: 'Swift',
    shikiLang: 'swift',
    extensions: ['swift'],
    detectPatterns: [
      /\bimport\s+(SwiftUI|UIKit|Foundation)/,
      /\bfunc\s+\w+\(.*\)\s*->/,
      /\bvar\s+\w+:\s*some\s+View/,
    ],
  },
  {
    id: 'kotlin',
    name: 'Kotlin',
    shikiLang: 'kotlin',
    extensions: ['kt', 'kts'],
    detectPatterns: [
      /\bfun\s+main\s*\(/,
      /\bval\s+\w+:\s*[A-Z]/,
      /\bpackage\s+[\w.]+/,
      /\bcompanion\s+object/,
    ],
  },
  {
    id: 'dart',
    name: 'Dart',
    shikiLang: 'dart',
    extensions: ['dart'],
    detectPatterns: [
      /\bimport\s+'package:flutter/,
      /\bWidget\s+build\(BuildContext/,
      /\bStatefulWidget\b/,
    ],
  },
  {
    id: 'yaml',
    name: 'YAML',
    shikiLang: 'yaml',
    extensions: ['yaml', 'yml'],
    detectPatterns: [
      /^\w+:\s*$/m,
      /^\s+-\s+\w+:/m,
    ],
  },
  {
    id: 'dockerfile',
    name: 'Dockerfile',
    shikiLang: 'dockerfile',
    extensions: ['Dockerfile', 'dockerfile'],
    detectPatterns: [
      /^FROM\s+[\w/:.-]+/m,
      /^RUN\s+/m,
      /^WORKDIR\s+/m,
      /^EXPOSE\s+\d+/m,
    ],
  },
];

export const AUTO_DETECT_ID = 'auto';

export function getLanguageById(id: string): Language {
  return LANGUAGES.find((l) => l.id === id) || LANGUAGES[0];
}

export function detectLanguage(code: string): string {
  if (!code || !code.trim()) return 'typescript';

  let bestLang = 'typescript';
  let maxScore = 0;

  for (const lang of LANGUAGES) {
    if (!lang.detectPatterns || lang.detectPatterns.length === 0) continue;
    let score = 0;
    for (const pattern of lang.detectPatterns) {
      if (pattern.test(code)) {
        score++;
      }
    }
    if (score > maxScore) {
      maxScore = score;
      bestLang = lang.id;
    }
  }

  return maxScore > 0 ? bestLang : 'typescript';
}

