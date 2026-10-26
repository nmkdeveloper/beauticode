# BeautiCode: Code-to-Image Web Application Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build "BeautiCode", an ultra-sleek, privacy-first, client-side web application that converts source code into beautiful, shareable images with rich themes, custom window chrome, and a flexible multi-preset batch exporter (4K/FHD portrait & landscape, square, custom) packaged into a ZIP.

**Architecture:** Client-side Single Page Application using Vite + React + TypeScript. Code syntax highlighting powered by Shiki (TextMate grammars identical to VS Code & Ray.so). Image rendering rendered via `html-to-image` using high-DPI scaling and auto-containment calculations, bundled into ZIP files with `jszip` and downloaded via `file-saver`. State synchronization preserved in URL hash via base64url/lz-string.

**Tech Stack:** React 19 / 18, TypeScript, Vite, Tailwind CSS, Lucide React, Shiki, html-to-image, jszip, file-saver.

**Spec:** Designed based on user requirements and Ray.so reference screenshots:
- Central interactive code editor with syntax highlighting, line numbers, customizable macOS window controls, and file title.
- Control bar: Language selector (with auto-detect heuristics), theme selector (20+ themes: Noir, Breeze, Falcon, Crimson, Vercel, Supabase, Tailwind, OpenAI, etc.), padding options (16, 32, 64, 128px), background visibility, dark/light mode toggle.
- Single Export: Quick PNG / SVG / Copy to Clipboard / Copy shareable URL.
- Batch Export Modal: Multi-preset selection (4K Landscape 3840x2160, 4K Portrait 2160x3840, FHD Landscape 1920x1080, FHD Portrait 1080x1920, Square 2160x2160, Auto-fit/Native), custom size builder, auto-scaling safe-containment algorithm to guarantee code is never cut off or warped, and "Download All as ZIP" (.zip).
- Design Taste: Anti-slop, true-black-flat aesthetic with clean typography, refined spacing, zero unnecessary visual clutter.

## Global Constraints

- 100% client-side execution; no backend server required.
- High-fidelity export: 4K outputs must render crisp text using devicePixelRatio / scale scaling without pixelation.
- Responsive layout: Usable on desktop and tablet with mobile preview responsiveness.
- Zero data loss: Code stays strictly in the user's browser.
- Presets must auto-contain code within a 10-15% safe margin regardless of aspect ratio (16:9, 9:16, 1:1).

## Review Focus

1. **Large code blocks exceeding 4K vertical/horizontal dimensions**: Verified that the auto-scaler calculates `Math.min(scaleX, scaleY)` to fit without clipping or overflow.
2. **Special characters & Unicode in code**: Verifies that languages with non-ASCII symbols (Vietnamese comments, emojis, special operators) render properly without encoding corruption.
3. **High-DPI rendering performance and memory**: Verifies that rendering multiple 4K canvases in sequence for ZIP packaging does not trigger browser out-of-memory crashes by releasing canvas objects sequentially.
4. **Clipboard image write API compatibility**: Gracefully falls back if `navigator.clipboard.write` with PNG Blob is restricted by browser permissions.
5. **URL hash length & decompression safety**: Handles extremely long snippets gracefully without breaking URL limits.

---

