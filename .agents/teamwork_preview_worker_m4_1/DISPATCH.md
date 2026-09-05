# Task Dispatch: Worker for Milestone 4 (Storefront 4: Raw Brutalist Archive Index)

You are `worker_m4_1`, a `teamwork_preview_worker` agent.
Working Directory: `c:\Users\devde\OneDrive\Desktop\Demo projects\Mint-more\tomboy clothing\.agents\teamwork_preview_worker_m4_1`
Project Root: `c:\Users\devde\OneDrive\Desktop\Demo projects\Mint-more\tomboy clothing`
Original Request: `c:\Users\devde\OneDrive\Desktop\Demo projects\Mint-more\tomboy clothing\.agents\ORIGINAL_REQUEST.md`
Project Spec: `c:\Users\devde\OneDrive\Desktop\Demo projects\Mint-more\tomboy clothing\PROJECT.md`
Milestone Scope: `c:\Users\devde\OneDrive\Desktop\Demo projects\Mint-more\tomboy clothing\.agents\sub_orch_m4\SCOPE.md`
Parent Sub-Orchestrator Conversation ID: ccf9ad89-246c-45cb-b764-df9f5d2f6f5d

## Exclusive Write Ownership
You exclusively own and modify:
`c:\Users\devde\OneDrive\Desktop\Demo projects\Mint-more\tomboy clothing\tomboy_raw_brutalist_archive_index\code.html`
Do NOT edit any other storefront or project files.

## MANDATORY INTEGRITY WARNING
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Task Requirements & Detailed Instructions
Read `ORIGINAL_REQUEST.md`, `PROJECT.md`, and `SCOPE.md` first.

1. **Remove Cart Count `[ 0 ]`**:
   - In the header utility matrix (lines 161–164), remove the `<span class="px-1.5 py-0.5 bg-neutral-800 text-white border border-neutral-600 text-[10px]">[ 0 ]</span>` badge completely.
   - Maintain the `CART` label and shopping bag / cart icon or text.
   - Ensure the anchor has min-height and padding meeting $\ge 44 \times 44\text{px}$ touch target standards.

2. **Clean Naive Injection & Restore 12-Column Grid**:
   - Remove the `<!-- RESPONSIVE ENHANCEMENTS -->` block and injected script/style tags at the bottom of the file (lines 906–959).
   - In the header (lines 124–166), ensure the 12-column grid geometry is clean and intact.
   - Add a dedicated brutalist mobile menu trigger button inside the header with `lg:hidden`, matching the raw brutalist grid aesthetic (e.g., `#mobile-menu-trigger`, with 1px border grid line, min 44x44px touch target, icon or `[ MENU ]` label).
   - Preserve desktop navigation on screens $\ge 1024\text{px}$ (`hidden lg:flex`).

3. **Archival Mobile Off-Canvas Side Drawer**:
   - Implement a bespoke mobile navigation drawer matching the stark industrial ledger aesthetic:
     - Container `#mobile-drawer` with backdrop overlay `#mobile-drawer-backdrop` (`bg-black/60 backdrop-blur-sm`).
     - Panel `#mobile-drawer-panel` with `#f4f3ef` parchment background, 1px raw hairline borders (`border-grid-line`), monospace typography (`font-mono-code`), Tokyo time / system protocol header.
     - Full navigation index links (`//01 ARCHIVE`, `//02 CAPSULE`, `//03 OBJECTS`, `//04 RUNWAY`, `//05 MATRIX`), plus currency and terminal options.
     - Close button `#mobile-drawer-close` ($\ge 44 \times 44\text{px}$).
     - JavaScript handling: Open on trigger click, close on close button click, backdrop click, link click, or keyboard `Escape`.
     - Scroll-lock: Set `document.body.style.overflow = 'hidden'` while open; restore to `''` when closed.

4. **Mobile Touch-Swipe Archive Carousel**:
   - In the Systematic Archive Catalog section (`#catalog`), update the product cards container (lines 317+):
     - On mobile viewports ($< 1024\text{px}$), make it a horizontal touch-swipeable CSS scroll-snap carousel (`flex lg:grid overflow-x-auto lg:overflow-visible snap-x snap-mandatory lg:snap-none pb-4 lg:pb-0 scrollbar-none`, with `-webkit-overflow-scrolling: touch;`).
     - Each card should snap (`snap-start shrink-0 w-[82vw] sm:w-[60vw] lg:w-auto lg:shrink`).
     - Live monospace counter element `#carousel-counter` (`<span id="carousel-counter" class="font-mono-code text-[11px] bg-black text-white px-2 py-0.5 tracking-wider">[ 01 / 04 ]</span>`) placed in the catalog section header next to the segment filters.
     - JavaScript logic using scroll event or `IntersectionObserver` to dynamically update the counter as the user swipes through cards.
     - On desktop ($\ge 1024\text{px}$), ensure it displays as the original multi-column grid (`lg:grid-cols-4`) with 1px hairline divide borders intact.
     - Make quick-add / preview actions accessible on mobile/touch (not hidden behind desktop hover).

5. **Fix Background Spec Watermark & Prevent Overflow**:
   - Line 175 has an absolute watermark `004` with `text-[140px]`. Ensure it scales responsively (e.g. `text-6xl sm:text-8xl lg:text-[140px]`) and cannot leak or cause horizontal scrolling on mobile viewports $< 400\text{px}$.
   - Update `<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">`.
   - Ensure `overflow-x: hidden` is enforced on `html` and `body`.

6. **Preserve Desktop Raw Brutalism**:
   - On screens $\ge 1024\text{px}$, maintain 100% visual fidelity to the original exposed 12-column grid, divide lines, Tokyo live clock, barcode headers, and monospace spec sheets.

7. **Verification & Testing**:
   - Verify `[ 0 ]` is completely eliminated.
   - Verify the file is valid HTML, works in modern browsers and iframe viewers.
   - Run verification checks (e.g. via python or node script if needed) to ensure zero syntax errors, proper DOM IDs, and responsive CSS classes.
   - Write your completion report to `handoff.md` in your working directory.
