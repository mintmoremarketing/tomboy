"""
Independent Forensic Integrity Audit Script for Milestone 2
Target: tomboy_editorial_darkroom_runway/code.html
Auditor: teamwork_preview_auditor_m2_1
"""

import os
import re
import sys
from html.parser import HTMLParser

TARGET_FILE = os.path.abspath('tomboy_editorial_darkroom_runway/code.html')
assert os.path.exists(TARGET_FILE), f"Target file does not exist: {TARGET_FILE}"

with open(TARGET_FILE, 'r', encoding='utf-8') as f:
    raw_content = f.read()

print("=" * 70)
print("INDEPENDENT FORENSIC INTEGRITY AUDIT — MILESTONE 2")
print(f"Target: {TARGET_FILE}")
print(f"Size: {len(raw_content)} bytes | Lines: {len(raw_content.splitlines())}")
print("=" * 70)

failures = []

def check(condition, test_name, fail_msg=""):
    if condition:
        print(f"[PASS] {test_name}")
    else:
        print(f"[FAIL] {test_name} --> {fail_msg}")
        failures.append((test_name, fail_msg))

# -------------------------------------------------------------
# CHECK 1: FORBIDDEN PATTERNS & ZERO-TOLERANCE CHEATING CHECKS
# -------------------------------------------------------------
print("\n--- CHECK 1: ZERO-TOLERANCE CHEATING & REMOVAL CHECKS ---")
check('[ 02 ]' not in raw_content, "Cart count [ 02 ] eliminated", "Found '[ 02 ]' in code.html")
check('[ 0 ]' not in raw_content, "Cart count [ 0 ] eliminated", "Found '[ 0 ]' in code.html")
check('<!-- RESPONSIVE ENHANCEMENTS -->' not in raw_content, "Naive legacy injection comment deleted", "Found '<!-- RESPONSIVE ENHANCEMENTS -->'")
check(not re.search(r'\.mobile-nav\b', raw_content), "Naive legacy CSS selector .mobile-nav deleted", "Found '.mobile-nav' CSS rule")

# Check navbar cart element
cart_match = re.search(r'<a[^>]*href="#cart"[^>]*>.*?</a>', raw_content, re.DOTALL)
check(cart_match is not None, "Navbar cart anchor exists", "Missing <a href='#cart'> in navbar")
if cart_match:
    cart_tag = cart_match.group(0)
    check('CART' in cart_tag, "Navbar cart contains 'CART' label", "CART text missing")
    check('min-h-[44px]' in cart_tag and 'min-w-[44px]' in cart_tag, "Navbar cart touch target >= 44x44px", "min-h-[44px] or min-w-[44px] missing on cart")
    check('[ 02 ]' not in cart_tag and '[ 0 ]' not in cart_tag, "Navbar cart contains no bracketed numbers", "Found bracketed number in cart")

# -------------------------------------------------------------
# CHECK 2: MOBILE NAVIGATION DRAWER ARCHITECTURE
# -------------------------------------------------------------
print("\n--- CHECK 2: MOBILE NAVIGATION DRAWER ARCHITECTURE ---")
trigger_match = re.search(r'<button[^>]*id="mobile-menu-trigger"[^>]*>.*?</button>', raw_content, re.DOTALL)
check(trigger_match is not None, "#mobile-menu-trigger element exists", "Missing #mobile-menu-trigger")
if trigger_match:
    t_tag = trigger_match.group(0)
    check('lg:hidden' in t_tag, "Trigger hidden on desktop (lg:hidden)", "Trigger missing lg:hidden")
    check('aria-controls="mobile-nav-drawer"' in t_tag, "Trigger specifies aria-controls='mobile-nav-drawer'", "Missing aria-controls")
    check('aria-expanded="false"' in t_tag, "Trigger specifies initial aria-expanded='false'", "Missing aria-expanded='false'")
    check('min-w-[44px]' in t_tag and 'min-h-[44px]' in t_tag, "Trigger touch target >= 44x44px", "Touch target too small")

