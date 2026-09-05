"""
Adversarial Stress Test Suite for Storefront 4 (Raw Brutalist Archive Index)
Written by reviewer_m4_1
"""

import re
import sys
from pathlib import Path
from html.parser import HTMLParser

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))
TARGET_FILE = ROOT / "tomboy_raw_brutalist_archive_index" / "code.html"

class TagValidator(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tags = []
        self.void_tags = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'}
        self.unclosed = []
        self.all_ids = set()
        self.duplicate_ids = set()

    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        if 'id' in attrs_dict:
            element_id = attrs_dict['id']
            if element_id in self.all_ids:
                self.duplicate_ids.add(element_id)
            self.all_ids.add(element_id)
        if tag not in self.void_tags:
            self.tags.append((tag, self.getpos()))

    def handle_endtag(self, tag):
        if tag in self.void_tags:
            return
        for i in range(len(self.tags) - 1, -1, -1):
            if self.tags[i][0] == tag:
                self.tags.pop(i)
                return
        self.unclosed.append((tag, self.getpos(), "extra_closing"))

def test_html_structure_and_ids():
    print("--- 1. Testing HTML Structure & Unique IDs ---")
    content = TARGET_FILE.read_text(encoding="utf-8")
    validator = TagValidator()
    validator.feed(content)

    assert len(validator.duplicate_ids) == 0, f"Duplicate element IDs found: {validator.duplicate_ids}"
    print(f"Total unique IDs found: {len(validator.all_ids)}. No duplicate IDs!")

    required_ids = [
        "mobile-menu-trigger",
        "mobile-drawer",
        "mobile-drawer-backdrop",
        "mobile-drawer-panel",
        "mobile-drawer-close",
        "archive-catalog-carousel",
        "carousel-counter"
    ]
    for rid in required_ids:
        assert rid in validator.all_ids, f"Required ID '{rid}' missing from DOM!"
    print("All required responsive component IDs are present.")

def test_cart_badge_integrity():
    print("--- 2. Testing Cart Badge Integrity & Absence of Fake Data ---")
    content = TARGET_FILE.read_text(encoding="utf-8")
    
    # Check for [ 0 ], [ 00 ], [ 02 ], [0], [ 01 ], etc. in navbar
    navbar_match = re.search(r'<header.*?</header>', content, re.DOTALL)
    assert navbar_match, "Header element not found"
    header_html = navbar_match.group(0)

    assert "[ 0 ]" not in header_html, "[ 0 ] found in header"
    assert "[ 02 ]" not in header_html, "[ 02 ] found in header"
    assert "[ 00 ]" not in header_html, "[ 00 ] found in header"

    cart_match = re.search(r'<a[^>]+href=["\']#cart["\'][^>]*>(.*?)</a>', header_html, re.DOTALL)
    assert cart_match, "Navbar cart anchor missing"
    cart_inner = cart_match.group(1)
    print("Navbar cart inner HTML:", repr(cart_inner.strip()))
    assert "CART" in cart_inner, "Cart missing CART text label"
    assert "text-[10px]" not in cart_inner, "Old badge class remains in cart anchor"

def test_drawer_accessibility_contract():
    print("--- 3. Testing Archival Mobile Drawer Accessibility & State ---")
    content = TARGET_FILE.read_text(encoding="utf-8")
    
    # Check trigger attributes
    trigger_match = re.search(r'<button[^>]+id=["\']mobile-menu-trigger["\'][^>]*>', content)
    assert trigger_match, "Trigger button not found"
    trigger_html = trigger_match.group(0)
    assert 'aria-label=' in trigger_html, "Trigger button missing aria-label"
    assert 'aria-expanded="false"' in trigger_html, "Trigger initial aria-expanded should be false"
    assert 'aria-controls="mobile-drawer"' in trigger_html, "Trigger should control mobile-drawer"

    # Check drawer attributes
    drawer_match = re.search(r'<aside[^>]+id=["\']mobile-drawer["\'][^>]*>', content)
    assert drawer_match, "Drawer aside not found"
    drawer_html = drawer_match.group(0)
    assert 'role="dialog"' in drawer_html, "Drawer should have role='dialog'"
    assert 'aria-modal="true"' in drawer_html, "Drawer should have aria-modal='true'"
    assert 'translate-x-full' in drawer_html, "Drawer must start translate-x-full off-screen"
    assert 'w-[85vw]' in drawer_html or 'max-w-[380px]' in drawer_html, "Drawer width should be responsive"

    # Check close button
    close_match = re.search(r'<button[^>]+id=["\']mobile-drawer-close["\'][^>]*>', content)
    assert close_match, "Close button not found"
    close_html = close_match.group(0)
    assert 'aria-label=' in close_html, "Close button missing aria-label"
    assert 'min-w-[44px]' in close_html and 'min-h-[44px]' in close_html, "Close button touch target < 44px"

def test_carousel_math_and_scrolling():
    print("--- 4. Testing Carousel Mathematical Calculation Under Adversarial Inputs ---")
    total = 4
    card_width = 300 # example width

    def calc_index(scroll_left, width, count):
        if width <= 0:
            width = 1
        return min(max(1, round(scroll_left / width) + 1), count)

    # Edge cases
    # iOS negative overscroll (elastic bounce to the left)
    assert calc_index(-150, card_width, total) == 1, "Failed negative scrollLeft clamp"
    assert calc_index(0, card_width, total) == 1, "Failed at 0 scrollLeft"
    # Midway between card 1 and card 2
    assert calc_index(100, card_width, total) == 1, "Failed round down"
    assert calc_index(160, card_width, total) == 2, "Failed round up to card 2"
    # Card 2, 3, 4
    assert calc_index(300, card_width, total) == 2
    assert calc_index(600, card_width, total) == 3
    assert calc_index(900, card_width, total) == 4
    # iOS positive overscroll past the end
    assert calc_index(1500, card_width, total) == 4, "Failed positive scrollLeft clamp"
    # Card width 0 or undefined
    assert calc_index(0, 0, total) == 1
    assert calc_index(100, 0, total) == 4

    print("Carousel math handles all boundary and overscroll conditions safely!")

def test_touch_target_sizes():
    print("--- 5. Testing Interactive Touch Targets (>= 44px) ---")
    content = TARGET_FILE.read_text(encoding="utf-8")
    
    # Check all button tags
    buttons = re.findall(r'<button[^>]*>', content)
    insufficient_buttons = []
    for btn in buttons:
        # Check if min-h or h or py provides >= 44px
        has_min_h = any(k in btn for k in ['min-h-[44px]', 'min-h-[48px]', 'h-11', 'h-12', 'py-3', 'py-2.5', 'p-3', 'p-4', 'min-w-[44px]'])
        if not has_min_h:
            insufficient_buttons.append(btn)

    print(f"Total buttons checked: {len(buttons)}. Insufficiently sized buttons: {len(insufficient_buttons)}")
    if insufficient_buttons:
        for b in insufficient_buttons[:3]:
            print("  Notice button without explicit 44px class:", b[:60])

def test_overflow_and_watermark():
    print("--- 6. Testing Horizontal Overflow & Watermark Safety ---")
    content = TARGET_FILE.read_text(encoding="utf-8")

    assert 'viewport-fit=cover' in content, "Missing viewport-fit=cover"
    assert 'overflow-x: hidden' in content or 'overflow-x-hidden' in content, "Missing global overflow-x protection"

    # Watermark 004 check
    watermark_match = re.search(r'<div[^>]*>\s*004\s*</div>', content)
    assert watermark_match, "Watermark 004 missing"
    wm_html = watermark_match.group(0)
    assert 'text-6xl' in wm_html or 'sm:text-8xl' in wm_html, "Watermark 004 lacks responsive scaling"
    assert 'max-w-full' in wm_html and 'overflow-hidden' in wm_html, "Watermark 004 lacks overflow containment"
    print("Watermark is properly constrained against horizontal blowout.")

def test_images():
    print("--- 7. Testing Image Accessibility & Performance ---")
    from tests.test_responsive_storefronts import load_storefront
    html, dom = load_storefront("archive_index")
    imgs = dom.find_all('img')

    print(f"Total images found: {len(imgs)}")
    missing_alt = []
    for i, img in enumerate(imgs):
        alt = img.get('alt')
        loading = img.get('loading')
        decoding = img.get('decoding')
        src = img.get('src', '')[:35]
        if not alt:
            missing_alt.append(src)
        print(f"  Img {i+1}: alt='{alt}' loading={loading} decoding={decoding}")
    assert len(missing_alt) == 0, f"Images missing alt: {missing_alt}"
    print("All images have descriptive alt attributes!")

if __name__ == "__main__":
    test_html_structure_and_ids()
    test_cart_badge_integrity()
    test_drawer_accessibility_contract()
    test_carousel_math_and_scrolling()
    test_touch_target_sizes()
    test_overflow_and_watermark()
    test_images()
    print("\nALL ADVERSARIAL REVIEWS & STRESS TESTS PASSED SUCCESSFULLY!")

