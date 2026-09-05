"""
Verification script for Milestone 4: Raw Brutalist Archive Index
Tests all requirements from TEST_INFRA.md and test_responsive_storefronts.py
specifically for tomboy_raw_brutalist_archive_index/code.html.
"""

import sys
from pathlib import Path

# Add project root to sys.path
project_root = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(project_root))

from tests.test_responsive_storefronts import (
    STOREFRONT_CONFIG,
    load_storefront,
    extract_navbar_cart,
    extract_all_script_contents,
    DOMParser
)

def run_all_m4_checks():
    html, dom = load_storefront("archive_index")
    cfg = STOREFRONT_CONFIG["archive_index"]
    errors = []

    print("=== RUNNING STOREFRONT 4 (RAW BRUTALIST) VERIFICATION ===")

    # 1. Cart Count Removal
    cart_elem = extract_navbar_cart(dom)
    if not cart_elem:
        errors.append("Cart element missing in navbar")
    else:
        cart_text = cart_elem.get_text()
        if "[ 0 ]" in cart_text or "[ 02 ]" in cart_text:
            errors.append(f"Cart still contains badge: {cart_text}")
        if "CART" not in cart_text.upper():
            errors.append(f"Cart missing CART label: {cart_text}")
        classes = " ".join(cart_elem.get_classes())
        if not any(t in classes for t in ['min-h-[44px]', 'min-h-[48px]', 'py-2.5', 'py-3', 'h-11', 'h-12', 'px-4', 'px-5']):
            errors.append(f"Cart touch target insufficient: {classes}")

    # 2. Legacy Injection Removal
    if "<!-- RESPONSIVE ENHANCEMENTS -->" in html:
        errors.append("Legacy '<!-- RESPONSIVE ENHANCEMENTS -->' still present")
    if ".mobile-nav {" in html:
        errors.append("Legacy '.mobile-nav {' CSS still present")

    # 3. Mobile Menu Trigger
    trigger = dom.find_by_id("mobile-menu-trigger")
    if not trigger:
        errors.append("Missing #mobile-menu-trigger")
    else:
        if trigger.tag != "button":
            errors.append(f"#mobile-menu-trigger tag is <{trigger.tag}>, expected <button>")
        if not trigger.get('aria-label'):
            errors.append("#mobile-menu-trigger missing aria-label")
        if not any(c in trigger.get_classes() for c in ['lg:hidden', 'xl:hidden', 'md:hidden']):
            errors.append("#mobile-menu-trigger not hidden on desktop")

    # 4. Archival Mobile Drawer
    drawer = dom.find_by_id("mobile-drawer")
    if not drawer:
        errors.append("Missing #mobile-drawer")
    else:
        classes = drawer.get_classes()
        if "fixed" not in classes:
            errors.append("#mobile-drawer missing 'fixed' class")
        if not any("translate-x-full" in c or "-translate-x-full" in c for c in classes):
            errors.append("#mobile-drawer missing translate-x-full off-canvas class")
        nav_links = drawer.find_all('a')
        if len(nav_links) < 3:
            errors.append(f"#mobile-drawer has only {len(nav_links)} links, expected >= 3")
        has_cart_link = any('cart' in a.get('href', '').lower() or 'cart' in a.get_text().lower() for a in nav_links)
        if not has_cart_link:
            errors.append("#mobile-drawer missing cart navigation shortcut")

    backdrop = dom.find_by_id("mobile-drawer-backdrop")
    if not backdrop:
        errors.append("Missing #mobile-drawer-backdrop")
    else:
        classes = backdrop.get_classes()
        if "fixed" not in classes:
            errors.append("#mobile-drawer-backdrop missing 'fixed' class")
        if not any(c in classes for c in ['opacity-0', 'hidden', 'pointer-events-none']):
            errors.append("#mobile-drawer-backdrop not initially hidden")

    close_btn = dom.find_by_id("mobile-drawer-close")
    if not close_btn:
        errors.append("Missing #mobile-drawer-close")
    else:
        if close_btn.tag != "button":
            errors.append("#mobile-drawer-close not a button")
        if not close_btn.get('aria-label'):
            errors.append("#mobile-drawer-close missing aria-label")

    panel = dom.find_by_id("mobile-drawer-panel")
    if not panel:
        errors.append("Missing #mobile-drawer-panel")

    # 5. Mobile Touch Carousel & Counter
    tracks = dom.find_by_class_tokens(['overflow-x-auto', 'snap-x'])
    if not tracks:
        errors.append("Missing carousel track with 'overflow-x-auto' and 'snap-x'")
    else:
        track_classes = tracks[0].get_classes()
        if not any(c.startswith('md:grid') or c.startswith('lg:grid') or 'md:overflow-visible' in c or 'lg:overflow-visible' in c for c in track_classes):
            errors.append("Carousel track missing desktop grid transition")
        if "snap-mandatory" not in track_classes:
            errors.append("Carousel track missing 'snap-mandatory'")

    snap_items = dom.find_by_class_tokens(['snap-start'])
    if len(snap_items) < 2:
        errors.append(f"Only {len(snap_items)} snap-start items found, expected >= 2")
    else:
        first_item_classes = " ".join(snap_items[0].get_classes())
        if not any(p in first_item_classes for p in ['w-[8', 'w-[7', 'w-[6', 'sm:w-', 'shrink-0']):
            errors.append(f"Carousel item missing peek width: {first_item_classes}")

    counter = dom.find_by_id("carousel-counter")
    if not counter:
        errors.append("Missing #carousel-counter")
    else:
        text = counter.get_text()
        import re
        if not re.search(r'\d+\s*/\s*\d+', text):
            errors.append(f"Counter text '{text}' doesn't match expected slide counter format")

    # 6. Viewport and Typography
    viewport = dom.find_all('meta', name='viewport')
    if not viewport:
        errors.append("Missing viewport meta")
    else:
        content = viewport[0].get('content', '')
        if "width=device-width" not in content:
            errors.append("Viewport missing width=device-width")
        if "viewport-fit=cover" not in content:
            errors.append("Viewport missing viewport-fit=cover")

    h1s = dom.find_all('h1')
    if not h1s:
        errors.append("Missing <h1> heading")
    else:
        h1_classes = " ".join(h1s[0].get_classes())
        if not any(t in h1_classes for t in ['sm:text-', 'md:text-', 'lg:text-', 'text-3xl', 'text-4xl', 'text-5xl', 'display-hero-mobile', 'clamp']):
            errors.append(f"Hero heading not responsive: {h1_classes}")

    # 7. Images Optimization
    images = dom.find_all('img')
    lazy_images = [img for img in images if img.get('loading') == 'lazy']
    if len(lazy_images) < 2:
        errors.append(f"Only {len(lazy_images)} lazy images, expected >= 2")
    async_images = [img for img in images if img.get('decoding') == 'async']
    if len(async_images) < 2:
        errors.append(f"Only {len(async_images)} async decoding images, expected >= 2")

    for img in images:
        if not img.get('alt'):
            errors.append(f"Image missing alt attribute: {img.get('src', '')[:30]}")

    # 8. Script Invariants
    scripts = extract_all_script_contents(html)
    import re
    if not re.search(r'["\']Escape["\']|\.key\s*===\s*["\']Escape["\']', scripts):
        errors.append("Script missing Escape key handler")
    if "mobile-drawer-backdrop" not in scripts:
        errors.append("Script missing backdrop click handler")
    if not re.search(r'document\.body\.style\.overflow\s*=\s*["\']hidden["\']', scripts):
        errors.append("Script missing body scroll lock")
    if not re.search(r'document\.body\.style\.overflow\s*=\s*["\'](unset|auto|)["\']', scripts):
        errors.append("Script missing body scroll restoration")
    if "carousel-counter" not in scripts:
        errors.append("Script missing carousel counter logic")

    # 9. Tailwind Hygiene
    if "py-0.2" in html:
        errors.append("Found invalid class py-0.2")
    if "md:grid-cols-2 md:grid-cols-4" in html:
        errors.append("Found duplicate md:grid-cols-2 md:grid-cols-4")

    # 10. Watermark check
    if "text-[140px]" in html and "text-6xl sm:text-8xl lg:text-[140px]" not in html:
        errors.append("Watermark 004 text-[140px] not made responsive")

    if errors:
        print(f"FAILED with {len(errors)} error(s):")
        for err in errors:
            print(f"  - [FAIL] {err}")
        return False
    else:
        print("ALL CHECKS PASSED PERFECTLY! [ 0 ERRORS ]")
        return True

if __name__ == "__main__":
    success = run_all_m4_checks()
    sys.exit(0 if success else 1)
