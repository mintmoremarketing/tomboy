## Task Dispatch: Sub-Orchestrator for Milestone M1 (Storefront 1 - Latest Drop)

You are sub_orch_m1 (Sub-Orchestrator for Milestone 1).
Working Directory: c:\Users\devde\OneDrive\Desktop\Demo projects\Mint-more\tomboy clothing\.agents\sub_orch_m1
Project Workspace: c:\Users\devde\OneDrive\Desktop\Demo projects\Mint-more\tomboy clothing
Parent Conversation ID: eb2440c2-ae6e-465c-90e6-fbb96da66cad
Original Request: c:\Users\devde\OneDrive\Desktop\Demo projects\Mint-more\tomboy clothing\.agents\ORIGINAL_REQUEST.md
Project Spec: c:\Users\devde\OneDrive\Desktop\Demo projects\Mint-more\tomboy clothing\PROJECT.md
Survey Reports:
- Explorer 1: c:\Users\devde\OneDrive\Desktop\Demo projects\Mint-more\tomboy clothing\.agents\teamwork_preview_explorer_survey_1\handoff.md
- Explorer 2: c:\Users\devde\OneDrive\Desktop\Demo projects\Mint-more\tomboy clothing\.agents\teamwork_preview_explorer_survey_2\handoff.md
- Explorer 3: c:\Users\devde\OneDrive\Desktop\Demo projects\Mint-more\tomboy clothing\.agents\teamwork_preview_explorer_survey_3\handoff.md

### Scope: Milestone 1
Target Storefront: `tomboy_clothing_home_latest_drop/code.html`
You exclusively own this directory and file.

### Required Deliverables for M1
1. **Remove Cart Count**: Eliminate `[ 0 ]` from the navbar cart link (line 4) while keeping `CART` and expanding touch target $\ge 44 \times 44\text{px}$.
2. **Clean Naive Injection**: Strip out the flawed script and button injected by `responsive_fix.py` (which caused breakpoint blackouts between 1024px and 1280px).
3. **Bespoke Mobile Side Drawer**: Implement off-canvas slide drawer matching the monochrome brutalist theme, triggered by an accessible brutalist button (`xl:hidden` matching desktop nav breakpoint), with full links (`ARRIVALS`, `TOPS`, `OUTER`, `COLLABS`, `LOOKBOOK`), backdrop overlay, scroll-lock, and keyboard `Escape` dismissal.
4. **Mobile Touch-Swipe Carousel**: Implement hardware-accelerated CSS scroll-snap carousel with live monospace slide counter (`01 / 04`) for the latest drop product section on mobile, transitioning to grid on desktop.
5. **Fluid Typography & Overflow Prevention**: Apply responsive clamp utilities to prevent horizontal blowout on mobile viewports.
6. **Image Optimization**: Ensure images have aspect ratio containment, lazy loading, and async decoding.
7. **Desktop Brutalism Preservation**: Ensure 100% fidelity to the original desktop layout and aesthetic when viewed on screens $\ge 1280\text{px}$.

### Sub-Orchestrator Workflow Protocol
1. Create `SCOPE.md` in your working directory defining architecture, requirements, and verification criteria for M1.
2. Initialize `BRIEFING.md` and `progress.md`.
3. Execute the Iteration Loop (2B):
   - Dispatch a Worker (`teamwork_preview_worker`) with the MANDATORY INTEGRITY WARNING to implement the redesign in `tomboy_clothing_home_latest_drop/code.html`.
   - Dispatch 2 Reviewers (`teamwork_preview_reviewer`) to independently inspect code quality, responsiveness, and aesthetic fidelity.
   - Dispatch 2 Challengers (`teamwork_preview_challenger`) to stress-test viewport responsiveness (320px, 375px, 768px, 1280px), drawer interaction, and touch gestures.
   - Dispatch a Forensic Auditor (`teamwork_preview_auditor`) to verify implementation authenticity and absence of hardcoded facades.
4. Gate the results in `GATE_STATUS.md`.
5. Upon PASS, write `handoff.md` and send a message back to parent orchestrator (`eb2440c2-ae6e-465c-90e6-fbb96da66cad`).
