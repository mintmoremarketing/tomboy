# TEST_INFRA: 4-Tier E2E Opaque-Box Test Architecture

## Overview
This document defines the test infrastructure and methodology for the Tomboy Clothing Brutalist Mobile/Tablet Responsive Redesign. The test suite operates as an opaque-box verification harness that validates contract adherence, structural DOM integrity, responsive adaptation, performance optimization, and mobile user experience across all 4 storefronts without coupling to internal component implementations.

## Target Storefronts
1. **Storefront 1: Latest Drop** (`tomboy_clothing_home_latest_drop/code.html`)
2. **Storefront 2: Editorial Darkroom Runway** (`tomboy_editorial_darkroom_runway/code.html`)
3. **Storefront 3: Neo Tokyo Color Clash** (`tomboy_neo_tokyo_color_clash/code.html`)
4. **Storefront 4: Raw Brutalist Archive Index** (`tomboy_raw_brutalist_archive_index/code.html`)

---

## 4-Tier Test Architecture

```
+-------------------------------------------------------------------------+
|                  TIER 4: REAL-WORLD WORKLOAD SCENARIOS                  |
|  Simulated end-to-end user journeys (Drop Discovery, Editorial Runway,  |
|  Neo Tokyo Wall, Archive Index Ledger, Cross-Storefront Parity)         |
+-------------------------------------------------------------------------+
                                    ^
+-------------------------------------------------------------------------+
|                TIER 3: CROSS-FEATURE INTEGRATION TESTS                  |
|  Drawer + Cart interaction, Carousel + Drawer isolation,               |
|  Responsive Grid + Carousel co-existence, Touch action ergonomics       |
+-------------------------------------------------------------------------+
                                    ^
+-------------------------------------------------------------------------+
|                TIER 2: BOUNDARY & CORNER CASE TESTS                     |
|  Extreme 320px viewport, 768px tablet & 1024px desktop breakpoints,     |
|  Scroll lock lifecycle, Keyboard Escape listener, Tailwind hygiene      |
+-------------------------------------------------------------------------+
                                    ^
+-------------------------------------------------------------------------+
|                TIER 1: FEATURE COVERAGE (CONTRACT TESTS)                |
|  Feature 1: Cart count removal & touch target padding (>=44x44px)       |
|  Feature 2: Mobile navigation drawer, backdrop, close action, triggers  |
|  Feature 3: Mobile touch carousel, CSS scroll-snap, live slide counter  |
|  Feature 4: Fluid typography scaling & viewport overflow containment    |
|  Feature 5: Image optimization (lazy loading, async decode, aspect-ratio|
+-------------------------------------------------------------------------+
```

---

## Tier Breakdown & Test Specifications

### Tier 1: Feature Coverage (Contract Verification)
Validates that each of the five primary features satisfies its interface contracts across all 4 storefronts ($\ge 5$ tests per feature):

1. **Feature 1: Cart Count Removal & Touch Target Integrity**
   - Absence of `[ 0 ]` and `[ 02 ]` in the navbar cart anchor.
   - Preservation of `CART` or `BAG` labels.
   - Touch target compliance: $\ge 44\text{px}$ effective height/padding.
   - Tests: `test_tier1_cart_no_zero_badge_storefront_1` through `_4`, `test_tier1_cart_navbar_button_touch_target_and_labels`.

2. **Feature 2: Mobile Navigation Trigger & Drawer Contract**
   - Trigger element: `<button id="mobile-menu-trigger" aria-label="..." class="lg:hidden ...">`.
   - Drawer container: `<aside id="mobile-drawer" class="... translate-x-full ...">`.
   - Backdrop overlay: `<div id="mobile-drawer-backdrop" class="... opacity-0 pointer-events-none ...">`.
   - Close button: `<button id="mobile-drawer-close" aria-label="...">`.
   - Primary navigational links mirrored inside drawer.
   - Tests: `test_tier1_mobile_menu_trigger_attributes`, `test_tier1_mobile_drawer_element_and_positioning`, `test_tier1_mobile_drawer_backdrop_overlay`, `test_tier1_mobile_drawer_close_button`, `test_tier1_mobile_drawer_navigation_links`.

