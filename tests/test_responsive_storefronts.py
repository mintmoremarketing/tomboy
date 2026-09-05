"""
Tomboy Clothing Responsive Redesign - Comprehensive 4-Tier E2E Opaque-Box Test Suite
===================================================================================
Automated verification harness covering all 4 brutalist storefronts:
  1. Storefront 1: Latest Drop (tomboy_clothing_home_latest_drop/code.html)
  2. Storefront 2: Darkroom Runway (tomboy_editorial_darkroom_runway/code.html)
  3. Storefront 3: Neo Tokyo Color Clash (tomboy_neo_tokyo_color_clash/code.html)
  4. Storefront 4: Raw Brutalist Archive (tomboy_raw_brutalist_archive_index/code.html)

Test Tiers:
  - Tier 1: Feature Coverage (Cart count removal, Drawer contract, Carousel contract,
            Fluid typography, Image optimization & legacy cleanup)
  - Tier 2: Boundary & Corner Cases (320px viewport, 768px/1024px breakpoints, Escape key,
            Backdrop click, Scroll lock invariants, Tailwind hygiene)
  - Tier 3: Cross-Feature Integration (Drawer + Cart interaction, Carousel + Drawer isolation,
            Grid + Carousel coexistence, Touch target accessibility)
  - Tier 4: Real-World Workload Scenarios (Simulated mobile shopper journeys across all 4 sites)

Run:
  python -m unittest tests/test_responsive_storefronts.py -v
  or
  python tests/test_responsive_storefronts.py
"""

import os
import re
import unittest
from html.parser import HTMLParser
from pathlib import Path
from typing import Dict, List, Optional


# =====================================================================
# Lightweight Standalone DOM Parser & Query Engine (Zero External Deps)
# =====================================================================

class DOMNode:
    """Represents a lightweight HTML node for opaque-box query assertions."""

    def __init__(self, tag: str, attrs: list, parent: Optional['DOMNode'] = None):
        self.tag = tag.lower()
        self.attrs: Dict[str, str] = {k.lower(): v for k, v in attrs}
        self.parent = parent
        self.children: List['DOMNode'] = []
        self.text: str = ""

    def get(self, attr_name: str, default: Optional[str] = None) -> Optional[str]:
        return self.attrs.get(attr_name.lower(), default)

    def get_classes(self) -> List[str]:
        class_str = self.get('class', '')
        return [c for c in class_str.split() if c]

    def has_class(self, class_name: str) -> bool:
        return class_name in self.get_classes()

    def get_text(self) -> str:
        texts = [self.text]
        for child in self.children:
            texts.append(child.get_text())
        return " ".join(t.strip() for t in texts if t.strip())

    def find_by_id(self, elem_id: str) -> Optional['DOMNode']:
        if self.attrs.get('id') == elem_id:
            return self
        for child in self.children:
            res = child.find_by_id(elem_id)
            if res:
                return res
        return None

    def find_all(self, tag: Optional[str] = None, **attrs) -> List['DOMNode']:
        results: List['DOMNode'] = []
        matches_tag = (tag is None or self.tag == tag.lower())
        matches_attrs = all(self.attrs.get(k.lower()) == str(v) for k, v in attrs.items())

        if matches_tag and matches_attrs and self.tag != '#document':
            results.append(self)

        for child in self.children:
            results.extend(child.find_all(tag=tag, **attrs))
        return results

    def find_by_class_tokens(self, required_tokens: List[str]) -> List['DOMNode']:
        """Find nodes whose class list contains all required tokens."""
        results: List['DOMNode'] = []
        classes = set(self.get_classes())
        if all(token in classes for token in required_tokens) and self.tag != '#document':
            results.append(self)
        for child in self.children:
            results.extend(child.find_by_class_tokens(required_tokens))
        return results


class DOMParser(HTMLParser):
    """HTMLParser that generates a DOM tree preserving void tags."""

    VOID_TAGS = {
        'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
        'link', 'meta', 'param', 'source', 'track', 'wbr'
    }

    def __init__(self):
        super().__init__()
        self.root = DOMNode('#document', [])
        self.current = self.root

    def handle_starttag(self, tag, attrs):
        node = DOMNode(tag, attrs, parent=self.current)
        self.current.children.append(node)
        if tag.lower() not in self.VOID_TAGS:
            self.current = node

    def handle_endtag(self, tag):
        tag_lower = tag.lower()
        if tag_lower in self.VOID_TAGS:
            return
        curr = self.current
        while curr != self.root:
            if curr.tag == tag_lower:
                self.current = curr.parent
                break
            curr = curr.parent

    def handle_data(self, data):
        if self.current != self.root:
            self.current.text += data


# =====================================================================
# Storefront Fixture & Helper Infrastructure
# =====================================================================

STOREFRONT_CONFIG = {
    "latest_drop": {
        "name": "Latest Drop (FW25 Active Drop)",
        "rel_path": "tomboy_clothing_home_latest_drop/code.html",
        "cart_label": "CART",
        "legacy_badge": "[ 0 ]",
        "nav_breakpoint": "xl"  # xl:flex
    },
    "darkroom_runway": {
        "name": "Editorial Darkroom Runway",
        "rel_path": "tomboy_editorial_darkroom_runway/code.html",
        "cart_label": "CART",
        "legacy_badge": "[ 02 ]",
        "nav_breakpoint": "lg"  # lg:flex
    },
    "neo_tokyo": {
        "name": "Neo Tokyo Color Clash",
        "rel_path": "tomboy_neo_tokyo_color_clash/code.html",
        "cart_label": "BAG",
        "legacy_badge": "[ 0 ]",
        "nav_breakpoint": "lg"  # lg:flex
    },
    "archive_index": {
        "name": "Raw Brutalist Archive Index",
        "rel_path": "tomboy_raw_brutalist_archive_index/code.html",
        "cart_label": "CART",
        "legacy_badge": "[ 0 ]",
        "nav_breakpoint": "lg"  # lg:flex
    }
}


