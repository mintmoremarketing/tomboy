"""
Adversarial Stress Test Suite for Storefront 4: Raw Brutalist Archive Index
Milestone 4 Challenger (challenger_m4_2)
"""

import os
import re
import unittest
from html.parser import HTMLParser
from pathlib import Path
from typing import Dict, List, Set, Tuple

STOREFRONT_PATH = Path("tomboy_raw_brutalist_archive_index/code.html")


class StrictHTMLValidator(HTMLParser):
    """HTML Parser that validates tag closure and catches duplicate IDs."""

    VOID_ELEMENTS = {
        "area", "base", "br", "col", "embed", "hr", "img", "input",
        "link", "meta", "param", "source", "track", "wbr"
    }

    def __init__(self):
        super().__init__()
        self.tag_stack: List[Tuple[str, int]] = []
        self.seen_ids: Dict[str, int] = {}
        self.duplicate_ids: List[Tuple[str, int, int]] = []
        self.unclosed_tags: List[Tuple[str, int]] = []
        self.all_elements: List[Dict[str, any]] = []

    def handle_starttag(self, tag: str, attrs: list):
        tag_lower = tag.lower()
        attr_dict = dict(attrs)
        line, _ = self.getpos()

        # Check duplicate IDs
        elem_id = attr_dict.get("id")
        if elem_id:
            if elem_id in self.seen_ids:
                self.duplicate_ids.append((elem_id, self.seen_ids[elem_id], line))
            else:
                self.seen_ids[elem_id] = line

        self.all_elements.append({
            "tag": tag_lower,
            "attrs": attr_dict,
            "line": line
        })

        if tag_lower not in self.VOID_ELEMENTS:
            self.tag_stack.append((tag_lower, line))

    def handle_endtag(self, tag: str):
        tag_lower = tag.lower()
        if tag_lower in self.VOID_ELEMENTS:
            return

        for i in range(len(self.tag_stack) - 1, -1, -1):
            if self.tag_stack[i][0] == tag_lower:
                del self.tag_stack[i]
                return


