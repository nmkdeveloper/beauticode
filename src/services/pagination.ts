export interface CodePage {
  pageNumber: number;
  totalPages: number;
  code: string;
  startLine: number;
  lineCount: number;
}

const MANUAL_PAGE_BREAK_REGEX = /^\s*(?:\/\/|#|\/\*)\s*-{2,}\s*(?:page)?\s*-*\s*(?:\*\/)?\s*$/i;

export function getRecommendedLinesPerPage(aspectRatio: string): number {
  switch (aspectRatio) {
    case '9:16':
      return 18;
    case '16:9':
      return 14;
    case '1:1':
      return 16;
    default:
      return 22;
  }
}

export function splitCodeIntoPages(
  fullCode: string,
  linesPerPage: number = 20
): CodePage[] {
  if (!fullCode || !fullCode.trim()) {
    return [
      {
        pageNumber: 1,
        totalPages: 1,
        code: fullCode || '',
        startLine: 1,
        lineCount: 1,
      },
    ];
  }

  const rawLines = fullCode.split('\n');
  const pages: { lines: string[]; startLine: number }[] = [];

  let currentLines: string[] = [];
  let currentStartLine = 1;
  let absoluteLineIndex = 1;

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];

    // Check if line is a manual page break delimiter
    if (MANUAL_PAGE_BREAK_REGEX.test(line)) {
      if (currentLines.length > 0) {
        pages.push({
          lines: currentLines,
          startLine: currentStartLine,
        });
      }
      currentLines = [];
      currentStartLine = absoluteLineIndex + 1;
      absoluteLineIndex++;
      continue;
    }

    currentLines.push(line);

    // If reached max lines per page and not at end
    if (
      linesPerPage > 0 &&
      currentLines.length >= linesPerPage &&
      i < rawLines.length - 1
    ) {
      pages.push({
        lines: currentLines,
        startLine: currentStartLine,
      });
      currentLines = [];
      currentStartLine = absoluteLineIndex + 1;
    }

    absoluteLineIndex++;
  }

  if (currentLines.length > 0 || pages.length === 0) {
    pages.push({
      lines: currentLines,
      startLine: currentStartLine,
    });
  }

  const totalPages = pages.length;

  return pages.map((p, idx) => ({
    pageNumber: idx + 1,
    totalPages,
    code: p.lines.join('\n'),
    startLine: p.startLine,
    lineCount: p.lines.length,
  }));
}

export function updateFullCodeWithPage(
  fullCode: string,
  pageIndex: number,
  pages: CodePage[],
  newPageCode: string
): string {
  const allLines = fullCode.split('\n');
  const targetPage = pages[pageIndex];
  if (!targetPage) return fullCode;

  const startIdx = targetPage.startLine - 1;
  const count = targetPage.lineCount;

  const newLines = newPageCode.split('\n');
  allLines.splice(startIdx, count, ...newLines);
  return allLines.join('\n');
}