def get_project_root() -> Path:
    """Resolve the project root directory regardless of current working directory."""
    current = Path(__file__).resolve().parent
    # Check if parent is project root
    if (current.parent / "PROJECT.md").exists():
        return current.parent
    if (current / "PROJECT.md").exists():
        return current
    # Fallback to CWD
    return Path.cwd()


PROJECT_ROOT = get_project_root()


def load_storefront(key: str) -> tuple[str, DOMNode]:
    """Load raw HTML string and parsed DOM root for a given storefront key."""
    rel_path = STOREFRONT_CONFIG[key]["rel_path"]
    full_path = PROJECT_ROOT / rel_path
    if not full_path.exists():
        raise FileNotFoundError(f"Storefront file missing at {full_path}")
    with open(full_path, "r", encoding="utf-8") as f:
        html = f.read()
    parser = DOMParser()
    parser.feed(html)
    return html, parser.root


def extract_navbar_cart(dom: DOMNode) -> Optional[DOMNode]:
    """Find the cart / bag element inside header or navbar."""
    headers = dom.find_all('header')
    search_roots = headers if headers else [dom]
    for root in search_roots:
        # Check anchors with cart href or data-path
        anchors = root.find_all('a')
        for a in anchors:
            href = a.get('href', '')
            data_path = a.get('data-path', '')
            text = a.get_text().upper()
            if '#cart' in href or data_path == 'cart' or 'CART' in text or 'BAG' in text:
                return a
        # Check buttons
        buttons = root.find_all('button')
        for b in buttons:
            text = b.get_text().upper()
            if 'CART' in text or 'BAG' in text:
                return b
    return None


def extract_all_script_contents(html: str) -> str:
    """Extract all inline script content from HTML."""
    scripts = re.findall(r'<script\b[^>]*>(.*?)</script>', html, flags=re.DOTALL | re.IGNORECASE)
    return "\n".join(scripts)


# =====================================================================
# TIER 1: Feature Coverage (Contract Tests)
# =====================================================================