3. **Feature 3: Mobile Touch-Swipe Carousel Contract**
   - Carousel track container: `overflow-x-auto`, `snap-x`, `snap-mandatory`, `scrollbar-none`, switching to multi-column grid on `md:`.
   - Carousel cards: `snap-start`, `shrink-0`, and viewport peek width `w-[82vw]` (or `w-[80vw]` / `sm:w-[60vw]`).
   - Live monospace slide counter: element with `id="carousel-counter"` and formatting matching `[ 01 / 04 ]`.
   - Script attachment: active scroll event or IntersectionObserver script updating counter.
   - Desktop grid fallback: `md:grid`, `lg:grid-cols-4`, etc. preserved for desktop screens.
   - Tests: `test_tier1_carousel_track_scroll_snap_classes`, `test_tier1_carousel_item_snap_alignment_and_peek`, `test_tier1_carousel_monospace_live_counter`, `test_tier1_carousel_scroll_listener_script`, `test_tier1_carousel_desktop_grid_preservation`.

4. **Feature 4: Fluid Typography & Viewport Overflow Containment**
   - Viewport meta tag present with standard `width=device-width, initial-scale=1.0`.
   - Hero colossal headings scaled responsively (via `sm:`, `md:`, `lg:` utility steps or `clamp()`) to avoid mobile width blowout.
   - Absence of rigid horizontal widths (e.g. `w-[1200px]`, `min-w-[1024px]`) without responsive overrides.
   - Correct font family tokens loaded (`Space Grotesk`, `Space Mono`, `Hanken Grotesk`).
   - Global containment (`overflow-x-hidden` or responsive container padding).
   - Tests: `test_tier1_viewport_meta_tag_present`, `test_tier1_hero_display_headings_responsive_scaling`, `test_tier1_no_fixed_overflowing_widths`, `test_tier1_typography_font_family_declarations`, `test_tier1_body_overflow_containment`.

5. **Feature 5: Image Optimization & Performance**
   - Product and lookbook images below the fold have `loading="lazy"`.
   - Images specify `decoding="async"`.
   - Aspect ratio constraints (`aspect-[3/4]`, `aspect-square`, or explicit dimensions) to prevent Cumulative Layout Shift (CLS).
   - Descriptive `alt` attributes on all image elements.
   - Purging of legacy naive injection script (`<!-- RESPONSIVE ENHANCEMENTS -->`).
   - Tests: `test_tier1_product_images_lazy_loading`, `test_tier1_product_images_async_decoding`, `test_tier1_product_images_aspect_ratio`, `test_tier1_all_images_have_alt_attributes`, `test_tier1_legacy_naive_injection_removed`.

---

### Tier 2: Boundary & Corner Cases
Validates resilience against atypical viewports, keyboard events, DOM transitions, and syntax anomalies ($\ge 5$ tests per feature area):

1. **Extreme Viewports (320px iPhone SE / legacy mobile)**
   - Header utility bar compactness: non-essential icons (currency toggle, account avatar) hide on small mobile (`hidden md:flex` or `hidden sm:flex`).
   - Carousel cards fit within 320px viewport without exceeding horizontal bounds.
   - Tests: `test_tier2_extreme_320px_navbar_compactness`, `test_tier2_extreme_320px_carousel_item_scaling`.

2. **Responsive Breakpoint Transitions (768px Tablet & 1024px Desktop Boundaries)**
   - Tablet grid transition: single-column/carousel cleanly transforms to 2-column or 3-column layout on `md:`.
   - Desktop navigation transition: mobile trigger button is hidden on desktop (`lg:hidden` or `xl:hidden`) while primary horizontal nav is visible (`lg:flex` or `xl:flex`).
   - Tests: `test_tier2_tablet_768px_breakpoint_grid_switching`, `test_tier2_desktop_1024px_nav_transition`.

3. **Accessibility & Keyboard Escape Handling**
   - Escape key listener: JavaScript registers `keydown` event checking for `e.key === 'Escape'` to close the drawer.
   - Backdrop click dismissal: click listener on `#mobile-drawer-backdrop` triggers drawer closure.
   - Tests: `test_tier2_escape_key_dismissal_contract`, `test_tier2_backdrop_click_dismissal_contract`.

4. **Scroll Lock Lifecycle & State Invariants**
   - Scroll lock activation: opening the mobile drawer locks body scrolling (`document.body.style.overflow = 'hidden'`).
   - Scroll lock restoration: closing via close button, backdrop click, or Escape key restores scroll capability (`style.overflow = ''` or `'auto'`).
   - Tests: `test_tier2_body_scroll_lock_on_open`, `test_tier2_body_scroll_lock_restoration_on_close`.

