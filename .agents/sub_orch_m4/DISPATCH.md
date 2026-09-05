## Task Dispatch: Sub-Orchestrator for Milestone M4 (Storefront 4 - Raw Brutalist Archive Index)

You are sub_orch_m4 (Sub-Orchestrator for Milestone 4).
Working Directory: c:\Users\devde\OneDrive\Desktop\Demo projects\Mint-more\tomboy clothing\.agents\sub_orch_m4
Project Workspace: c:\Users\devde\OneDrive\Desktop\Demo projects\Mint-more\tomboy clothing
Parent Conversation ID: eb2440c2-ae6e-465c-90e6-fbb96da66cad
Original Request: c:\Users\devde\OneDrive\Desktop\Demo projects\Mint-more\tomboy clothing\.agents\ORIGINAL_REQUEST.md
Project Spec: c:\Users\devde\OneDrive\Desktop\Demo projects\Mint-more\tomboy clothing\PROJECT.md
Survey Reports:
- Explorer 1: c:\Users\devde\OneDrive\Desktop\Demo projects\Mint-more\tomboy clothing\.agents\teamwork_preview_explorer_survey_1\handoff.md
- Explorer 2: c:\Users\devde\OneDrive\Desktop\Demo projects\Mint-more\tomboy clothing\.agents\teamwork_preview_explorer_survey_2\handoff.md
- Explorer 3: c:\Users\devde\OneDrive\Desktop\Demo projects\Mint-more\tomboy clothing\.agents\teamwork_preview_explorer_survey_3\handoff.md

### Scope: Milestone 4
Target Storefront: `tomboy_raw_brutalist_archive_index/code.html`
You exclusively own this directory and file.

### Required Deliverables for M4
1. **Remove Cart Count**: Eliminate `[ 0 ]` badge from navbar cart link (lines 161-164) while preserving `CART` label and expanding touch target $\ge 44 \times 44\text{px}$.
2. **Clean Naive Injection & Fix Grid**: Remove the button injected directly into the 12-column header grid by `responsive_fix.py` (which severely broke the CSS grid alignment), restoring clean grid geometry.
3. **Raw Archival Mobile Side Drawer**: Implement off-canvas drawer honoring the stark industrial ledger aesthetic (parchment background, raw 1px hairline borders, monospace typography, section index links), scroll-lock, and keyboard `Escape` dismissal.
4. **Mobile Touch-Swipe Archive Carousel**: Implement CSS scroll-snap carousel with live monospace item counter (`01 / 06`) for the archival product ledger on mobile viewports ($< 1024\text{px}$), maintaining tabular grid on desktop.
5. **Background Spec Watermark & Overflow Fix**: Constrain the huge `text-[140px]` background watermark and metadata specs so they do not cause horizontal scrolling on viewports $< 400\text{px}$.
6. **Desktop Raw Brutalism Preservation**: Maintain 100% fidelity to the raw archival ledger grid aesthetic on screens $\ge 1024\text{px}$.

### Sub-Orchestrator Workflow Protocol
1. Create `SCOPE.md` in your working directory.
2. Initialize `BRIEFING.md` and `progress.md`.
3. Execute Iteration Loop (2B):
   - Dispatch a Worker (`teamwork_preview_worker`) with the MANDATORY INTEGRITY WARNING.
   - Dispatch 2 Reviewers (`teamwork_preview_reviewer`).
   - Dispatch 2 Challengers (`teamwork_preview_challenger`).
   - Dispatch Forensic Auditor (`teamwork_preview_auditor`).
4. Gate the results in `GATE_STATUS.md`.
5. Upon PASS, write `handoff.md` and send a message back to parent orchestrator (`eb2440c2-ae6e-465c-90e6-fbb96da66cad`).

## 2026-09-05T11:14:04Z
You are sub_orch_m4, the Sub-Orchestrator for Milestone 4 (Storefront 4: Raw Brutalist Archive Index).
Working Directory: c:\Users\devde\OneDrive\Desktop\Demo projects\Mint-more\tomboy clothing\.agents\sub_orch_m4
Parent Conversation ID: eb2440c2-ae6e-465c-90e6-fbb96da66cad
Dispatch Task: c:\Users\devde\OneDrive\Desktop\Demo projects\Mint-more\tomboy clothing\.agents\sub_orch_m4\DISPATCH.md
Original Request: c:\Users\devde\OneDrive\Desktop\Demo projects\Mint-more\tomboy clothing\.agents\ORIGINAL_REQUEST.md
Project Spec: c:\Users\devde\OneDrive\Desktop\Demo projects\Mint-more\tomboy clothing\PROJECT.md

Your scope is tomboy_raw_brutalist_archive_index/code.html.
Follow your orchestrator workflow: create SCOPE.md, initialize BRIEFING.md, and run the Iteration Loop (Worker -> Reviewers -> Challengers -> Auditor -> Gate). Ensure cart count [ 0 ] is removed, broken 12-column grid button injection from responsive_fix.py is removed, archival mobile drawer and touch carousel are added, large watermark overflow is fixed, and desktop raw grid brutalism is preserved. Report back via send_message when milestone passes gate.
