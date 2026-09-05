# Task Dispatch: Challenger 2 for Milestone 4 (Storefront 4)

You are `challenger_m4_2`, a `teamwork_preview_challenger` agent.
Working Directory: `c:\Users\devde\OneDrive\Desktop\Demo projects\Mint-more\tomboy clothing\.agents\challenger_m4_2`
Project Root: `c:\Users\devde\OneDrive\Desktop\Demo projects\Mint-more\tomboy clothing`
Target File: `c:\Users\devde\OneDrive\Desktop\Demo projects\Mint-more\tomboy clothing\tomboy_raw_brutalist_archive_index\code.html`
Worker Handoff Report: `c:\Users\devde\OneDrive\Desktop\Demo projects\Mint-more\tomboy clothing\.agents\teamwork_preview_worker_m4_1\handoff.md`
Original Request: `c:\Users\devde\OneDrive\Desktop\Demo projects\Mint-more\tomboy clothing\.agents\ORIGINAL_REQUEST.md`
Project Spec: `c:\Users\devde\OneDrive\Desktop\Demo projects\Mint-more\tomboy clothing\PROJECT.md`
Milestone Scope: `c:\Users\devde\OneDrive\Desktop\Demo projects\Mint-more\tomboy clothing\.agents\sub_orch_m4\SCOPE.md`

## Challenge Objective
Empirically stress-test viewport boundaries, visual stability (CLS), touch ergonomics, and extreme display conditions for `tomboy_raw_brutalist_archive_index/code.html`.

## Adversarial Stress Tests
1. **Viewport Overflow Stress**:
   - Test CSS overflow rules at 320px, 360px, 375px, 414px, 768px, 1024px, 1440px.
   - Specifically probe the `004` watermark, technical table rows, barcode headers, and long spec strings to ensure zero elements cause horizontal window scroll.
2. **Touch Target Sizing Invariant**:
   - Verify every interactive button, menu trigger, cart anchor, close button, and filter button has computed or explicit minimum dimension $\ge 44 \times 44\text{px}$.
3. **Image & CLS Resilience**:
   - Verify all `<img>` tags have explicit aspect-ratio or width/height classes (`aspect-[4/5]`, `aspect-square`, `w-auto h-7`, etc.) to prevent layout shifts.
   - Verify lazy loading and asynchronous decoding on below-the-fold assets.
4. **HTML Parsing & Syntax Validation**:
   - Verify zero unclosed tags, duplicate IDs, or invalid markup.
5. **E2E Test Regression**:
   - Run the full suite in `tests/test_responsive_storefronts.py` and confirm 0 regressions or failures for Storefront 4.

Document your test scripts, measurements, and verdict (`APPROVE` or `REJECT`) in `handoff.md` in your working directory and notify the parent orchestrator via send_message.

## 2026-09-05T11:21:31Z
You are challenger_m4_2.
Working Directory: c:\Users\devde\OneDrive\Desktop\Demo projects\Mint-more\tomboy clothing\.agents\challenger_m4_2
Parent Sub-Orchestrator Conversation ID: ccf9ad89-246c-45cb-b764-df9f5d2f6f5d

MANDATORY FILES TO READ:
1. c:\Users\devde\OneDrive\Desktop\Demo projects\Mint-more\tomboy clothing\.agents\ORIGINAL_REQUEST.md
2. c:\Users\devde\OneDrive\Desktop\Demo projects\Mint-more\tomboy clothing\PROJECT.md
3. c:\Users\devde\OneDrive\Desktop\Demo projects\Mint-more\tomboy clothing\.agents\sub_orch_m4\SCOPE.md
4. c:\Users\devde\OneDrive\Desktop\Demo projects\Mint-more\tomboy clothing\.agents\challenger_m4_2\DISPATCH.md
5. Worker Handoff: c:\Users\devde\OneDrive\Desktop\Demo projects\Mint-more\tomboy clothing\.agents\teamwork_preview_worker_m4_1\handoff.md
6. Target File: c:\Users\devde\OneDrive\Desktop\Demo projects\Mint-more\tomboy clothing\tomboy_raw_brutalist_archive_index\code.html

Empirically stress-test viewport boundary conditions (320px to 1440px), visual stability (CLS), touch ergonomics, HTML markup validity, watermark overflow resilience, and run the project E2E test suite. Document your adversarial scripts, execution measurements, and final verdict (APPROVE or REJECT) in handoff.md in your working directory and notify the parent orchestrator via send_message.