drawer_container = re.search(r'<div[^>]*id="mobile-nav-drawer"[^>]*>', raw_content)
check(drawer_container is not None, "#mobile-nav-drawer container exists", "Missing #mobile-nav-drawer")
if drawer_container:
    dc_tag = drawer_container.group(0)
    check('lg:hidden' in dc_tag, "Drawer container hidden on desktop (lg:hidden)", "Missing lg:hidden on drawer container")
    check('role="dialog"' in dc_tag and 'aria-modal="true"' in dc_tag, "Drawer container has proper ARIA dialog semantics", "Missing role='dialog' or aria-modal='true'")
    check('pointer-events-none' in dc_tag and 'opacity-0' in dc_tag, "Drawer container initially closed/invisible", "Drawer container not hidden by default")

backdrop_match = re.search(r'<div[^>]*id="mobile-drawer-backdrop"[^>]*>', raw_content)
check(backdrop_match is not None, "#mobile-drawer-backdrop element exists", "Missing #mobile-drawer-backdrop")

panel_match = re.search(r'<aside[^>]*id="mobile-drawer"[^>]*>', raw_content)
check(panel_match is not None, "#mobile-drawer aside element exists", "Missing #mobile-drawer aside")
if panel_match:
    p_tag = panel_match.group(0)
    check('translate-x-full' in p_tag, "Drawer aside panel starts off-canvas (translate-x-full)", "Missing translate-x-full")
    check('fixed' in p_tag and 'inset-y-0' in p_tag and 'right-0' in p_tag, "Drawer aside panel positioned fixed on right edge", "Incorrect positioning")

close_match = re.search(r'<button[^>]*id="mobile-drawer-close"[^>]*>', raw_content)
check(close_match is not None, "#mobile-drawer-close button exists", "Missing #mobile-drawer-close")
if close_match:
    c_tag = close_match.group(0)
    check('min-w-[44px]' in c_tag and 'min-h-[44px]' in c_tag, "Close button touch target >= 44x44px", "Close button touch target too small")

# Drawer navigation links
drawer_block = re.search(r'<div id="mobile-nav-drawer".*?</div>\s*</aside>\s*</div>', raw_content, re.DOTALL)
check(drawer_block is not None, "Complete mobile drawer block found", "Drawer block malformed")
if drawer_block:
    d_html = drawer_block.group(0)
    for expected_href in ['#runway-hero', '#lookbook-grid', '#cinematic-feature', '#backstage-archive', '#secret-vip', '#cart']:
        check(f'href="{expected_href}"' in d_html, f"Drawer contains navigation link '{expected_href}'", f"Link {expected_href} missing from drawer")
    check('VIEW CART' in d_html, "Drawer contains full-width 'VIEW CART' action", "VIEW CART missing from drawer footer")

# -------------------------------------------------------------
# CHECK 3: MOBILE TOUCH CAROUSEL ARCHITECTURE
# -------------------------------------------------------------
print("\n--- CHECK 3: MOBILE TOUCH CAROUSEL ARCHITECTURE ---")
carousel_match = re.search(r'<div[^>]*id="lookbook-carousel"[^>]*>', raw_content)
check(carousel_match is not None, "#lookbook-carousel track exists", "Missing #lookbook-carousel")
if carousel_match:
    car_tag = carousel_match.group(0)
    check('overflow-x-auto' in car_tag, "Carousel has overflow-x-auto", "Missing overflow-x-auto")
    check('snap-x' in car_tag and 'snap-mandatory' in car_tag, "Carousel has snap-x snap-mandatory", "Missing CSS snap classes")
    check('scroll-snap-type: x mandatory' in car_tag, "Carousel has inline scroll-snap-type style", "Missing inline scroll-snap-type")
    check('lg:grid' in car_tag and 'lg:overflow-visible' in car_tag, "Carousel gracefully restores to desktop grid (lg:grid lg:overflow-visible)", "Missing desktop grid restoration classes")

counter_match = re.search(r'<span[^>]*id="carousel-counter"[^>]*>.*?</span>', raw_content)
check(counter_match is not None, "#carousel-counter element exists", "Missing #carousel-counter")
if counter_match:
    cnt_tag = counter_match.group(0)
    check('[ 01 / 04 ]' in cnt_tag, "Carousel counter displays initial '[ 01 / 04 ]'", "Initial counter text incorrect")
    check('font-mono' in cnt_tag, "Carousel counter styled with font-mono", "font-mono missing")

