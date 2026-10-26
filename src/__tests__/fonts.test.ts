import { describe, it, expect } from 'vitest';
import { POPULAR_GOOGLE_FONTS, getFontByName } from '../constants/fonts';
import { loadGoogleFont } from '../services/fontLoader';
import { encodeState, decodeState } from '../hooks/useEditorState';

describe('Typography & Google Fonts', () => {
  it('contains essential curated monospace fonts with metadata', () => {
    expect(POPULAR_GOOGLE_FONTS.length).toBeGreaterThan(10);
    const names = POPULAR_GOOGLE_FONTS.map((f) => f.name);
    expect(names).toContain('JetBrains Mono');
    expect(names).toContain('Fira Code');
    expect(names).toContain('Source Code Pro');
    expect(names).toContain('Roboto Mono');
    expect(names).toContain('VT323');
  });

  it('retrieves font by name or id case-insensitively', () => {
    const font1 = getFontByName('fira-code');
    expect(font1?.name).toBe('Fira Code');

    const font2 = getFontByName('JETBRAINS MONO');
    expect(font2?.id).toBe('jetbrains-mono');

    const notFound = getFontByName('NonExistentFont123');
    expect(notFound).toBeUndefined();
  });

  it('handles font loader for system or empty fonts safely', async () => {
    const resEmpty = await loadGoogleFont('');
    expect(resEmpty).toBe(false);

    const resCascadia = await loadGoogleFont('Cascadia Code');
    expect(resCascadia).toBe(true);

    const resMono = await loadGoogleFont('monospace');
    expect(resMono).toBe(true);
  });

  it('encodes and decodes fontFamily and fontSize in editor URL state', () => {
    const state = {
      code: 'console.log("hello");',
      language: 'javascript',
      fontSize: 18,
      fontFamily: 'Fira Code',
      preset: 'auto-fit',
    };

    const encoded = encodeState(state);
    expect(encoded).toBeTruthy();

    const decoded = decodeState(`#${encoded}`);
    expect(decoded?.fontSize).toBe(18);
    expect(decoded?.fontFamily).toBe('Fira Code');
    expect(decoded?.code).toBe('console.log("hello");');
  });
});