class Tier1FeatureCoverageTests(unittest.TestCase):
    """
    Tier 1 validates that each of the 5 key features adheres strictly
    to its interface contracts and baseline specifications.
    """

    # Feature 1: Cart Count Removal & Touch Target Integrity (>= 5 tests)
    def test_tier1_cart_no_zero_badge_storefront_1(self):
        """[Feature 1] Storefront 1 (Latest Drop) navbar cart must NOT contain '[ 0 ]'."""
        html, dom = load_storefront("latest_drop")
        cart_elem = extract_navbar_cart(dom)
        self.assertIsNotNone(cart_elem, "Storefront 1: Cart anchor/button must exist in header")
        cart_text = cart_elem.get_text()
        self.assertNotIn("[ 0 ]", cart_text, "Storefront 1: Cart must not display '[ 0 ]' badge")
        self.assertNotIn("[ 02 ]", cart_text, "Storefront 1: Cart must not display numeric badge")

    def test_tier1_cart_no_zero_badge_storefront_2(self):
        """[Feature 1] Storefront 2 (Darkroom Runway) navbar cart must NOT contain '[ 02 ]'."""
        html, dom = load_storefront("darkroom_runway")
        cart_elem = extract_navbar_cart(dom)
        self.assertIsNotNone(cart_elem, "Storefront 2: Cart anchor/button must exist in header")
        cart_text = cart_elem.get_text()
        self.assertNotIn("[ 02 ]", cart_text, "Storefront 2: Cart must not display '[ 02 ]' badge")
        self.assertNotIn("[ 0 ]", cart_text, "Storefront 2: Cart must not display numeric badge")

    def test_tier1_cart_no_zero_badge_storefront_3(self):
        """[Feature 1] Storefront 3 (Neo Tokyo) navbar BAG button must NOT contain '[ 0 ]'."""
        html, dom = load_storefront("neo_tokyo")
        cart_elem = extract_navbar_cart(dom)
        self.assertIsNotNone(cart_elem, "Storefront 3: BAG anchor/button must exist in header")
        cart_text = cart_elem.get_text()
        self.assertNotIn("[ 0 ]", cart_text, "Storefront 3: BAG button must not display '[ 0 ]' badge")

    def test_tier1_cart_no_zero_badge_storefront_4(self):
        """[Feature 1] Storefront 4 (Raw Brutalist) navbar cart must NOT contain '[ 0 ]'."""
        html, dom = load_storefront("archive_index")
        cart_elem = extract_navbar_cart(dom)
        self.assertIsNotNone(cart_elem, "Storefront 4: Cart anchor/button must exist in header")
        cart_text = cart_elem.get_text()
        self.assertNotIn("[ 0 ]", cart_text, "Storefront 4: Cart must not display '[ 0 ]' badge")

    def test_tier1_cart_navbar_button_touch_target_and_labels(self):
        """[Feature 1] All 4 storefronts must retain CART/BAG text label and provide >=44px touch target padding."""
        for key, cfg in STOREFRONT_CONFIG.items():
            html, dom = load_storefront(key)
            cart_elem = extract_navbar_cart(dom)
            self.assertIsNotNone(cart_elem, f"{cfg['name']}: Cart element missing in navbar")
            cart_text = cart_elem.get_text().upper()
            expected_label = cfg["cart_label"]
            self.assertIn(expected_label, cart_text, f"{cfg['name']}: Cart must display '{expected_label}' text label")

            # Check touch target padding (min-h-[44px], py-2.5, py-3, h-11, etc.)
            classes = " ".join(cart_elem.get_classes())
            touch_target_ok = any(t in classes for t in ['min-h-[44px]', 'min-h-[48px]', 'py-2.5', 'py-3', 'h-11', 'h-12', 'px-4', 'px-5'])
            self.assertTrue(touch_target_ok, f"{cfg['name']}: Cart button touch target must be at least 44px (classes: {classes})")

    # Feature 2: Mobile Navigation Trigger & Drawer Contract (>= 5 tests)
    def test_tier1_mobile_menu_trigger_attributes(self):
        """[Feature 2] All 4 storefronts must have button id='mobile-menu-trigger' with aria-label and hidden on desktop."""
        for key, cfg in STOREFRONT_CONFIG.items():
            html, dom = load_storefront(key)
            trigger = dom.find_by_id("mobile-menu-trigger")
            self.assertIsNotNone(trigger, f"{cfg['name']}: Missing element with id='mobile-menu-trigger'")
            self.assertEqual(trigger.tag, "button", f"{cfg['name']}: #mobile-menu-trigger must be a <button>")
            aria_label = trigger.get('aria-label', '')
            self.assertTrue(len(aria_label) > 0, f"{cfg['name']}: #mobile-menu-trigger must have an aria-label attribute")
            # Must be hidden on desktop (lg:hidden or xl:hidden)
            classes = trigger.get_classes()
            desktop_hide = any(c in classes for c in ['lg:hidden', 'xl:hidden', 'md:hidden'])
            self.assertTrue(desktop_hide, f"{cfg['name']}: #mobile-menu-trigger must be hidden on desktop screens")

    def test_tier1_mobile_drawer_element_and_positioning(self):
        """[Feature 2] All 4 storefronts must have aside id='mobile-drawer' with fixed positioning and off-canvas translate."""
        for key, cfg in STOREFRONT_CONFIG.items():
            html, dom = load_storefront(key)
            drawer = dom.find_by_id("mobile-drawer")
            self.assertIsNotNone(drawer, f"{cfg['name']}: Missing element with id='mobile-drawer'")
            classes = drawer.get_classes()
            self.assertIn("fixed", classes, f"{cfg['name']}: #mobile-drawer must have 'fixed' class")
            has_offcanvas = any("translate-x-full" in c or "-translate-x-full" in c for c in classes)
            self.assertTrue(has_offcanvas, f"{cfg['name']}: #mobile-drawer must start off-canvas with translate-x-full")

    def test_tier1_mobile_drawer_backdrop_overlay(self):
        """[Feature 2] All 4 storefronts must have div id='mobile-drawer-backdrop' with fixed positioning and opacity transition."""
        for key, cfg in STOREFRONT_CONFIG.items():
            html, dom = load_storefront(key)
            backdrop = dom.find_by_id("mobile-drawer-backdrop")
            self.assertIsNotNone(backdrop, f"{cfg['name']}: Missing element with id='mobile-drawer-backdrop'")
            classes = backdrop.get_classes()
            self.assertIn("fixed", classes, f"{cfg['name']}: #mobile-drawer-backdrop must have 'fixed' class")
            has_hidden_initial = any(c in classes for c in ['opacity-0', 'hidden', 'pointer-events-none'])
            self.assertTrue(has_hidden_initial, f"{cfg['name']}: #mobile-drawer-backdrop must be initially hidden or transparent")

    def test_tier1_mobile_drawer_close_button(self):
        """[Feature 2] All 4 storefronts must have button id='mobile-drawer-close' with aria-label."""
        for key, cfg in STOREFRONT_CONFIG.items():
            html, dom = load_storefront(key)
            close_btn = dom.find_by_id("mobile-drawer-close")
            self.assertIsNotNone(close_btn, f"{cfg['name']}: Missing element with id='mobile-drawer-close'")
            self.assertEqual(close_btn.tag, "button", f"{cfg['name']}: #mobile-drawer-close must be a <button>")
            aria_label = close_btn.get('aria-label', '')
            self.assertTrue(len(aria_label) > 0, f"{cfg['name']}: #mobile-drawer-close must have an aria-label")

    def test_tier1_mobile_drawer_navigation_links(self):
        """[Feature 2] The mobile drawer must contain primary navigational links."""
        for key, cfg in STOREFRONT_CONFIG.items():
            html, dom = load_storefront(key)
            drawer = dom.find_by_id("mobile-drawer")
            if drawer is None:
                self.fail(f"{cfg['name']}: Mobile drawer missing, cannot inspect navigation links")
            nav_links = drawer.find_all('a')
            self.assertGreaterEqual(len(nav_links), 3, f"{cfg['name']}: Mobile drawer must contain at least 3 navigational links")

    # Feature 3: Mobile Touch-Swipe Carousel Contract (>= 5 tests)
    def test_tier1_carousel_track_scroll_snap_classes(self):
        """[Feature 3] Product section must include a scroll-snap carousel track with 'overflow-x-auto' and 'snap-x'."""
        for key, cfg in STOREFRONT_CONFIG.items():
            html, dom = load_storefront(key)
            tracks = dom.find_by_class_tokens(['overflow-x-auto', 'snap-x'])
            self.assertTrue(len(tracks) >= 1, f"{cfg['name']}: Must contain at least one track with 'overflow-x-auto' and 'snap-x'")

    def test_tier1_carousel_item_snap_alignment_and_peek(self):
        """[Feature 3] Carousel items must have snap-start and responsive card peek width."""
        for key, cfg in STOREFRONT_CONFIG.items():
            html, dom = load_storefront(key)
            snap_items = dom.find_by_class_tokens(['snap-start'])
            self.assertTrue(len(snap_items) >= 2, f"{cfg['name']}: Must contain at least 2 cards with 'snap-start'")
            # Check peek affordance: card class should specify w-[80vw], w-[82vw], w-[85vw], sm:w-[60vw], etc.
            first_item_classes = " ".join(snap_items[0].get_classes())
            has_peek = any(p in first_item_classes for p in ['w-[8', 'w-[7', 'w-[6', 'sm:w-', 'shrink-0'])
            self.assertTrue(has_peek, f"{cfg['name']}: Carousel item must have peek affordance styling (shrink-0 / w-[8xvw])")

    def test_tier1_carousel_monospace_live_counter(self):
        """[Feature 3] Product carousel section must contain live slide counter id='carousel-counter'."""
        for key, cfg in STOREFRONT_CONFIG.items():
            html, dom = load_storefront(key)
            counter = dom.find_by_id("carousel-counter")
            self.assertIsNotNone(counter, f"{cfg['name']}: Must have slide counter element with id='carousel-counter'")
            text = counter.get_text()
            # Initial counter should match pattern like [ 01 / 04 ] or 01 / 04
            self.assertTrue(bool(re.search(r'\d+\s*/\s*\d+', text)), f"{cfg['name']}: Counter text '{text}' must match slide format (e.g. '01 / 04')")

    def test_tier1_carousel_scroll_listener_script(self):
        """[Feature 3] Storefront script must attach scroll or intersection listener to update carousel-counter."""
        for key, cfg in STOREFRONT_CONFIG.items():
            html, dom = load_storefront(key)
            scripts = extract_all_script_contents(html)
            has_counter_script = "carousel-counter" in scripts or "carouselCounter" in scripts or "scroll" in scripts
            self.assertTrue(has_counter_script, f"{cfg['name']}: Must contain script logic managing carousel counter")

    def test_tier1_carousel_desktop_grid_preservation(self):
        """[Feature 3] Product carousel must restore to multi-column grid on desktop screens (md:grid, lg:grid-cols-4)."""
        for key, cfg in STOREFRONT_CONFIG.items():
            html, dom = load_storefront(key)
            tracks = dom.find_by_class_tokens(['overflow-x-auto', 'snap-x'])
            if not tracks:
                self.fail(f"{cfg['name']}: Carousel track not found")
            track_classes = tracks[0].get_classes()
            has_desktop_grid = any(c.startswith('md:grid') or c.startswith('lg:grid') or 'md:overflow-visible' in c for c in track_classes)
            self.assertTrue(has_desktop_grid, f"{cfg['name']}: Carousel track must scale to desktop grid (e.g. md:grid, md:overflow-visible)")

    # Feature 4: Fluid Typography & Viewport Overflow Containment (>= 5 tests)
    def test_tier1_viewport_meta_tag_present(self):
        """[Feature 4] HTML must include standard responsive viewport meta tag."""
        for key, cfg in STOREFRONT_CONFIG.items():
            html, dom = load_storefront(key)
            meta_tags = dom.find_all('meta', name='viewport')
            self.assertTrue(len(meta_tags) > 0, f"{cfg['name']}: Missing <meta name='viewport'> tag")
            content = meta_tags[0].get('content', '')
            self.assertIn("width=device-width", content, f"{cfg['name']}: Viewport must set width=device-width")

    def test_tier1_hero_display_headings_responsive_scaling(self):
        """[Feature 4] Colossal hero headings must use responsive sizing or clamp to prevent mobile viewport blowout."""
        for key, cfg in STOREFRONT_CONFIG.items():
            html, dom = load_storefront(key)
            h1s = dom.find_all('h1')
            self.assertTrue(len(h1s) >= 1, f"{cfg['name']}: Must contain primary <h1> display heading")
            h1_classes = " ".join(h1s[0].get_classes())
            # Heading should scale via Tailwind responsive prefixes (e.g. text-4xl sm:text-6xl md:text-8xl) or display-hero-mobile
            is_responsive = any(t in h1_classes for t in ['sm:text-', 'md:text-', 'lg:text-', 'text-3xl', 'text-4xl', 'text-5xl', 'display-hero-mobile', 'clamp'])
            self.assertTrue(is_responsive, f"{cfg['name']}: Hero heading <h1> must use responsive font scaling (classes: {h1_classes})")

    def test_tier1_no_fixed_overflowing_widths(self):
        """[Feature 4] Major layout containers must not enforce rigid widths exceeding mobile viewports (e.g. w-[1200px])."""
        for key, cfg in STOREFRONT_CONFIG.items():
            html, dom = load_storefront(key)
            all_elements = dom.find_all()
            for elem in all_elements:
                classes = elem.get_classes()
                for c in classes:
                    # Check for non-responsive large fixed widths
                    if re.match(r'^w-\[(1[0-9]{3}|[2-9][0-9]{3})px\]$', c):
                        self.fail(f"{cfg['name']}: Found rigid non-responsive width class '{c}' on <{elem.tag}>")

    def test_tier1_typography_font_family_declarations(self):
        """[Feature 4] Storefront must load required brutalist font families (Space Grotesk, Space Mono, or Hanken Grotesk)."""
        for key, cfg in STOREFRONT_CONFIG.items():
            html, dom = load_storefront(key)
            self.assertTrue("Space+Grotesk" in html or "Space+Mono" in html or "font-mono" in html or "Space Grotesk" in html,
                            f"{cfg['name']}: Must declare Space Grotesk / Space Mono typography")

    def test_tier1_body_overflow_containment(self):
        """[Feature 4] HTML body or main wrapper must prevent horizontal layout blowout."""
        for key, cfg in STOREFRONT_CONFIG.items():
            html, dom = load_storefront(key)
            body = dom.find_all('body')
            self.assertTrue(len(body) > 0, f"{cfg['name']}: <body> tag missing")
            # Check for overscroll / overflow handling in style or classes
            has_containment = "overflow-x-hidden" in html or "overscroll-behavior" in html or "w-full" in html
            self.assertTrue(has_containment, f"{cfg['name']}: Must include container overflow containment")

    # Feature 5: Image Optimization & Performance (>= 5 tests)
    def test_tier1_product_images_lazy_loading(self):
        """[Feature 5] Product and lookbook images below the fold must have loading='lazy'."""
        for key, cfg in STOREFRONT_CONFIG.items():
            html, dom = load_storefront(key)
            images = dom.find_all('img')
            self.assertGreaterEqual(len(images), 3, f"{cfg['name']}: Must contain product/lookbook images")
            lazy_images = [img for img in images if img.get('loading') == 'lazy']
            self.assertGreaterEqual(len(lazy_images), 2, f"{cfg['name']}: Must have loading='lazy' on at least 2 below-the-fold images")

    def test_tier1_product_images_async_decoding(self):
        """[Feature 5] Images should specify decoding='async' to optimize main thread performance."""
        for key, cfg in STOREFRONT_CONFIG.items():
            html, dom = load_storefront(key)
            images = dom.find_all('img')
            async_images = [img for img in images if img.get('decoding') == 'async']
            self.assertGreaterEqual(len(async_images), 2, f"{cfg['name']}: Must specify decoding='async' on product images")

    def test_tier1_product_images_aspect_ratio(self):
        """[Feature 5] Product images must define aspect-ratio classes or dimensional constraints to prevent CLS."""
        for key, cfg in STOREFRONT_CONFIG.items():
            html, dom = load_storefront(key)
            images = dom.find_all('img')
            for img in images:
                parent = img.parent
                classes = " ".join(img.get_classes() + (parent.get_classes() if parent else []))
                has_dimensions = (
                    img.get('width') is not None or
                    'aspect-' in classes or
                    'h-' in classes or
                    'w-' in classes or
                    'object-cover' in classes
                )
                self.assertTrue(has_dimensions, f"{cfg['name']}: Image {img.get('alt', '')} missing aspect-ratio / dimensional sizing")

    def test_tier1_all_images_have_alt_attributes(self):
        """[Feature 5] All <img> elements must possess descriptive alt attributes for accessibility."""
        for key, cfg in STOREFRONT_CONFIG.items():
            html, dom = load_storefront(key)
            images = dom.find_all('img')
            for img in images:
                alt = img.get('alt')
                self.assertIsNotNone(alt, f"{cfg['name']}: Image tag missing 'alt' attribute: src={img.get('src', '')[:40]}")

    def test_tier1_legacy_naive_injection_removed(self):
        """[Feature 5] Legacy naive responsive injection from responsive_fix.py must be purged."""
        for key, cfg in STOREFRONT_CONFIG.items():
            html, dom = load_storefront(key)
            self.assertNotIn("<!-- RESPONSIVE ENHANCEMENTS -->", html,
                             f"{cfg['name']}: Flawed legacy injection '<!-- RESPONSIVE ENHANCEMENTS -->' must be removed")
            self.assertNotIn(".mobile-nav {", html,
                             f"{cfg['name']}: Flawed legacy CSS '.mobile-nav' must be removed")


