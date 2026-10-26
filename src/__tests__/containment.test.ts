import { describe, it, expect } from 'vitest';
import { DEFAULT_PRESETS } from '../constants/presets';
import { computeContainmentScale } from '../services/batchExporter';

describe('Auto-Containment Algorithm & Edge Cases', () => {
  const landscape4K = DEFAULT_PRESETS.find((p) => p.id === '4k-landscape')!;
  const portrait4K = DEFAULT_PRESETS.find((p) => p.id === '4k-portrait')!;
  const fhdLandscape = DEFAULT_PRESETS.find((p) => p.id === 'fhd-landscape')!;
  const square2K = DEFAULT_PRESETS.find((p) => p.id === 'square-2k')!;

  it('contains standard sized code card in 4K Landscape within safe margins', () => {
    const cardWidth = 800;
    const cardHeight = 600;
    const result = computeContainmentScale(cardWidth, cardHeight, landscape4K.width, landscape4K.height);

    expect(result.fits).toBe(true);
    expect(result.scaledWidth).toBeLessThanOrEqual(landscape4K.width * 0.85);
    expect(result.scaledHeight).toBeLessThanOrEqual(landscape4K.height * 0.85);
  });

  it('handles extremely tall code blocks (exceeding canvas height) without vertical clipping', () => {
    // 3500px tall code block in 2160px height canvas
    const cardWidth = 700;
    const cardHeight = 3500;
    const result = computeContainmentScale(cardWidth, cardHeight, landscape4K.width, landscape4K.height);

    expect(result.fits).toBe(true);
    // Scaled height must strictly fit within 2160 * 0.85 = 1836px
    expect(result.scaledHeight).toBeLessThanOrEqual(1836.001);
    expect(result.scaledWidth).toBeLessThanOrEqual(landscape4K.width * 0.85);
  });

  it('handles extremely wide code blocks without horizontal clipping', () => {
    // 4000px wide code block
    const cardWidth = 4000;
    const cardHeight = 400;
    const result = computeContainmentScale(cardWidth, cardHeight, landscape4K.width, landscape4K.height);

    expect(result.fits).toBe(true);
    // Scaled width must strictly fit within 3840 * 0.85 = 3264px
    expect(result.scaledWidth).toBeLessThanOrEqual(3264.001);
  });

  it('contains code cleanly in 4K Portrait 9:16 layout', () => {
    const cardWidth = 900;
    const cardHeight = 1200;
    const result = computeContainmentScale(cardWidth, cardHeight, portrait4K.width, portrait4K.height);

    expect(result.fits).toBe(true);
    expect(result.scaledWidth).toBeLessThanOrEqual(portrait4K.width * 0.85);
    expect(result.scaledHeight).toBeLessThanOrEqual(portrait4K.height * 0.85);
  });

  it('contains code cleanly in 1:1 Square layout', () => {
    const cardWidth = 1000;
    const cardHeight = 1400;
    const result = computeContainmentScale(cardWidth, cardHeight, square2K.width, square2K.height);

    expect(result.fits).toBe(true);
    expect(result.scaledWidth).toBeLessThanOrEqual(square2K.width * 0.85);
    expect(result.scaledHeight).toBeLessThanOrEqual(square2K.height * 0.85);
  });

  it('handles FHD Landscape 1080p scaling', () => {
    const cardWidth = 800;
    const cardHeight = 500;
    const result = computeContainmentScale(cardWidth, cardHeight, fhdLandscape.width, fhdLandscape.height);

    expect(result.fits).toBe(true);
    expect(result.scaledWidth).toBeLessThanOrEqual(fhdLandscape.width * 0.85);
    expect(result.scaledHeight).toBeLessThanOrEqual(fhdLandscape.height * 0.85);
  });

  it('returns scale 1 for auto-fit preset (width 0, height 0)', () => {
    const cardWidth = 720;
    const cardHeight = 480;
    const result = computeContainmentScale(cardWidth, cardHeight, 0, 0);

    expect(result.scale).toBe(1);
    expect(result.scaledWidth).toBe(720);
    expect(result.scaledHeight).toBe(480);
    expect(result.fits).toBe(true);
  });
});