### Task 1: Project Initialization & Dependency Setup

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `tailwind.config.js`
- Create: `postcss.config.js`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/index.css`

**Interfaces:**
- Produces: Working React + Vite + Tailwind CSS development environment with required dependencies (`shiki`, `lucide-react`, `html-to-image`, `jszip`, `file-saver`, `clsx`, `tailwind-merge`).

- [ ] **Step 1: Initialize package.json and install dependencies**
  Install `react`, `react-dom`, `lucide-react`, `shiki`, `html-to-image`, `jszip`, `file-saver`, `clsx`, `tailwind-merge` as dependencies; `typescript`, `@types/react`, `@types/react-dom`, `@types/file-saver`, `vite`, `@vitejs/plugin-react`, `tailwindcss`, `autoprefixer`, `postcss` as devDependencies.

- [ ] **Step 2: Configure Vite, Tailwind, PostCSS, and TypeScript**
  Configure `vite.config.ts`, `tailwind.config.js` with dark mode support and custom fonts/colors, `tsconfig.json` with strict type checking.

- [ ] **Step 3: Setup index.html and root styling**
  Add modern typography (`JetBrains Mono` / `Fira Code` / `Inter` from Google Fonts) and standard reset in `src/index.css`.

- [ ] **Step 4: Verify initial build and dev server**
  Run `npm run build` to verify clean compilation without errors.

- [ ] **Step 5: Commit**
  ```bash
  git add .
  git commit -m "chore: initialize project with React, Vite, Tailwind, and core dependencies"
  ```

---

### Task 2: Themes & Language Presets Configuration

**Files:**
- Create: `src/types/index.ts`
- Create: `src/constants/themes.ts`
- Create: `src/constants/languages.ts`
- Create: `src/constants/presets.ts`

**Interfaces:**
- Produces:
  - `Theme` interface and `THEMES` list (20+ themes: Noir, Breeze, Candy, Falcon, Ice, Sand, Forest, Crimson, Meadow, Mono, Vercel, Supabase, Tailwind, OpenAI, GitHub Dark, Cyberpunk, Dracula, One Dark, Nord, Solarized).
  - `Language` interface and `LANGUAGES` list (C++, C, JavaScript, TypeScript, Python, Rust, Go, Java, HTML, CSS, JSON, SQL, Bash, Markdown, PHP, Swift, Kotlin, Dart).
  - `ExportPreset` interface and `DEFAULT_PRESETS` list (4K Landscape 3840x2160, 4K Portrait 2160x3840, FHD Landscape 1920x1080, FHD Portrait 1080x1920, Square 2160x2160, Auto-fit).

- [ ] **Step 1: Define TypeScript models in `src/types/index.ts`**
  Define `Theme`, `Language`, `ExportPreset`, `EditorSettings`, `ExportOptions`.

- [ ] **Step 2: Implement `src/constants/themes.ts`**
  Implement theme definitions with background styles (radial gradients, linear gradients, solid dark/light tones), card backgrounds, text contrast tokens, and matching Shiki highlighter themes.

- [ ] **Step 3: Implement `src/constants/languages.ts`**
  Implement language list with display names, Shiki language IDs, and simple auto-detection heuristics (regex patterns for keywords like `#include`, `def `, `const `, `fn `, `public class`).

- [ ] **Step 4: Implement `src/constants/presets.ts`**
  Define 4K, FHD, Square, and Auto-fit preset dimensions and descriptions.

- [ ] **Step 5: Verify types and constants**
  Run `npx tsc --noEmit` to verify type definitions.

- [ ] **Step 6: Commit**
  ```bash
  git add src/types/ src/constants/
  git commit -m "feat: define theme, language, and export preset data structures"
  ```

---

### Task 3: Shiki Syntax Highlighting & Code Card Component

**Files:**
- Create: `src/services/highlighter.ts`
- Create: `src/components/CodeWindow.tsx`
- Create: `src/components/MacControls.tsx`
- Modify: `src/index.css`

**Interfaces:**
- Consumes: `Theme`, `Language`, `EditorSettings` from `src/types/index.ts`.
- Produces:
  - `highlightCode(code: string, lang: string, theme: string): Promise<string>`
  - `<CodeWindow />`: Component rendering the macOS title bar with editable file title, line numbers, editable textarea overlay, and highlighted code container.

- [ ] **Step 1: Implement `src/services/highlighter.ts`**
  Initialize Shiki highlighter singleton with support for required languages and dual dark/light themes.

- [ ] **Step 2: Build `src/components/MacControls.tsx`**
  Create macOS traffic light buttons (red, yellow, green dots) and title bar with optional interactive file name editing.

- [ ] **Step 3: Build `src/components/CodeWindow.tsx`**
  Implement the code card:
  - Synchronized transparent textarea for user editing.
  - Formatted syntax highlighted background layer.
  - Left line numbers gutter with toggle.
  - Drop shadow and border styling conforming to the selected theme.