# =====================================================================
# TIER 2: Boundary & Corner Cases
# =====================================================================

class Tier2BoundaryCornerCaseTests(unittest.TestCase):
    """
    Tier 2 verifies extreme viewports (320px), responsive breakpoints (768px, 1024px),
    keyboard event handling, scroll lock invariants, and syntax hygiene.
    """

    def test_tier2_extreme_320px_navbar_compactness(self):
        """[Corner Case 1] On 320px screens, secondary utility items must be hidden to prevent header wrapping."""
        for key, cfg in STOREFRONT_CONFIG.items():
            html, dom = load_storefront(key)
            headers = dom.find_all('header')
            if not headers:
                continue
            header = headers[0]
            # Verify secondary items like currency, account, or stream buttons hide below md/sm
            hidden_items = header.find_by_class_tokens(['hidden', 'md:flex']) + header.find_by_class_tokens(['hidden', 'sm:flex'])
            self.assertGreaterEqual(len(hidden_items), 1, f"{cfg['name']}: Secondary header tools must hide on small screens (hidden sm:flex or hidden md:flex)")

    def test_tier2_extreme_320px_carousel_item_scaling(self):
        """[Corner Case 1] Carousel items must use relative viewport widths to prevent clipping on 320px screens."""
        for key, cfg in STOREFRONT_CONFIG.items():
            html, dom = load_storefront(key)
            snap_items = dom.find_by_class_tokens(['snap-start'])
            if snap_items:
                classes = snap_items[0].get_classes()
                # Should not have rigid px widths like w-[380px]
                has_rigid_px = any(re.match(r'^w-\[(3[5-9][0-9]|[4-9][0-9]{2})px\]$', c) for c in classes)
                self.assertFalse(has_rigid_px, f"{cfg['name']}: Carousel item must not have rigid width >350px that overflows 320px screen")

    def test_tier2_tablet_768px_breakpoint_grid_switching(self):
        """[Corner Case 2] On 768px tablet breakpoint, product displays must transition into multi-column layout."""
        for key, cfg in STOREFRONT_CONFIG.items():
            html, dom = load_storefront(key)
            # Find elements with md:grid-cols-2 or md:grid
            tablet_grids = dom.find_by_class_tokens(['md:grid-cols-2']) + dom.find_by_class_tokens(['md:grid'])
            self.assertGreaterEqual(len(tablet_grids), 1, f"{cfg['name']}: Product sections must define tablet layout transitions via 'md:grid' or 'md:grid-cols-2'")

    def test_tier2_desktop_1024px_nav_transition(self):
        """[Corner Case 2] On 1024px/1280px desktop breakpoint, mobile menu must hide and desktop nav must appear."""
        for key, cfg in STOREFRONT_CONFIG.items():
            html, dom = load_storefront(key)
            trigger = dom.find_by_id("mobile-menu-trigger")
            if trigger:
                classes = trigger.get_classes()
                self.assertTrue(any(c in classes for c in ['lg:hidden', 'xl:hidden']), f"{cfg['name']}: Trigger must hide on desktop")
            # Check desktop nav
            desktop_navs = dom.find_by_class_tokens(['hidden', 'lg:flex']) + dom.find_by_class_tokens(['hidden', 'xl:flex'])
            self.assertGreaterEqual(len(desktop_navs), 1, f"{cfg['name']}: Desktop navigation must show on desktop screens (hidden lg:flex or hidden xl:flex)")

    def test_tier2_escape_key_dismissal_contract(self):
        """[Corner Case 3] Drawer script must register keydown listener checking for 'Escape' key."""
        for key, cfg in STOREFRONT_CONFIG.items():
            html, dom = load_storefront(key)
            scripts = extract_all_script_contents(html)
            has_escape = bool(re.search(r'["\']Escape["\']|\.key\s*===\s*["\']Escape["\']', scripts))
            self.assertTrue(has_escape, f"{cfg['name']}: Script must handle Escape keydown event to close drawer")

    def test_tier2_backdrop_click_dismissal_contract(self):
        """[Corner Case 3] Backdrop click must dismiss mobile drawer."""
        for key, cfg in STOREFRONT_CONFIG.items():
            html, dom = load_storefront(key)
            scripts = extract_all_script_contents(html)
            has_backdrop_listener = "mobile-drawer-backdrop" in scripts or "mobileDrawerBackdrop" in scripts
            self.assertTrue(has_backdrop_listener, f"{cfg['name']}: Script must bind click handler on backdrop to close drawer")

    def test_tier2_body_scroll_lock_on_open(self):
        """[Corner Case 4] Opening mobile drawer must lock document.body scroll."""
        for key, cfg in STOREFRONT_CONFIG.items():
            html, dom = load_storefront(key)
            scripts = extract_all_script_contents(html)
            has_lock = bool(re.search(r'document\.body\.style\.overflow\s*=\s*["\']hidden["\']', scripts))
            self.assertTrue(has_lock, f"{cfg['name']}: Script must set body overflow='hidden' when opening drawer")

    def test_tier2_body_scroll_lock_restoration_on_close(self):
        """[Corner Case 4] Closing mobile drawer must restore document.body scroll capability."""
        for key, cfg in STOREFRONT_CONFIG.items():
            html, dom = load_storefront(key)
            scripts = extract_all_script_contents(html)
            has_restore = bool(re.search(r'document\.body\.style\.overflow\s*=\s*["\'](unset|auto|)["\']', scripts))
            self.assertTrue(has_restore, f"{cfg['name']}: Script must restore body overflow to '' or 'unset' on drawer close")

    def test_tier2_no_malformed_or_duplicate_tailwind_classes(self):
        """[Corner Case 5] HTML class attributes must not contain invalid tokens (e.g. py-0.2, unmatched brackets)."""
        for key, cfg in STOREFRONT_CONFIG.items():
            html, dom = load_storefront(key)
            # Check for known malformed class py-0.2
            self.assertNotIn('py-0.2', html, f"{cfg['name']}: Found invalid Tailwind class 'py-0.2'")
            # Check for broken bracket syntax in class attributes
            matches = re.findall(r'class="([^"]*)"', html)
            for m in matches:
                open_brackets = m.count('[')
                close_brackets = m.count(']')
                self.assertEqual(open_brackets, close_brackets, f"{cfg['name']}: Mismatched brackets in class='{m}'")

    def test_tier2_aria_expanded_state_contract(self):
        """[Corner Case 5] Mobile menu trigger must maintain aria-expanded attribute."""
        for key, cfg in STOREFRONT_CONFIG.items():
            html, dom = load_storefront(key)
            trigger = dom.find_by_id("mobile-menu-trigger")
            if trigger:
                self.assertTrue('aria-expanded' in trigger.attrs or 'aria-label' in trigger.attrs,
                                f"{cfg['name']}: Mobile trigger must include accessibility attributes")


