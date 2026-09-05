import os
import re
import sys
from html.parser import HTMLParser

TARGET_FILE = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../tomboy_clothing_home_latest_drop/code.html'))

print(f"Auditing target file: {TARGET_FILE}")
with open(TARGET_FILE, 'r', encoding='utf-8') as f:
    content = f.read()

results = {}

# -------------------------------------------------------------
# CHECK 1: Cart Count Removal & No CSS Hiding
# -------------------------------------------------------------
print("\n=== CHECK 1: Cart Count Authentic Removal ===")
cart_matches = re.findall(r'<a[^>]*data-path=["\']cart["\'][^>]*>.*?</a>', content, re.DOTALL)
check1_passed = True
details1 = []

if not cart_matches:
    check1_passed = False
    details1.append("FAIL: No cart link found with data-path='cart'")
else:
    for idx, el in enumerate(cart_matches):
        details1.append(f"Cart HTML: {el.strip()}")
        if '[ 0 ]' in el:
            check1_passed = False
            details1.append("FAIL: Found literal '[ 0 ]' in cart markup")
        if '[ 02 ]' in el:
            check1_passed = False
            details1.append("FAIL: Found literal '[ 02 ]' in cart markup")
        if 'display:none' in el.replace(' ', '') or 'hidden' in el:
            check1_passed = False
            details1.append("FAIL: Suspicious display:none or hidden class on cart element")
        if 'font-size:0' in el.replace(' ', '') or 'text-[0px]' in el:
            check1_passed = False
            details1.append("FAIL: Suspicious zero font-size on cart element")
        if 'opacity-0' in el:
            check1_passed = False
            details1.append("FAIL: Suspicious opacity-0 on cart element")

if check1_passed:
    details1.append("PASS: '[ 0 ]' and '[ 02 ]' completely absent from cart; no deceptive CSS hiding detected.")
results['cart_removal'] = (check1_passed, details1)

# -------------------------------------------------------------
# CHECK 2: Mobile Navigation Drawer Integrity
# -------------------------------------------------------------
print("\n=== CHECK 2: Mobile Navigation Drawer Integrity ===")
check2_passed = True
details2 = []

# Elements check
trigger_match = re.search(r'<button[^>]*id=["\']mobile-menu-trigger["\'][^>]*>.*?</button>', content, re.DOTALL)
drawer_match = re.search(r'<aside[^>]*id=["\']mobile-drawer["\'][^>]*>.*?</aside>', content, re.DOTALL)
backdrop_match = re.search(r'<div[^>]*id=["\']mobile-drawer-backdrop["\'][^>]*>', content)
close_match = re.search(r'<button[^>]*id=["\']mobile-drawer-close["\'][^>]*>', content)

if not trigger_match:
    check2_passed = False
    details2.append("FAIL: #mobile-menu-trigger missing")
else:
    t_html = trigger_match.group(0)
    details2.append(f"Trigger HTML: {t_html.strip()[:120]}...")
    if 'xl:hidden' not in t_html:
        check2_passed = False
        details2.append("FAIL: #mobile-menu-trigger missing xl:hidden")
    if 'aria-label' not in t_html:
        check2_passed = False
        details2.append("FAIL: #mobile-menu-trigger missing aria-label")

if not drawer_match:
    check2_passed = False
    details2.append("FAIL: #mobile-drawer missing")
else:
    d_html = drawer_match.group(0)
    details2.append(f"Drawer HTML length: {len(d_html)} bytes")
    if 'translate-x-full' not in d_html:
        check2_passed = False
        details2.append("FAIL: #mobile-drawer missing translate-x-full initial state")
    nav_links = re.findall(r'<a[^>]*href=["\'][^"\']+["\'][^>]*>.*?</a>', d_html, re.DOTALL)
    details2.append(f"Nav links in drawer: {len(nav_links)}")
    if len(nav_links) < 4:
        check2_passed = False
        details2.append(f"FAIL: Only {len(nav_links)} nav links found in drawer (expected >= 4)")

