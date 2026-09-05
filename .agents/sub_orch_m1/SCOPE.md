# Scope: Milestone 1 (Storefront 1: Latest Drop)

## Target
- **Target File**: `tomboy_clothing_home_latest_drop/code.html`
- **Exclusively Owned By**: Worker for M1

## Architecture & Visual Aesthetic
- Industrial Brutalist Mono-Drop (`tomboy_clothing_home_latest_drop/code.html`): High-contrast off-white/black aesthetic with crimson red (`#ba002c`, `#e8043a`) accents, Space Grotesk display headings, Space Mono price tags/specifications, and 1px crisp outline borders.
- Pure Vanilla HTML5/CSS/JavaScript with in-browser Tailwind Play CDN (`cdn.tailwindcss.com`) and Google Material Symbols Outlined.
- Zero npm/node build step dependencies; fully functional standalone and inside the root `index.html` iframe viewer.

## Feature Inventory (Milestone 1)
| # | Feature | Specification for M1 | Acceptance Criteria |
|---|---------|----------------------|---------------------|
| 1 | Cart Count Removal | In header utility flex row (line 4), eliminate `[ 0 ]` text node entirely. Keep `CART` label and shopping bag icon. Increase touch target padding to $\ge 44 \times 44\text{px}$. | `[ 0 ]` completely absent from navbar; touch target $\ge 44\text{px}$. |
| 2 | Legacy Injection Cleanup | Completely remove flawed `<!-- RESPONSIVE ENHANCEMENTS -->` block and injected script at the bottom of the file (`responsive_fix.py` legacy code). Correct malformed class `grid-cols-1 md:grid-cols-2 md:grid-cols-4` to clean responsive classes. | Zero traces of naive `responsive_fix.py` script. |
| 3 | Mobile Navigation Drawer | High-contrast industrial brutalist off-canvas sliding drawer (`#s1-drawer`) triggered by dedicated button (`#s1-drawer-trigger`) with `xl:hidden`. Includes backdrop overlay (`#s1-backdrop`), close button (`#s1-drawer-close`), body scroll-lock, keyboard `Escape` dismissal, click-outside dismissal, and link click auto-dismissal. Full navigation links (`ARRIVALS`, `TOPS & TEES`, `OUTERWEAR`, `EDITORIAL`, `LOOKBOOK`, `COLLABS`). | Drawer slides smoothly on mobile/tablet; backdrop blurs; escape key closes; desktop nav visible on $\ge 1280\text{px}$. |
| 4 | Mobile Touch-Swipe Carousel | In Section 2 ("NEW ARRIVALS"), convert 4-column desktop grid into a horizontal CSS scroll-snap carousel (`scroll-snap-type: x mandatory`) on mobile viewports ($< 768\text{px}$) with $82\text{vw}$ peek cards and live monospace counter `[ 01 / 04 ]` (`#s1-arrivals-counter`) updated dynamically. Smoothly transitions to 2-column grid on tablet and 4-column grid on desktop. | Horizontal swipe works on mobile; visual peek present; live counter updates; desktop grid intact. |
| 5 | Fluid Typography & Overflow Prevention | Scale hero headline (`font-display-hero`) using responsive sizing (`text-4xl sm:text-6xl lg:text-7xl xl:text-display-hero`) so headlines like "YOUTH." never clip or cause horizontal scrollbar blowout on 320px–390px screens. Add `viewport-fit=cover` to `<meta name="viewport">`. | No horizontal scrollbars at 320px, 375px, 414px, 768px, 1280px. |
| 6 | Image Optimization & CLS Prevention | Hero banner images use `loading="eager"` and `fetchpriority="high"`. Below-the-fold product and editorial images use `loading="lazy"` and `decoding="async"`. All image containers have explicit aspect ratio constraints. | Fast LCP; zero CLS reflow. |
| 7 | Touch Target & Interaction Fixes | Ensure all interactive buttons, filter tabs, size pills, and links meet $\ge 44 \times 44\text{px}$ touch targets. Make "QUICK ADD +" visible on mobile/touch screens (e.g. permanent button or touch affordance) rather than locked behind desktop-only `:hover`. | Accessible touch targets; quick add usable on touch. |
| 8 | Desktop Brutalism Preservation | 100% preservation of original desktop layout, spacing, hairlines, and typography when viewed on screens $\ge 1280\text{px}$. Desktop nav remains visible and untouched. | Desktop view pixel-perfect and visually faithful to original. |