5. **Tailwind Syntax Hygiene & ARIA State Management**
   - Class token sanitization: checks for malformed class names (e.g. broken decimals like `py-0.2`, unmatched brackets, empty tokens).
   - ARIA state synchronization: menu trigger has `aria-expanded` attribute toggleable by drawer state.
   - Tests: `test_tier2_no_malformed_or_duplicate_tailwind_classes`, `test_tier2_aria_expanded_state_contract`.

---

### Tier 3: Cross-Feature Integration Tests
Validates harmonic interaction across multiple responsive sub-systems:

1. **Drawer + Cart Interaction**
   - Drawer navigation includes a direct cart reference or unobstructed access without conflicting z-index overlays.
   - Z-index stacking hierarchy: Backdrop (`z-40`), Drawer (`z-50`), Header (`z-30`/`z-50`) correctly stack without bleed.
   - Tests: `test_tier3_drawer_contains_cart_shortcut_or_clean_handoff`, `test_tier3_drawer_overlay_z_index_hierarchy`.

2. **Carousel + Drawer Interaction**
   - Scroll lock isolation: Drawer scroll lock prevents background touch carousel dragging.
   - Touch action ergonomics: Carousel track uses appropriate overflow/touch styling (`touch-pan-x` or `overflow-x-auto`) to prevent horizontal drag conflicts with vertical page scroll.
   - Tests: `test_tier3_carousel_scroll_lock_isolation`, `test_tier3_carousel_touch_action_and_snap_isolation`.

3. **Responsive Grid + Carousel Coexistence**
   - Breakpoint harmony: Product section cleanly toggles between scroll-snap carousel on mobile and multi-column grid on tablet/desktop (`md:grid md:overflow-visible`).
   - Touch accessibility of card actions: Quick-add and sizing buttons remain accessible on mobile touchscreens rather than locked behind desktop-only hover pseudoclasses.
   - Tests: `test_tier3_carousel_to_grid_breakpoint_harmony`, `test_tier3_product_card_action_buttons_touch_accessibility`.

---

### Tier 4: Real-World Workload Scenarios
Validates comprehensive end-to-end mobile user journeys:

1. **Mobile Shopper Drop Discovery Journey (`test_tier4_mobile_drop_discovery_journey`)**
   - Simulates a mobile user on Storefront 1 (Latest Drop): verifies viewport setup, hero typography legibility, carousel card structure and live counter, and sleek cart button with no badge.

2. **Darkroom Editorial Lookbook Immersion Journey (`test_tier4_darkroom_editorial_mobile_journey`)**
   - Simulates an editorial visitor on Storefront 2 (Darkroom Runway): verifies lookbook image aspect ratios, lazy loading, mobile menu drawer existence, and cart button without `[ 02 ]`.

3. **Neo Tokyo Streetwear Color Wall Navigation (`test_tier4_neo_tokyo_mobile_shopper_journey`)**
   - Simulates browsing Storefront 3 (Neo Tokyo): verifies badge styling, swipeable product cards, counter element, and cart button without `[ 0 ]`.

4. **Raw Brutalist Archive Ledger Search Journey (`test_tier4_raw_archive_technical_mobile_journey`)**
   - Simulates technical spec inspection on Storefront 4 (Raw Brutalist): verifies exposed 1px grid responsiveness, terminal accessibility, off-canvas navigation drawer, and cart button without `[ 0 ]`.

5. **Full Site Multi-Storefront Cross-Navigation Integrity (`test_tier4_cross_storefront_contract_uniformity`)**
   - Asserts uniform contract adherence across all 4 storefronts for element IDs, ARIA tags, zero-badge cart presence, and drawer architecture.

---

## Test Execution

The test suite is self-contained and implemented using Python's standard library (`unittest`, `html.parser`, `re`, `pathlib`). No third-party packages are required.

### Execution Command:
```bash
python -m unittest tests/test_responsive_storefronts.py -v
```
or directly:
```bash
python tests/test_responsive_storefronts.py
```

### Expected Test Outcomes Across Lifecycle:
- **Baseline Run (Milestone M-Test)**: The test suite executes cleanly and successfully detects failures across all 4 storefronts (presence of `[ 0 ]`/`[ 02 ]`, missing drawers, missing carousels, legacy script presence).
- **Post-Milestone Runs (M1 through M4)**: Individual storefront tests transition from `FAIL` to `PASS` as each storefront is redesigned.
- **Final Milestone (M5)**: All 46 tests across all 4 tiers pass with 0 failures and 0 errors.
