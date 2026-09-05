import sys
import os
sys.path.insert(0, os.path.abspath('.'))

import unittest
from tests.test_responsive_storefronts import (
    load_storefront, extract_navbar_cart, extract_all_script_contents,
    STOREFRONT_CONFIG, Tier1FeatureCoverageTests, Tier2BoundaryCornerCaseTests,
    Tier3CrossFeatureIntegrationTests, Tier4RealWorldWorkloadScenarioTests
)

key = 'darkroom_runway'
cfg = STOREFRONT_CONFIG[key]
html, dom = load_storefront(key)

print(f"Checking {cfg['name']}:")

# Test 1: Cart
cart_elem = extract_navbar_cart(dom)
assert cart_elem is not None
cart_text = cart_elem.get_text()
assert '[ 02 ]' not in cart_text, "Found [ 02 ] in cart text"
assert '[ 0 ]' not in cart_text, "Found [ 0 ] in cart text"
assert 'CART' in cart_text, "CART label not in cart text"
print('  [PASS] Cart no zero badge & CART label')

# Test 2: Trigger
trigger = dom.find_by_id('mobile-menu-trigger')
assert trigger is not None
assert trigger.tag == 'button'
assert trigger.get('aria-label')
assert any(c in trigger.get_classes() for c in ['lg:hidden', 'xl:hidden'])
print('  [PASS] Mobile menu trigger')

# Test 3: Drawer
drawer = dom.find_by_id('mobile-drawer')
assert drawer is not None
assert drawer.tag == 'aside'
classes = drawer.get_classes()
assert any(c in classes for c in ['translate-x-full', '-translate-x-full', 'translate-y-full'])
assert any(c in classes for c in ['fixed', 'absolute'])
print('  [PASS] Drawer element & positioning')

# Test 4: Backdrop
backdrop = dom.find_by_id('mobile-drawer-backdrop')
assert backdrop is not None
print('  [PASS] Drawer backdrop')

# Test 5: Close button
close_btn = dom.find_by_id('mobile-drawer-close')
assert close_btn is not None
assert close_btn.get('aria-label')
print('  [PASS] Drawer close button')

# Test 6: Carousel track
carousel = dom.find_by_id('lookbook-carousel')
assert carousel is not None
c_classes = carousel.get_classes()
assert any('snap-x' in c for c in c_classes)
assert any('overflow-x' in c for c in c_classes)
print('  [PASS] Carousel track')

# Test 7: Carousel cards
cards = carousel.find_by_class_tokens(['snap-start'])
assert len(cards) >= 3
peek_ok = any(any('w-[' in c for c in card.get_classes()) for card in cards)
assert peek_ok
print(f'  [PASS] Carousel cards ({len(cards)} cards, snap-start and peek width)')

# Test 8: Live counter
counter = dom.find_by_id('carousel-counter')
assert counter is not None
assert '01' in counter.get_text()
print('  [PASS] Live counter #carousel-counter')

# Test 9: Scripts
scripts = extract_all_script_contents(html)
assert 'Escape' in scripts or 'escape' in scripts.lower()
assert 'overflow' in scripts and 'hidden' in scripts
assert 'scroll' in scripts
print('  [PASS] JS: Escape key, scroll lock, scroll listener')

# Test 10: Naive injection cleanup
assert '<!-- RESPONSIVE ENHANCEMENTS -->' not in html
assert '.mobile-nav' not in html
print('  [PASS] Naive injection completely eliminated')

# Test 11: Real-world darkroom editorial mobile journey
suite = unittest.TestSuite()
suite.addTest(Tier4RealWorldWorkloadScenarioTests('test_tier4_darkroom_editorial_mobile_journey'))
suite.addTest(Tier1FeatureCoverageTests('test_tier1_cart_no_zero_badge_storefront_2'))
runner = unittest.TextTestRunner(verbosity=2)
result = runner.run(suite)
assert result.wasSuccessful()
print('  [PASS] test_tier4_darkroom_editorial_mobile_journey passed!')

print('=== ALL DARKROOM RUNWAY STOREFRONT 2 TESTS 100% PASS! ===')
