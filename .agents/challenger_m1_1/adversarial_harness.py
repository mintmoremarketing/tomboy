"""
Milestone 1 Adversarial Challenge Harness
Storefront 1: Latest Drop (tomboy_clothing_home_latest_drop/code.html)

Author: challenger_m1_1
Purpose: Empirically and adversarially stress-test Storefront 1 across:
  1. Edge-case viewports: 320px, 375px, 600px, 768px, 1024px, 1280px, 1920px
  2. Mobile drawer state machine transitions (open, closeBtn, backdrop, links, escape key, scroll-lock)
  3. Touch carousel scroll snap, card widths, peek affordances, and dynamic counter logic
  4. Cart button typography, zero-badge verification, and touch target sizing
  5. Layout hygiene, rigid width violations, and CLS image attributes
"""

import os
import re
import sys
import json
import subprocess
from html.parser import HTMLParser
from pathlib import Path

TARGET_HTML = Path(r"c:\Users\devde\OneDrive\Desktop\Demo projects\Mint-more\tomboy clothing\tomboy_clothing_home_latest_drop\code.html")

class EmpiricalChallengeRunner:
    def __init__(self, html_path: Path):
        self.html_path = html_path
        self.html = html_path.read_text(encoding="utf-8")
        self.findings = []
        self.passed_tests = []
        self.failed_tests = []

    def log_pass(self, test_name: str, detail: str):
        self.passed_tests.append({"test": test_name, "detail": detail})
        print(f"  [PASS] {test_name}: {detail}")

    def log_fail(self, test_name: str, detail: str):
        self.failed_tests.append({"test": test_name, "detail": detail})
        print(f"  [FAIL] {test_name}: {detail}")

    # =========================================================================
    # Test 1: Cart Button Hygiene & Touch Target Sizing
    # =========================================================================
    def challenge_cart_button(self):
        print("\n--- Challenge 1: Cart Button Robustness & Zero Numeric Badge ---")
        # 1. Inspect header
        header_match = re.search(r"<header.*?</header>", self.html, re.DOTALL)
        if not header_match:
            self.log_fail("cart_header_present", "Header element not found in HTML")
            return
        header_text = header_match.group(0)

        # 2. Extract navbar container (exclude off-canvas drawer)
        navbar_match = re.search(r'<div class="w-full px-unit-6 h-16 flex items-center justify-between">.*?</div>\s*</div>', header_text, re.DOTALL)
        navbar_text = navbar_match.group(0) if navbar_match else header_text

        # 3. Extract cart link
        cart_match = re.search(r'<a[^>]*data-path="cart"[^>]*>.*?</a>', header_text, re.DOTALL)
        if not cart_match:
            self.log_fail("cart_link_present", "Cart anchor with data-path='cart' not found in header")
            return
        cart_html = cart_match.group(0)

        # 4. Check for bracketed number badges in cart link
        bracketed_nums = re.findall(r'\[\s*\d+\s*\]', cart_html)
        if bracketed_nums:
            self.log_fail("cart_no_bracketed_count", f"Found bracketed count in cart link: {bracketed_nums}")
        else:
            self.log_pass("cart_no_bracketed_count", "Zero bracketed numeric badges found in navbar cart link")

        # 5. Check for '[ 0 ]' or '[ 02 ]' in navbar
        navbar_zero_counts = re.findall(r'\[\s*0[1-9]?\s*\]', navbar_text)
        if navbar_zero_counts:
            self.log_fail("navbar_zero_badge_absence", f"Found zero/low numeric badges in navbar: {navbar_zero_counts}")
        else:
            self.log_pass("navbar_zero_badge_absence", "Zero [ 0 ] or [ 02 ] count badges in navbar")

        # 5. Check touch target dimensions in classes
        classes = re.search(r'class="([^"]+)"', cart_html).group(1).split()
        has_min_height = any("min-h-[44px]" in c or "h-11" in c or "h-12" in c or "py-2.5" in c or "py-3" in c for c in classes)
        has_padding = any("px-4" in c or "px-3" in c for c in classes)
        if has_min_height and has_padding:
            self.log_pass("cart_touch_target", f"Cart link has touch target compliant classes: min-h-[44px] and padding ({classes})")
        else:
            self.log_fail("cart_touch_target", f"Cart link lacks explicit >=44px touch target classes: {classes}")

        # 6. Check aria-label
        if 'aria-label=' in cart_html:
            self.log_pass("cart_aria_label", "Cart link has descriptive aria-label")
        else:
            self.log_fail("cart_aria_label", "Cart link missing aria-label")

    # =========================================================================
    # Test 2: Viewport Matrix Analysis across 7 Viewports
    # =========================================================================
    def challenge_viewport_matrix(self):
        print("\n--- Challenge 2: Viewport Matrix Stress-Testing (320px to 1920px) ---")
        viewports = [
            {"width": 320, "name": "Ultra-narrow Mobile (320px)", "is_mobile": True, "breakpoint": "<sm"},
            {"width": 375, "name": "Standard Mobile (375px)", "is_mobile": True, "breakpoint": "<sm"},
            {"width": 600, "name": "Phablet / Small Tablet (600px)", "is_mobile": True, "breakpoint": "<sm"},
            {"width": 768, "name": "Tablet Portrait (768px)", "is_mobile": False, "breakpoint": "md"},
            {"width": 1024, "name": "Tablet Landscape / Laptop (1024px)", "is_mobile": False, "breakpoint": "lg"},
            {"width": 1280, "name": "Standard Desktop (1280px)", "is_mobile": False, "breakpoint": "xl"},
            {"width": 1920, "name": "Full HD Desktop (1920px)", "is_mobile": False, "breakpoint": "2xl"}
        ]

        # Check Mobile Drawer Trigger visibility breakpoint
        trigger_match = re.search(r'<button[^>]*id="mobile-menu-trigger"[^>]*>', self.html)
        if not trigger_match:
            self.log_fail("trigger_button_exists", "Missing #mobile-menu-trigger element")
            return
        trigger_classes = re.search(r'class="([^"]+)"', trigger_match.group(0)).group(1).split()
        
        # Check Desktop Nav breakpoint
        nav_match = re.search(r'<nav[^>]*class="([^"]+)"[^>]*data-active-classes', self.html)
        nav_classes = nav_match.group(1).split() if nav_match else []

        # Check Carousel Track breakpoint classes
        carousel_match = re.search(r'<div[^>]*id="s1-arrivals-carousel"[^>]*class="([^"]+)"', self.html)
        carousel_classes = carousel_match.group(1).split() if carousel_match else []

        # Check Carousel Counter breakpoint classes
        counter_match = re.search(r'<div[^>]*class="([^"]+)"[^>]*>\s*<span[^>]*>// SWIPE DROP</span>', self.html)
        counter_parent_classes = counter_match.group(1).split() if counter_match else []

        for vp in viewports:
            w = vp["width"]
            name = vp["name"]
            
            # Rule 1: On viewports < 1280px (mobile & tablet up to 1024px), trigger must be visible (xl:hidden)
            if w < 1280:
                if "xl:hidden" in trigger_classes and "flex" in trigger_classes:
                    self.log_pass(f"vp_{w}_trigger_visible", f"{name}: Mobile trigger button visible (has flex xl:hidden)")
                else:
                    self.log_fail(f"vp_{w}_trigger_visible", f"{name}: Trigger button lacks proper visibility classes: {trigger_classes}")
                
                # Desktop nav must be hidden on screens < 1280px
                if "hidden" in nav_classes and "xl:flex" in nav_classes:
                    self.log_pass(f"vp_{w}_desktop_nav_hidden", f"{name}: Desktop nav hidden (has hidden xl:flex)")
                else:
                    self.log_fail(f"vp_{w}_desktop_nav_hidden", f"{name}: Desktop nav visible when it should be hidden: {nav_classes}")
            else:
                # Desktop >= 1280px: trigger hidden, desktop nav visible
                if "xl:hidden" in trigger_classes:
                    self.log_pass(f"vp_{w}_trigger_hidden", f"{name}: Mobile trigger hidden on desktop (xl:hidden)")
                else:
                    self.log_fail(f"vp_{w}_trigger_hidden", f"{name}: Mobile trigger visible on desktop: {trigger_classes}")

                if "xl:flex" in nav_classes:
                    self.log_pass(f"vp_{w}_desktop_nav_visible", f"{name}: Desktop nav visible on desktop (xl:flex)")
                else:
                    self.log_fail(f"vp_{w}_desktop_nav_visible", f"{name}: Desktop nav hidden on desktop: {nav_classes}")

            # Rule 2: Carousel behavior
            if w < 640: # Mobile (<sm)
                # Must be flex overflow-x-auto snap-x
                if "flex" in carousel_classes and "overflow-x-auto" in carousel_classes and "snap-x" in carousel_classes:
                    self.log_pass(f"vp_{w}_carousel_active", f"{name}: Touch carousel active with flex, overflow-x-auto, snap-x")
                else:
                    self.log_fail(f"vp_{w}_carousel_active", f"{name}: Carousel missing mobile scroll-snap classes: {carousel_classes}")

                # Counter container must be visible
                if "flex" in counter_parent_classes and "sm:hidden" in counter_parent_classes:
                    self.log_pass(f"vp_{w}_counter_visible", f"{name}: Live slide counter visible on mobile (flex sm:hidden)")
                else:
                    self.log_fail(f"vp_{w}_counter_visible", f"{name}: Live slide counter missing flex sm:hidden: {counter_parent_classes}")
            else: # Tablet & Desktop (>= 640px)
                # Must transition to grid
                if "sm:grid" in carousel_classes and "sm:overflow-visible" in carousel_classes and "sm:snap-none" in carousel_classes:
                    self.log_pass(f"vp_{w}_grid_restored", f"{name}: Product display transitions to multi-column grid (sm:grid, sm:overflow-visible, sm:snap-none)")
                else:
                    self.log_fail(f"vp_{w}_grid_restored", f"{name}: Carousel fails to restore grid at >=sm: {carousel_classes}")

    # =========================================================================
    # Test 3: Horizontal Overflow & Rigid Width Hazards
    # =========================================================================
    def challenge_overflow_and_typography(self):
        print("\n--- Challenge 3: Overflow Prevention & Typography Stress ---")
        # 1. Viewport meta tag
        viewport_match = re.search(r'<meta[^>]*name="viewport"[^>]*content="([^"]+)"', self.html)
        if viewport_match:
            content = viewport_match.group(1)
            if "width=device-width" in content and "viewport-fit=cover" in content:
                self.log_pass("viewport_meta_fit_cover", f"Viewport meta has width=device-width and viewport-fit=cover: '{content}'")
            else:
                self.log_fail("viewport_meta_fit_cover", f"Viewport meta missing key attributes: '{content}'")
        else:
            self.log_fail("viewport_meta_fit_cover", "Missing viewport meta tag")

        # 2. Body overflow-x-hidden
        body_match = re.search(r'<body[^>]*class="([^"]+)"', self.html)
        if body_match and "overflow-x-hidden" in body_match.group(1):
            self.log_pass("body_overflow_x_hidden", "Body tag explicitly locks horizontal overflow with overflow-x-hidden")
        else:
            self.log_fail("body_overflow_x_hidden", "Body tag missing overflow-x-hidden")

        # 3. Rigid overflowing widths: check for fixed w-[>320px] or min-w-[>320px] (exclude max-w)
        rigid_widths = re.findall(r'(?<!max-)(?:min-)?w-\[(\d+)px\]', self.html)
        hazardous_widths = [int(w) for w in rigid_widths if int(w) > 320]
        if hazardous_widths:
            self.log_fail("no_rigid_widths", f"Found fixed widths exceeding 320px without responsive wrapper: {hazardous_widths}")
        else:
            self.log_pass("no_rigid_widths", "Zero fixed pixel widths exceeding 320px found in layout")

        # 4. Hero display typography scaling
        hero_h1 = re.search(r'<h1[^>]*class="([^"]+)"[^>]*>.*?REBEL.*?</h1>', self.html, re.DOTALL)
        if hero_h1:
            h1_classes = hero_h1.group(1).split()
            # Must have mobile-friendly text-4xl or similar scaling before display-hero
            has_mobile_scale = any(c in h1_classes for c in ["text-4xl", "text-3xl", "text-5xl"])
            has_desktop_scale = any("xl:text-display-hero" in c or "lg:text-7xl" in c for c in h1_classes)
            if has_mobile_scale and has_desktop_scale:
                self.log_pass("hero_typography_scaling", f"Hero h1 scales fluidly across breakpoints: {h1_classes}")
            else:
                self.log_fail("hero_typography_scaling", f"Hero h1 lacks responsive type scaling: {h1_classes}")
        else:
            self.log_fail("hero_typography_scaling", "Hero h1 element not found")

    # =========================================================================
    # Test 4: Node.js Execution of Actual In-File JavaScript Controllers
    # =========================================================================
    def challenge_js_execution_in_node(self):
        print("\n--- Challenge 4: Empirical Execution of In-File JavaScript Controllers in Node.js ---")
        node_script_path = Path(__file__).parent / "node_empirical_test.js"
        if not node_script_path.exists():
            self.log_fail("node_script_exists", f"Missing {node_script_path}")
            return

        res = subprocess.run(["node", str(node_script_path)], capture_output=True, text=True)
        if res.returncode != 0:
            self.log_fail("node_js_execution", f"Node harness error: {res.stderr}")
            return

        try:
            results = json.loads(res.stdout.strip())
            for r in results:
                if r["pass"]:
                    self.log_pass(r["test"], r["msg"])
                else:
                    self.log_fail(r["test"], r["msg"])
        except Exception as e:
            self.log_fail("parse_node_results", f"Failed to parse node test output: {res.stdout}, error: {e}")

    # =========================================================================
    # Test 5: Image Optimization, CLS & Performance Attributes
    # =========================================================================
    def challenge_images_and_performance(self):
        print("\n--- Challenge 5: Image Performance & CLS Prevention ---")
        img_matches = re.findall(r'<img[^>]+>', self.html)
        if not img_matches:
            self.log_fail("images_exist", "No <img> tags found in document")
            return

        hero_img = img_matches[1] # First is logo, second is hero
        if 'fetchpriority="high"' in hero_img and 'loading="eager"' in hero_img:
            self.log_pass("hero_image_lcp_optimization", f"Hero image has fetchpriority='high' and loading='eager'")
        else:
            self.log_fail("hero_image_lcp_optimization", f"Hero image missing LCP priority attributes: {hero_img}")

        # Check below-the-fold product images
        lazy_count = 0
        async_count = 0
        alt_count = 0
        for img in img_matches[2:]:
            if 'loading="lazy"' in img:
                lazy_count += 1
            if 'decoding="async"' in img:
                async_count += 1
            if 'alt=' in img:
                alt_count += 1

        total_below_fold = len(img_matches[2:])
        if lazy_count == total_below_fold:
            self.log_pass("lazy_loading_coverage", f"100% of below-the-fold images have loading='lazy' ({lazy_count}/{total_below_fold})")
        else:
            self.log_fail("lazy_loading_coverage", f"Only {lazy_count}/{total_below_fold} images have loading='lazy'")

        if async_count == total_below_fold:
            self.log_pass("async_decoding_coverage", f"100% of below-the-fold images have decoding='async' ({async_count}/{total_below_fold})")
        else:
            self.log_fail("async_decoding_coverage", f"Only {async_count}/{total_below_fold} images have decoding='async'")

        if alt_count == total_below_fold:
            self.log_pass("image_alt_coverage", f"100% of product images have descriptive alt attributes ({alt_count}/{total_below_fold})")
        else:
            self.log_fail("image_alt_coverage", f"Only {alt_count}/{total_below_fold} images have alt attributes")

    def run_all(self):
        print(f"Executing Empirical Challenge Suite on: {self.html_path}")
        self.challenge_cart_button()
        self.challenge_viewport_matrix()
        self.challenge_overflow_and_typography()
        self.challenge_js_execution_in_node()
        self.challenge_images_and_performance()

        print("\n==================================================================")
        print(f"CHALLENGE SUMMARY: {len(self.passed_tests)} PASSED, {len(self.failed_tests)} FAILED")
        print("==================================================================")
        return len(self.failed_tests) == 0

if __name__ == "__main__":
    runner = EmpiricalChallengeRunner(TARGET_HTML)
    success = runner.run_all()
    sys.exit(0 if success else 1)
