# Scope: Milestone 2 — Storefront 2: Editorial Darkroom Runway

## Architecture
- Target file: `tomboy_editorial_darkroom_runway/code.html`
- Exclusive ownership: Milestone 2 worker
- Visual language: Moody, atmospheric cinema-grade brutalism, darkroom red light accents (`neon-red`), high grain lookbook, stark uppercase grotesque typography.
- Responsive strategy: Mobile (< 1024px) transitions to off-canvas darkroom drawer and touch-swipe lookbook carousel; Desktop (>= 1024px) retains 100% desktop darkroom brutalist layout and aesthetic.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Cart Count Removal | Remove `[ 02 ]` badge from navbar cart button (lines 136-139), keep CART text, touch target >= 44x44px | M2 | ORIGINAL_REQUEST §R1, DISPATCH |
| 2 | Clean Naive Injection | Remove flawed script and button injected by `responsive_fix.py` | M2 | DISPATCH, Survey reports |
| 3 | Darkroom Mobile Drawer | Off-canvas sliding drawer (`lg:hidden`), neon-red accents, runway navigation links, backdrop blur, scroll-lock, Esc key dismissal | M2 | ORIGINAL_REQUEST §R2, PROJECT.md |
| 4 | Mobile Touch Carousel | CSS scroll-snap carousel with monospace counter for runway looks on mobile (<1024px), preserving desktop grid | M2 | ORIGINAL_REQUEST §R2, PROJECT.md |
| 5 | Hero Overflow & Typography Fix | Fix absolute/fixed positioning in hero section that clips on <480px, scale typography cleanly | M2 | DISPATCH, Survey reports |
| 6 | Desktop Brutalism Preservation | Maintain 100% aesthetic fidelity on viewports >= 1024px | M2 | PROJECT.md, DISPATCH |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M2.1 | Implementation | Worker modifies `tomboy_editorial_darkroom_runway/code.html` | none | IN_PROGRESS |
| M2.2 | Verification & Audit | 2 Reviewers, 2 Challengers, 1 Forensic Auditor | M2.1 | PLANNED |

## Interface Contracts
### Darkroom Mobile Navigation Drawer Contract
- Trigger Element: `<button id="mobile-menu-trigger" aria-label="Open navigation menu" class="lg:hidden ...">`
- Drawer Container: `<div id="mobile-nav-drawer" ...>` with `<aside id="mobile-drawer-panel" class="fixed inset-y-0 right-0 z-50 ...">`
- Backdrop Overlay: `<div id="mobile-drawer-backdrop" class="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm ...">`
- Close Action: `<button id="mobile-drawer-close" ...>`, backdrop click, and keyboard `Escape` handler.
- Scroll Lock: `document.body.style.overflow = 'hidden'` when open; restored when closed.

### Mobile Touch Carousel Contract
- Track: Container with `class="flex overflow-x-auto snap-x snap-mandatory scrollbar-none ... lg:grid lg:overflow-visible"`
- Items: Cards with `snap-start shrink-0 w-[82vw] sm:w-[60vw] lg:w-auto`
- Monospace Counter: Dynamic counter element `<span id="carousel-counter" class="font-mono text-xs">[ 01 / 04 ]</span>`

### Cart Button Contract
- Navbar Cart Link: `<a href="#cart" class="flex items-center ..."><span>CART</span></a>`
- No Count: Strictly NO `[ 02 ]` or `[ 0 ]` in navbar.
