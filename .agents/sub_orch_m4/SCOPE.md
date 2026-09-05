# Scope: Milestone 4 (Storefront 4: Raw Brutalist Archive Index)

## Target
- **Target File**: `tomboy_raw_brutalist_archive_index/code.html`
- **Exclusively Owned By**: Worker for M4
- **Working Directory**: `c:\Users\devde\OneDrive\Desktop\Demo projects\Mint-more\tomboy clothing\.agents\sub_orch_m4`

## Architecture & Visual Aesthetic
- **Theme**: Raw Technical Brutalist Archive Index (`tomboy_raw_brutalist_archive_index/code.html`).
- **Visual Design**: Stark industrial ledger, `#f4f3ef` parchment background, high-contrast dark text, 1px exposed hairline grid lines (`divide-grid-line`, `border-grid-line`), monospace telemetry (`Space Mono`), barcode accents, tabular layout matrices.
- **Framework & Libraries**: Pure Vanilla HTML5/CSS/JavaScript with in-browser Tailwind Play CDN (`cdn.tailwindcss.com?plugins=forms,container-queries`) and Google Material Symbols Outlined. Zero npm/node build dependencies. Must run standalone and inside the root `index.html` iframe viewer.

## Feature Inventory (Milestone 4)
| # | Feature | Specification for M4 | Acceptance Criteria |
|---|---------|----------------------|---------------------|
| 1 | Cart Count Removal | In header utility matrix (lines 161–164), remove the `[ 0 ]` badge completely. Keep `CART` label and ensure touch target padding $\ge 44 \times 44\text{px}$. | `[ 0 ]` badge completely absent from navbar; touch target $\ge 44\text{px}$. |
| 2 | Legacy Injection Cleanup | Completely remove flawed `<!-- RESPONSIVE ENHANCEMENTS -->` script and style blocks (lines 906–959) injected by `responsive_fix.py`. Ensure no leftover DOM mutations or dark `#080808` dropdowns corrupt the 12-column grid. | Zero traces of naive `responsive_fix.py` script. Clean 12-column header grid. |
| 3 | Archival Mobile Drawer | Archival off-canvas sliding drawer (`#mobile-drawer`) triggered by dedicated brutalist button (`#mobile-menu-trigger`) with `lg:hidden`. Matching parchment `#f4f3ef` surface, 1px raw hairline borders, monospace navigation links (`//01 ARCHIVE`, `//02 CAPSULE`, `//03 OBJECTS`, `//04 RUNWAY`, `//05 MATRIX`), backdrop overlay (`#mobile-drawer-backdrop`), close button (`#mobile-drawer-close`), body scroll-lock, keyboard `Escape` dismissal, and touch-dismiss. | Drawer slides smoothly on mobile/tablet; backdrop blurs; escape key closes; desktop nav visible on $\ge 1024\text{px}$. |
| 4 | Mobile Touch Carousel | In Systematic Archive Catalog (`#catalog`), convert the multi-column product cards grid into a horizontal CSS scroll-snap carousel (`scroll-snap-type: x mandatory`) on mobile/tablet viewports ($< 1024\text{px}$) with $82\text{vw}$ peek cards and live monospace counter `[ 01 / 04 ]` (`#carousel-counter`) updating dynamically via scroll/IntersectionObserver. Tabular grid remains intact on desktop ($\ge 1024\text{px}$). | Horizontal swipe works on mobile; visual peek present; live counter updates; desktop grid intact. |
| 5 | Watermark & Overflow Fix | Constrain huge `text-[140px]` background watermark `"004"` and technical spec metadata so they scale gracefully on small viewports and never cause horizontal scroll blowout on screens $< 400\text{px}$. Add `viewport-fit=cover` to `<meta name="viewport">` and ensure `overflow-x: hidden` safety. | Zero horizontal scrollbars at 320px, 375px, 414px, 768px, 1024px, 1440px. |
| 6 | Touch Target & Interaction Fixes | Ensure all interactive buttons, filter pills, and links meet $\ge 44 \times 44\text{px}$ touch targets. Make "QUICK ADD" / "RESTRICTED 1/120" actions accessible on mobile/touch screens rather than locked behind desktop `:hover`. | Accessible touch targets; quick add usable on touch. |
| 7 | Desktop Brutalism Preservation | 100% preservation of original desktop layout, exposed 12-column grid, divide lines, Tokyo live clock, and tabular typography when viewed on screens $\ge 1024\text{px}$. Desktop nav remains visible and untouched. | Desktop view pixel-perfect and visually faithful to original. |

