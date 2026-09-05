# Project: Tomboy Clothing Brutalist Mobile/Tablet Responsive Redesign

## Architecture
The Tomboy Clothing platform comprises 4 brutalist streetwear HTML storefronts, each with a unique visual language, color palette, and layout philosophy:
1. **Latest Drop Storefront** (`tomboy_clothing_home_latest_drop/code.html`): Minimal high-contrast monochrome, bold drop alerts, typography-driven product grids.
2. **Editorial Darkroom Runway** (`tomboy_editorial_darkroom_runway/code.html`): Moody, atmospheric cinema-grade aesthetic, high-grain editorial lookbook, neon-red accents.
3. **Neo Tokyo Color Clash** (`tomboy_neo_tokyo_color_clash/code.html`): Cyber-brutalist acid green / berry magenta, sticker badges, high-saturation product walls.
4. **Raw Brutalist Archive Index** (`tomboy_raw_brutalist_archive_index/code.html`): Stark industrial archival ledger, monospace metadata, exposed 1px grid architecture.

### Global Design & Technical Standards
- **Cart Button Space Optimization**: Zero empty numeric counter badges (`[ 0 ]` or `[ 02 ]`) in navbar. Sleek text (`CART` / `BAG`) with touch target padding $\ge 44 \times 44\text{px}$.
- **Bespoke Mobile Side Navigation Drawer**: High-contrast, theme-tailored off-canvas drawer triggered by brutalist `[ MENU ]` or geometric icon button (hidden on desktop, visible on mobile/tablet). Includes full link hierarchy, backdrop overlay, scroll lock, keyboard `Escape` support, and touch dismiss.
- **Mobile Touch-Swipe Carousel**: Hardware-accelerated CSS scroll-snap (`scroll-snap-type: x mandatory`) carousel with visual peek affordance ($80\text{vw}-85\text{vw}$ cards) and live monospace counters (`01 / 04`) for mobile product sections, gracefully scaling back to multi-column grids on desktop.
- **Fluid Typography & Overflow Prevention**: Responsive clamp scaling on colossal display headings to eliminate horizontal viewport overflow.
- **Image Performance**: Aspect ratio stability (prevent CLS), responsive scaling (`w-full object-cover`), lazy loading for below-the-fold assets, and `viewport-fit=cover`.
- **Desktop Brutalism Preservation**: 100% preservation of existing desktop brutalist typography, hairlines, and aesthetics when viewed on screens $\ge 1024\text{px}$.

---

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Cart Count Removal | Remove `[ 0 ]` and `[ 02 ]` badges from navbar cart buttons across all 4 storefronts | M1, M2, M3, M4 | ORIGINAL_REQUEST §R1, Acceptance Criteria |
| 2 | Legacy Injection Cleanup | Remove flawed, naive button/dropdown injections from `responsive_fix.py` | M1, M2, M3, M4 | Explorer 1 Survey |
| 3 | Mobile Navigation Drawer | Implement high-contrast off-canvas sliding drawer with overlay, scroll-lock, and escape-key handling | M1, M2, M3, M4 | ORIGINAL_REQUEST §R2, Explorer 2/3 Survey |
| 4 | Mobile Touch-Swipe Carousel | Implement CSS scroll-snap touch carousel with live counter and visual peek on product sections | M1, M2, M3, M4 | ORIGINAL_REQUEST §R2, Explorer 2/3 Survey |
| 5 | Fluid Typography & Overflow Fix | Apply responsive type scaling and container constraints to prevent mobile viewport blowout | M1, M2, M3, M4 | Explorer 1/2/3 Survey |
| 6 | Image Optimization & CLS Prevention | Add explicit aspect-ratio constraints, lazy loading, and async decoding | M1, M2, M3, M4 | ORIGINAL_REQUEST §R2, Explorer 3 Survey |
| 7 | Touch Target & Interaction Fixes | Ensure touch targets $\ge 44\text{px}$, make action buttons visible on touchscreens | M1, M2, M3, M4 | Explorer 1/2 Survey |
| 8 | Automated E2E Regression Suite | Comprehensive opaque-box test suite verifying absence of cart badges, presence of drawers & carousels, responsive layout integrity | M-Test, M5 | Project Dual Track |

---

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M-Test | E2E Test Suite Creation | Automated responsive test harness covering all 4 storefronts (Tiers 1-4) | none | DONE |
| M1 | Storefront 1: Latest Drop | Complete responsive redesign of `tomboy_clothing_home_latest_drop/code.html` | none | IN_PROGRESS |
| M2 | Storefront 2: Darkroom Runway | Complete responsive redesign of `tomboy_editorial_darkroom_runway/code.html` | none | IN_PROGRESS |
| M3 | Storefront 3: Neo Tokyo | Complete responsive redesign of `tomboy_neo_tokyo_color_clash/code.html` | none | IN_PROGRESS |
| M4 | Storefront 4: Raw Brutalist | Complete responsive redesign of `tomboy_raw_brutalist_archive_index/code.html` | none | IN_PROGRESS |
| M5 | Final E2E Verification & Review | 100% pass on E2E test suite + adversarial review + forensic audit | M1, M2, M3, M4, M-Test | PLANNED |

---

## Interface Contracts
### Mobile Navigation Drawer Contract
- **Trigger Element**: `<button id="mobile-menu-trigger" aria-label="Open navigation menu" class="lg:hidden ...">` (or `xl:hidden` matching desktop nav breakpoint).
- **Drawer Container**: `<aside id="mobile-drawer" class="fixed inset-y-0 right-0 z-50 transform translate-x-full transition-transform duration-300 ease-in-out ...">`
- **Backdrop Overlay**: `<div id="mobile-drawer-backdrop" class="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm opacity-0 pointer-events-none transition-opacity duration-300">`
- **Close Action**: Button with `id="mobile-drawer-close"`, plus backdrop click, plus `Escape` keydown, plus touch swipe-to-close.
- **Scroll Lock**: `document.body.style.overflow = 'hidden'` when open; restored when closed.

### Mobile Touch Carousel Contract
- **Track**: Container with `class="flex overflow-x-auto snap-x snap-mandatory scrollbar-none ... md:grid md:overflow-visible"`
- **Items**: Each card with `class="w-[82vw] sm:w-[60vw] md:w-auto shrink-0 snap-start ..."`
- **Monospace Counter**: Live slide counter element `<span id="carousel-counter" class="font-mono text-xs">[ 01 / 04 ]</span>` updating dynamically on scroll.

### Cart Button Contract
- **Navbar Cart Link**: `<a href="#cart" class="flex items-center ..."><span>CART</span></a>` (or `BAG`).
- **No Count**: Must NOT contain `[ 0 ]`, `[ 02 ]`, or any bracketed count string inside the navbar.

---

## Code Layout
- Storefront 1: `tomboy_clothing_home_latest_drop/code.html`
- Storefront 2: `tomboy_editorial_darkroom_runway/code.html`
- Storefront 3: `tomboy_neo_tokyo_color_clash/code.html`
- Storefront 4: `tomboy_raw_brutalist_archive_index/code.html`
- E2E Tests: `tests/test_responsive_storefronts.py`
- Test Config & Runners: `TEST_INFRA.md`, `TEST_READY.md`
