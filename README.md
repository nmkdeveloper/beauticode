# BeautiCode ✨

> Convert source code into beautiful, presentation-ready images in seconds — privacy-first, client-side, with Shiki TextMate syntax highlighting and multi-preset batch exports.

[![Deploy to GitHub Pages](https://github.com/nmkdeveloper/beauticode/actions/workflows/deploy.yml/badge.svg)](https://github.com/nmkdeveloper/beauticode/actions/workflows/deploy.yml)
[![CI Test & Build](https://github.com/nmkdeveloper/beauticode/actions/workflows/ci.yml/badge.svg)](https://github.com/nmkdeveloper/beauticode/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

🌐 **Live App**: [https://beauticode.nmkdeveloper.io.vn/](https://beauticode.nmkdeveloper.io.vn/)  
*(Backup GitHub Pages mirror: [https://nmkdeveloper.github.io/beauticode/](https://nmkdeveloper.github.io/beauticode/))*

---

## Highlights

- **Accurate Syntax Highlighting**: Powered by [Shiki](https://shiki.style) using VS Code's real TextMate grammars.
- **20+ Studio Themes**:
  - *Gradients*: Breeze, Candy, Crimson, Falcon, Meadow, Sunset, Ice, Aurora.
  - *Minimal*: Noir, Mono Dark, Sand, Forest, Pure Dark, Slate.
  - *Tech & Brands*: Vercel, Supabase, Tailwind, OpenAI, GitHub, Cyberpunk, Dracula, One Dark, Nord, Solarized.
- **macOS Window Chrome**: Customizable traffic light dots and interactive editable file name title.
- **Privacy-First & 100% Client-Side**: No code is ever sent to an external server. Your code stays strictly in your browser.
- **State Persistence via URL Hash**: Share code snippets effortlessly. All settings (language, theme, padding, background, title, dark mode) encode into URL hash with base64url support.
- **Quick Single Exports**:
  - Save PNG (2x High-Res & 4K Ultra-Res)
  - Save Vector (SVG)
  - Copy Image directly to System Clipboard (`navigator.clipboard.write`)
  - Copy Shareable URL
- **Batch Multi-Preset ZIP Exporter**:
  - **4K Landscape** (3840 × 2160, 16:9)
  - **4K Portrait** (2160 × 3840, 9:16)
  - **FHD Landscape** (1920 × 1080, 16:9)
  - **FHD Portrait** (1080 × 1920, 9:16)
  - **Square 2K** (2160 × 2160, 1:1)
  - **Auto-Fit (Native)**
  - **Custom Dimensions**: Add any width × height preset (e.g. 1200×630 for Twitter / OpenGraph)
  - **Intelligent Auto-Containment**: Code is framed within a 10–15% safe margin using `Math.min(safeWidth / cardWidth, safeHeight / cardHeight)` — ensuring text is never cropped or distorted regardless of screen aspect ratio.
  - Bundled as `.ZIP` using JSZip and downloaded instantly with progress tracking.

---

## Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| <kbd>⌘</kbd> / <kbd>Ctrl</kbd> + <kbd>S</kbd> | Quick Save High-Res PNG (2x) |
| <kbd>⌘</kbd> / <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>S</kbd> | Open Batch Multi-Size ZIP Export Modal |
| <kbd>⌘</kbd> / <kbd>Ctrl</kbd> + <kbd>C</kbd> | Copy Code Card Image to Clipboard (when outside text editor) |
| <kbd>?</kbd> | Toggle Keyboard Shortcuts Modal |
| <kbd>Tab</kbd> | Indent 2 spaces in the editor |
| <kbd>Esc</kbd> | Close active modals & dropdowns |

---

## Tech Stack

- **Framework**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Lucide React
- **Syntax Engine**: Shiki (TextMate Grammars)
- **Image Generation**: html-to-image
- **Batch Compression**: JSZip, file-saver
- **Testing**: Vitest (31 automated unit tests)

---

## Getting Started

### Prerequisites

Node.js v18+ and npm installed.

### Development

```bash
# Clone the repository
git clone git@github.com:nmkdeveloper/beauticode.git
cd beauticode

# Install dependencies
npm install

# Start local Vite development server
npm run dev
```

### Production Build

```bash
# Compile TypeScript and bundle assets
npm run build

# Preview production build locally
npm run preview
```

### Running Tests

```bash
npm test
```

### Deploying to GitHub Pages

This repository includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that automatically builds and deploys to GitHub Pages upon pushing to `main`.

Alternatively, you can deploy manually using:
```bash
npm run deploy
```

---

## Contributing

Contributions, issues, and feature requests are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for details.

---

## License

MIT © 2026 [Nguyen Minh Khoi (nmkdeveloper)](LICENSE)
