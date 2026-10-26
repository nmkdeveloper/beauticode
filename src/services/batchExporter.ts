import { toBlob } from 'html-to-image';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { ExportPreset, Theme } from '../types';

export interface BatchProgressCallback {
  (current: number, total: number, presetName: string): void;
}

export function computeContainmentScale(
  cardWidth: number,
  cardHeight: number,
  presetWidth: number,
  presetHeight: number,
  safeMarginRatio: number = 0.85
): { scale: number; scaledWidth: number; scaledHeight: number; fits: boolean } {
  if (presetWidth === 0 || presetHeight === 0) {
    return { scale: 1, scaledWidth: cardWidth, scaledHeight: cardHeight, fits: true };
  }

  const safeWidth = presetWidth * safeMarginRatio;
  const safeHeight = presetHeight * safeMarginRatio;
  const scale = Math.min(safeWidth / cardWidth, safeHeight / cardHeight);
  const scaledWidth = cardWidth * scale;
  const scaledHeight = cardHeight * scale;

  const fits = scaledWidth <= safeWidth + 0.001 && scaledHeight <= safeHeight + 0.001;

  return { scale, scaledWidth, scaledHeight, fits };
}

export async function renderPresetImage(
  codeCardNode: HTMLElement,
  sourceCanvasNode: HTMLElement | null,
  preset: ExportPreset,
  theme: Theme,
  showBackground: boolean
): Promise<Blob> {
  // Capture unconstrained content dimensions so wide code is never clipped
  const codeFontEl = codeCardNode.querySelector('.code-font') as HTMLElement | null;
  const gutterEl = codeCardNode.querySelector('.border-r') as HTMLElement | null;
  const preEl = codeCardNode.querySelector('pre.shiki') as HTMLElement | null;

  let naturalContentWidth = 0;
  if (preEl) {
    naturalContentWidth = preEl.scrollWidth;
  } else if (codeFontEl) {
    naturalContentWidth = codeFontEl.scrollWidth;
  }

  const gutterWidth = gutterEl ? gutterEl.offsetWidth + 16 : 0;
  const paddingX = 40;
  const cardRect = codeCardNode.getBoundingClientRect();
  const naturalWidth = Math.max(
    naturalContentWidth + gutterWidth + paddingX,
    codeCardNode.scrollWidth,
    cardRect.width,
    320
  );
  const naturalHeight = Math.max(
    codeCardNode.scrollHeight,
    cardRect.height,
    160
  );

  // If auto-fit / native preset, render offscreen fitted container
  if (preset.width === 0 || preset.height === 0) {
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-99999px';
    container.style.top = '0';
    container.style.background = showBackground ? theme.background : 'transparent';
    container.style.padding = sourceCanvasNode?.style.padding || '64px';
    container.style.display = 'inline-flex';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'center';
    container.style.borderRadius = '16px';
    container.style.zIndex = '-9999';

    const clone = codeCardNode.cloneNode(true) as HTMLElement;
    clone.querySelectorAll('textarea').forEach((ta) => ta.remove());
    clone.style.width = `${naturalWidth}px`;
    clone.style.minWidth = `${naturalWidth}px`;
    clone.style.maxWidth = 'none';

    const cloneCodeFont = clone.querySelector('.code-font') as HTMLElement | null;
    if (cloneCodeFont) {
      cloneCodeFont.style.overflow = 'visible';
      cloneCodeFont.style.overflowX = 'visible';
    }

    container.appendChild(clone);
    document.body.appendChild(container);

    try {
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }
      await new Promise((r) => setTimeout(r, 60));

      const blob = await toBlob(container, {
        pixelRatio: 2,
        quality: 1,
        filter: (domNode) => (domNode as HTMLElement).tagName !== 'TEXTAREA',
      });
      if (!blob) throw new Error(`Failed to render auto-fit preset`);
      return blob;
    } finally {
      if (document.body.contains(container)) {
        document.body.removeChild(container);
      }
    }
  }

  // Sized preset: build offscreen container with exact preset dimensions
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-99999px';
  container.style.top = '0';
  container.style.width = `${preset.width}px`;
  container.style.height = `${preset.height}px`;
  container.style.background = showBackground ? theme.background : 'transparent';
  container.style.display = 'flex';
  container.style.alignItems = 'center';
  container.style.justifyContent = 'center';
  container.style.overflow = 'hidden';
  container.style.zIndex = '-9999';

  // Clone code card without interactive textarea
  const clone = codeCardNode.cloneNode(true) as HTMLElement;
  clone.querySelectorAll('textarea').forEach((ta) => ta.remove());

  // Set explicit unclipped width on card clone
  clone.style.width = `${naturalWidth}px`;
  clone.style.minWidth = `${naturalWidth}px`;
  clone.style.maxWidth = 'none';
  clone.style.boxSizing = 'border-box';

  const cloneCodeFont = clone.querySelector('.code-font') as HTMLElement | null;
  if (cloneCodeFont) {
    cloneCodeFont.style.overflow = 'visible';
    cloneCodeFont.style.overflowX = 'visible';
  }

  // Calculate containment scale with safe margin
  const { scale } = computeContainmentScale(
    naturalWidth,
    naturalHeight,
    preset.width,
    preset.height,
    0.85
  );

  // Scale wrapper
  const scaler = document.createElement('div');
  scaler.style.transform = `scale(${scale})`;
  scaler.style.transformOrigin = 'center center';
  scaler.style.display = 'flex';
  scaler.style.alignItems = 'center';
  scaler.style.justifyContent = 'center';
  scaler.appendChild(clone);

  container.appendChild(scaler);
  document.body.appendChild(container);

  try {
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }
    await new Promise((r) => setTimeout(r, 60));

    const blob = await toBlob(container, {
      pixelRatio: 1,
      quality: 1,
      width: preset.width,
      height: preset.height,
      filter: (domNode) => (domNode as HTMLElement).tagName !== 'TEXTAREA',
    });

    if (!blob) {
      throw new Error(`Failed to render preset: ${preset.name}`);
    }

    return blob;
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
}

export async function exportBatchZip(
  codeCardNode: HTMLElement,
  sourceCanvasNode: HTMLElement | null,
  presets: ExportPreset[],
  theme: Theme,
  showBackground: boolean,
  baseFilename: string,
  onProgress?: BatchProgressCallback
): Promise<void> {
  const zip = new JSZip();
  const cleanBase =
    (baseFilename || 'beauticode')
      .replace(/[<>:"/\\|?*]/g, '_')
      .replace(/\.[^/.]+$/, '')
      .trim() || 'beauticode';
  const total = presets.length;

  for (let i = 0; i < presets.length; i++) {
    const preset = presets[i];
    if (onProgress) {
      onProgress(i + 1, total, preset.name);
    }

    const blob = await renderPresetImage(
      codeCardNode,
      sourceCanvasNode,
      preset,
      theme,
      showBackground
    );

    const filename = `${cleanBase}-${preset.id}-${preset.width || 'auto'}x${preset.height || 'auto'}.png`;
    zip.file(filename, blob);

    // Yield to event loop to allow GC of canvas resources
    await new Promise((r) => setTimeout(r, 20));
  }

  const zipBlob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  saveAs(zipBlob, `${cleanBase}-bundle.zip`);
}
