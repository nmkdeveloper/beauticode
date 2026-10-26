import { toBlob, toPng } from 'html-to-image';
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

async function safeNodeToBlob(node: HTMLElement, options: Record<string, unknown>): Promise<Blob> {
  const mergedOptions = {
    ...options,
    fetchRequestInit: { mode: 'cors' as RequestMode },
    filter: (domNode: HTMLElement) => domNode.tagName !== 'TEXTAREA',
  };

  try {
    const blob = await toBlob(node, mergedOptions);
    if (blob && blob.size > 0) {
      return blob;
    }
  } catch (err) {
    console.warn('toBlob primary capture encountered issue, attempting toPng fallback:', err);
  }

  // Robust fallback via toPng dataURL
  const dataUrl = await toPng(node, mergedOptions);
  const res = await fetch(dataUrl);
  const fallbackBlob = await res.blob();
  if (!fallbackBlob || fallbackBlob.size === 0) {
    throw new Error('Failed to create image blob');
  }
  return fallbackBlob;
}

export async function renderPresetImage(
  codeCardNode: HTMLElement,
  sourceCanvasNode: HTMLElement | null,
  preset: ExportPreset,
  theme: Theme,
  showBackground: boolean
): Promise<Blob> {
  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  }

  // 1. AUTO-FIT PRESET (Native / Dynamic size)
  if (preset.width === 0 || preset.height === 0) {
    // If sourceCanvasNode is in document and visible, capture it directly
    if (
      sourceCanvasNode &&
      document.body.contains(sourceCanvasNode) &&
      sourceCanvasNode.offsetWidth > 0 &&
      sourceCanvasNode.offsetHeight > 0
    ) {
      await new Promise((r) => setTimeout(r, 60));
      return await safeNodeToBlob(sourceCanvasNode, {
        pixelRatio: 2,
        quality: 1,
      });
    }

    // Fallback: build an isolated unclipped container inside hidden wrapper
    const cardRect = codeCardNode.getBoundingClientRect();
    const naturalWidth = Math.max(codeCardNode.scrollWidth, cardRect.width, 480);
    const naturalHeight = Math.max(codeCardNode.scrollHeight, cardRect.height, 160);
    const paddingVal = 64;
    const totalW = naturalWidth + paddingVal * 2;
    const totalH = naturalHeight + paddingVal * 2;

    const wrapper = document.createElement('div');
    wrapper.style.position = 'fixed';
    wrapper.style.left = '-99999px';
    wrapper.style.top = '0';
    wrapper.style.width = '0';
    wrapper.style.height = '0';
    wrapper.style.overflow = 'hidden';
    wrapper.style.zIndex = '-9999';

    const container = document.createElement('div');
    container.style.position = 'relative';
    container.style.left = '0';
    container.style.top = '0';
    container.style.width = `${totalW}px`;
    container.style.height = `${totalH}px`;
    container.style.boxSizing = 'border-box';
    container.style.background = showBackground ? theme.background : 'transparent';
    container.style.padding = `${paddingVal}px`;
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'center';
    container.style.borderRadius = '16px';

    const clone = codeCardNode.cloneNode(true) as HTMLElement;
    clone.querySelectorAll('textarea').forEach((ta) => ta.remove());
    clone.style.width = `${naturalWidth}px`;
    clone.style.minWidth = `${naturalWidth}px`;
    clone.style.maxWidth = 'none';

    container.appendChild(clone);
    wrapper.appendChild(container);
    document.body.appendChild(wrapper);

    try {
      await new Promise((r) => setTimeout(r, 60));
      return await safeNodeToBlob(container, {
        width: totalW,
        height: totalH,
        pixelRatio: 2,
        quality: 1,
      });
    } finally {
      if (document.body.contains(wrapper)) {
        document.body.removeChild(wrapper);
      }
    }
  }

  // 2. SIZED PRESET (4K, FHD, 16:9, 9:16, 1:1, etc.)
  const cardRect = codeCardNode.getBoundingClientRect();
  const naturalWidth = Math.max(codeCardNode.scrollWidth, cardRect.width, 480);
  const naturalHeight = Math.max(codeCardNode.scrollHeight, cardRect.height, 160);

  const wrapper = document.createElement('div');
  wrapper.style.position = 'fixed';
  wrapper.style.left = '-99999px';
  wrapper.style.top = '0';
  wrapper.style.width = '0';
  wrapper.style.height = '0';
  wrapper.style.overflow = 'hidden';
  wrapper.style.zIndex = '-9999';

  const container = document.createElement('div');
  container.style.position = 'relative';
  container.style.left = '0';
  container.style.top = '0';
  container.style.width = `${preset.width}px`;
  container.style.height = `${preset.height}px`;
  container.style.boxSizing = 'border-box';
  container.style.background = showBackground ? theme.background : 'transparent';
  container.style.display = 'flex';
  container.style.alignItems = 'center';
  container.style.justifyContent = 'center';
  container.style.overflow = 'hidden';

  const clone = codeCardNode.cloneNode(true) as HTMLElement;
  clone.querySelectorAll('textarea').forEach((ta) => ta.remove());
  clone.style.width = `${naturalWidth}px`;
  clone.style.minWidth = `${naturalWidth}px`;
  clone.style.maxWidth = 'none';
  clone.style.boxSizing = 'border-box';

  const { scale } = computeContainmentScale(
    naturalWidth,
    naturalHeight,
    preset.width,
    preset.height,
    0.85
  );

  const scaler = document.createElement('div');
  scaler.style.transform = `scale(${scale})`;
  scaler.style.transformOrigin = 'center center';
  scaler.style.display = 'flex';
  scaler.style.alignItems = 'center';
  scaler.style.justifyContent = 'center';
  scaler.appendChild(clone);

  container.appendChild(scaler);
  wrapper.appendChild(container);
  document.body.appendChild(wrapper);

  try {
    await new Promise((r) => setTimeout(r, 60));
    return await safeNodeToBlob(container, {
      pixelRatio: 1,
      quality: 1,
      width: preset.width,
      height: preset.height,
    });
  } finally {
    if (document.body.contains(wrapper)) {
      document.body.removeChild(wrapper);
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