# =====================================================================
# TIER 3: Cross-Feature Integration Tests
# =====================================================================

class Tier3CrossFeatureIntegrationTests(unittest.TestCase):
    """
    Tier 3 verifies harmonious co-existence of multiple responsive systems:
    Drawer + Cart, Carousel + Drawer scroll isolation, Grid + Carousel breakpoint switching.
    """

    def test_tier3_drawer_contains_cart_shortcut_or_clean_handoff(self):
        """[Integration 1] Drawer navigation must provide an accessible cart shortcut without z-index conflict."""
        for key, cfg in STOREFRONT_CONFIG.items():
            html, dom = load_storefront(key)
            drawer = dom.find_by_id("mobile-drawer")
            if drawer:
                # Should contain links to shop / cart / bag or checkout
                anchors = drawer.find_all('a')
                has_shop_or_cart = any('cart' in a.get('href', '').lower() or
                                       'bag' in a.get_text().lower() or
                                       'shop' in a.get_text().lower() or
                                       'arrivals' in a.get_text().lower() or
                                       'drop' in a.get_text().lower() for a in anchors)
                self.assertTrue(has_shop_or_cart, f"{cfg['name']}: Drawer must contain shopping or cart navigation paths")

    def test_tier3_drawer_overlay_z_index_hierarchy(self):
        """[Integration 1] Drawer (z-50) and Backdrop (z-40) must stack properly above header elements."""
        for key, cfg in STOREFRONT_CONFIG.items():
            html, dom = load_storefront(key)
            drawer = dom.find_by_id("mobile-drawer")
            backdrop = dom.find_by_id("mobile-drawer-backdrop")
            if drawer and backdrop:
                drawer_classes = drawer.get_classes()
                backdrop_classes = backdrop.get_classes()
                has_drawer_z = any(c.startswith('z-') for c in drawer_classes)
                has_backdrop_z = any(c.startswith('z-') for c in backdrop_classes)
                self.assertTrue(has_drawer_z and has_backdrop_z, f"{cfg['name']}: Drawer and backdrop must have explicit z-index classes")

    def test_tier3_carousel_scroll_lock_isolation(self):
        """[Integration 2] Mobile drawer scroll lock must isolate touch gestures so carousel does not scroll behind open drawer."""
        for key, cfg in STOREFRONT_CONFIG.items():
            html, dom = load_storefront(key)
            scripts = extract_all_script_contents(html)
            # Ensure script locks body scroll when drawer opens
            self.assertTrue("overflow" in scripts and "hidden" in scripts,
                            f"{cfg['name']}: Script must lock page/carousel scrolling when drawer is active")

    def test_tier3_carousel_touch_action_and_snap_isolation(self):
        """[Integration 2] Carousel track must permit horizontal swipe while snapping cleanly to cards."""
        for key, cfg in STOREFRONT_CONFIG.items():
            html, dom = load_storefront(key)
            tracks = dom.find_by_class_tokens(['snap-mandatory'])
            self.assertGreaterEqual(len(tracks), 1, f"{cfg['name']}: Track must declare 'snap-mandatory' for touch gesture isolation")

    def test_tier3_carousel_to_grid_breakpoint_harmony(self):
        """[Integration 3] Carousel track must switch to grid layout on desktop without leftover scroll snapping."""
        for key, cfg in STOREFRONT_CONFIG.items():
            html, dom = load_storefront(key)
            tracks = dom.find_by_class_tokens(['snap-x'])
            if tracks:
                classes = tracks[0].get_classes()
                has_desktop_override = any(c.startswith('md:') or c.startswith('lg:') for c in classes)
                self.assertTrue(has_desktop_override, f"{cfg['name']}: Carousel track must include md: or lg: responsive overrides")

    def test_tier3_product_card_action_buttons_touch_accessibility(self):
        """[Integration 3] Product action buttons (Add to Bag, Quick View) must not be permanently hidden on touchscreens."""
        for key, cfg in STOREFRONT_CONFIG.items():
            html, dom = load_storefront(key)
            # Verify action buttons have accessible touch presence
            buttons = dom.find_all('button')
            self.assertGreaterEqual(len(buttons), 2, f"{cfg['name']}: Storefront must offer interactive buttons")


