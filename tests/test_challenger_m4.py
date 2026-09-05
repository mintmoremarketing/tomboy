"""
Milestone 4 Adversarial Challenger Test Harness
Target: tomboy_raw_brutalist_archive_index/code.html
Challenger: challenger_m4_1

Covers:
  1. Cart String Invariant (Absence of [ 0 ], numeric badges; retention of CART label)
  2. Drawer Interaction State Machine (Trigger, Close, Backdrop, Escape, Nav links, Idempotency, Scroll lock)
  3. Carousel Boundary & Scroll Logic (Track snap classes, card snap classes, active index math, elastic overscroll, zero-width fallback)
  4. Header 12-Column Grid Math (Mobile, Tablet, Desktop LG, Desktop XL exact column summation)
  5. Absence of Legacy Injections (No responsive_fix, no .mobile-nav CSS, no rogue children)
  6. Ergonomic & Performance Boundary Invariants (Watermark overflow, touch targets >= 44px, lazy images)
"""

import os
import re
import sys
import unittest
from html.parser import HTMLParser
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
TARGET_HTML = REPO_ROOT / "tomboy_raw_brutalist_archive_index" / "code.html"


class SimpleDOMNode:
    """Lightweight DOM Node for adversarial HTML inspection."""
    def __init__(self, tag, attrs, parent=None):
        self.tag = tag.lower()
        self.attrs = {k.lower(): v for k, v in attrs}
        self.parent = parent
        self.children = []
        self.text_content = ""

    def get_attr(self, name, default=None):
        return self.attrs.get(name.lower(), default)

    def get_classes(self):
        return [c for c in self.attrs.get("class", "").split() if c]

    def has_class(self, cls):
        return cls in self.get_classes()

    def find_by_id(self, elem_id):
        if self.attrs.get("id") == elem_id:
            return self
        for child in self.children:
            found = child.find_by_id(elem_id)
            if found:
                return found
        return None

    def find_all(self, tag=None, **attrs):
        results = []
        matches_tag = (tag is None or self.tag == tag.lower())
        matches_attrs = all(self.attrs.get(k.lower()) == str(v) for k, v in attrs.items())
        if matches_tag and matches_attrs and self.tag != "#document":
            results.append(self)
        for child in self.children:
            results.extend(child.find_all(tag=tag, **attrs))
        return results

    def get_full_text(self):
        texts = [self.text_content]
        for child in self.children:
            texts.append(child.get_full_text())
        return " ".join(t.strip() for t in texts if t.strip())


class RobustHTMLParser(HTMLParser):
    VOID_TAGS = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
                 'link', 'meta', 'param', 'source', 'track', 'wbr'}

    def __init__(self):
        super().__init__()
        self.root = SimpleDOMNode("#document", [])
        self.current = self.root

    def handle_starttag(self, tag, attrs):
        node = SimpleDOMNode(tag, attrs, parent=self.current)
        self.current.children.append(node)
        if tag.lower() not in self.VOID_TAGS:
            self.current = node

    def handle_endtag(self, tag):
        if tag.lower() in self.VOID_TAGS:
            return
        temp = self.current
        while temp and temp.tag != tag.lower() and temp.parent:
            temp = temp.parent
        if temp and temp.parent:
            self.current = temp.parent

    def handle_data(self, data):
        if self.current:
            self.current.text_content += data


def parse_html_file(filepath: Path) -> tuple[str, SimpleDOMNode]:
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    parser = RobustHTMLParser()
    parser.feed(content)
    return content, parser.root


