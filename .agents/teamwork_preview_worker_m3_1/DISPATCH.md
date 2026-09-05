# Dispatch: Worker for Milestone 3 (Storefront 3 - Neo Tokyo Color Clash)

## Identity
- Name: teamwork_preview_worker_m3_1
- Role: Implementation Worker
- Working Directory: c:\Users\devde\OneDrive\Desktop\Demo projects\Mint-more\tomboy clothing\.agents\teamwork_preview_worker_m3_1
- Parent Conversation ID: 511cf2e0-cd0f-46b3-8f96-edf670838b95

## Context & Inputs
- Original Request (MANDATORY TO READ): c:\Users\devde\OneDrive\Desktop\Demo projects\Mint-more\tomboy clothing\.agents\ORIGINAL_REQUEST.md
- Project Spec: c:\Users\devde\OneDrive\Desktop\Demo projects\Mint-more\tomboy clothing\PROJECT.md
- Milestone Scope: c:\Users\devde\OneDrive\Desktop\Demo projects\Mint-more\tomboy clothing\.agents\sub_orch_m3\SCOPE.md
- Target File (EXCLUSIVE WRITE OWNERSHIP): c:\Users\devde\OneDrive\Desktop\Demo projects\Mint-more\tomboy clothing\tomboy_neo_tokyo_color_clash\code.html

### Comprehensive Explorer Handoff Reports (READ ALL THREE):
1. Explorer 1 (Cart & Legacy Cleanup & Baseline): c:\Users\devde\OneDrive\Desktop\Demo projects\Mint-more\tomboy clothing\.agents\teamwork_preview_explorer_m3_1\handoff.md
2. Explorer 2 (Mobile Navigation Drawer Architecture): c:\Users\devde\OneDrive\Desktop\Demo projects\Mint-more\tomboy clothing\.agents\teamwork_preview_explorer_m3_2\handoff.md
3. Explorer 3 (Mobile Carousel & Header De-Cluttering): c:\Users\devde\OneDrive\Desktop\Demo projects\Mint-more\tomboy clothing\.agents\teamwork_preview_explorer_m3_3\handoff.md

## MANDATORY INTEGRITY WARNING
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Implementation Tasks for `tomboy_neo_tokyo_color_clash/code.html`
1. **Remove Cart Count & Comply with Touch Target**:
   - In `<header>`, update the BAG button: completely remove `[ 0 ]` badge (line 144). Ensure touch target padding $\ge 44 \times 44\text{px}$ (`min-h-[44px] min-w-[44px] px-3 py-2.5`). Keep cyber-brutalist berry-magenta styling, 2px black border, and `#product-wall` / `#cart` anchor.
2. **De-Clutter Header on Mobile (360px-390px)**:
   - In the right tools cluster, hide Search on mobile (`hidden md:flex`) and Currency on mobile (`hidden md:flex`).
   - Add the Cyber-Brutalist `#mobile-menu-trigger` button with `[ MENU ]` text, acid green `#ccff00` styling, `min-h-[44px] min-w-[44px]`, visible on mobile/tablet and hidden on desktop (`lg:hidden`).
3. **Cyber-Brutalist Mobile Side Drawer DOM**:
   - Insert backdrop overlay `<div id="mobile-drawer-backdrop" class="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm opacity-0 pointer-events-none transition-opacity duration-300"></div>`.
   - Insert `<aside id="mobile-drawer" class="fixed inset-y-0 right-0 z-50 w-[85vw] max-w-[380px] bg-white text-black border-l-3 border-black transform translate-x-full transition-transform duration-300 ease-in-out neo-shadow flex flex-col justify-between overflow-y-auto">`.
   - Include close button `<button id="mobile-drawer-close" aria-label="Close navigation menu" class="w-11 h-11 min-w-[44px] min-h-[44px] ...">`.
   - Include navigation hierarchy links (`<a>`) with Neo-Tokyo cyber-brutalist hover states.
   - Include the relocated Search tool and Currency selector inside the drawer.
4. **Mobile Touch-Swipe Carousel on Product Wall**:
   - In Section 2 (`#product-wall`), add `#carousel-counter` displaying `[ 01 / 04 ]` with class `font-mono`, plus prev/next buttons (`md:hidden`).
   - Configure product track container: `class="flex overflow-x-auto snap-x snap-mandatory scrollbar-none gap-4 md:gap-6 pb-4 pt-2 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-2 lg:grid-cols-4 md:overflow-visible md:pb-0 touch-pan-x" id="product-wall-carousel"`.
   - Configure each of the 4 product cards: `class="group bg-white border-2 border-black rounded-lg overflow-hidden neo-shadow transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between w-[82vw] sm:w-[60vw] md:w-auto shrink-0 md:shrink snap-start"`.
   - Add `.scrollbar-none` rule in `<style>`.
