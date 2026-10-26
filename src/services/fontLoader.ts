const loadedFonts = new Set<string>();

/**
 * Loads a font dynamically from Google Fonts CSS API.
 * If font is system or empty, resolves immediately.
 */
export function loadGoogleFont(fontFamily: string): Promise<boolean> {
  if (!fontFamily) {
    return Promise.resolve(false);
  }

  const cleanName = fontFamily.trim();
  if (
    cleanName === 'Cascadia Code' ||
    cleanName === 'monospace' ||
    cleanName === 'ui-monospace' ||
    cleanName === 'Consolas'
  ) {
    return Promise.resolve(true);
  }

  if (typeof document === 'undefined') {
    return Promise.resolve(false);
  }

  const fontKey = cleanName.toLowerCase();
  if (loadedFonts.has(fontKey)) {
    return Promise.resolve(true);
  }

  return new Promise((resolve) => {
    // Format name for Google Fonts API (e.g., "JetBrains Mono" -> "JetBrains+Mono")
    const apiName = cleanName.replace(/\s+/g, '+');
    const linkId = `google-font-${apiName.toLowerCase()}`;

    // If tag already exists, resolve
    if (document.getElementById(linkId)) {
      loadedFonts.add(fontKey);
      resolve(true);
      return;
    }

    const link = document.createElement('link');
    link.id = linkId;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${apiName}:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap`;

    link.onload = () => {
      loadedFonts.add(fontKey);
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => resolve(true)).catch(() => resolve(true));
      } else {
        resolve(true);
      }
    };

    link.onerror = () => {
      // Fallback: try loading without weight specifiers (compatible with single-weight fonts like VT323)
      const fallbackLink = document.createElement('link');
      fallbackLink.id = `${linkId}-fallback`;
      fallbackLink.rel = 'stylesheet';
      fallbackLink.href = `https://fonts.googleapis.com/css2?family=${apiName}&display=swap`;

      fallbackLink.onload = () => {
        loadedFonts.add(fontKey);
        if (document.fonts && document.fonts.ready) {
          document.fonts.ready.then(() => resolve(true)).catch(() => resolve(true));
        } else {
          resolve(true);
        }
      };

      fallbackLink.onerror = () => {
        console.warn(`Could not load Google Font: ${cleanName}`);
        resolve(false);
      };

      document.head.appendChild(fallbackLink);
    };

    document.head.appendChild(link);
  });
}
