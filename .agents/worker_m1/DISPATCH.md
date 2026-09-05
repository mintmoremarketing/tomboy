# Task Dispatch: Worker for Milestone 1 (Storefront 1 - Latest Drop)

You are `worker_m1`.
Working Directory: `c:\Users\devde\OneDrive\Desktop\Demo projects\Mint-more\tomboy clothing\.agents\worker_m1`
Project Workspace: `c:\Users\devde\OneDrive\Desktop\Demo projects\Mint-more\tomboy clothing`
Parent Orchestrator: `sub_orch_m1` (Conversation ID: d4c109c8-8c09-4e9e-896f-0d8c74589e06)

## Mandatory Reading
- Original Request: `c:\Users\devde\OneDrive\Desktop\Demo projects\Mint-more\tomboy clothing\.agents\ORIGINAL_REQUEST.md`
- Project Spec: `c:\Users\devde\OneDrive\Desktop\Demo projects\Mint-more\tomboy clothing\PROJECT.md`
- Milestone 1 Scope: `c:\Users\devde\OneDrive\Desktop\Demo projects\Mint-more\tomboy clothing\.agents\sub_orch_m1\SCOPE.md`
- Explorer Technical Survey 1: `c:\Users\devde\OneDrive\Desktop\Demo projects\Mint-more\tomboy clothing\.agents\teamwork_preview_explorer_survey_1\handoff.md`
- Explorer Competitor Survey 2: `c:\Users\devde\OneDrive\Desktop\Demo projects\Mint-more\tomboy clothing\.agents\teamwork_preview_explorer_survey_2\handoff.md`
- Explorer Architectural Survey 3: `c:\Users\devde\OneDrive\Desktop\Demo projects\Mint-more\tomboy clothing\.agents\teamwork_preview_explorer_survey_3\handoff.md`

## File Ownership
You EXCLUSIVELY own: `tomboy_clothing_home_latest_drop/code.html`.
Do NOT edit any other storefront or project files.

## MANDATORY INTEGRITY WARNING
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Tasks & Implementation Requirements
1. **Remove Cart Count `[ 0 ]`**:
   - In `tomboy_clothing_home_latest_drop/code.html` header, completely eliminate `[ 0 ]` text node.
   - Retain `CART` label and shopping bag icon with $\ge 44 \times 44\text{px}$ touch target padding.
2. **Remove Naive `responsive_fix.py` Code**:
   - Remove the `<!-- RESPONSIVE ENHANCEMENTS -->` block and injected script at the bottom of the file.
   - Clean up malformed classes like `grid-cols-1 md:grid-cols-2 md:grid-cols-4` (fix to `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`).
3. **Implement Bespoke Industrial Brutalist Mobile Drawer**:
   - Insert `#s1-drawer-trigger` (`xl:hidden`) in the header utility row with touch target $\ge 44\text{px}$.
   - Add `#s1-drawer` off-canvas sliding drawer container, `#s1-backdrop` blurred overlay, `#s1-panel` right-sliding panel, `#s1-drawer-close` button, and full navigation links (`ARRIVALS`, `TOPS & TEES`, `OUTERWEAR`, `EDITORIAL`, `LOOKBOOK`, `COLLABS`).
   - Add vanilla JS event listeners for open, close on button, close on backdrop click, close on link click, close on `Escape` keydown, and scroll lock on `document.body.style.overflow`.
4. **Implement Mobile Touch-Swipe Carousel for Section 2 ("NEW ARRIVALS")**:
   - Add `#s1-arrivals-counter` showing `[ 01 / 04 ]` on mobile.
   - Transform the arrivals container into `#s1-arrivals-carousel` using CSS scroll snap (`snap-x snap-mandatory flex overflow-x-auto sm:grid sm:grid-cols-2 lg:grid-cols-4 pb-4 sm:pb-0 scrollbar-none`).
   - Each card has `snap-start shrink-0 w-[82vw] sm:w-auto sm:shrink`.
   - Add `IntersectionObserver` in JS to update `#s1-arrivals-counter` dynamically as user swipes.
5. **Fluid Typography & Overflow Prevention**:
   - Scale hero display heading `display-hero` with responsive sizing (`text-4xl sm:text-6xl lg:text-7xl xl:text-display-hero`) to eliminate clipping/overflow at 320px–390px.
   - Update viewport meta tag to include `viewport-fit=cover`.
   - Ensure horizontal overflow is strictly contained (`overflow-x-hidden`).
6. **Image Optimization & CLS Prevention**:
   - Add `loading="lazy"` and `decoding="async"` to all below-the-fold images.
   - Add `fetchpriority="high"` to hero image.
   - Maintain strict aspect ratio wrappers.
7. **Touch Accessibility & Quick Add**:
   - Make Quick Add buttons accessible on touch devices (not hidden behind desktop `:hover`).
   - Ensure all interactive touch targets are $\ge 44 \times 44\text{px}$.
8. **Preserve 100% Desktop Brutalism**:
   - Ensure that on screens $\ge 1280\text{px}$, the desktop navigation, multi-column grids, and brutalist aesthetic are completely intact.
9. **Verification**:
   - Verify HTML syntax, run tests or validation scripts, check that no horizontal scrollbars occur, and document all changes in your `handoff.md`.
   - When finished, send a message back to your parent orchestrator (`d4c109c8-8c09-4e9e-896f-0d8c74589e06`).

## 2026-09-05T11:15:00Z
You are worker_m1, the Worker subagent for Milestone 1 (Storefront 1: Latest Drop).
Your Working Directory is: c:\Users\devde\OneDrive\Desktop\Demo projects\Mint-more\tomboy clothing\.agents\worker_m1
Your Task Dispatch file is: c:\Users\devde\OneDrive\Desktop\Demo projects\Mint-more\tomboy clothing\.agents\worker_m1\DISPATCH.md
Your Parent Orchestrator is sub_orch_m1 (Conversation ID: d4c109c8-8c09-4e9e-896f-0d8c74589e06).

DELIVERABLES:
1. Eliminate `[ 0 ]` from the navbar cart button in tomboy_clothing_home_latest_drop/code.html while keeping CART and icon, with touch target >= 44x44px.
2. Remove naive responsive_fix.py injected script and fix malformed grid classes (e.g. line 223 md:grid-cols-2 md:grid-cols-4).
3. Implement bespoke industrial brutalist mobile drawer (#s1-drawer, #s1-backdrop, #s1-panel, #s1-drawer-trigger with xl:hidden, #s1-drawer-close, full nav links, body scroll-lock, and escape key handling).
4. Implement touch-swipe carousel for Section 2 New Arrivals (#s1-arrivals-carousel, #s1-arrivals-counter [ 01 / 04 ], scroll-snap-type: x mandatory, 82vw peek, IntersectionObserver slide counter tracking).
5. Fluid typography & overflow prevention (hero heading responsive scaling, viewport-fit=cover, no horizontal scrollbars at 320px, 375px, 768px, 1280px).
6. Image optimization (loading=lazy, decoding=async, fetchpriority=high on hero, aspect ratio containers).
7. Ensure 100% desktop brutalism preservation at >= 1280px.
8. Verify your work (test HTML validity, responsiveness, etc.), write handoff.md in your working directory, and send a completion message to sub_orch_m1 (d4c109c8-8c09-4e9e-896f-0d8c74589e06).