# Carousel product cards
cards = re.findall(r'<article[^>]*class="[^"]*snap-start[^"]*"[^>]*>', raw_content)
check(len(cards) == 4, f"Carousel contains 4 lookbook product cards (found {len(cards)})", f"Expected 4 cards, found {len(cards)}")
for i, card in enumerate(cards, 1):
    check('w-[82vw]' in card and 'sm:w-[60vw]' in card, f"Card {i} has mobile peek width w-[82vw] sm:w-[60vw]", f"Card {i} missing peek classes")
    check('lg:w-auto' in card and 'lg:shrink' in card and 'lg:col-span-6' in card, f"Card {i} has desktop grid span lg:col-span-6", f"Card {i} missing desktop classes")

# -------------------------------------------------------------
# CHECK 4: RESPONSIVE LAYOUT & PERFORMANCE INTEGRITY
# -------------------------------------------------------------
print("\n--- CHECK 4: RESPONSIVE LAYOUT & PERFORMANCE INTEGRITY ---")
check('viewport-fit=cover' in raw_content, "Meta viewport includes viewport-fit=cover", "Missing viewport-fit=cover")
check('overflow-x-hidden' in raw_content and 'w-full' in raw_content, "Body tag contains overflow-x-hidden w-full", "Body missing horizontal overflow guard")
check('text-4xl sm:text-6xl md:text-7xl lg:text-8xl' in raw_content, "Hero display typography uses fluid scaling", "Display headline typography not scaled")
check('break-words' in raw_content, "Hero display title includes break-words constraint", "break-words missing")

# Product images optimization
lookbook_html = raw_content[raw_content.find('id="lookbook-carousel"'):raw_content.find('</section>', raw_content.find('id="lookbook-carousel"'))]
lookbook_imgs = re.findall(r'<img[^>]+>', lookbook_html)
check(len(lookbook_imgs) == 4, f"Found 4 product images in lookbook section ({len(lookbook_imgs)})", f"Expected 4 images, got {len(lookbook_imgs)}")
for idx, img in enumerate(lookbook_imgs, 1):
    check('loading="lazy"' in img, f"Product image {idx} has loading='lazy'", f"loading='lazy' missing on image {idx}")
    check('decoding="async"' in img, f"Product image {idx} has decoding='async'", f"decoding='async' missing on image {idx}")
    check('alt=' in img and len(re.search(r'alt="([^"]*)"', img).group(1)) > 3, f"Product image {idx} has descriptive alt text", f"alt missing or empty on image {idx}")

# Quick-add touch targets
quick_adds = re.findall(r'<div class="absolute inset-x-4 bottom-4[^"]*">.*?<button[^>]*>.*?</button>.*?</div>', lookbook_html, re.DOTALL)
check(len(quick_adds) == 4, f"Found 4 quick-add card docks ({len(quick_adds)})", f"Expected 4 quick-adds, got {len(quick_adds)}")
for idx, qa in enumerate(quick_adds, 1):
    check('opacity-100' in qa and 'lg:opacity-0' in qa and 'lg:group-hover:opacity-100' in qa, f"Quick-add dock {idx} visible on touch and hover on desktop", f"Dock {idx} missing mobile touch visibility")
    check('min-h-[44px]' in qa and 'min-w-[44px]' in qa, f"Quick-add button {idx} touch target >= 44x44px", f"Button {idx} touch target too small")