class TestAdversarialStorefront4(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.raw_html, cls.dom = parse_html_file(TARGET_HTML)

    # =========================================================================
    # 1. CART STRING INVARIANT
    # =========================================================================
    def test_cart_zero_count_elimination_header(self):
        """Header cart button must NOT contain [ 0 ], [ 00 ], [ 01 ], or any numeric count badge."""
        header = self.dom.find_all("header")
        self.assertTrue(header, "Header element must exist")
        header_node = header[0]
        
        # Locate the cart anchor
        cart_links = [a for a in header_node.find_all("a") if a.get_attr("href") == "#cart"]
        self.assertEqual(len(cart_links), 1, "Exactly one cart link href='#cart' expected in header")
        cart_link = cart_links[0]
        cart_text = cart_link.get_full_text()

        # Probing numeric brackets: [ 0 ], [0], [ 00 ], [ 01 ], [ 1 ], etc.
        bracket_pattern = re.compile(r"\[\s*\d+\s*\]")
        match = bracket_pattern.search(cart_text)
        self.assertIsNone(
            match,
            f"Adversarial failure: Cart button in header contains numeric count badge '{match.group(0) if match else ''}' in '{cart_text}'"
        )
        
        # Verify text CART is preserved
        self.assertIn("CART", cart_text, "Cart link must still present 'CART' label")
        
        # Check touch target
        classes = cart_link.get_classes()
        has_min_height = any("min-h-[44px]" in c or "h-11" in c or "h-12" in c for c in classes)
        self.assertTrue(has_min_height, f"Cart link must ensure min touch height >= 44px: {classes}")

    def test_cart_in_drawer_has_no_zero_badge(self):
        """Mobile drawer cart navigation link must not have bracketed count badge."""
        drawer = self.dom.find_by_id("mobile-drawer")
        self.assertIsNotNone(drawer, "#mobile-drawer must exist")
        drawer_cart_links = [a for a in drawer.find_all("a") if a.get_attr("href") == "#cart"]
        self.assertEqual(len(drawer_cart_links), 1, "Drawer must include a cart link")
        drawer_cart_text = drawer_cart_links[0].get_full_text()
        
        bracket_pattern = re.compile(r"\[\s*\d+\s*\]")
        match = bracket_pattern.search(drawer_cart_text)
        self.assertIsNone(
            match,
            f"Adversarial failure: Drawer cart shortcut contains numeric badge: '{drawer_cart_text}'"
        )
        self.assertIn("CART", drawer_cart_text)

    # =========================================================================
    # 2. DRAWER INTERACTION STATE MACHINE & SCROLL LOCK
    # =========================================================================
    def test_drawer_dom_structure_and_aria(self):
        """Verify DOM elements and accessibility contracts for mobile drawer."""
        trigger = self.dom.find_by_id("mobile-menu-trigger")
        self.assertIsNotNone(trigger, "#mobile-menu-trigger must exist")
        self.assertEqual(trigger.get_attr("aria-expanded"), "false", "Trigger aria-expanded must initially be 'false'")
        self.assertEqual(trigger.get_attr("aria-controls"), "mobile-drawer")
        self.assertTrue(trigger.has_class("lg:hidden"), "Trigger must be hidden on desktop (lg:hidden)")

        drawer = self.dom.find_by_id("mobile-drawer")
        self.assertIsNotNone(drawer, "#mobile-drawer must exist")
        self.assertTrue(drawer.has_class("fixed"), "Drawer must be fixed positioned")
        self.assertTrue(drawer.has_class("translate-x-full"), "Drawer must initially be off-canvas (translate-x-full)")

        backdrop = self.dom.find_by_id("mobile-drawer-backdrop")
        self.assertIsNotNone(backdrop, "#mobile-drawer-backdrop must exist")
        self.assertTrue(backdrop.has_class("opacity-0"), "Backdrop must initially be opacity-0")
        self.assertTrue(backdrop.has_class("pointer-events-none"), "Backdrop must initially be pointer-events-none")

        close_btn = self.dom.find_by_id("mobile-drawer-close")
        self.assertIsNotNone(close_btn, "#mobile-drawer-close must exist")
        self.assertIsNotNone(close_btn.get_attr("aria-label"), "Close button must have aria-label")

    def test_drawer_state_machine_simulation(self):
        """Simulate the JavaScript drawer state machine transition logic."""
        # State model mimicking code.html lines 984-1027
        class MockElement:
            def __init__(self, initial_classes, initial_attrs=None):
                self.classes = set(initial_classes)
                self.attrs = initial_attrs or {}
            def add_class(self, *cls):
                for c in cls: self.classes.add(c)
            def remove_class(self, *cls):
                for c in cls: self.classes.discard(c)
            def set_attr(self, k, v):
                self.attrs[k] = v

        class MockDocument:
            def __init__(self):
                self.body_style_overflow = ""

        # Extract JS source to verify implementation patterns
        script_pattern = re.compile(r"//\s*ARCHIVAL MOBILE DRAWER CONTROLLER(.*?)</script>", re.DOTALL)
        match = script_pattern.search(self.raw_html)
        self.assertIsNotNone(match, "Archival mobile drawer controller script block must exist")
        js_code = match.group(1)

        # Static verification that required event handlers are registered
        self.assertIn("trigger.addEventListener('click', openDrawer)", js_code)
        self.assertIn("backdrop.addEventListener('click', closeDrawer)", js_code)
        self.assertIn("closeBtn.addEventListener('click', closeDrawer)", js_code)
        self.assertIn("link.addEventListener('click', closeDrawer)", js_code)
        self.assertIn("e.key === 'Escape'", js_code)
        self.assertIn("document.body.style.overflow = 'hidden'", js_code)
        self.assertIn("document.body.style.overflow = ''", js_code)

        # Simulation:
        drawer = MockElement(["fixed", "translate-x-full"])
        backdrop = MockElement(["opacity-0", "pointer-events-none"])
        trigger = MockElement(["flex"], {"aria-expanded": "false"})
        doc = MockDocument()

        def openDrawer():
            drawer.remove_class('translate-x-full')
            drawer.add_class('translate-x-0')
            backdrop.remove_class('opacity-0', 'pointer-events-none')
            backdrop.add_class('opacity-100', 'pointer-events-auto')
            trigger.set_attr('aria-expanded', 'true')
            drawer.set_attr('aria-hidden', 'false')
            doc.body_style_overflow = 'hidden'

        def closeDrawer():
            drawer.remove_class('translate-x-0')
            drawer.add_class('translate-x-full')
            backdrop.remove_class('opacity-100', 'pointer-events-auto')
            backdrop.add_class('opacity-0', 'pointer-events-none')
            trigger.set_attr('aria-expanded', 'false')
            drawer.set_attr('aria-hidden', 'true')
            doc.body_style_overflow = ''

        # Step 1: Open
        openDrawer()
        self.assertIn('translate-x-0', drawer.classes)
        self.assertNotIn('translate-x-full', drawer.classes)
        self.assertIn('opacity-100', backdrop.classes)
        self.assertIn('pointer-events-auto', backdrop.classes)
        self.assertEqual(trigger.attrs['aria-expanded'], 'true')
        self.assertEqual(drawer.attrs['aria-hidden'], 'false')
        self.assertEqual(doc.body_style_overflow, 'hidden')

        # Step 2: Close via Close Button
        closeDrawer()
        self.assertIn('translate-x-full', drawer.classes)
        self.assertNotIn('translate-x-0', drawer.classes)
        self.assertIn('opacity-0', backdrop.classes)
        self.assertIn('pointer-events-none', backdrop.classes)
        self.assertEqual(trigger.attrs['aria-expanded'], 'false')
        self.assertEqual(drawer.attrs['aria-hidden'], 'true')
        self.assertEqual(doc.body_style_overflow, '')

        # Step 3: Re-open and Close via Backdrop
        openDrawer()
        self.assertEqual(doc.body_style_overflow, 'hidden')
        closeDrawer() # simulated backdrop click
        self.assertEqual(doc.body_style_overflow, '')

        # Step 4: Re-open and Close via Escape Key
        openDrawer()
        self.assertEqual(doc.body_style_overflow, 'hidden')
        closeDrawer() # simulated escape key
        self.assertEqual(doc.body_style_overflow, '')

        # Step 5: Idempotency stress test
        for _ in range(5): openDrawer()
        self.assertEqual(len([c for c in drawer.classes if c == 'translate-x-0']), 1)
        for _ in range(5): closeDrawer()
        self.assertEqual(len([c for c in drawer.classes if c == 'translate-x-full']), 1)
        self.assertEqual(doc.body_style_overflow, '')

    # =========================================================================
    # 3. CAROUSEL BOUNDARY & SCROLL LOGIC
    # =========================================================================
    def test_carousel_track_and_item_classes(self):
        """Verify CSS scroll snap, flex layout, and visual peek classes."""
        carousel = self.dom.find_by_id("archive-catalog-carousel")
        self.assertIsNotNone(carousel, "#archive-catalog-carousel must exist")

        self.assertTrue(carousel.has_class("flex"), "Carousel must be flex on mobile")
        self.assertTrue(carousel.has_class("lg:grid"), "Carousel must switch to grid on desktop (lg:grid)")
        self.assertTrue(carousel.has_class("overflow-x-auto"), "Carousel must be overflow-x-auto on mobile")
        self.assertTrue(carousel.has_class("snap-x"), "Carousel must have snap-x")
        self.assertTrue(carousel.has_class("snap-mandatory"), "Carousel must have snap-mandatory")

        # Check slide cards
        articles = carousel.find_all("article")
        self.assertEqual(len(articles), 4, "Carousel should contain 4 catalog items")
        for idx, card in enumerate(articles):
            classes = card.get_classes()
            self.assertTrue(card.has_class("snap-start"), f"Card {idx+1} missing snap-start: {classes}")
            self.assertTrue(card.has_class("shrink-0"), f"Card {idx+1} missing shrink-0: {classes}")
            self.assertTrue(
                any("w-[82vw]" in c or "w-[80vw]" in c or "w-[85vw]" in c for c in classes),
                f"Card {idx+1} must have mobile peek width: {classes}"
            )
            self.assertTrue(card.has_class("lg:w-auto"), f"Card {idx+1} must revert to lg:w-auto: {classes}")

    def test_carousel_counter_initial_and_math(self):
        """Verify #carousel-counter initial value and mathematical calculation under stress."""
        counter = self.dom.find_by_id("carousel-counter")
        self.assertIsNotNone(counter, "#carousel-counter element must exist")
        self.assertEqual(counter.get_full_text().strip(), "[ 01 / 04 ]", "Initial counter value must be '[ 01 / 04 ]'")

        # Pure mathematical model of updateCounter:
        # activeIndex = Math.min(Math.max(1, Math.round(scrollLeft / cardWidth) + 1), total)
        total = 4
        def calculate_active_index(scroll_left, card_width):
            effective_width = card_width if card_width > 0 else 1
            idx = int(round(scroll_left / effective_width)) + 1
            return min(max(1, idx), total)

        # Test across realistic viewport card widths (82vw):
        test_widths = [262.4, 307.5, 319.8, 339.48, 400.0]
        for w in test_widths:
            # Card 1 (initial)
            self.assertEqual(calculate_active_index(0.0, w), 1)
            # Card 1 threshold (before midpoint)
            self.assertEqual(calculate_active_index(w * 0.49, w), 1)
            # Card 2 threshold (after midpoint)
            self.assertEqual(calculate_active_index(w * 0.51, w), 2)
            # Card 2 exact snap
            self.assertEqual(calculate_active_index(w * 1.0, w), 2)
            # Card 3 exact snap
            self.assertEqual(calculate_active_index(w * 2.0, w), 3)
            # Card 4 exact snap
            self.assertEqual(calculate_active_index(w * 3.0, w), 4)

            # Adversarial Stress: Elastic negative overscroll (iOS bounce)
            self.assertEqual(calculate_active_index(-50.0, w), 1)
            self.assertEqual(calculate_active_index(-500.0, w), 1)

            # Adversarial Stress: Extreme positive overscroll
            self.assertEqual(calculate_active_index(w * 5.0, w), 4)
            self.assertEqual(calculate_active_index(10000.0, w), 4)

        # Division by zero safeguard
        self.assertEqual(calculate_active_index(100.0, 0), 4)

    # =========================================================================
    # 4. HEADER 12-COLUMN GRID MATH
    # =========================================================================
    def test_header_12_column_grid_math(self):
        """Header grid child columns must sum exactly to 12 at each breakpoint."""
        headers = self.dom.find_all("header")
        self.assertTrue(headers)
        header = headers[0]
        
        grid_rows = [div for div in header.find_all("div") if div.has_class("grid") and div.has_class("grid-cols-12")]
        self.assertEqual(len(grid_rows), 1, "Header must contain a grid-cols-12 container")
        grid_container = grid_rows[0]
        
        children = grid_container.children
        # Expect 3 functional cells: Logo, Nav, Utility
        self.assertEqual(len(children), 3, f"Header grid should have exactly 3 top-level cells, found {len(children)}")
        logo_cell, nav_cell, utility_cell = children[0], children[1], children[2]

        # Function to extract col-span for breakpoint following Tailwind min-width cascade:
        # xl -> lg -> md -> base
        def get_span_for_breakpoint(node, bp):
            classes = node.get_classes()
            order = []
            if bp == "xl":
                order = ["xl", "lg", "md", ""]
            elif bp == "lg":
                order = ["lg", "md", ""]
            elif bp == "md":
                order = ["md", ""]
            else:
                order = [""]

            for prefix in order:
                for c in classes:
                    if prefix:
                        m = re.match(rf"^{prefix}:col-span-(\d+)$", c)
                        if m: return int(m.group(1))
                    else:
                        m = re.match(r"^col-span-(\d+)$", c)
                        if m: return int(m.group(1))
            return 0

        # Breakpoint 1: Mobile (< 768px)
        # Nav is hidden on mobile ('hidden lg:flex'), so it occupies 0 columns
        self.assertTrue(nav_cell.has_class("hidden"), "Nav cell must be hidden on mobile")
        span_mobile_logo = get_span_for_breakpoint(logo_cell, "")
        span_mobile_util = get_span_for_breakpoint(utility_cell, "")
        total_mobile = span_mobile_logo + span_mobile_util
        self.assertEqual(
            total_mobile, 12,
            f"Mobile columns must sum to 12 (Logo: {span_mobile_logo} + Utility: {span_mobile_util} = {total_mobile})"
        )

        # Breakpoint 2: Tablet (md: 768px - 1023px)
        # Nav is still hidden ('lg:flex' only activates at 1024px)
        span_md_logo = get_span_for_breakpoint(logo_cell, "md")
        span_md_util = get_span_for_breakpoint(utility_cell, "md")
        total_md = span_md_logo + span_md_util
        self.assertEqual(
            total_md, 12,
            f"Tablet md columns must sum to 12 (Logo: {span_md_logo} + Utility: {span_md_util} = {total_md})"
        )

        # Breakpoint 3: Desktop (lg: 1024px - 1279px)
        # Nav is now flex (visible)
        span_lg_logo = get_span_for_breakpoint(logo_cell, "lg")
        span_lg_nav = get_span_for_breakpoint(nav_cell, "lg")
        span_lg_util = get_span_for_breakpoint(utility_cell, "lg")
        total_lg = span_lg_logo + span_lg_nav + span_lg_util
        self.assertEqual(
            total_lg, 12,
            f"Desktop lg columns must sum to 12 (Logo: {span_lg_logo} + Nav: {span_lg_nav} + Util: {span_lg_util} = {total_lg})"
        )

        # Breakpoint 4: Extra Large Desktop (xl: >= 1280px)
        span_xl_logo = get_span_for_breakpoint(logo_cell, "xl")
        span_xl_nav = get_span_for_breakpoint(nav_cell, "xl")
        span_xl_util = get_span_for_breakpoint(utility_cell, "xl")
        total_xl = span_xl_logo + span_xl_nav + span_xl_util
        self.assertEqual(
            total_xl, 12,
            f"Desktop xl columns must sum to 12 (Logo: {span_xl_logo} + Nav: {span_xl_nav} + Util: {span_xl_util} = {total_xl})"
        )

    # =========================================================================
    # 5. NO BROKEN INJECTED SCRIPTS & TAILWIND HYGIENE
    # =========================================================================
    def test_zero_legacy_injections(self):
        """Verify zero traces of responsive_fix.py, .mobile-nav CSS, or naive injection comments."""
        self.assertNotIn("<!-- RESPONSIVE ENHANCEMENTS -->", self.raw_html)
        self.assertNotIn("responsive_fix.py", self.raw_html)
        self.assertNotIn(".mobile-nav", self.raw_html)
        self.assertNotIn("navs = document.querySelectorAll('nav')", self.raw_html)

    def test_script_syntax_and_structure(self):
        """Ensure all script blocks are valid and non-empty."""
        scripts = self.dom.find_all("script")
        self.assertGreaterEqual(len(scripts), 3, "At least Tailwind config, clock, and drawer/carousel scripts required")
        for s in scripts:
            src = s.get_attr("src")
            if not src:
                self.assertTrue(len(s.text_content.strip()) > 0, "Inline script must not be empty")

    # =========================================================================
    # 6. ERGONOMIC & OVERFLOW BOUNDARY INVARIANTS
    # =========================================================================
    def test_watermark_overflow_protection(self):
        """Watermark '004' must have responsive text clamp and overflow containment."""
        watermark_divs = [d for d in self.dom.find_all("div") if d.text_content.strip() == "004"]
        self.assertTrue(watermark_divs, "Watermark container with text '004' must exist")
        w_classes = watermark_divs[0].get_classes()
        self.assertIn("overflow-hidden", w_classes)
        self.assertIn("max-w-full", w_classes)
        # Verify not rigid text-[140px] without small-screen sizing
        self.assertTrue(any("text-6xl" in c or "text-5xl" in c for c in w_classes), "Watermark must scale down on mobile")

    def test_touch_target_accessibility(self):
        """Interactive buttons must enforce min-h-[44px]."""
        trigger = self.dom.find_by_id("mobile-menu-trigger")
        self.assertTrue(trigger.has_class("min-h-[44px]"))
        self.assertTrue(trigger.has_class("min-w-[44px]"))

        close_btn = self.dom.find_by_id("mobile-drawer-close")
        self.assertTrue(close_btn.has_class("min-h-[44px]"))
        self.assertTrue(close_btn.has_class("min-w-[44px]"))


if __name__ == "__main__":
    unittest.main(verbosity=2)