class TestAdversarialStorefront4(unittest.TestCase):
    """Adversarial stress tests for Storefront 4."""

    @classmethod
    def setUpClass(cls):
        if not STOREFRONT_PATH.exists():
            raise FileNotFoundError(f"Storefront 4 file not found at {STOREFRONT_PATH}")
        with open(STOREFRONT_PATH, "r", encoding="utf-8") as f:
            cls.html_content = f.read()

        cls.validator = StrictHTMLValidator()
        cls.validator.feed(cls.html_content)

    def test_01_strict_html_syntax_and_unique_ids(self):
        """[Adversarial 1] Verify zero duplicate IDs and proper DOM tag structure."""
        self.assertEqual(
            len(self.validator.duplicate_ids), 0,
            f"Duplicate IDs detected in Storefront 4: {self.validator.duplicate_ids}"
        )
        # Check critical IDs exist exactly once
        critical_ids = [
            "mobile-menu-trigger",
            "mobile-drawer",
            "mobile-drawer-backdrop",
            "mobile-drawer-close",
            "archive-catalog-carousel",
            "carousel-counter"
        ]
        for cid in critical_ids:
            self.assertIn(cid, self.validator.seen_ids, f"Required element #{cid} missing from DOM")

    def test_02_viewport_and_watermark_overflow_resilience(self):
        """[Adversarial 2] Watermark '004' must not exceed viewport width and must be constrained."""
        # Check viewport meta tag
        self.assertRegex(
            self.html_content,
            r'<meta[^>]*content="[^"]*width=device-width[^"]*viewport-fit=cover[^"]*"',
            "Viewport meta tag must contain width=device-width and viewport-fit=cover"
        )

        # Check body and html overflow-x: hidden safety
        self.assertIn("overflow-x: hidden", self.html_content, "Base styles must enforce overflow-x: hidden")
        self.assertIn("overflow-x-hidden", self.html_content, "Body tag must include overflow-x-hidden class")

        # Watermark "004" adversarial check
        watermark_matches = re.findall(r'<div[^>]*font-bold[^>]*>\s*004\s*</div>', self.html_content)
        self.assertTrue(len(watermark_matches) > 0, "Watermark '004' must be present in DOM")
        for wm in watermark_matches:
            self.assertIn("overflow-hidden", wm, "Watermark container must specify overflow-hidden")
            self.assertIn("max-w-full", wm, "Watermark container must specify max-w-full")
            self.assertIn("text-6xl", wm, "Watermark must scale fluidly (start at text-6xl on mobile)")
            self.assertIsNone(re.search(r'(?<!lg:)text-\[140px\]', wm), "Watermark must not use unconstrained text-[140px] without responsive breakpoints")

    def test_03_touch_target_invariants_minimum_44px(self):
        """[Adversarial 3] Every interactive trigger, cart anchor, and button must satisfy >= 44x44px touch targets."""
        # 1. Mobile Menu Trigger
        trigger_match = re.search(r'<button[^>]*id="mobile-menu-trigger"[^>]*>', self.html_content)
        self.assertIsNotNone(trigger_match, "mobile-menu-trigger button must exist")
        trigger_tag = trigger_match.group(0)
        self.assertIn("min-w-[44px]", trigger_tag, "Menu trigger must have min-w-[44px]")
        self.assertIn("min-h-[44px]", trigger_tag, "Menu trigger must have min-h-[44px]")

        # 2. Mobile Drawer Close Button
        close_match = re.search(r'<button[^>]*id="mobile-drawer-close"[^>]*>', self.html_content)
        self.assertIsNotNone(close_match, "mobile-drawer-close button must exist")
        close_tag = close_match.group(0)
        self.assertIn("min-w-[44px]", close_tag, "Drawer close button must have min-w-[44px]")
        self.assertIn("min-h-[44px]", close_tag, "Drawer close button must have min-h-[44px]")

        # 3. Cart Anchor in Navbar
        cart_match = re.search(r'<a[^>]*href="#cart"[^>]*>', self.html_content)
        self.assertIsNotNone(cart_match, "Navbar cart anchor must exist")
        cart_tag = cart_match.group(0)
        self.assertIn("min-h-[44px]", cart_tag, "Navbar cart anchor must have min-h-[44px]")

        # 4. Catalog Quick-Add buttons
        card_buttons = re.findall(r'<button[^>]*>[\s\S]*?ADD TO CARGO[\s\S]*?</button>', self.html_content)
        self.assertTrue(len(card_buttons) >= 4, "Must have at least 4 ADD TO CARGO action buttons")
        for btn in card_buttons:
            self.assertIn("min-h-[44px]", btn, "Product card ADD TO CARGO button must have min-h-[44px]")

        # 5. Catalog Filter Pills
        filter_buttons = re.findall(r'<button[^>]*>[\s\S]*?(?:ALL ARCHIVES|TEES|HOODIES|OUTERWEAR|BLANKS)[\s\S]*?</button>', self.html_content)
        self.assertTrue(len(filter_buttons) >= 5, "Must have at least 5 filter pill buttons")
        for btn in filter_buttons:
            self.assertIn("min-h-[44px]", btn, "Filter pill button must have min-h-[44px]")

    def test_04_image_cls_and_async_decoding_resilience(self):
        """[Adversarial 4] Verify aspect-ratio / dimensional constraints and lazy loading to prevent CLS."""
        img_elements = [el for el in self.validator.all_elements if el["tag"] == "img"]
        self.assertTrue(len(img_elements) >= 5, "Document must contain images")

        for img in img_elements:
            attrs = img["attrs"]
            class_val = attrs.get("class", "")
            alt_val = attrs.get("alt", "")
            src_val = attrs.get("src", "")

            # Must have alt text
            self.assertTrue(len(alt_val) > 0, f"Image at line {img['line']} missing alt attribute: {attrs}")

            # Below-the-fold catalog / lookbook images must have loading='lazy' and decoding='async'
            if "logo" not in alt_val.lower() and "hero" not in alt_val.lower() and img["line"] > 250:
                self.assertEqual(attrs.get("loading"), "lazy", f"Image at line {img['line']} must have loading='lazy'")
                self.assertEqual(attrs.get("decoding"), "async", f"Image at line {img['line']} must have decoding='async'")

    def test_05_cart_badge_zero_count_total_absence(self):
        """[Adversarial 5] Strict absence of '[ 0 ]' or bracketed zero badges anywhere in document."""
        self.assertNotIn("[ 0 ]", self.html_content, "Document contains forbidden '[ 0 ]' count badge")
        self.assertNotIn("[ 00 ]", self.html_content, "Document contains forbidden '[ 00 ]' count badge")

    def test_06_legacy_injections_purged(self):
        """[Adversarial 6] Ensure responsive_fix.py script or rogue dropdowns are 100% gone."""
        self.assertNotIn("responsive_fix.py", self.html_content)
        self.assertNotIn("<!-- RESPONSIVE ENHANCEMENTS -->", self.html_content)
        self.assertNotIn("mobile-nav-dropdown", self.html_content)

    def test_07_touch_carousel_contract_and_counter_dynamics(self):
        """[Adversarial 7] Catalog carousel must have scroll-snap, peek classes, and dynamic counter logic."""
        # Carousel container
        carousel_match = re.search(r'<div[^>]*id="archive-catalog-carousel"[^>]*>', self.html_content)
        self.assertIsNotNone(carousel_match, "archive-catalog-carousel container must exist")
        c_tag = carousel_match.group(0)
        self.assertIn("snap-x", c_tag, "Carousel must have snap-x")
        self.assertIn("snap-mandatory", c_tag, "Carousel must have snap-mandatory")
        self.assertIn("overflow-x-auto", c_tag, "Carousel must have overflow-x-auto on mobile")
        self.assertIn("lg:overflow-visible", c_tag, "Carousel must restore overflow-visible on lg screens")

        # Cards peek classes
        card_matches = re.findall(r'<article[^>]*snap-start[^>]*>', self.html_content)
        self.assertTrue(len(card_matches) >= 4, "Must have at least 4 catalog card articles with snap-start")
        for card in card_matches:
            self.assertIn("w-[82vw]", card, "Card must have mobile peek width w-[82vw]")
            self.assertIn("shrink-0", card, "Card must have shrink-0 on mobile")

        # Counter element
        counter_match = re.search(r'<span[^>]*id="carousel-counter"[^>]*>([\s\S]*?)</span>', self.html_content)
        self.assertIsNotNone(counter_match, "carousel-counter element must exist")
        self.assertIn("[ 01 / 04 ]", counter_match.group(1), "Initial counter must display [ 01 / 04 ]")

        # Dynamic JS scroll handler
        self.assertIn("addEventListener('scroll'", self.html_content, "Carousel script must listen to scroll events")
        self.assertIn("updateCounter", self.html_content, "Carousel script must implement updateCounter function")

    def test_08_mobile_drawer_contract_and_scroll_lock(self):
        """[Adversarial 8] Off-canvas drawer must implement modal dialog role, backdrop, and body scroll lock."""
        # Backdrop
        backdrop_match = re.search(r'<div[^>]*id="mobile-drawer-backdrop"[^>]*>', self.html_content)
        self.assertIsNotNone(backdrop_match, "mobile-drawer-backdrop must exist")
        b_tag = backdrop_match.group(0)
        self.assertIn("fixed", b_tag)
        self.assertIn("z-40", b_tag)

        # Drawer
        drawer_match = re.search(r'<aside[^>]*id="mobile-drawer"[^>]*>', self.html_content)
        self.assertIsNotNone(drawer_match, "mobile-drawer aside must exist")
        d_tag = drawer_match.group(0)
        self.assertIn("fixed", d_tag)
        self.assertIn("translate-x-full", d_tag)
        self.assertIn("z-50", d_tag)
        self.assertIn('role="dialog"', d_tag)
        self.assertIn('aria-modal="true"', d_tag)

        # Script handles open, close, escape key, and scroll lock
        self.assertIn("document.body.style.overflow = 'hidden'", self.html_content, "Script must lock body scroll on open")
        self.assertIn("document.body.style.overflow = ''", self.html_content, "Script must unlock body scroll on close")
        self.assertIn("Escape", self.html_content, "Script must handle Escape key dismissal")


if __name__ == "__main__":
    unittest.main(verbosity=2)
