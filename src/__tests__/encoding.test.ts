import { describe, it, expect } from 'vitest';
import { encodeState, decodeState } from '../hooks/useEditorState';
import { EditorSettings } from '../types';

describe('Editor State Hash Encoding & Decoding', () => {
  const sampleSettings: Partial<EditorSettings> = {
    code: `const greeting = "Hello BeautiCode!";`,
    language: 'typescript',
    theme: 'breeze',
    padding: 32,
    showBackground: true,
    darkMode: true,
    showLineNumbers: true,
    title: 'test.ts',
  };

  it('encodes and decodes standard editor state accurately', () => {
    const hash = encodeState(sampleSettings);
    expect(hash).toBeTruthy();

    const decoded = decodeState(`#${hash}`);
    expect(decoded).toEqual({
      code: sampleSettings.code,
      language: sampleSettings.language,
      theme: sampleSettings.theme,
      padding: sampleSettings.padding,
      showBackground: sampleSettings.showBackground,
      darkMode: sampleSettings.darkMode,
      showLineNumbers: sampleSettings.showLineNumbers,
      title: sampleSettings.title,
    });
  });

  it('safely roundtrips non-ASCII characters, Vietnamese diacritics, and emojis', () => {
    const unicodeSettings: Partial<EditorSettings> = {
      code: `// Xin chào thế giới! 🇻🇳 🚀 🧑‍💻\nconst lambda = (α: number, β: number) => α * β;`,
      language: 'typescript',
      title: 'vietnamese_tính_toán.ts',
    };

    const hash = encodeState(unicodeSettings);
    const decoded = decodeState(hash);

    expect(decoded?.code).toBe(unicodeSettings.code);
    expect(decoded?.title).toBe(unicodeSettings.title);
  });

  it('handles URL-encoded hash strings containing %3D, %2B, and %2F', () => {
    const hash = encodeState(sampleSettings);
    const urlEncodedHash = encodeURIComponent(hash);

    // E.g. shared via apps that percent-encode URLs
    const decoded = decodeState(`#${urlEncodedHash}`);
    expect(decoded).toBeTruthy();
    expect(decoded?.code).toBe(sampleSettings.code);
    expect(decoded?.language).toBe(sampleSettings.language);
  });

  it('handles base64url replacements with dashes and underscores', () => {
    const hash = encodeState(sampleSettings);
    const base64UrlSafe = hash.replace(/\+/g, '-').replace(/\//g, '_');

    const decoded = decodeState(base64UrlSafe);
    expect(decoded).toBeTruthy();
    expect(decoded?.code).toBe(sampleSettings.code);
  });

  it('gracefully returns null for invalid, corrupted, or empty hashes', () => {
    expect(decodeState('')).toBeNull();
    expect(decodeState('#')).toBeNull();
    expect(decodeState('invalid-gibberish-not-json-@@@')).toBeNull();
  });
});
