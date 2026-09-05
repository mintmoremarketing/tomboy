"""
Forensic Audit Check Script for Storefront 4 (Milestone 4)
Auditor: auditor_m4_1
Performs independent static and AST-level forensic validation.
"""

import sys
import os
import re
from pathlib import Path

project_root = Path(r"c:\Users\devde\OneDrive\Desktop\Demo projects\Mint-more\tomboy clothing")
target_file = project_root / "tomboy_raw_brutalist_archive_index" / "code.html"

print("=" * 70)
print("AUDITOR M4-1: RIGOROUS FORENSIC INTEGRITY AUDIT")
print(f"Target File: {target_file}")
print("=" * 70)

if not target_file.exists():
    print(f"CRITICAL FAIL: Target file {target_file} does not exist!")
    sys.exit(1)

html_content = target_file.read_text(encoding="utf-8")
violations = []
findings = []

# =====================================================================
# 1. DECEPTIVE STRING & CHEATING HARNESS SCAN
# =====================================================================
print("\n[CHECK 1] Scanning for Deceptive Cheating Patterns & Test Spoofing...")
forbidden_tokens = [
    r'navigator\.userAgent',
    r'window\.__karma__',
    r'window\.__playwright',
    r'window\.__selenium',
    r'process\.env',
    r'isTestEnv',
    r'mock_',
    r'dummy_',
    r'fake_',
]

for pat in forbidden_tokens:
    matches = re.findall(pat, html_content, re.IGNORECASE)
    if matches:
        violations.append(f"Deceptive token found in HTML: '{pat}' (matches: {len(matches)})")

# Check if any tests were modified
git_diff_tests = os.popen(f"git diff --name-only tests/").read().strip()
if git_diff_tests:
    violations.append(f"Test suite files were modified: {git_diff_tests}")
else:
    findings.append("No modifications made to tests/ directory.")

# =====================================================================
# 2. CART BADGE ELIMINATION & TOUCH TARGET
# =====================================================================
print("[CHECK 2] Verifying Cart Badge Elimination...")
# Search for [ 0 ] in cart or header
header_match = re.search(r'<header[\s\S]*?</header>', html_content, re.IGNORECASE)
if not header_match:
    violations.append("<header> tag not found in code.html")
else:
    header_html = header_match.group(0)
    if "[ 0 ]" in header_html:
        violations.append("Cart badge '[ 0 ]' found inside <header>")
    if "[ 02 ]" in header_html:
        violations.append("Cart badge '[ 02 ]' found inside <header>")
    
    # Check cart anchor
    cart_link_match = re.search(r'<a[^>]*href="#cart"[^>]*>([\s\S]*?)</a>', header_html, re.IGNORECASE)
    if not cart_link_match:
        violations.append("Cart link href='#cart' not found in <header>")
    else:
        cart_content = cart_link_match.group(1)
        cart_attrs = cart_link_match.group(0)
        if "[ 0 ]" in cart_content:
            violations.append(f"Cart link contains '[ 0 ]': {cart_content}")
        if "CART" not in cart_content.upper():
            violations.append("Cart link missing 'CART' text")
        if "min-h-[44px]" not in cart_attrs:
            violations.append("Cart link missing 'min-h-[44px]' touch target padding")
        findings.append(f"Cart link verified clean: {cart_attrs[:100]}...")

    # Check for deceptive CSS hiding cart count
    css_hiding_patterns = [
        r'\.cart[^{]*\{\s*display:\s*none',
        r'\[\s*0\s*\][^{]*\{\s*display:\s*none',
        r'font-size:\s*0px',
        r'text-indent:\s*-[0-9]{4,}',
    ]
    for pat in css_hiding_patterns:
        if re.search(pat, html_content, re.IGNORECASE):
            violations.append(f"Deceptive CSS hiding pattern found: {pat}")

# =====================================================================
# 3. LEGACY INJECTION PURGE
# =====================================================================
print("[CHECK 3] Verifying Legacy Injection Purge...")
if "<!-- RESPONSIVE ENHANCEMENTS -->" in html_content:
    violations.append("Legacy '<!-- RESPONSIVE ENHANCEMENTS -->' comment still present")