5. **Purge Flawed Legacy Injections & Restore Countdown Timer**:
   - Delete all 53 lines of `<!-- RESPONSIVE ENHANCEMENTS -->` and inline `<style>` at the bottom of the file (lines 893–945).
   - Revert line 772 countdown grid back to `grid grid-cols-4 gap-2 text-center py-3 bg-slate-100 border-2 border-black` so DAYS, HOURS, MINS, SECS stay in 4 columns.
   - Fix `data-alt` attributes on images to standard `alt` attributes and add `loading="lazy"` / `decoding="async"`.
6. **Implement Clean Vanilla JS Controllers**:
   - Drawer controller:
     - Open drawer on `#mobile-menu-trigger` click.
     - Set `document.body.style.overflow = "hidden"`.
     - Close on `#mobile-drawer-close` click, backdrop click, link navigation, or `e.key === "Escape"`.
     - Restore `document.body.style.overflow = ""`.
     - Touch swipe-to-close gesture support (> 50px right swipe).
   - Carousel controller:
     - Scroll event listener with requestAnimationFrame updating `#carousel-counter` text.
     - IntersectionObserver dual registration for rock-solid slide tracking.
     - Prev and next button click handlers.
7. **Verify Desktop Invariant Baseline**:
   - Verify on $\ge 1024\text{px}$ viewports: `#mobile-menu-trigger` hidden (`lg:hidden`), desktop pill nav visible (`hidden lg:flex`), carousel renders as 4-column grid (`lg:grid-cols-4`).

## Testing & Verification Required Before Reporting Back
Run the following test suites and include output in your handoff report:
`python -m unittest tests/test_responsive_storefronts.py -v`

Write your structured handoff report to `c:\Users\devde\OneDrive\Desktop\Demo projects\Mint-more\tomboy clothing\.agents\teamwork_preview_worker_m3_1\handoff.md` and report completion back via `send_message`.

## 2026-09-05T11:19:10Z
You are teamwork_preview_worker_m3_1.
Your working directory is: c:\Users\devde\OneDrive\Desktop\Demo projects\Mint-more\tomboy clothing\.agents\teamwork_preview_worker_m3_1
Target file (exclusive write ownership): c:\Users\devde\OneDrive\Desktop\Demo projects\Mint-more\tomboy clothing\tomboy_neo_tokyo_color_clash\code.html

Read your instructions in: c:\Users\devde\OneDrive\Desktop\Demo projects\Mint-more\tomboy clothing\.agents\teamwork_preview_worker_m3_1\DISPATCH.md
MANDATORY: You must read ORIGINAL_REQUEST.md at: c:\Users\devde\OneDrive\Desktop\Demo projects\Mint-more\tomboy clothing\.agents\ORIGINAL_REQUEST.md
Also read PROJECT.md at: c:\Users\devde\OneDrive\Desktop\Demo projects\Mint-more\tomboy clothing\PROJECT.md
And SCOPE.md at: c:\Users\devde\OneDrive\Desktop\Demo projects\Mint-more\tomboy clothing\.agents\sub_orch_m3\SCOPE.md

READ ALL THREE EXPLORER HANDOFF REPORTS:
1. c:\Users\devde\OneDrive\Desktop\Demo projects\Mint-more\tomboy clothing\.agents\teamwork_preview_explorer_m3_1\handoff.md
2. c:\Users\devde\OneDrive\Desktop\Demo projects\Mint-more\tomboy clothing\.agents\teamwork_preview_explorer_m3_2\handoff.md
3. c:\Users\devde\OneDrive\Desktop\Demo projects\Mint-more\tomboy clothing\.agents\teamwork_preview_explorer_m3_3\handoff.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Implement all required components in tomboy_neo_tokyo_color_clash/code.html.
Run the test command: python -m unittest tests/test_responsive_storefronts.py -v
Write your structured handoff report to: c:\Users\devde\OneDrive\Desktop\Demo projects\Mint-more\tomboy clothing\.agents\teamwork_preview_worker_m3_1\handoff.md
Send a completion message back to parent via send_message when done.