- [ ] **Step 4: Test syntax highlighting and editing**
  Verify code editing updates highlight in real-time with zero lag.

- [ ] **Step 5: Commit**
  ```bash
  git add src/services/highlighter.ts src/components/CodeWindow.tsx src/components/MacControls.tsx
  git commit -m "feat: implement Shiki syntax highlighting and macOS code window component"
  ```

---

### Task 4: Interactive Canvas & Studio Controls

**Files:**
- Create: `src/components/StudioCanvas.tsx`
- Create: `src/components/ControlBar.tsx`
- Create: `src/components/ThemeSelector.tsx`
- Create: `src/components/LanguageSelector.tsx`
- Create: `src/components/Header.tsx`
- Create: `src/hooks/useEditorState.ts`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `CodeWindow`, `THEMES`, `LANGUAGES`.
- Produces: Full interactive studio with real-time preview, control bar at the bottom, theme picker modal/popover, language search dropdown, padding adjuster (16, 32, 64, 128px), background toggle, and dark mode toggle.

- [ ] **Step 1: Implement `src/hooks/useEditorState.ts`**
  State management for code text, language, theme, padding, line numbers, background visibility, title, and URL hash encoding/decoding.

- [ ] **Step 2: Build `src/components/LanguageSelector.tsx`**
  Searchable dropdown with auto-detect option and common programming languages.

- [ ] **Step 3: Build `src/components/ThemeSelector.tsx`**
  Dropdown/popover with theme categories (Gradients, Minimal, Dark, Partner/Tech themes) and color swatches.

- [ ] **Step 4: Build `src/components/ControlBar.tsx`**
  Floating bottom action bar matching ray.so layout: Theme, Background toggle, Dark mode toggle, Line numbers toggle, Padding segmented control, Language selector.

- [ ] **Step 5: Build `src/components/StudioCanvas.tsx` & `src/components/Header.tsx`**
  Canvas container with responsive auto-zoom/fit so that users with any screen size see the full code card comfortably centered.

- [ ] **Step 6: Integrate into `src/App.tsx` and test**
  Verify state updates, theme switching, padding changing, and responsive behavior.

- [ ] **Step 7: Commit**
  ```bash
  git add src/components/ src/hooks/ src/App.tsx
  git commit -m "feat: implement studio canvas, floating control bar, and theme/language selectors"
  ```

---

### Task 5: Single Export & Clipboard Integration

**Files:**
- Create: `src/services/imageExporter.ts`
- Create: `src/components/ExportDropdown.tsx`
- Modify: `src/components/Header.tsx`

**Interfaces:**
- Consumes: Studio canvas DOM node ref.
- Produces:
  - `exportSingleImage(node: HTMLElement, format: 'png' | 'svg', scale: number, filename: string): Promise<void>`
  - `copyImageToClipboard(node: HTMLElement, scale: number): Promise<boolean>`
  - Quick export dropdown: Save PNG, Save SVG, Copy Image, Copy URL, Open Batch Export Modal.

- [ ] **Step 1: Implement single export logic in `src/services/imageExporter.ts`**
  Use `html-to-image` (`toPng`, `toSvg`, `toBlob`) with pixelRatio configuration (2x, 4x, etc.) for ultra-crisp output.

- [ ] **Step 2: Implement clipboard copy with fallback**
  Use `navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])` with toast notification for success/error.

- [ ] **Step 3: Implement URL hash sharing**
  Encode editor state into URL hash (`#code=...&lang=...&theme=...`) and handle copy link action.

- [ ] **Step 4: Build `src/components/ExportDropdown.tsx`**
  Menu matching Ray.so export menu with shortcut labels and "Batch Export (Multi-size ZIP)" prominent action.

- [ ] **Step 5: Test single export and clipboard**
  Verify PNG download, SVG download, and clipboard copy work smoothly.

- [ ] **Step 6: Commit**
  ```bash
  git add src/services/imageExporter.ts src/components/ExportDropdown.tsx src/components/Header.tsx
  git commit -m "feat: implement single image export, clipboard copy, and URL sharing"
  ```

