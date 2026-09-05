# Dispatch: Worker M2 (Storefront 2 - Editorial Darkroom Runway)

You are `teamwork_preview_worker_m2_1`.
Working Directory: `c:\Users\devde\OneDrive\Desktop\Demo projects\Mint-more\tomboy clothing\.agents\teamwork_preview_worker_m2_1`
Parent Conversation ID: (Your dispatcher / caller)

## MANDATORY INTEGRITY WARNING
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Mandatory Files to Read First
You MUST read these files completely before starting work:
- `c:\Users\devde\OneDrive\Desktop\Demo projects\Mint-more\tomboy clothing\.agents\ORIGINAL_REQUEST.md`
- `c:\Users\devde\OneDrive\Desktop\Demo projects\Mint-more\tomboy clothing\PROJECT.md`
- `c:\Users\devde\OneDrive\Desktop\Demo projects\Mint-more\tomboy clothing\.agents\sub_orch_m2\SCOPE.md`
- Reference survey report: `c:\Users\devde\OneDrive\Desktop\Demo projects\Mint-more\tomboy clothing\.agents\teamwork_preview_explorer_survey_2\handoff.md`

## Exclusive File Ownership
You exclusively own and modify:
- `c:\Users\devde\OneDrive\Desktop\Demo projects\Mint-more\tomboy clothing\tomboy_editorial_darkroom_runway\code.html`
Do NOT touch any other HTML files or files outside your scope.

## Deliverables & Tasks
1. **Remove Cart Count `[ 02 ]`**:
   - In `tomboy_editorial_darkroom_runway/code.html`, locate the navbar cart button (around lines 136-139).
   - Remove `<span class="font-price-tag font-bold">[ 02 ]</span>` entirely.
   - Keep the `CART` text (and optional shopping bag icon), and ensure touch target padding is $\ge 44 \times 44\text{px}$.
   - Ensure NO occurrences of `[ 02 ]` or `[ 0 ]` remain in the navbar.

2. **Remove Naive Injected Scripts**:
   - Search for and delete any previously injected naive responsive script (e.g., `<!-- RESPONSIVE ENHANCEMENTS -->` from `responsive_fix.py`).

3. **Darkroom Editorial Mobile Navigation Drawer**:
   - Implement an off-canvas navigation drawer (`lg:hidden`) tailored to the Darkroom Runway theme:
     - Deep black background, moody atmospheric glass/border styling, `neon-red` accents matching the darkroom cinema theme.
     - Accessible trigger button `#mobile-menu-trigger` in the navbar with touch target $\ge 44\text{px}$ (visible on mobile/tablet `< 1024px`, hidden on desktop `lg:`).
     - Full navigation links (RUNWAY, LOOKBOOK, ARCHIVE, EXHIBITION, TICKETS, etc.) matching desktop navigation.
     - Backdrop overlay `#mobile-drawer-backdrop` with click-to-close.
     - Close button `#mobile-drawer-close` and keyboard `Escape` dismissal.
     - Scroll locking on `document.body` while drawer is open.

4. **Mobile Touch-Swipe Lookbook Carousel**:
   - Transform the runway looks section on mobile/tablet (`< 1024px`) into a horizontal CSS scroll-snap carousel:
     - `scroll-snap-type: x mandatory`, `overflow-x-auto`, `snap-x`, `scrollbar-none`.
     - Card width: peek layout `w-[82vw] sm:w-[60vw] lg:w-auto` so users intuitively see the next slide.
     - Dynamic monospace slide counter `#carousel-counter` (e.g. `01 / 04`) updating on scroll.
     - Preserves full editorial multi-column grid on desktop (`lg:grid`).

5. **Hero Controls & Typography Overflow Fix**:
   - Fix any absolute/fixed controls in the hero section that clip on small viewports ($< 480\text{px}$).
   - Use fluid responsive typography scaling or responsive classes to eliminate horizontal scrolling.

6. **Desktop Darkroom Brutalism Preservation**:
   - Maintain 100% aesthetic fidelity to the desktop darkroom brutalist experience on viewports $\ge 1024\text{px}$.

7. **Verification Requirements**:
   - Run verification checks (e.g. grep for `\[ 02 \]` or `\[ 0 \]` in navbar, check HTML validity / structure, check script syntax).
   - Document all changes and verification commands in `handoff.md` in your working directory.

## 2026-09-05T11:15:09Z
You are teamwork_preview_worker_m2_1, assigned to Milestone 2 (Storefront 2: Editorial Darkroom Runway).
Working Directory: c:\Users\devde\OneDrive\Desktop\Demo projects\Mint-more\tomboy clothing\.agents\teamwork_preview_worker_m2_1
Task Dispatch File: c:\Users\devde\OneDrive\Desktop\Demo projects\Mint-more\tomboy clothing\.agents\teamwork_preview_worker_m2_1\DISPATCH.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

MANDATORY FILES TO READ:
Before doing anything, read:
1. c:\Users\devde\OneDrive\Desktop\Demo projects\Mint-more\tomboy clothing\.agents\ORIGINAL_REQUEST.md
2. c:\Users\devde\OneDrive\Desktop\Demo projects\Mint-more\tomboy clothing\PROJECT.md
3. c:\Users\devde\OneDrive\Desktop\Demo projects\Mint-more\tomboy clothing\.agents\sub_orch_m2\SCOPE.md
4. c:\Users\devde\OneDrive\Desktop\Demo projects\Mint-more\tomboy clothing\.agents\teamwork_preview_worker_m2_1\DISPATCH.md
5. Survey handoff: c:\Users\devde\OneDrive\Desktop\Demo projects\Mint-more\tomboy clothing\.agents\teamwork_preview_explorer_survey_2\handoff.md

SCOPE & EXCLUSIVE OWNERSHIP:
Target file: c:\Users\devde\OneDrive\Desktop\Demo projects\Mint-more\tomboy clothing\tomboy_editorial_darkroom_runway\code.html

TASKS:
1. Remove cart count badge [ 02 ] from navbar cart button while preserving CART text and ensuring touch target >= 44x44px.
2. Remove naive injected script (e.g. <!-- RESPONSIVE ENHANCEMENTS --> from responsive_fix.py).
3. Implement darkroom editorial mobile side drawer (lg:hidden) with neon-red accents, runway nav links, backdrop blur overlay, scroll lock, and Escape key handling.
4. Implement mobile touch-swipe lookbook carousel with CSS scroll-snap (scroll-snap-type: x mandatory) and live monospace counter (#carousel-counter) for viewports < 1024px, preserving desktop grid.
5. Fix hero controls & typography overflow on viewports < 480px.
6. Preserve 100% desktop darkroom brutalist aesthetic on viewports >= 1024px.
7. Run verification commands (check for [ 02 ] removal, test DOM structure and JS functionality).
8. Write comprehensive handoff.md in your working directory and notify parent via send_message.
