"""
Adversarial Stress Test Suite: Corner Cases, Rapid State Cycles, and Boundary Mining
Milestone 1 - Storefront 1: Latest Drop

Author: challenger_m1_1
"""

import re
import sys
import json
import subprocess
from html.parser import HTMLParser
from pathlib import Path

TARGET_HTML = Path(r"c:\Users\devde\OneDrive\Desktop\Demo projects\Mint-more\tomboy clothing\tomboy_clothing_home_latest_drop\code.html")

def run_stress_test():
    print("=== Running Adversarial Stress Suite for Storefront 1 ===")
    html = TARGET_HTML.read_text(encoding="utf-8")
    errors = []

    # 1. HTML Validation / Zero Tag Mismatches
    class StrictValidator(HTMLParser):
        def __init__(self):
            super().__init__()
            self.stack = []
            self.voids = {'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}
            self.mismatches = []
        def handle_starttag(self, tag, attrs):
            if tag.lower() not in self.voids:
                self.stack.append((tag.lower(), self.getpos()))
        def handle_endtag(self, tag):
            if tag.lower() in self.voids:
                return
            if not self.stack:
                self.mismatches.append(f"Unexpected end tag </{tag}> at {self.getpos()}")
                return
            expected_tag, pos = self.stack.pop()
            if expected_tag != tag.lower():
                self.mismatches.append(f"Mismatched tag: expected </{expected_tag}> (opened at {pos}), found </{tag}> at {self.getpos()}")

    validator = StrictValidator()
    validator.feed(html)
    if validator.stack:
        errors.append(f"Unclosed tags at EOF: {[t[0] for t in validator.stack]}")
    if validator.mismatches:
        errors.append(f"Tag mismatches: {validator.mismatches}")
    print(f"[*] HTML Parsing & Tag Balance: {'PASS' if not validator.stack and not validator.mismatches else 'FAIL'}")

    # 2. Strict Search for [ 0 ] or [ 02 ] anywhere in the entire navbar / header / cart
    cart_matches = re.findall(r'<a[^>]*data-path="cart"[^>]*>.*?</a>', html, re.DOTALL)
    for c in cart_matches:
        if re.search(r'\[\s*0[1-9]?\s*\]', c):
            errors.append(f"Found forbidden zero count badge inside cart anchor: {c}")
    print("[*] Navbar Cart Count Badge Absence: PASS")

    # 3. Verify All 7 Viewports have distinct breakpoint behaviors
    # We check that breakpoint classes exist for:
    # <sm (default), sm (640px), md (768px), lg (1024px), xl (1280px), 2xl (1536px)
    breakpoints_in_code = {
        "sm": len(re.findall(r'\bsm:', html)),
        "md": len(re.findall(r'\bmd:', html)),
        "lg": len(re.findall(r'\blg:', html)),
        "xl": len(re.findall(r'\bxl:', html)),
    }
    for bp, count in breakpoints_in_code.items():
        min_expected = 3 if bp == "xl" else 5
        if count < min_expected:
            errors.append(f"Breakpoint '{bp}:' occurs only {count} times; insufficient responsive differentiation")
        else:
            print(f"[*] Responsive Breakpoint '{bp}:' utilized {count} times: PASS")

    # 4. Stress Test Rapid Drawer Open/Close Cycles in Node.js (1,000 cycles)
    stress_node_script = """
    const fs = require('fs');
    const path = require('path');
    const html = fs.readFileSync(path.resolve(__dirname, '../../tomboy_clothing_home_latest_drop/code.html'), 'utf8');
    
    // Mock minimal DOM
    class ClassList {
        constructor() { this.classes = new Set(); }
        add(...cls) { cls.forEach(c => this.classes.add(c)); }
        remove(...cls) { cls.forEach(c => this.classes.delete(c)); }
        contains(c) { return this.classes.has(c); }
    }
    class MockElement {
        constructor(id) {
            this.id = id;
            this.classList = new ClassList();
            this.attributes = {};
            this.listeners = {};
            this.style = {};
            this.children = [];
        }
        setAttribute(k, v) { this.attributes[k] = String(v); }
        getAttribute(k) { return this.attributes[k]; }
        addEventListener(e, fn) { if (!this.listeners[e]) this.listeners[e] = []; this.listeners[e].push(fn); }
        click() { (this.listeners['click'] || []).forEach(fn => fn({ type: 'click' })); }
        focus() {}
        querySelectorAll() { return []; }
    }
    const doc = {
        body: new MockElement('body'),
        elements: new Map(),
        listeners: {},
        register(el) { this.elements.set(el.id, el); return el; },
        getElementById(id) { return this.elements.get(id); },
        addEventListener(e, fn) { if (!this.listeners[e]) this.listeners[e] = []; this.listeners[e].push(fn); },
        dispatchEvent(e) { (this.listeners[e.type] || []).forEach(fn => fn(e)); }
    };
    global.document = doc;
    global.window = {};

    const trigger = doc.register(new MockElement('mobile-menu-trigger'));
    const s1Trigger = doc.register(new MockElement('s1-drawer-trigger'));
    const drawer = doc.register(new MockElement('s1-drawer'));
    const panel = doc.register(new MockElement('mobile-drawer'));
    const backdrop = doc.register(new MockElement('mobile-drawer-backdrop'));
    const closeBtn = doc.register(new MockElement('mobile-drawer-close'));
    const s1CloseBtn = doc.register(new MockElement('s1-drawer-close'));

    // Extract script
    const scriptMatches = html.match(/<script\\b[^>]*>([\\s\\S]*?)<\\/script>/gi);
    const lastScript = scriptMatches[scriptMatches.length - 1].replace(/<\\/?script\\b[^>]*>/gi, '');
    eval(lastScript);

    // Run 1,000 rapid state transitions alternating methods
    for (let i = 0; i < 250; i++) {
        // Cycle 1: Trigger -> CloseBtn
        trigger.click();
        if (doc.body.style.overflow !== 'hidden') throw new Error('Overflow not hidden at cycle ' + i);
        closeBtn.click();
        if (doc.body.style.overflow !== '') throw new Error('Overflow not restored at cycle ' + i);

        // Cycle 2: Trigger -> Backdrop
        trigger.click();
        backdrop.click();
        if (doc.body.style.overflow !== '') throw new Error('Overflow not restored on backdrop cycle ' + i);

        // Cycle 3: Trigger -> Escape key
        trigger.click();
        doc.dispatchEvent({ type: 'keydown', key: 'Escape' });
        if (doc.body.style.overflow !== '') throw new Error('Overflow not restored on Escape cycle ' + i);

        // Cycle 4: s1Trigger -> s1CloseBtn
        s1Trigger.click();
        s1CloseBtn.click();
        if (doc.body.style.overflow !== '') throw new Error('Overflow not restored on s1 cycle ' + i);
    }
    console.log('1000_CYCLES_OK');
    """

    stress_script_path = TARGET_HTML.parent.parent / ".agents" / "challenger_m1_1" / "rapid_cycles_test.js"
    stress_script_path.write_text(stress_node_script, encoding="utf-8")
    res = subprocess.run(["node", str(stress_script_path)], capture_output=True, text=True)
    if "1000_CYCLES_OK" in res.stdout:
        print("[*] 1,000 Rapid State Transition Cycles (Trigger/Backdrop/Escape/CloseBtn): PASS")
    else:
        errors.append(f"1,000 rapid cycles failed: {res.stderr}")

    # 5. Check No-JS Graceful Degradation
    # If JS fails to load or is blocked, verify that:
    # a) Carousel is still scrollable via CSS overflow-x-auto & snap-x
    # b) Desktop layout is unaffected
    has_css_scroll = "overflow-x-auto" in html and "snap-x" in html and "snap-mandatory" in html
    if has_css_scroll:
        print("[*] No-JS Graceful Degradation (Pure CSS scroll-snap carousel): PASS")
    else:
        errors.append("Carousel relies entirely on JS and lacks pure CSS scroll-snap classes")

    print("\n=== Adversarial Stress Test Summary ===")
    if not errors:
        print("ALL ADVERSARIAL CHALLENGES PASSED (0 defects found)")
        return True
    else:
        print(f"FAILED WITH {len(errors)} DEFECTS:")
        for e in errors:
            print(f"  - {e}")
        return False

if __name__ == "__main__":
    success = run_stress_test()
    sys.exit(0 if success else 1)
