import { describe, it, expect } from 'vitest';
import { THEMES, getThemeById, DEFAULT_THEME_ID } from '../constants/themes';

describe('Theme Presets', () => {
  it('contains at least 20 rich themes', () => {
    expect(THEMES.length).toBeGreaterThanOrEqual(20);
  });

  it('contains all core required themes', () => {
    const ids = THEMES.map((t) => t.id);
    expect(ids).toContain('noir');
    expect(ids).toContain('breeze');
    expect(ids).toContain('candy');
    expect(ids).toContain('falcon');
    expect(ids).toContain('crimson');
    expect(ids).toContain('vercel');
    expect(ids).toContain('supabase');
    expect(ids).toContain('tailwind');
    expect(ids).toContain('openai');
    expect(ids).toContain('dracula');
    expect(ids).toContain('nord');
  });

  it('has valid categories for all themes', () => {
    const validCategories = ['gradient', 'minimal', 'tech'];
    THEMES.forEach((theme) => {
      expect(validCategories).toContain(theme.category);
      expect(theme.background).toBeTruthy();
      expect(theme.cardBg).toBeTruthy();
      expect(theme.shikiDarkTheme).toBeTruthy();
      expect(theme.shikiLightTheme).toBeTruthy();
      expect(theme.previewColors).toHaveLength(2);
    });
  });

  it('returns default theme when given an invalid ID', () => {
    const defaultTheme = getThemeById(DEFAULT_THEME_ID);
    expect(defaultTheme).toBeDefined();

    const fallback = getThemeById('random-invalid-theme-id');
    expect(fallback.id).toBe(THEMES[0].id);
  });
});