# -------------------------------------------------------------
# CHECK 5: CLIENT-SIDE JAVASCRIPT CONTROLLER VERIFICATION
# -------------------------------------------------------------
print("\n--- CHECK 5: CLIENT-SIDE JAVASCRIPT VERIFICATION ---")
script_match = re.search(r'<!-- DARKROOM EDITORIAL MOBILE CONTROLLER -->\s*<script>(.*?)</script>', raw_content, re.DOTALL)
check(script_match is not None, "Darkroom Editorial script block exists", "Missing darkroom controller script")
if script_match:
    js_code = script_match.group(1)
    check('DOMContentLoaded' in js_code, "JS initializes inside DOMContentLoaded listener", "DOMContentLoaded missing")
    check('openDrawer' in js_code and 'closeDrawer' in js_code, "openDrawer and closeDrawer functions defined", "Functions missing")
    check('pointer-events-none' in js_code and 'pointer-events-auto' in js_code, "JS toggles pointer-events on drawer/backdrop", "pointer-events toggles missing")
    check('translate-x-full' in js_code and 'translate-x-0' in js_code, "JS toggles translate-x transform on panel", "translate-x toggles missing")
    check('document.body.style.overflow = "hidden"' in js_code, "JS implements body scroll lock on open", "Scroll lock missing")
    check('document.body.style.overflow = ""' in js_code, "JS implements body scroll unlock on close", "Scroll unlock missing")
    check('Escape' in js_code, "JS handles keyboard Escape key dismissal", "Escape key handler missing")
    check('touchstart' in js_code and 'touchend' in js_code, "JS handles touch swipe-to-close gesture", "Touch swipe handler missing")
    check('scrollLeft' in js_code and 'offsetLeft' in js_code, "JS computes dynamic carousel card offset on scroll", "Scroll calculations missing")
    check('IntersectionObserver' in js_code, "JS implements modern IntersectionObserver for carousel counter", "IntersectionObserver missing")
    check('padStart(2, "0")' in js_code, "JS formats counter numbers as two-digit monospace (padStart)", "padStart missing")

# -------------------------------------------------------------
# CHECK 6: HTML SYNTAX & PARSER VALIDITY
# -------------------------------------------------------------
print("\n--- CHECK 6: HTML SYNTAX & PARSER VALIDITY ---")
class StrictDOMAuditor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tags = []
        self.tag_counts = {}
        self.ids = set()
        self.duplicate_ids = []

    def handle_starttag(self, tag, attrs):
        self.tags.append(tag)
        self.tag_counts[tag] = self.tag_counts.get(tag, 0) + 1
        attr_dict = dict(attrs)
        if 'id' in attr_dict:
            elem_id = attr_dict['id']
            if elem_id in self.ids:
                self.duplicate_ids.append(elem_id)
            self.ids.add(elem_id)

parser = StrictDOMAuditor()
try:
    parser.feed(raw_content)
    print(f"[PASS] HTML parser parsed {len(parser.tags)} tags successfully without syntax exception.")
    check(len(parser.duplicate_ids) == 0, f"No duplicate HTML ID attributes (found {parser.duplicate_ids})", f"Duplicate IDs: {parser.duplicate_ids}")
except Exception as e:
    check(False, "HTML parsing failed", str(e))

# -------------------------------------------------------------
# CHECK 7: DESKTOP BRUTALISM PRESERVATION (>= 1024PX)
# -------------------------------------------------------------
print("\n--- CHECK 7: DESKTOP BRUTALISM PRESERVATION ---")
desktop_nav_match = re.search(r'<nav class="hidden lg:flex[^"]*".*?</nav>', raw_content, re.DOTALL)
check(desktop_nav_match is not None, "Desktop navigation intact with 'hidden lg:flex'", "Desktop nav missing or modified incorrectly")
if desktop_nav_match:
    d_nav = desktop_nav_match.group(0)
    for section_name in ['RUNWAY', 'CAPSULE', 'CINEMATICS', 'GRAILS', 'PASS']:
        check(section_name in d_nav, f"Desktop nav contains '{section_name}' link", f"Link {section_name} missing from desktop nav")

print("\n" + "=" * 70)
if failures:
    print(f"AUDIT RESULT: INTEGRITY VIOLATION ({len(failures)} failures found)")
    for f_name, f_msg in failures:
        print(f"  - {f_name}: {f_msg}")
    sys.exit(1)
else:
    print("AUDIT RESULT: CLEAN — ALL FORENSIC CHECKS PASSED EMPIRICALLY (0 FAILURES)")
    sys.exit(0)
