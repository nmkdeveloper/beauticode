import { toSvg, toBlob } from 'html-to-image';
import { saveAs } from 'file-saver';

export interface SingleExportOptions {
  format: 'png' | 'svg';
  pixelRatio?: number;
  filename?: string;
}

export async function exportSingleImage(
  node: HTMLElement,
  options: SingleExportOptions
): Promise<void> {
  const { format, pixelRatio = 2, filename = 'beauticode.png' } = options;
  const sanitizedFilename = filename.replace(/[<>:"/\\|?*]/g, '_').trim() || 'beauticode.png';

  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  }

  const filter = (domNode: HTMLElement) => domNode.tagName !== 'TEXTAREA';

  if (format === 'svg') {
    const dataUrl = await toSvg(node, {
      quality: 1,
      pixelRatio,
      filter,
    });
    saveAs(dataUrl, sanitizedFilename.endsWith('.svg') ? sanitizedFilename : `${sanitizedFilename}.svg`);
  } else {
    const blob = await toBlob(node, {
      pixelRatio,
      quality: 1,
      filter,
    });
    if (!blob) {
      throw new Error('Failed to render PNG blob from canvas');
    }
    saveAs(blob, sanitizedFilename.endsWith('.png') ? sanitizedFilename : `${sanitizedFilename}.png`);
  }
}

export async function copyImageToClipboard(
  node: HTMLElement,
  pixelRatio: number = 2
): Promise<boolean> {
  try {
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }

    const filter = (domNode: HTMLElement) => domNode.tagName !== 'TEXTAREA';

    const blob = await toBlob(node, {
      pixelRatio,
      quality: 1,
      filter,
    });

    if (!blob) {
      console.error('Failed to create blob for clipboard');
      return false;
    }

    if (!navigator.clipboard || !window.ClipboardItem) {
      console.warn('ClipboardItem API not supported in this browser');
      return false;
    }

    await navigator.clipboard.write([
      new ClipboardItem({
        'image/png': blob,
      }),
    ]);
    return true;
  } catch (error) {
    console.error('Error writing image to clipboard:', error);
    return false;
  }
}

export async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    // Fallback for older environments
    const input = document.createElement('textarea');
    input.value = text;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
    return true;
  } catch {
    return false;
  }
}
