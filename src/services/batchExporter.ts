import { toBlob } from 'html-to-image';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { ExportPreset, Theme } from '../types';

export interface BatchProgressCallback {
  (current: number, total: number, presetName: string): void;
}

export async function renderPresetImage(
  codeCardNode: HTMLElement,
  sourceCanvasNode: HTMLElement | null,
  preset: ExportPreset,
  theme: Theme,
  showBackground: boolean
): Promise<Blob> {
  // If auto-fit / native preset, render source canvas directly
  if (preset.width === 0 || preset.height === 0) {
    const targetNode = sourceCanvasNode || codeCardNode;
    const blob = await toBlob(targetNode, {
      pixelRatio: 2,
      quality: 1,
    });
    if (!blob) throw new Error(`Failed to render auto-fit preset`);
    return blob;
  }

  // Sized preset: build offscreen 1:1 container with auto-containment
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

  // Clone code card
  const clone = codeCardNode.cloneNode(true) as HTMLElement;
  // Clean up any textareas to prevent cursors or caret markers
  clone.querySelectorAll('textarea').forEach((ta) => ta.remove());

  // Capture original dimensions
  const cardRect = codeCardNode.getBoundingClientRect();
  const cardWidth = Math.max(cardRect.width, 320);
  const cardHeight = Math.max(cardRect.height, 160);

  // Set explicit width on card clone matching source
  clone.style.width = `${cardWidth}px`;
  clone.style.minWidth = `${cardWidth}px`;
  clone.style.maxWidth = `${cardWidth}px`;
  clone.style.boxSizing = 'border-box';

  // Auto-containment calculation with 15% safe margin
  const safeWidth = preset.width * 0.85;
  const safeHeight = preset.height * 0.85;
  const scale = Math.min(safeWidth / cardWidth, safeHeight / cardHeight);

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
    // Settle fonts and CSS
    await new Promise((r) => setTimeout(r, 60));

    const blob = await toBlob(container, {
      pixelRatio: 1,
      quality: 1,
      width: preset.width,
      height: preset.height,
    });

    if (!blob) {
      throw new Error(`Failed to render preset: ${preset.name}`);
    }

    return blob;
  } finally {
    // Sequential memory cleanup
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
  const cleanBase = (baseFilename || 'beauticode').replace(/\.[^/.]+$/, '');
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