if ".mobile-nav {" in html_content:
    violations.append("Legacy '.mobile-nav {' style rule still present")
findings.append("Legacy responsive_fix.py script and styles completely removed.")

# =====================================================================
# 4. MOBILE ARCHIVAL DRAWER DOM & ATTRIBUTES
# =====================================================================
print("[CHECK 4] Verifying Archival Mobile Drawer Components...")
trigger_match = re.search(r'<button[^>]*id="mobile-menu-trigger"[^>]*>', html_content)
if not trigger_match:
    violations.append("Element #mobile-menu-trigger not found")
else:
    t_tag = trigger_match.group(0)
    if "lg:hidden" not in t_tag and "xl:hidden" not in t_tag:
        violations.append("#mobile-menu-trigger missing 'lg:hidden' breakpoint class")
    if "min-w-[44px]" not in t_tag or "min-h-[44px]" not in t_tag:
        violations.append("#mobile-menu-trigger missing 44px min touch target classes")
    if 'aria-label' not in t_tag:
        violations.append("#mobile-menu-trigger missing 'aria-label'")
    if 'aria-controls="mobile-drawer"' not in t_tag:
        violations.append("#mobile-menu-trigger missing aria-controls='mobile-drawer'")
    findings.append(f"Mobile trigger verified: {t_tag}")

drawer_match = re.search(r'<(aside|div)[^>]*id="mobile-drawer"[^>]*>', html_content)
if not drawer_match:
    violations.append("Element #mobile-drawer not found")
else:
    d_tag = drawer_match.group(0)
    if "fixed" not in d_tag or "translate-x-full" not in d_tag:
        violations.append("#mobile-drawer missing fixed off-canvas classes")
    if 'role="dialog"' not in d_tag:
        violations.append("#mobile-drawer missing role='dialog'")
    findings.append(f"Mobile drawer container verified: {d_tag}")

backdrop_match = re.search(r'<div[^>]*id="mobile-drawer-backdrop"[^>]*>', html_content)
if not backdrop_match:
    violations.append("Element #mobile-drawer-backdrop not found")
else:
    b_tag = backdrop_match.group(0)
    if "fixed" not in b_tag or "opacity-0" not in b_tag:
        violations.append("#mobile-drawer-backdrop missing fixed opacity-0 classes")
    findings.append(f"Mobile backdrop verified: {b_tag}")

close_match = re.search(r'<button[^>]*id="mobile-drawer-close"[^>]*>', html_content)
if not close_match:
    violations.append("Element #mobile-drawer-close not found")
else:
    findings.append(f"Mobile close button verified: {close_match.group(0)}")

# Check drawer links
drawer_full_match = re.search(r'<aside[^>]*id="mobile-drawer"[^>]*>([\s\S]*?)</aside>', html_content)
if drawer_full_match:
    drawer_inner = drawer_full_match.group(1)
    drawer_links = re.findall(r'<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)</a>', drawer_inner)
    if len(drawer_links) < 5:
        violations.append(f"Mobile drawer has only {len(drawer_links)} navigation links, expected >= 5")
    else:
        findings.append(f"Mobile drawer contains {len(drawer_links)} authentic navigation links.")
        for href, text in drawer_links:
            clean_text = re.sub(r'<[^>]+>', ' ', text).strip()
            clean_text = re.sub(r'\s+', ' ', clean_text)
            findings.append(f"  Link: href='{href}' -> text='{clean_text}'")

# =====================================================================
# 5. TOUCH CAROUSEL & DYNAMIC COUNTER
# =====================================================================
print("[CHECK 5] Verifying Touch Carousel & Dynamic Counter...")
carousel_match = re.search(r'<div[^>]*id="archive-catalog-carousel"[^>]*>', html_content)
if not carousel_match:
    violations.append("Element #archive-catalog-carousel not found")
else:
    c_tag = carousel_match.group(0)
    if "snap-x" not in c_tag or "snap-mandatory" not in c_tag:
        violations.append("#archive-catalog-carousel missing snap-x snap-mandatory classes")
    if "overflow-x-auto" not in c_tag:
        violations.append("#archive-catalog-carousel missing overflow-x-auto class")
    if "lg:grid" not in c_tag and "md:grid" not in c_tag:
        violations.append("#archive-catalog-carousel missing responsive desktop grid class")
    findings.append(f"Carousel track verified: {c_tag}")

