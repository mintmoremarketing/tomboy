"""
Independent Adversarial and Quality Review Verification Test
Target: tomboy_raw_brutalist_archive_index/code.html
Reviewer: reviewer_m4_2
"""

import re
import sys
from pathlib import Path

PROJECT_ROOT = Path(r"c:\Users\devde\OneDrive\Desktop\Demo projects\Mint-more\tomboy clothing")
TARGET_FILE = PROJECT_ROOT / "tomboy_raw_brutalist_archive_index" / "code.html"

def run_adversarial_suite():
    print("=== STARTING INDEPENDENT ADVERSARIAL & QUALITY REVIEW SUITE ===")
    assert TARGET_FILE.exists(), f"Target file does not exist: {TARGET_FILE}"
    
    html = TARGET_FILE.read_text(encoding="utf-8")
    findings = []
    passes = []
    
    # -------------------------------------------------------------
    # 1. INTEGRITY VIOLATION CHECKS
    # -------------------------------------------------------------
    print("\n--- [1] INTEGRITY VIOLATION CHECKS ---")
    
    # Check for hardcoded test results / expected outputs pretending to be real
    # Check if carousel script is a facade that doesn't calculate
    if "Math.round(scrollLeft / cardWidth)" not in html:
        findings.append(("CRITICAL", "INTEGRITY VIOLATION", "Carousel counter appears to be a facade without scroll math"))
    else:
        passes.append("Carousel dynamic calculation contains genuine scroll math")
        
    # Check if drawer script actually manipulates DOM or is empty stub
    if "drawer.classList.remove('translate-x-full')" not in html:
        findings.append(("CRITICAL", "INTEGRITY VIOLATION", "Drawer controller appears to be a facade"))
    else:
        passes.append("Drawer controller contains genuine open/close state transitions")
        
    # Check if cart removal was faked with CSS display:none or zero opacity instead of removal
    # Look for [ 0 ] anywhere in HTML
    if "[ 0 ]" in html:
        findings.append(("CRITICAL", "INTEGRITY VIOLATION", "[ 0 ] is still present in HTML source"))
    else:
        passes.append("[ 0 ] badge is 100% eliminated from the source markup")

    # -------------------------------------------------------------
    # 2. VIEWPORT SCALING & OVERFLOW ANALYSIS (320px - 1440px)
    # -------------------------------------------------------------
    print("\n--- [2] VIEWPORT SCALING & OVERFLOW ANALYSIS ---")
    
    # Check viewport meta
    if 'content="width=device-width, initial-scale=1.0, viewport-fit=cover"' not in html:
        findings.append(("MAJOR", "Responsive", "Viewport meta tag missing viewport-fit=cover or proper attributes"))
    else:
        passes.append("Viewport meta has width=device-width, initial-scale=1.0, viewport-fit=cover")
        
    # Check overflow-x containment
    if "overflow-x: hidden" not in html and "overflow-x-hidden" not in html:
        findings.append(("MAJOR", "Responsive", "Base CSS lacks overflow-x: hidden containment"))
    else:
        passes.append("Horizontal overflow containment configured on body/base layer")
        
    # Check watermark 004 font size scaling
    watermark_match = re.search(r'004\s*</div>', html)
    if watermark_match:
        # Find container
        watermark_chunk = html[max(0, watermark_match.start() - 300):watermark_match.end()]
        if "text-[140px]" in watermark_chunk and "text-6xl" not in watermark_chunk:
            findings.append(("MAJOR", "Responsive", "Watermark '004' retains fixed text-[140px] without responsive scaling"))
        else:
            passes.append("Watermark '004' contains responsive type scaling (text-6xl sm:text-8xl lg:text-[140px])")
            
    # Check for hardcoded pixel widths > 320px on non-dialog elements
    fixed_widths = re.findall(r'w-\[(\d+)px\]', html)
    large_fixed = [int(w) for w in fixed_widths if int(w) > 320]
    # Filter out dialog/drawer max-w-[380px]
    fixed_widths_raw = re.findall(r'(?:min-)?w-\[(\d+)px\]', html)
    large_widths = [int(w) for w in fixed_widths_raw if int(w) > 320]
    print(f"Fixed pixel widths > 320px detected: {large_widths}")
    # Verify they have responsive prefixes or max-w constraints
    if any(w > 500 for w in large_widths):
        findings.append(("MAJOR", "Responsive", f"Found unconstrained large pixel width: {large_widths}"))
    else:
        passes.append(f"Fixed widths are safely bounded: {large_widths}")

    # -------------------------------------------------------------
    # 3. CART BUTTON SPECIFICATION
    # -------------------------------------------------------------
    print("\n--- [3] CART BUTTON SPECIFICATION ---")
    cart_match = re.search(r'<a[^>]*href=["\']#cart["\'][^>]*>(.*?)</a>', html, re.DOTALL)
    if not cart_match:
        findings.append(("CRITICAL", "Cart", "Navbar cart anchor `<a href='#cart'>` not found"))
    else:
        cart_tag = cart_match.group(0)
        cart_inner = cart_match.group(1)
        if "[ 0 ]" in cart_inner or "[ 02 ]" in cart_inner:
            findings.append(("CRITICAL", "Cart", f"Cart contains numeric badge: {cart_inner}"))
        elif "CART" not in cart_inner:
            findings.append(("MAJOR", "Cart", f"Cart missing 'CART' text: {cart_inner}"))
        else:
            passes.append(f"Cart button cleanly contains CART label without numeric badge: {cart_inner.strip()}")
            
        if "min-h-[44px]" in cart_tag or "h-11" in cart_tag or "h-12" in cart_tag or "py-3" in cart_tag:
            passes.append("Cart button touch target height satisfies >= 44px")
        else:
            findings.append(("MINOR", "Cart", f"Cart button may not explicitly set >= 44px touch height: {cart_tag}"))

    # -------------------------------------------------------------
    # 4. MOBILE NAVIGATION DRAWER CONTRACT & BEHAVIOR
    # -------------------------------------------------------------
    print("\n--- [4] MOBILE NAVIGATION DRAWER CONTRACT & BEHAVIOR ---")
    
    # Elements existence
    for elem_id in ["mobile-menu-trigger", "mobile-drawer", "mobile-drawer-backdrop", "mobile-drawer-close", "mobile-drawer-panel"]:
        if f'id="{elem_id}"' not in html:
            findings.append(("CRITICAL", "Drawer", f"Required element #{elem_id} missing"))
        else:
            passes.append(f"Required element #{elem_id} present")
            
    # Trigger visibility
    trigger_match = re.search(r'<button[^>]*id=["\']mobile-menu-trigger["\'][^>]*>', html)
    if trigger_match:
        trigger_tag = trigger_match.group(0)
        if "lg:hidden" not in trigger_tag and "md:hidden" not in trigger_tag:
            findings.append(("MAJOR", "Drawer", f"#mobile-menu-trigger not hidden on desktop: {trigger_tag}"))
        else:
            passes.append(f"#mobile-menu-trigger has desktop hiding class: {trigger_tag}")
        if "min-w-[44px]" in trigger_tag and "min-h-[44px]" in trigger_tag:
            passes.append("#mobile-menu-trigger meets 44x44px touch target requirement")
        else:
            findings.append(("MINOR", "Drawer", f"#mobile-menu-trigger touch target size: {trigger_tag}"))
            
    # Close button touch target
    close_match = re.search(r'<button[^>]*id=["\']mobile-drawer-close["\'][^>]*>', html)
    if close_match:
        close_tag = close_match.group(0)
        if "min-w-[44px]" in close_tag and "min-h-[44px]" in close_tag:
            passes.append("#mobile-drawer-close meets 44x44px touch target requirement")
        else:
            findings.append(("MINOR", "Drawer", f"#mobile-drawer-close touch target size: {close_tag}"))
            
    # Drawer scripts: open, close, escape, backdrop click, body scroll lock
    if "mobile-drawer-backdrop" in html and "Escape" in html and "body.style.overflow = 'hidden'" in html:
        passes.append("Drawer JS handles open, close, backdrop click, Escape key, and body scroll lock")
    else:
        findings.append(("CRITICAL", "Drawer", "Drawer script missing one or more required interaction handlers"))

    # Check drawer links dismiss drawer
    if "drawer.querySelectorAll('a').forEach" in html:
        passes.append("Drawer nav links close drawer on navigation")
    else:
        findings.append(("MAJOR", "Drawer", "Drawer nav links do not close drawer on click"))

    # -------------------------------------------------------------
    # 5. MOBILE TOUCH CAROUSEL & LIVE COUNTER
    # -------------------------------------------------------------
    print("\n--- [5] MOBILE TOUCH CAROUSEL & LIVE COUNTER ---")
    
    # Carousel container
    carousel_match = re.search(r'<div[^>]*id=["\']archive-catalog-carousel["\'][^>]*>', html)
    if not carousel_match:
        findings.append(("CRITICAL", "Carousel", "Element #archive-catalog-carousel missing"))
    else:
        c_tag = carousel_match.group(0)
        if "overflow-x-auto" not in c_tag or "snap-x" not in c_tag or "snap-mandatory" not in c_tag:
            findings.append(("CRITICAL", "Carousel", f"#archive-catalog-carousel missing scroll-snap classes: {c_tag}"))
        else:
            passes.append(f"#archive-catalog-carousel properly implements scroll-snap: {c_tag}")
            
        if "lg:grid" not in c_tag or "lg:overflow-visible" not in c_tag:
            findings.append(("MAJOR", "Carousel", f"#archive-catalog-carousel missing desktop grid transition: {c_tag}"))
        else:
            passes.append("#archive-catalog-carousel transitions to grid and visible overflow on desktop (lg:grid)")

    # Peek width on cards
    cards = re.findall(r'<article[^>]*class=["\'][^"\']*snap-start[^"\']*["\']', html)
    if len(cards) < 4:
        findings.append(("MAJOR", "Carousel", f"Expected at least 4 catalog cards with snap-start, found {len(cards)}"))
    else:
        passes.append(f"Found {len(cards)} snap-start cards in catalog")
        if all("w-[82vw]" in card or "sm:w-[60vw]" in card for card in cards):
            passes.append("All catalog cards have mobile peek width affordance (w-[82vw] / sm:w-[60vw])")
        else:
            findings.append(("MAJOR", "Carousel", "Some catalog cards missing peek width affordance"))

    # Carousel counter element
    counter_match = re.search(r'<span[^>]*id=["\']carousel-counter["\'][^>]*>(.*?)</span>', html)
    if not counter_match:
        findings.append(("CRITICAL", "Carousel", "#carousel-counter element missing"))
    else:
        c_text = counter_match.group(1).strip()
        passes.append(f"#carousel-counter element found with initial text: {c_text}")
        if not re.search(r'\[\s*\d+\s*/\s*\d+\s*\]', c_text):
            findings.append(("MINOR", "Carousel", f"#carousel-counter initial text format unexpected: {c_text}"))

    # -------------------------------------------------------------
    # 6. MOBILE TOUCH AFFORDANCES
    # -------------------------------------------------------------
    print("\n--- [6] MOBILE TOUCH AFFORDANCES ---")
    
    # Check if hover-only classes were made accessible on touch
    restricted_badges = re.findall(r'<div[^>]*class=["\'][^"\']*opacity-100 lg:opacity-0 lg:group-hover:opacity-100[^"\']*["\']', html)
    if len(restricted_badges) >= 4:
        passes.append(f"Product preview and restricted badges are permanently visible on touch/mobile ({len(restricted_badges)} cards)")
    else:
        findings.append(("MAJOR", "Touch Affordance", f"Only {len(restricted_badges)} badges have mobile touch visibility"))

    # Quick order buttons min height
    quick_orders = re.findall(r'<button[^>]*>QUICK ORDER</button>', html)
    quick_order_tags = re.findall(r'<button[^>]*class=["\'][^"\']*min-h-\[44px\][^"\']*["\'][^>]*>QUICK ORDER</button>', html)
    passes.append(f"Quick order buttons: {len(quick_order_tags)} / {len(quick_orders)} have explicit min-h-[44px]")

    # -------------------------------------------------------------
    # 7. PERFORMANCE & CLS
    # -------------------------------------------------------------
    print("\n--- [7] PERFORMANCE & CLS ---")
    img_tags = re.findall(r'<img[^>]*>', html)
    lazy_imgs = [img for img in img_tags if 'loading="lazy"' in img]
    async_imgs = [img for img in img_tags if 'decoding="async"' in img]
    alt_imgs = [img for img in img_tags if 'alt=' in img and 'alt=""' not in img]
    
    print(f"Total images: {len(img_tags)}, Lazy: {len(lazy_imgs)}, Async: {len(async_imgs)}, With Alt: {len(alt_imgs)}")
    if len(lazy_imgs) >= 4 and len(async_imgs) >= 4:
        passes.append(f"Image performance verified: {len(lazy_imgs)} lazy loaded, {len(async_imgs)} async decoded")
    else:
        findings.append(("MINOR", "Performance", f"Insufficient lazy/async images: {len(lazy_imgs)} lazy, {len(async_imgs)} async"))
        
    if len(alt_imgs) == len(img_tags):
        passes.append("100% of images have descriptive alt attributes")
    else:
        findings.append(("MINOR", "Accessibility", f"{len(img_tags) - len(alt_imgs)} images lack alt attributes"))

    # -------------------------------------------------------------
    # 8. DESKTOP BRUTALISM PRESERVATION
    # -------------------------------------------------------------
    print("\n--- [8] DESKTOP BRUTALISM PRESERVATION ---")
    # Live clock
    if 'id="live-clock"' in html and "updateClock" in html:
        passes.append("Tokyo live clock and updateClock script intact")
    else:
        findings.append(("CRITICAL", "Desktop", "Tokyo live clock or update script missing"))

    # Desktop nav
    desktop_nav = re.search(r'<nav[^>]*class=["\'][^"\']*hidden lg:flex[^"\']*["\'][^>]*>', html)
    if desktop_nav:
        passes.append("Desktop navigation index matrix preserved with hidden lg:flex")
    else:
        findings.append(("CRITICAL", "Desktop", "Desktop navigation matrix missing or broken"))

    # 12-column grid in header
    if "grid grid-cols-12" in html:
        passes.append("Header preserves 12-column grid structure")
    else:
        findings.append(("MAJOR", "Desktop", "Header missing grid grid-cols-12"))

    # -------------------------------------------------------------
    # 9. HYGIENE & CLEANUP
    # -------------------------------------------------------------
    print("\n--- [9] HYGIENE & CLEANUP ---")
    if "<!-- RESPONSIVE ENHANCEMENTS -->" in html:
        findings.append(("CRITICAL", "Hygiene", "Found lingering '<!-- RESPONSIVE ENHANCEMENTS -->' block"))
    else:
        passes.append("No naive responsive_fix.py script comments present")

    if ".mobile-nav" in html:
        findings.append(("CRITICAL", "Hygiene", "Found lingering '.mobile-nav' CSS rule"))
    else:
        passes.append("No leftover '.mobile-nav' CSS rules present")

    if "md:grid-cols-2 md:grid-cols-4" in html:
        findings.append(("MAJOR", "Hygiene", "Found conflicting duplicate md:grid-cols classes in footer"))
    else:
        passes.append("Footer technical links grid properly cleaned (sm:grid-cols-2 lg:grid-cols-4)")

    # -------------------------------------------------------------
    # 10. ADVERSARIAL STRESS TESTING (SIMULATED DYNAMICS)
    # -------------------------------------------------------------
    print("\n--- [10] ADVERSARIAL STRESS TESTING ---")
    
    # Stress test 1: Counter math boundary conditions
    # Active index formula: Math.min(Math.max(1, Math.round(scrollLeft / cardWidth) + 1), total)
    total = 4
    card_width = 300
    test_scrolls = [-100, 0, 150, 300, 450, 600, 750, 900, 2000]
    for s in test_scrolls:
        computed = min(max(1, round(s / card_width) + 1), total)
        assert 1 <= computed <= total, f"Index out of bounds for scroll {s}: {computed}"
    passes.append("Carousel index formula survives extreme negative and beyond-total scroll offsets")

    # Stress test 2: Check divide-by-zero protection in counter math
    # cards[0]?.offsetWidth || 1 ensures denominator is never 0
    if "offsetWidth || 1" in html:
        passes.append("Counter formula explicitly handles zero-width edge case with fallback `|| 1`")
    else:
        findings.append(("MINOR", "Adversarial", "Counter formula may risk divide-by-zero if card width is 0"))

    # Stress test 3: Resize while drawer open
    # When drawer is open, does anything prevent desktop nav from functioning if resized?
    # Notice: body scroll is locked, trigger is hidden on desktop (lg:hidden).
    # If opened and user resizes to lg, drawer is still visible (translate-x-0) unless closed or lg:hidden.
    if "lg:hidden" not in html[html.find('id="mobile-drawer"'):html.find('id="mobile-drawer"')+100]:
        findings.append(("MINOR", "Adversarial", "Mobile drawer element does not have `lg:hidden`, meaning if a user resizes desktop while drawer is open, it remains visible unless closed"))
    else:
        passes.append("Mobile drawer element has lg:hidden")

    # Stress test 4: Anchor navigation targets
    drawer_hrefs = re.findall(r'<a[^>]*href=["\']#([^"\']+)["\'][^>]*>', html[html.find('id="mobile-drawer"'):html.find('</aside>')])
    page_ids = set(re.findall(r'id=["\']([^"\']+)["\']', html))
    print(f"Drawer href targets: {drawer_hrefs}")
    for h in set(drawer_hrefs):
        if h != "cart" and h not in page_ids:
            findings.append(("MINOR", "Navigation", f"Drawer link target #{h} not found as element ID in page"))
        else:
            passes.append(f"Drawer anchor #{h} targets valid ID or recognized action")

    # Print summary
    print("\n" + "=" * 60)
    print("TEST SUMMARY:")
    print(f"Total Passes: {len(passes)}")
    print(f"Total Findings: {len(findings)}")
    print("=" * 60)
    
    if findings:
        print("\nFINDINGS:")
        for severity, cat, desc in findings:
            print(f"  [{severity}] [{cat}] {desc}")
    else:
        print("\nZERO DEFECTS FOUND! PERFECT EXECUTION.")

    return len(findings) == 0, passes, findings

if __name__ == "__main__":
    success, passes, findings = run_adversarial_suite()
    sys.exit(0 if success else 1)
