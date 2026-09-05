# Scope: Milestone 3 — Storefront 3: Neo Tokyo Color Clash

## Architecture
- **Target**: `tomboy_neo_tokyo_color_clash/code.html`
- **Visual Aesthetic**: Cyber-brutalist acid green / berry magenta palette, bold borders (2px/3px black), sharp offset drop shadows, sticker badges, and high-impact typography.
- **Mobile Navigation**: Off-canvas sliding drawer (`#mobile-drawer`) triggered by brutalist `[ MENU ]` button, accompanied by backdrop overlay (`#mobile-drawer-backdrop`), scroll-lock, and escape-key handling.
- **Mobile Product Section**: CSS scroll-snap touch carousel (`scroll-snap-type: x mandatory`) with visual peek affordance ($80\text{vw}-85\text{vw}$) and dynamic monospace counter (`[ 01 / 04 ]`), gracefully scaling back to multi-column grid on desktop ($\ge 1024\text{px}$).
- **Cart Button**: Elimination of empty count badge (`[ 0 ]`), keeping `BAG` text with touch target $\ge 44 \times 44\text{px}$.
- **Header Utility De-Cluttering**: Secondary utility items relocated to drawer on mobile to prevent navbar compression on 360px-390px viewports.
- **Cleanup**: Removal of flawed naive injections from `responsive_fix.py`.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Cart Count Removal | Remove `[ 0 ]` badge from navbar `BAG` button | M3 | ORIGINAL_REQUEST §R1, DISPATCH §1 |
| 2 | Legacy Injection Cleanup | Strip naive scripts/dropdown injected by responsive_fix.py | M3 | DISPATCH §2 |
| 3 | Cyber-Brutalist Mobile Drawer | Bespoke slide drawer with acid/magenta styling, scroll-lock, Esc dismiss | M3 | ORIGINAL_REQUEST §R2, DISPATCH §3 |
| 4 | Mobile Touch-Swipe Carousel | CSS scroll-snap carousel with live monospace counter | M3 | ORIGINAL_REQUEST §R2, DISPATCH §4 |
| 5 | Header Utility De-Cluttering | Group secondary header actions into drawer for narrow viewports (360-390px) | M3 | DISPATCH §5 |
| 6 | Desktop Neo-Tokyo Preservation | 100% preservation of desktop brutalist typography and aesthetic ($\ge 1024\text{px}$) | M3 | ORIGINAL_REQUEST §R2, DISPATCH §6 |

## Milestones & Execution Strategy
- Assessed: Scope is tightly coupled to `tomboy_neo_tokyo_color_clash/code.html`.
- Execution: Direct Iteration Loop 2B (Explorers -> Worker -> Reviewers -> Challengers -> Forensic Auditor -> Gate).

## Interface Contracts
### Mobile Navigation Drawer Contract
- **Trigger Element**: `<button id="mobile-menu-trigger" aria-label="Open navigation menu" class="lg:hidden ...">`
- **Drawer Container**: `<aside id="mobile-drawer" class="fixed inset-y-0 right-0 z-50 transform translate-x-full transition-transform duration-300 ease-in-out ...">`
- **Backdrop Overlay**: `<div id="mobile-drawer-backdrop" class="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm opacity-0 pointer-events-none transition-opacity duration-300">`
- **Close Action**: Button with `id="mobile-drawer-close"`, plus backdrop click, plus `Escape` keydown, plus touch swipe-to-close.
- **Scroll Lock**: `document.body.style.overflow = 'hidden'` when open; restored when closed.
- **Drawer Contents**: Navigation hierarchy (`INDEX`, `WALL`, `COLLABS`, `ARCHIVE`), plus secondary header utilities and currency/region toggles.

### Mobile Touch Carousel Contract
- **Track**: Container with `class="flex overflow-x-auto snap-x snap-mandatory scrollbar-none ... lg:grid lg:overflow-visible"`
- **Items**: Each card sized `w-[82vw] sm:w-[60vw] lg:w-auto shrink-0 snap-start ...`
- **Monospace Counter**: Live slide counter element `<span id="carousel-counter" class="font-mono text-xs">[ 01 / 04 ]</span>` updating dynamically on scroll.

### Cart Button Contract
- **Navbar Bag Link**: `<a href="#cart" class="flex items-center ..."><span>BAG</span></a>`
- **No Count**: Must NOT contain `[ 0 ]` or any bracketed count string inside the navbar.
- **Touch Target**: Min dimensions $44 \times 44\text{px}$.