## Interface Contracts

### 1. Mobile Navigation Drawer Contract
- **Trigger**:
  ```html
  <button id="s1-drawer-trigger" class="flex xl:hidden items-center justify-center min-w-[44px] min-h-[44px] p-2 text-primary border border-outline-variant hover:bg-primary hover:text-on-primary transition-colors" aria-label="Open Navigation Menu" aria-expanded="false" aria-controls="s1-drawer">
    <span class="material-symbols-outlined text-[24px]">menu</span>
  </button>
  ```
- **Drawer Container**:
  ```html
  <div id="s1-drawer" class="fixed inset-0 z-50 pointer-events-none opacity-0 transition-opacity duration-300 ease-in-out" role="dialog" aria-modal="true" aria-hidden="true" aria-label="Site Navigation">
  ```
- **Backdrop**:
  ```html
  <div id="s1-backdrop" class="absolute inset-0 bg-primary/80 backdrop-blur-sm cursor-pointer"></div>
  ```
- **Drawer Panel**:
  ```html
  <aside id="s1-panel" class="absolute top-0 right-0 w-[85vw] max-w-[380px] h-full bg-surface text-on-surface border-l-2 border-primary flex flex-col justify-between transform translate-x-full transition-transform duration-300 ease-out shadow-2xl overflow-y-auto">
  ```
- **Close Action**: `#s1-drawer-close` button ($\ge 44 \times 44\text{px}$), backdrop click, `Escape` keydown, and clicking any nav link inside drawer.
- **Scroll Locking**: Sets `document.body.style.overflow = 'hidden'` when open; restores empty string `''` when closed.

### 2. Cart Button Contract
- **Markup**:
  ```html
  <a class="flex items-center gap-2 min-h-[44px] px-4 py-2.5 bg-primary text-on-primary hover:bg-surface-container-highest hover:text-on-surface transition-colors font-label-caps-md text-xs tracking-wider" data-path="cart" href="#" aria-label="Shopping Cart">
    <span class="material-symbols-outlined text-[18px]">shopping_bag</span>
    <span>CART</span>
  </a>
  ```
- **Constraint**: Must NOT contain `[ 0 ]`, `[ 02 ]`, or any bracketed count text.

### 3. Touch Carousel Contract
- **Live Counter**:
  ```html
  <span id="s1-arrivals-counter" class="font-price-tag bg-primary text-on-primary px-2 py-0.5">[ 01 / 04 ]</span>
  ```
- **Carousel Track**:
  ```html
  <div id="s1-arrivals-carousel" class="flex sm:grid overflow-x-auto sm:overflow-visible snap-x snap-mandatory sm:snap-none pb-4 sm:pb-0 gap-unit-4 sm:grid-cols-2 lg:grid-cols-4 scrollbar-none" style="-webkit-overflow-scrolling: touch;">
  ```
- **Slide Items**:
  ```html
  <article class="snap-start shrink-0 w-[82vw] sm:w-auto sm:shrink group flex flex-col bg-surface-container-lowest border border-outline-variant/40">
  ```
- **JS Dynamic Tracking**: Uses `IntersectionObserver` on `#s1-arrivals-carousel` slides to update `#s1-arrivals-counter` dynamically as user swipes.

## Verification Protocol
1. Static analysis verifying `[ 0 ]` is completely removed from navbar.
2. Static analysis verifying `responsive_fix.py` injected code is removed.
3. DOM verification of `#s1-drawer-trigger`, `#s1-drawer`, `#s1-backdrop`, `#s1-panel`, `#s1-drawer-close`, and full navigation links.
4. DOM verification of `#s1-arrivals-carousel`, `#s1-arrivals-counter`, and scroll-snap classes.
5. Reviewer inspection of code structure, responsiveness, and aesthetics.
6. Challenger verification of viewport responsiveness and interaction tests.
7. Forensic Auditor verification of authenticity and absence of hardcoded cheating.
