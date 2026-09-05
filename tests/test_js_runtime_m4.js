/**
 * Milestone 4 Node.js Adversarial Runtime State Machine & Event Dispatcher Probe
 * Target: tomboy_raw_brutalist_archive_index/code.html
 * Challenger: challenger_m4_1
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const htmlPath = path.resolve(__dirname, '..', 'tomboy_raw_brutalist_archive_index', 'code.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf8');

console.log('=== RUNNING EMPIRICAL JS RUNTIME ADVERSARIAL STRESS TEST ===\n');

// 1. Lightweight Mock DOM Implementation
class ClassList {
  constructor(initial = []) {
    this.set = new Set(initial);
  }
  add(...tokens) {
    tokens.forEach(t => this.set.add(t));
  }
  remove(...tokens) {
    tokens.forEach(t => this.set.delete(t));
  }
  contains(token) {
    return this.set.has(token);
  }
  toString() {
    return Array.from(this.set).join(' ');
  }
}

class MockElement {
  constructor(tag, id = '', initialClasses = [], attrs = {}) {
    this.tagName = tag.toUpperCase();
    this.id = id;
    this.classList = new ClassList(initialClasses);
    this.attributes = { ...attrs };
    this.children = [];
    this.listeners = {};
    this.textContent = '';
    this.scrollLeft = 0;
    this.offsetWidth = 320;
    this.style = {};
  }
  setAttribute(k, v) {
    this.attributes[k] = String(v);
  }
  getAttribute(k) {
    return this.attributes[k] !== undefined ? this.attributes[k] : null;
  }
  addEventListener(event, fn, options) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(fn);
  }
  dispatchEvent(event) {
    const type = event.type || event;
    const handlers = this.listeners[type] || [];
    for (const h of handlers) {
      h(event);
    }
  }
  querySelectorAll(selector) {
    const results = [];
    function search(node) {
      for (const child of node.children) {
        if (selector === 'a' && child.tagName === 'A') results.push(child);
        if (selector === 'article' && child.tagName === 'ARTICLE') results.push(child);
        search(child);
      }
    }
    search(this);
    return results;
  }
}

// 2. Build Mock DOM matching code.html
const trigger = new MockElement('BUTTON', 'mobile-menu-trigger', ['flex', 'lg:hidden', 'min-h-[44px]', 'min-w-[44px]'], {
  'aria-expanded': 'false',
  'aria-controls': 'mobile-drawer'
});

const drawer = new MockElement('ASIDE', 'mobile-drawer', ['fixed', 'inset-y-0', 'right-0', 'z-50', 'transform', 'translate-x-full'], {
  'role': 'dialog',
  'aria-modal': 'true',
  'aria-label': 'Archival Navigation Menu'
});

const backdrop = new MockElement('DIV', 'mobile-drawer-backdrop', ['fixed', 'inset-0', 'z-40', 'opacity-0', 'pointer-events-none']);
const closeBtn = new MockElement('BUTTON', 'mobile-drawer-close', ['flex', 'min-h-[44px]', 'min-w-[44px]'], {
  'aria-label': 'Close Archival Navigation'
});

// Add 6 links inside drawer
const drawerLinks = [];
for (let i = 1; i <= 6; i++) {
  const link = new MockElement('A', `drawer-link-${i}`, ['flex'], { 'href': i === 6 ? '#cart' : '#catalog' });
  link.textContent = `//0${i} LINK`;
  drawer.children.push(link);
  drawerLinks.push(link);
}
drawer.children.push(closeBtn);

const carousel = new MockElement('DIV', 'archive-catalog-carousel', ['flex', 'lg:grid', 'overflow-x-auto', 'snap-x', 'snap-mandatory']);
const cards = [];
for (let i = 1; i <= 4; i++) {
  const card = new MockElement('ARTICLE', `card-${i}`, ['snap-start', 'shrink-0', 'w-[82vw]']);
  card.offsetWidth = 320; // Simulated mobile card width
  carousel.children.push(card);
  cards.push(card);
}

const counter = new MockElement('SPAN', 'carousel-counter', ['font-mono-code']);
counter.textContent = '[ 01 / 04 ]';

// Global mock environment
const mockBody = {
  style: {
    overflow: ''
  }
};

const windowListeners = {};
const mockWindow = {
  addEventListener: (event, fn) => {
    if (!windowListeners[event]) windowListeners[event] = [];
    windowListeners[event].push(fn);
  },
  dispatchEvent: (event) => {
    const handlers = windowListeners[event.type || event] || [];
    for (const h of handlers) h(event);
  }
};

const elementsById = {
  'mobile-menu-trigger': trigger,
  'mobile-drawer': drawer,
  'mobile-drawer-backdrop': backdrop,
  'mobile-drawer-close': closeBtn,
  'archive-catalog-carousel': carousel,
  'carousel-counter': counter
};

const mockDocument = {
  body: mockBody,
  getElementById: (id) => elementsById[id] || null
};

// 3. Extract Script Controller from code.html
const scriptBlocks = htmlContent.split('<script>');
const targetBlock = scriptBlocks.find(b => b.includes('ARCHIVAL MOBILE DRAWER CONTROLLER'));
assert(targetBlock, 'Script block containing ARCHIVAL MOBILE DRAWER CONTROLLER must exist');
const scriptSource = targetBlock.split('</script>')[0];

// 4. Execute script in isolated sandbox
const sandbox = {
  document: mockDocument,
  window: mockWindow,
  Math: Math,
  String: String,
  console: console
};
vm.createContext(sandbox);
vm.runInContext(scriptSource, sandbox);

console.log('✓ Script initialized without syntax or runtime exceptions in sandbox.');

// 5. STRESS TEST SUITE

// Test 5.1: Initial State Check
console.log('Testing 5.1: Initial State Invariants...');
assert(drawer.classList.contains('translate-x-full'), 'Drawer must start closed');
assert(!drawer.classList.contains('translate-x-0'), 'Drawer must not have translate-x-0');
assert(backdrop.classList.contains('opacity-0'), 'Backdrop must start transparent');
assert(backdrop.classList.contains('pointer-events-none'), 'Backdrop must not intercept clicks initially');
assert.strictEqual(trigger.getAttribute('aria-expanded'), 'false');
assert.strictEqual(mockBody.style.overflow, '');
console.log('  -> PASSED: Initial state clean.');

// Test 5.2: Open via Trigger
console.log('Testing 5.2: Open Drawer via Trigger...');
trigger.dispatchEvent({ type: 'click' });
assert(!drawer.classList.contains('translate-x-full'), 'Drawer must not be translate-x-full when open');
assert(drawer.classList.contains('translate-x-0'), 'Drawer must be translate-x-0 when open');
assert(backdrop.classList.contains('opacity-100'), 'Backdrop must be opacity-100 when open');
assert(backdrop.classList.contains('pointer-events-auto'), 'Backdrop must be pointer-events-auto when open');
assert.strictEqual(trigger.getAttribute('aria-expanded'), 'true');
assert.strictEqual(drawer.getAttribute('aria-hidden'), 'false');
assert.strictEqual(mockBody.style.overflow, 'hidden', 'Scroll must be locked');
console.log('  -> PASSED: Trigger open correctly updates classes, ARIA, and scroll lock.');

// Test 5.3: Close via Close Button
console.log('Testing 5.3: Close Drawer via Close Button...');
closeBtn.dispatchEvent({ type: 'click' });
assert(drawer.classList.contains('translate-x-full'), 'Drawer must return to translate-x-full');
assert(!drawer.classList.contains('translate-x-0'), 'Drawer must not have translate-x-0');
assert(backdrop.classList.contains('opacity-0'), 'Backdrop must return to opacity-0');
assert(backdrop.classList.contains('pointer-events-none'), 'Backdrop must return to pointer-events-none');
assert.strictEqual(trigger.getAttribute('aria-expanded'), 'false');
assert.strictEqual(drawer.getAttribute('aria-hidden'), 'true');
assert.strictEqual(mockBody.style.overflow, '', 'Scroll must be unlocked');
console.log('  -> PASSED: Close button restores closed state and restores body scroll.');

// Test 5.4: Re-open and Close via Backdrop
console.log('Testing 5.4: Re-open and Close via Backdrop Click...');
trigger.dispatchEvent({ type: 'click' });
assert.strictEqual(mockBody.style.overflow, 'hidden');
backdrop.dispatchEvent({ type: 'click' });
assert(drawer.classList.contains('translate-x-full'));
assert.strictEqual(mockBody.style.overflow, '');
console.log('  -> PASSED: Backdrop click closes drawer and unlocks scroll.');

// Test 5.5: Re-open and Close via Escape Key
console.log('Testing 5.5: Re-open and Close via Escape Keydown...');
trigger.dispatchEvent({ type: 'click' });
assert.strictEqual(mockBody.style.overflow, 'hidden');
mockWindow.dispatchEvent({ type: 'keydown', key: 'Escape' });
assert(drawer.classList.contains('translate-x-full'));
assert.strictEqual(mockBody.style.overflow, '');
console.log('  -> PASSED: Escape key closes drawer.');

// Test 5.6: Non-Escape Keys do NOT close drawer
console.log('Testing 5.6: Non-Escape Keydown does NOT close drawer...');
trigger.dispatchEvent({ type: 'click' });
mockWindow.dispatchEvent({ type: 'keydown', key: 'Enter' });
assert(drawer.classList.contains('translate-x-0'), 'Drawer should stay open on Enter');
mockWindow.dispatchEvent({ type: 'keydown', key: 'Tab' });
assert(drawer.classList.contains('translate-x-0'), 'Drawer should stay open on Tab');
mockWindow.dispatchEvent({ type: 'keydown', key: ' ' });
assert(drawer.classList.contains('translate-x-0'), 'Drawer should stay open on Space');
closeBtn.dispatchEvent({ type: 'click' });
console.log('  -> PASSED: Non-Escape keys ignored.');

// Test 5.7: All Drawer Links Close Drawer on Navigation
console.log('Testing 5.7: All Drawer Nav Links Trigger Close...');
for (let i = 0; i < drawerLinks.length; i++) {
  trigger.dispatchEvent({ type: 'click' });
  assert.strictEqual(mockBody.style.overflow, 'hidden');
  drawerLinks[i].dispatchEvent({ type: 'click' });
  assert(drawer.classList.contains('translate-x-full'), `Link ${i+1} must close drawer`);
  assert.strictEqual(mockBody.style.overflow, '', `Link ${i+1} must unlock scroll`);
}
console.log(`  -> PASSED: All ${drawerLinks.length} drawer links close the drawer on click.`);

// Test 5.8: Rapid Idempotency Stress Test (50 cycles)
console.log('Testing 5.8: Rapid Idempotency Stress Test (50 cycles)...');
for (let i = 0; i < 50; i++) {
  trigger.dispatchEvent({ type: 'click' });
  assert.strictEqual(mockBody.style.overflow, 'hidden');
  closeBtn.dispatchEvent({ type: 'click' });
  assert.strictEqual(mockBody.style.overflow, '');
}
assert(drawer.classList.contains('translate-x-full'));
console.log('  -> PASSED: 50 open/close cycles completed with flawless state integrity.');

// Test 5.9: Carousel Real-Time Scroll Listener & Counter Math
console.log('Testing 5.9: Carousel Real-Time Scroll Listener & Counter Math...');
assert.strictEqual(counter.textContent, '[ 01 / 04 ]');

// Scroll to card 2 (scrollLeft = 320)
carousel.scrollLeft = 320;
carousel.dispatchEvent({ type: 'scroll' });
assert.strictEqual(counter.textContent, '[ 02 / 04 ]', `Expected [ 02 / 04 ], got ${counter.textContent}`);

// Scroll to card 3 (scrollLeft = 640)
carousel.scrollLeft = 640;
carousel.dispatchEvent({ type: 'scroll' });
assert.strictEqual(counter.textContent, '[ 03 / 04 ]', `Expected [ 03 / 04 ], got ${counter.textContent}`);

// Scroll to card 4 (scrollLeft = 960)
carousel.scrollLeft = 960;
carousel.dispatchEvent({ type: 'scroll' });
assert.strictEqual(counter.textContent, '[ 04 / 04 ]', `Expected [ 04 / 04 ], got ${counter.textContent}`);

// Negative elastic bounce (scrollLeft = -150)
carousel.scrollLeft = -150;
carousel.dispatchEvent({ type: 'scroll' });
assert.strictEqual(counter.textContent, '[ 01 / 04 ]', `Expected [ 01 / 04 ] on bounce, got ${counter.textContent}`);

// Overscroll beyond max (scrollLeft = 5000)
carousel.scrollLeft = 5000;
carousel.dispatchEvent({ type: 'scroll' });
assert.strictEqual(counter.textContent, '[ 04 / 04 ]', `Expected [ 04 / 04 ] on overscroll, got ${counter.textContent}`);

// Subpixel transition boundary (midpoint between 1 and 2: 159px vs 161px)
carousel.scrollLeft = 159;
carousel.dispatchEvent({ type: 'scroll' });
assert.strictEqual(counter.textContent, '[ 01 / 04 ]');
carousel.scrollLeft = 161;
carousel.dispatchEvent({ type: 'scroll' });
assert.strictEqual(counter.textContent, '[ 02 / 04 ]');

console.log('  -> PASSED: Carousel counter scroll tracking and clamping verified.');

// Test 5.10: Zero-width Card Fallback
console.log('Testing 5.10: Zero-width Card Fallback...');
cards[0].offsetWidth = 0; // Simulate card width 0
carousel.scrollLeft = 50;
carousel.dispatchEvent({ type: 'scroll' });
// Must not crash or produce NaN
assert(!counter.textContent.includes('NaN'), `Counter must not contain NaN: ${counter.textContent}`);
console.log('  -> PASSED: Card width 0 fallback works (guarded by cards[0]?.offsetWidth || 1).');

console.log('\n======================================================');
console.log('ALL EMPIRICAL JS RUNTIME ADVERSARIAL STRESS TESTS PASSED!');
console.log('======================================================\n');