---

### Task 6: Multi-Preset Batch Exporter & ZIP Generator

**Files:**
- Create: `src/services/batchExporter.ts`
- Create: `src/components/BatchExportModal.tsx`
- Create: `src/components/PresetItem.tsx`
- Modify: `src/components/ExportDropdown.tsx`

**Interfaces:**
- Consumes: `DEFAULT_PRESETS`, code card element, theme settings.
- Produces:
  - `renderPresetImage(codeCard: HTMLElement, preset: ExportPreset, theme: Theme): Promise<Blob>`
  - `exportBatchZip(codeCard: HTMLElement, presets: ExportPreset[], theme: Theme, baseName: string, onProgress: (p: number) => void): Promise<void>`
  - `<BatchExportModal />`: Modal with preset toggles (4K Portrait, 4K Landscape, FHD Portrait, FHD Landscape, Square, Custom), custom width/height input, live ratio preview indicator, individual download button per preset, and "Export All (.ZIP)" button with progress bar.

- [ ] **Step 1: Implement Auto-Containment Algorithm in `src/services/batchExporter.ts`**
  Construct a virtual/offscreen rendering container sized to exact preset dimensions (e.g. 3840x2160 or 2160x3840).
  Calculate:
  ```ts
  const safeWidth = targetWidth * 0.85;
  const safeHeight = targetHeight * 0.85;
  const scale = Math.min(1, safeWidth / cardWidth, safeHeight / cardHeight);
  ```
  Center the code card within the preset background, applying the scale transform so code is perfectly framed and never cropped.

- [ ] **Step 2: Implement ZIP Packaging with JSZip & FileSaver**
  Iterate through selected presets, render each canvas offscreen, append to `JSZip` instance, track progress percentage, and trigger `saveAs(zipBlob, 'beauticode-export.zip')`.

- [ ] **Step 3: Build `src/components/PresetItem.tsx` & `src/components/BatchExportModal.tsx`**
  Create rich UI modal:
  - Checkboxes for presets with badge labels (4K, 16:9, 9:16, 1:1, etc.).
  - Custom size adder (Width, Height, Label).
  - Progress bar during generation.
  - Download individual image button on each preset card.
  - "Export All (N images) as .ZIP" primary action.

- [ ] **Step 4: Test batch export**
  Test batch export with 4K portrait, 4K landscape, FHD, and Square presets. Inspect generated ZIP file to ensure all images contain properly centered, sharp code.

- [ ] **Step 5: Commit**
  ```bash
  git add src/services/batchExporter.ts src/components/BatchExportModal.tsx src/components/PresetItem.tsx
  git commit -m "feat: implement multi-preset batch export with intelligent auto-containment and ZIP packaging"
  ```

---

### Task 7: UI Polish, Tasteskill Aesthetics & Responsive Testing

**Files:**
- Modify: `src/components/*`
- Modify: `src/index.css`
- Modify: `README.md`

**Interfaces:**
- Ensures compliance with `design-taste-frontend` (`true-black-flat` dark aesthetic, anti-slop typography, keyboard shortcuts, accessible focus states).

- [ ] **Step 1: Apply taste-skill design principles**
  Refine typography, remove unnecessary borders/shadows from inactive elements, ensure color is strictly on data/code, add subtle hover/active micro-interactions.

- [ ] **Step 2: Add keyboard shortcuts**
  Support Cmd/Ctrl+S (Quick Save), Cmd/Ctrl+Shift+S (Batch Export), Cmd/Ctrl+C (Copy Image).

- [ ] **Step 3: Mobile & Tablet preview check**
  Ensure control bar wraps cleanly or scrolls horizontally on smaller viewports.

- [ ] **Step 4: Run production build & verify**
  Run `npm run build` and test the production bundle with `npm run preview`.

- [ ] **Step 5: Commit**
  ```bash
  git add .
  git commit -m "polish: apply taste-skill design rules, keyboard shortcuts, and responsive refinements"
  ```

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-10-26-beauticode-code-to-image.md`.
