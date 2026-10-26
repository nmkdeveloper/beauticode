import { describe, it, expect } from 'vitest';
import {
  splitCodeIntoPages,
  getRecommendedLinesPerPage,
} from '../services/pagination';

describe('Pagination Service', () => {
  it('handles empty code cleanly', () => {
    const pages = splitCodeIntoPages('', 10);
    expect(pages).toHaveLength(1);
    expect(pages[0].pageNumber).toBe(1);
    expect(pages[0].totalPages).toBe(1);
  });

  it('splits code by lines per page correctly', () => {
    const lines = Array.from({ length: 35 }, (_, i) => `const x${i} = ${i};`);
    const code = lines.join('\n');
    const pages = splitCodeIntoPages(code, 15);

    expect(pages).toHaveLength(3);
    expect(pages[0].pageNumber).toBe(1);
    expect(pages[0].startLine).toBe(1);
    expect(pages[0].lineCount).toBe(15);

    expect(pages[1].pageNumber).toBe(2);
    expect(pages[1].startLine).toBe(16);
    expect(pages[1].lineCount).toBe(15);

    expect(pages[2].pageNumber).toBe(3);
    expect(pages[2].startLine).toBe(31);
    expect(pages[2].lineCount).toBe(5);
  });

  it('splits code on manual page break delimiter', () => {
    const code = `function a() {
  return 1;
}
// --- page ---
function b() {
  return 2;
}`;
    const pages = splitCodeIntoPages(code, 50);
    expect(pages).toHaveLength(2);
    expect(pages[0].code).toContain('function a()');
    expect(pages[1].code).toContain('function b()');
  });

  it('provides recommended lines per page for ratios', () => {
    expect(getRecommendedLinesPerPage('9:16')).toBe(18);
    expect(getRecommendedLinesPerPage('16:9')).toBe(14);
    expect(getRecommendedLinesPerPage('1:1')).toBe(16);
  });
});