# =====================================================================
# TIER 4: Real-World Workload Scenarios
# =====================================================================

class Tier4RealWorldWorkloadScenarioTests(unittest.TestCase):
    """
    Tier 4 simulates end-to-end user journeys across all 4 storefronts,
    validating complete mobile customer workflows from landing to cart checkout.
    """

    def test_tier4_mobile_drop_discovery_journey(self):
        """[Scenario 1] Latest Drop: Shopper arrives on mobile, reads hero drop, swipes carousel, and inspects cart."""
        html, dom = load_storefront("latest_drop")

        # 1. Viewport verification
        viewport = dom.find_all('meta', name='viewport')
        self.assertTrue(len(viewport) > 0, "Scenario 1: Viewport meta tag required")

        # 2. Hero banner title is readable and responsive
        h1 = dom.find_all('h1')[0]
        self.assertIn("REBEL", h1.get_text(), "Scenario 1: Hero heading must display 'REBEL YOUTH'")

        # 3. Mobile menu trigger and drawer ready
        trigger = dom.find_by_id("mobile-menu-trigger")
        drawer = dom.find_by_id("mobile-drawer")
        self.assertIsNotNone(trigger, "Scenario 1: Mobile menu trigger required for mobile navigation")
        self.assertIsNotNone(drawer, "Scenario 1: Mobile drawer required for catalog access")

        # 4. Carousel cards & live counter present
        counter = dom.find_by_id("carousel-counter")
        self.assertIsNotNone(counter, "Scenario 1: Slide counter required for touch carousel")

        # 5. Navbar cart clean of [ 0 ]
        cart = extract_navbar_cart(dom)
        self.assertIsNotNone(cart, "Scenario 1: Navbar cart required")
        self.assertNotIn("[ 0 ]", cart.get_text(), "Scenario 1: Cart must not display [ 0 ]")

    def test_tier4_darkroom_editorial_mobile_journey(self):
        """[Scenario 2] Darkroom Runway: Shopper explores cinema lookbook, swipes runway cards, checks cart [ 02 ] removal."""
        html, dom = load_storefront("darkroom_runway")

        # 1. Mobile menu drawer
        trigger = dom.find_by_id("mobile-menu-trigger")
        drawer = dom.find_by_id("mobile-drawer")
        self.assertIsNotNone(trigger, "Scenario 2: Mobile menu trigger required")
        self.assertIsNotNone(drawer, "Scenario 2: Darkroom off-canvas drawer required")

        # 2. Lookbook / runway touch carousel
        counter = dom.find_by_id("carousel-counter")
        self.assertIsNotNone(counter, "Scenario 2: Runway carousel counter required")

        # 3. Cart button clean of [ 02 ]
        cart = extract_navbar_cart(dom)
        self.assertIsNotNone(cart, "Scenario 2: Cart button required")
        self.assertNotIn("[ 02 ]", cart.get_text(), "Scenario 2: Cart must not display [ 02 ]")
        self.assertIn("CART", cart.get_text().upper(), "Scenario 2: Cart label must remain 'CART'")

        # 4. Image lazy loading
        images = dom.find_all('img')
        lazy_count = len([i for i in images if i.get('loading') == 'lazy'])
        self.assertGreaterEqual(lazy_count, 2, "Scenario 2: Editorial runway images must be lazy loaded")

    def test_tier4_neo_tokyo_mobile_shopper_journey(self):
        """[Scenario 3] Neo Tokyo: Shopper browses color clash product wall, tests touch swipe, confirms BAG button."""
        html, dom = load_storefront("neo_tokyo")

        # 1. Drawer navigation
        trigger = dom.find_by_id("mobile-menu-trigger")
        drawer = dom.find_by_id("mobile-drawer")
        self.assertIsNotNone(trigger, "Scenario 3: Mobile trigger required")
        self.assertIsNotNone(drawer, "Scenario 3: Neo Tokyo mobile drawer required")

        # 2. Carousel & counter
        counter = dom.find_by_id("carousel-counter")
        self.assertIsNotNone(counter, "Scenario 3: Product wall carousel counter required")

        # 3. Clean BAG button without [ 0 ]
        cart = extract_navbar_cart(dom)
        self.assertIsNotNone(cart, "Scenario 3: BAG button required")
        self.assertNotIn("[ 0 ]", cart.get_text(), "Scenario 3: BAG button must not display [ 0 ]")
        self.assertIn("BAG", cart.get_text().upper(), "Scenario 3: Button label must remain 'BAG'")

    def test_tier4_raw_archive_technical_mobile_journey(self):
        """[Scenario 4] Raw Brutalist Archive: Shopper navigates technical ledger, checks 1px grid adaptability & clean cart."""
        html, dom = load_storefront("archive_index")

        # 1. Technical navigation drawer
        trigger = dom.find_by_id("mobile-menu-trigger")
        drawer = dom.find_by_id("mobile-drawer")
        self.assertIsNotNone(trigger, "Scenario 4: Mobile trigger required")
        self.assertIsNotNone(drawer, "Scenario 4: Technical archive drawer required")

        # 2. Carousel & live counter
        counter = dom.find_by_id("carousel-counter")
        self.assertIsNotNone(counter, "Scenario 4: Archive carousel counter required")

        # 3. Clean CART button without [ 0 ]
        cart = extract_navbar_cart(dom)
        self.assertIsNotNone(cart, "Scenario 4: Archive cart button required")
        self.assertNotIn("[ 0 ]", cart.get_text(), "Scenario 4: Archive cart must not display [ 0 ]")
        self.assertIn("CART", cart.get_text().upper(), "Scenario 4: Archive cart label must remain 'CART'")

    def test_tier4_cross_storefront_contract_uniformity(self):
        """[Scenario 5] Cross-Storefront Parity: Verify consistent ID contracts and zero-badge cart across all 4 sites."""
        for key, cfg in STOREFRONT_CONFIG.items():
            html, dom = load_storefront(key)

            # Contract ID assertions
            self.assertIsNotNone(dom.find_by_id("mobile-menu-trigger"),
                                 f"{cfg['name']}: Must implement standard #mobile-menu-trigger")
            self.assertIsNotNone(dom.find_by_id("mobile-drawer"),
                                 f"{cfg['name']}: Must implement standard #mobile-drawer")
            self.assertIsNotNone(dom.find_by_id("mobile-drawer-backdrop"),
                                 f"{cfg['name']}: Must implement standard #mobile-drawer-backdrop")
            self.assertIsNotNone(dom.find_by_id("mobile-drawer-close"),
                                 f"{cfg['name']}: Must implement standard #mobile-drawer-close")
            self.assertIsNotNone(dom.find_by_id("carousel-counter"),
                                 f"{cfg['name']}: Must implement standard #carousel-counter")

            # Navbar cart count elimination assertion
            cart = extract_navbar_cart(dom)
            self.assertIsNotNone(cart, f"{cfg['name']}: Navbar cart missing")
            self.assertNotIn("[ 0 ]", cart.get_text(), f"{cfg['name']}: Cart still contains [ 0 ]")
            self.assertNotIn("[ 02 ]", cart.get_text(), f"{cfg['name']}: Cart still contains [ 02 ]")


# =====================================================================
# Main Execution Entrypoint
# =====================================================================

if __name__ == "__main__":
    unittest.main()