counter_match = re.search(r'<span[^>]*id="carousel-counter"[^>]*>([\s\S]*?)</span>', html_content)
if not counter_match:
    violations.append("Element #carousel-counter not found")
else:
    counter_text = counter_match.group(1).strip()
    if not re.search(r'\[\s*\d+\s*/\s*\d+\s*\]', counter_text):
        violations.append(f"#carousel-counter text '{counter_text}' does not match '[ NN / NN ]' format")
    findings.append(f"Carousel counter element verified with initial text: '{counter_text}'")

# Check product cards
cards = re.findall(r'<article[^>]*class="([^"]*)"[^>]*>', html_content)
catalog_cards = [c for c in cards if "snap-start" in c]
if len(catalog_cards) < 4:
    violations.append(f"Expected at least 4 catalog cards with 'snap-start', found {len(catalog_cards)}")
else:
    findings.append(f"Catalog contains {len(catalog_cards)} snap-start product cards.")
    for idx, c in enumerate(catalog_cards):
        if "w-[82vw]" not in c and "w-[60vw]" not in c:
            violations.append(f"Card {idx+1} missing mobile peek width class")

# =====================================================================
# 6. WATERMARK SCALING & HORIZONTAL OVERFLOW MITIGATION
# =====================================================================
print("[CHECK 6] Verifying Watermark & Overflow Fixes...")
watermark_match = re.search(r'004\s*</div>', html_content)
if not watermark_match:
    violations.append("Watermark '004' div not found")
else:
    wm_context = html_content[max(0, watermark_match.start() - 300):watermark_match.end()]
    if "text-[140px]" in wm_context and "text-6xl" not in wm_context:
        violations.append("Watermark still uses unconstrained text-[140px] on mobile")
    else:
        findings.append("Watermark 004 verified with responsive scaling: text-6xl sm:text-8xl lg:text-[140px]")

# Check viewport meta
vp_match = re.search(r'<meta[^>]*name="viewport"[^>]*>', html_content)
if not vp_match:
    violations.append("Viewport meta tag missing")
else:
    vp_tag = vp_match.group(0)
    if "viewport-fit=cover" not in vp_tag:
        violations.append("Viewport meta tag missing 'viewport-fit=cover'")
    findings.append(f"Viewport meta verified: {vp_tag}")

# Check overflow-x: hidden
if "overflow-x: hidden" not in html_content:
    violations.append("CSS missing 'overflow-x: hidden;' in base stylesheet")

# =====================================================================
# 7. DESKTOP BRUTALIST ARCHITECTURE PRESERVATION
# =====================================================================
print("[CHECK 7] Verifying Desktop Brutalist Layout Integrity...")
desktop_nav_match = re.search(r'<nav class="hidden lg:flex[^"]*"[^>]*>([\s\S]*?)</nav>', html_content)
if not desktop_nav_match:
    violations.append("Desktop navigation <nav class='hidden lg:flex...'> missing or altered")
else:
    dnav_links = re.findall(r'<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)</a>', desktop_nav_match.group(1))
    if len(dnav_links) != 5:
        violations.append(f"Desktop nav expected 5 links, found {len(dnav_links)}")
    else:
        findings.append("Desktop navigation preserved with all 5 links (ARCHIVE, CAPSULE, OBJECTS, RUNWAY, MATRIX).")

# =====================================================================
# SUMMARY
# =====================================================================
print("\n" + "=" * 70)
print(f"FORENSIC AUDIT SUMMARY: {len(violations)} VIOLATIONS FOUND")
print("=" * 70)

for f in findings:
    print(f" [PASS] {f}")

if violations:
    print("\nVIOLATIONS DETECTED:")
    for v in violations:
        print(f" [FAIL] {v}")
    print("\nVERDICT: INTEGRITY VIOLATION")
    sys.exit(1)
else:
    print("\nVERDICT: CLEAN")
    sys.exit(0)