## Interface Contracts

### 1. Mobile Navigation Drawer Contract
- **Trigger**:
  ```html
  <button id="mobile-menu-trigger" class="flex lg:hidden items-center justify-center min-w-[44px] min-h-[44px] px-3 border-l border-grid-line bg-surface hover:bg-black hover:text-white transition-colors font-mono-code text-[11px] font-bold" aria-label="Open Archive Navigation" aria-expanded="false" aria-controls="mobile-drawer">
    <span class="material-symbols-outlined text-[20px]">menu</span>
  </button>
  ```
- **Drawer Container**:
  ```html
  <div id="mobile-drawer" class="fixed inset-0 z-50 pointer-events-none opacity-0 transition-opacity duration-300 ease-in-out" role="dialog" aria-modal="true" aria-hidden="true" aria-label="Archival Navigation Menu">
  ```
- **Backdrop**:
  ```html
  <div id="mobile-drawer-backdrop" class="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"></div>
  ```
- **Drawer Panel**:
  ```html
  <aside id="mobile-drawer-panel" class="absolute top-0 right-0 w-[85vw] max-w-[380px] h-full bg-[#f4f3ef] text-black border-l-2 border-grid-line flex flex-col justify-between transform translate-x-full transition-transform duration-300 ease-out shadow-2xl overflow-y-auto">
  ```
- **Close Button**: `#mobile-drawer-close` button ($\ge 44 \times 44\text{px}$), backdrop click, `Escape` keydown, and clicking any nav link inside drawer.
- **Scroll Locking**: Sets `document.body.style.overflow = 'hidden'` when open; restores empty string `''` when closed.

### 2. Cart Button Contract
- **Markup**:
  ```html
  <a class="flex items-center gap-2 px-5 min-h-[44px] bg-black text-white hover:bg-secondary transition-colors font-mono-code text-[11px] font-bold tracking-widest" href="#cart" aria-label="Archive Cart">
    <span>CART</span>
  </a>
  ```
- **Constraint**: Must NOT contain `[ 0 ]`, `[ 02 ]`, or any bracketed number text node.

### 3. Touch Carousel Contract
- **Live Counter**:
  ```html
  <span id="carousel-counter" class="font-mono-code text-[11px] bg-black text-white px-2 py-0.5 tracking-wider">[ 01 / 04 ]</span>
  ```
- **Carousel Track**:
  ```html
  <div id="archive-catalog-carousel" class="flex lg:grid overflow-x-auto lg:overflow-visible snap-x snap-mandatory lg:snap-none pb-4 lg:pb-0 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-grid-line scrollbar-none" style="-webkit-overflow-scrolling: touch;">
  ```
- **Slide Items**:
  ```html
  <article class="snap-start shrink-0 w-[82vw] sm:w-[60vw] lg:w-auto lg:shrink group flex flex-col justify-between bg-surface relative hover:bg-surface-dim/30 transition-colors border-b lg:border-b-0 border-grid-line">
  ```
- **JS Dynamic Tracking**: Uses `IntersectionObserver` or scroll listener on `#archive-catalog-carousel` slides to update `#carousel-counter` dynamically as user swipes.

## Verification Protocol
1. Static analysis: `[ 0 ]` must not be present in `tomboy_raw_brutalist_archive_index/code.html`.
2. Static analysis: `responsive_fix.py` injected script and style blocks must be removed.
3. DOM verification: `#mobile-menu-trigger`, `#mobile-drawer`, `#mobile-drawer-backdrop`, `#mobile-drawer-panel`, `#mobile-drawer-close` exist with appropriate classes and accessibility attributes.
4. DOM verification: `#archive-catalog-carousel`, `#carousel-counter`, scroll-snap classes exist and function.
5. Visual check: Desktop layout on $\ge 1024\text{px}$ remains 100% faithful to raw brutalist grid aesthetic.
6. Reviewer inspection: Code structure, responsiveness, and aesthetics verified.
7. Challenger verification: Viewport responsiveness, drawer interaction, carousel swipe interaction.
8. Forensic Auditor verification: Genuine implementation, no hardcoded cheating, no facades.