if not backdrop_match:
    check2_passed = False
    details2.append("FAIL: #mobile-drawer-backdrop missing")
else:
    b_html = backdrop_match.group(0)
    details2.append(f"Backdrop HTML: {b_html.strip()}")
    if 'bg-black/80' not in b_html and 'bg-primary/80' not in b_html:
        check2_passed = False
        details2.append("FAIL: Backdrop missing dark background")

if not close_match:
    check2_passed = False
    details2.append("FAIL: #mobile-drawer-close missing")
else:
    c_html = close_match.group(0)
    details2.append(f"Close button HTML: {c_html.strip()}")

# Event listeners in script
drawer_scripts = re.findall(r'<script.*?</script>', content, re.DOTALL)
script_text = "\n".join(drawer_scripts)

if 'openDrawer' not in script_text:
    check2_passed = False
    details2.append("FAIL: openDrawer function not found in scripts")
if 'closeDrawer' not in script_text:
    check2_passed = False
    details2.append("FAIL: closeDrawer function not found in scripts")
if 'Escape' not in script_text:
    check2_passed = False
    details2.append("FAIL: Escape key handler not found in scripts")
if 'document.body.style.overflow' not in script_text:
    check2_passed = False
    details2.append("FAIL: Body scroll lock not found in scripts")

if check2_passed:
    details2.append("PASS: Authentic off-canvas mobile drawer with real DOM, backdrop, close button, scroll lock, Esc dismissal.")
results['drawer_integrity'] = (check2_passed, details2)

# -------------------------------------------------------------
# CHECK 3: CSS Scroll Snap Touch Carousel & Live Counter
# -------------------------------------------------------------
print("\n=== CHECK 3: Touch Carousel & Live Counter ===")
check3_passed = True
details3 = []

carousel_match = re.search(r'<div[^>]*id=["\']s1-arrivals-carousel["\'][^>]*>', content)
if not carousel_match:
    check3_passed = False
    details3.append("FAIL: #s1-arrivals-carousel missing")
else:
    c_html = carousel_match.group(0)
    details3.append(f"Carousel HTML: {c_html.strip()}")
    for token in ['snap-x', 'snap-mandatory', 'overflow-x-auto']:
        if token not in c_html:
            check3_passed = False
            details3.append(f"FAIL: Carousel missing required class '{token}'")

counter_match = re.search(r'<span[^>]*id=["\']carousel-counter["\'][^>]*>.*?</span>', content)
if not counter_match:
    check3_passed = False
    details3.append("FAIL: #carousel-counter missing")
else:
    cnt_html = counter_match.group(0)
    details3.append(f"Counter HTML: {cnt_html.strip()}")
    if '[ 01 / 04 ]' not in cnt_html:
        check3_passed = False
        details3.append("FAIL: Counter initial value is not '[ 01 / 04 ]'")

# JS logic verification for carousel
if 'IntersectionObserver' not in script_text:
    check3_passed = False
    details3.append("FAIL: IntersectionObserver not utilized in scripts")
if 'updateCounter' not in script_text:
    check3_passed = False
    details3.append("FAIL: updateCounter dynamic function not found")
if 'scroll' not in script_text:
    check3_passed = False
    details3.append("FAIL: Scroll event listener not found")

if check3_passed:
    details3.append("PASS: Genuine CSS scroll snap carousel with live IntersectionObserver & scroll fallback counter.")
results['carousel_integrity'] = (check3_passed, details3)

# -------------------------------------------------------------
# CHECK 4: Test Harness Cheating / User Agent Sniffing
# -------------------------------------------------------------
print("\n=== CHECK 4: Test Harness Cheating / UA Sniffing ===")
check4_passed = True
details4 = []

cheating_patterns = [
    (r'navigator\.userAgent', "User agent sniffing"),
    (r'window\.__playwright', "Playwright detection"),
    (r'window\.__selenium', "Selenium detection"),
    (r'window\.location\.search', "Query param test mode"),
    (r'test_mode', "Test mode variable"),
    (r'is_test', "Is-test flag"),
    (r'mock', "Mocking logic"),
    (r'webdriver', "Webdriver sniffing")
]

for pat, desc in cheating_patterns:
    m = re.search(pat, script_text, re.IGNORECASE)
    if m:
        check4_passed = False
        details4.append(f"FAIL: Detected suspicious pattern: {desc} ({m.group(0)})")

if check4_passed:
    details4.append("PASS: Zero test harness detection, zero user agent sniffing, zero mock/bypass logic.")
results['cheating_detection'] = (check4_passed, details4)

# -------------------------------------------------------------
# CHECK 5: Legacy Code Purge & Malformed Classes
# -------------------------------------------------------------
print("\n=== CHECK 5: Legacy Code Purge ===")
check5_passed = True
details5 = []

if 'RESPONSIVE ENHANCEMENTS' in content:
    check5_passed = False
    details5.append("FAIL: Legacy 'RESPONSIVE ENHANCEMENTS' comment block found")
if '.mobile-nav' in content:
    check5_passed = False
    details5.append("FAIL: Legacy '.mobile-nav' selector found")
if 'responsive_fix.py' in content:
    check5_passed = False
    details5.append("FAIL: Reference to responsive_fix.py found")
if 'md:grid-cols-2 md:grid-cols-4' in content:
    check5_passed = False
    details5.append("FAIL: Malformed class 'md:grid-cols-2 md:grid-cols-4' found")

if check5_passed:
    details5.append("PASS: Naive responsive_fix.py injection and malformed classes cleanly eradicated.")
results['legacy_purge'] = (check5_passed, details5)

# -------------------------------------------------------------
# CHECK 6: Desktop Brutalism & Layout Invariants
# -------------------------------------------------------------
print("\n=== CHECK 6: Desktop Brutalism & Invariants ===")
check6_passed = True
details6 = []

# Desktop nav intact
desktop_nav = re.search(r'<nav[^>]*class=["\'][^"\']*hidden xl:flex[^"\']*["\'][^>]*>.*?</nav>', content, re.DOTALL)
if not desktop_nav:
    check6_passed = False
    details6.append("FAIL: Desktop navigation (<nav class='hidden xl:flex ...'>) missing or altered")
else:
    details6.append(f"Desktop Nav found: {desktop_nav.group(0)[:100]}...")

# Colors & Fonts in tailwind config
for token in ['Space Grotesk', 'Space Mono', 'Hanken Grotesk', 'secondary-container']:
    if token not in content:
        check6_passed = False
        details6.append(f"FAIL: Brutalist design token '{token}' missing")

# Check all 4 product images are present and uncorrupted
product_articles = re.findall(r'<article[^>]*>.*?</article>', content, re.DOTALL)
details6.append(f"Found {len(product_articles)} product articles in section 2")
if len(product_articles) != 4:
    check6_passed = False
    details6.append(f"FAIL: Expected 4 product cards, found {len(product_articles)}")

# Images check
images = re.findall(r'<img[^>]+>', content)
details6.append(f"Total images in document: {len(images)}")
missing_alt = [img for img in images if 'alt=' not in img]
if missing_alt:
    check6_passed = False
    details6.append(f"FAIL: Found {len(missing_alt)} images without alt attributes")

if check6_passed:
    details6.append("PASS: Desktop brutalism, typography, colors, assets, and layouts 100% preserved.")
results['desktop_preservation'] = (check6_passed, details6)

# Print Summary
print("\n" + "="*50)
print("AUDIT SUMMARY:")
print("="*50)
all_clean = True
for k, (p, d) in results.items():
    status = "PASS" if p else "FAIL"
    print(f"[{status}] {k}")
    for item in d:
        print(f"  - {item}")
    if not p:
        all_clean = False

if all_clean:
    print("\nOVERALL FORENSIC VERDICT: CLEAN")
    sys.exit(0)
else:
    print("\nOVERALL FORENSIC VERDICT: INTEGRITY VIOLATION")
    sys.exit(1)
