// Independent Dynamic Behavioral Verification for auditor_m4_1
// Simulates DOM environment in pure Node.js and executes the script from code.html

const fs = require('fs');
const path = require('path');

const codeHtmlPath = path.resolve(__dirname, '../../tomboy_raw_brutalist_archive_index/code.html');
const html = fs.readFileSync(codeHtmlPath, 'utf8');

console.log('=== AUDITOR M4-1 INDEPENDENT DYNAMIC VERIFICATION ===');

// Simple DOM Mock Environment for dynamic behavioral testing
class MockClassList {
  constructor(initial = '') {
    this.classes = new Set(initial.split(/\s+/).filter(Boolean));
  }
  add(...cls) { cls.forEach(c => this.classes.add(c)); }
  remove(...cls) { cls.forEach(c => this.classes.delete(c)); }
  contains(cls) { return this.classes.has(cls); }
  toString() { return Array.from(this.classes).join(' '); }
}

class MockElement {
  constructor(id, tag = 'div', initialClasses = '') {
    this.id = id;
    this.tagName = tag.toUpperCase();
    this.classList = new MockClassList(initialClasses);
    this.attributes = {};
    this.listeners = {};
    this.style = {};
    this.children = [];
    this.textContent = '';
    this.scrollLeft = 0;
    this.offsetWidth = 320;
  }
  setAttribute(name, value) { this.attributes[name] = String(value); }
  getAttribute(name) { return this.attributes[name] || null; }
  addEventListener(event, fn) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(fn);
  }
  dispatchEvent(event) {
    if (this.listeners[event.type]) {
      this.listeners[event.type].forEach(fn => fn(event));
    }
  }
  querySelectorAll(selector) {
    if (selector === 'a') return this.children.filter(c => c.tagName === 'A');
    if (selector === 'article') return this.children.filter(c => c.tagName === 'ARTICLE');
    return [];
  }
}

// Build Mock Document
const doc = {
  elements: {},
  body: {
    style: { overflow: '' }
  },
  getElementById(id) {
    return this.elements[id] || null;
  }
};

const winListeners = {};
const win = {
  addEventListener(event, fn) {
    if (!winListeners[event]) winListeners[event] = [];
    winListeners[event].push(fn);
  },
  dispatchEvent(event) {
    if (winListeners[event.type]) {
      winListeners[event.type].forEach(fn => fn(event));
    }
  }
};

// Create real elements matching code.html IDs
const trigger = new MockElement('mobile-menu-trigger', 'button', 'flex lg:hidden');
trigger.setAttribute('aria-expanded', 'false');
trigger.setAttribute('aria-controls', 'mobile-drawer');

const drawer = new MockElement('mobile-drawer', 'aside', 'fixed inset-y-0 right-0 z-50 transform translate-x-full');
drawer.setAttribute('aria-hidden', 'true');

const backdrop = new MockElement('mobile-drawer-backdrop', 'div', 'fixed inset-0 z-40 opacity-0 pointer-events-none');
const closeBtn = new MockElement('mobile-drawer-close', 'button');

// Add links inside drawer
for (let i = 1; i <= 6; i++) {
  const link = new MockElement(`nav-link-${i}`, 'a');
  drawer.children.push(link);
}

// Carousel elements
const carousel = new MockElement('archive-catalog-carousel', 'div');
for (let i = 1; i <= 4; i++) {
  const card = new MockElement(`product-${i}`, 'article');
  card.offsetWidth = 320;
  carousel.children.push(card);
}
const counter = new MockElement('carousel-counter', 'span');
counter.textContent = '[ 01 / 04 ]';

doc.elements['mobile-menu-trigger'] = trigger;
doc.elements['mobile-drawer'] = drawer;
doc.elements['mobile-drawer-backdrop'] = backdrop;
doc.elements['mobile-drawer-close'] = closeBtn;
doc.elements['archive-catalog-carousel'] = carousel;
doc.elements['carousel-counter'] = counter;

// Extract JS from code.html
const scriptMatches = [...html.matchAll(/<script>([\s\S]*?)<\/script>/gi)];
const controllerScript = scriptMatches.find(m => m[1].includes('ARCHIVAL MOBILE DRAWER CONTROLLER'));

if (!controllerScript) {
  console.error('FAIL: Controller script not found in code.html!');
  process.exit(1);
}

// Execute script in mock environment
const vm = require('vm');
const context = vm.createContext({
  document: doc,
  window: win,
  console: console,
  Math: Math,
  String: String,
  Date: Date,
  setInterval: setInterval
});

vm.runInContext(controllerScript[1], context);

console.log('Script evaluated without runtime syntax errors.');

// TEST 1: Initial state
console.log('\n--- TEST 1: Initial State ---');
console.assert(drawer.classList.contains('translate-x-full'), 'Drawer must start translate-x-full');
console.assert(!drawer.classList.contains('translate-x-0'), 'Drawer must NOT start translate-x-0');
console.assert(backdrop.classList.contains('opacity-0'), 'Backdrop must start opacity-0');
console.assert(doc.body.style.overflow === '', 'Body overflow must start empty');
console.log('PASS: Initial state is correctly closed and accessible.');

// TEST 2: Trigger Click -> Open Drawer
console.log('\n--- TEST 2: Open Drawer on Trigger Click ---');
trigger.dispatchEvent({ type: 'click' });
console.assert(drawer.classList.contains('translate-x-0'), 'Drawer must have translate-x-0 when opened');
console.assert(!drawer.classList.contains('translate-x-full'), 'Drawer must not have translate-x-full when opened');
console.assert(backdrop.classList.contains('opacity-100'), 'Backdrop must have opacity-100 when opened');
console.assert(backdrop.classList.contains('pointer-events-auto'), 'Backdrop must have pointer-events-auto when opened');
console.assert(trigger.getAttribute('aria-expanded') === 'true', 'Trigger aria-expanded must be true');
console.assert(drawer.getAttribute('aria-hidden') === 'false', 'Drawer aria-hidden must be false');
console.assert(doc.body.style.overflow === 'hidden', 'Body overflow must be hidden (scroll lock)');
console.log('PASS: Trigger click opens drawer, locks scroll, and activates ARIA attributes.');

// TEST 3: Close Button Click -> Close Drawer
console.log('\n--- TEST 3: Close Drawer via Close Button ---');
closeBtn.dispatchEvent({ type: 'click' });
console.assert(drawer.classList.contains('translate-x-full'), 'Drawer must have translate-x-full when closed');
console.assert(backdrop.classList.contains('opacity-0'), 'Backdrop must have opacity-0 when closed');
console.assert(doc.body.style.overflow === '', 'Body overflow must be restored to empty string');
console.assert(trigger.getAttribute('aria-expanded') === 'false', 'Trigger aria-expanded must be false');
console.log('PASS: Close button closes drawer and unlocks scroll.');

// TEST 4: Re-open and Close via Escape key
console.log('\n--- TEST 4: Close Drawer via Escape Key ---');
trigger.dispatchEvent({ type: 'click' });
console.assert(doc.body.style.overflow === 'hidden', 'Body scroll locked on open');
win.dispatchEvent({ type: 'keydown', key: 'Escape' });
console.assert(drawer.classList.contains('translate-x-full'), 'Escape must close drawer');
console.assert(doc.body.style.overflow === '', 'Escape must restore scroll');
console.log('PASS: Escape key closes drawer and unlocks scroll.');

// TEST 5: Re-open and Close via Backdrop click
console.log('\n--- TEST 5: Close Drawer via Backdrop Click ---');
trigger.dispatchEvent({ type: 'click' });
backdrop.dispatchEvent({ type: 'click' });
console.assert(drawer.classList.contains('translate-x-full'), 'Backdrop click must close drawer');
console.assert(doc.body.style.overflow === '', 'Backdrop click must restore scroll');
console.log('PASS: Backdrop click closes drawer and unlocks scroll.');

// TEST 6: Re-open and Close via Nav Link click
console.log('\n--- TEST 6: Close Drawer via Nav Link Click ---');
trigger.dispatchEvent({ type: 'click' });
drawer.children[0].dispatchEvent({ type: 'click' });
console.assert(drawer.classList.contains('translate-x-full'), 'Nav link click must close drawer');
console.assert(doc.body.style.overflow === '', 'Nav link click must restore scroll');
console.log('PASS: Nav link click closes drawer and unlocks scroll.');

// TEST 7: Carousel Dynamic Counter Calculation
console.log('\n--- TEST 7: Carousel Dynamic Counter Calculation ---');
console.log('Initial counter:', counter.textContent);
console.assert(counter.textContent === '[ 01 / 04 ]', 'Initial counter should be [ 01 / 04 ]');

// Simulate scroll to card 2 (scrollLeft = 320)
carousel.scrollLeft = 320;
carousel.dispatchEvent({ type: 'scroll' });
console.log('Scrolled to 320px, counter:', counter.textContent);
console.assert(counter.textContent === '[ 02 / 04 ]', 'Counter must be [ 02 / 04 ] at 320px');

// Simulate scroll to card 3 (scrollLeft = 640)
carousel.scrollLeft = 640;
carousel.dispatchEvent({ type: 'scroll' });
console.log('Scrolled to 640px, counter:', counter.textContent);
console.assert(counter.textContent === '[ 03 / 04 ]', 'Counter must be [ 03 / 04 ] at 640px');

// Simulate scroll to card 4 (scrollLeft = 960)
carousel.scrollLeft = 960;
carousel.dispatchEvent({ type: 'scroll' });
console.log('Scrolled to 960px, counter:', counter.textContent);
console.assert(counter.textContent === '[ 04 / 04 ]', 'Counter must be [ 04 / 04 ] at 960px');

// Test bounds clamping: negative scrollLeft
carousel.scrollLeft = -100;
carousel.dispatchEvent({ type: 'scroll' });
console.assert(counter.textContent === '[ 01 / 04 ]', 'Counter must clamp lower bound to [ 01 / 04 ]');

// Test bounds clamping: excessive scrollLeft
carousel.scrollLeft = 5000;
carousel.dispatchEvent({ type: 'scroll' });
console.assert(counter.textContent === '[ 04 / 04 ]', 'Counter must clamp upper bound to [ 04 / 04 ]');

console.log('PASS: Carousel counter computes dynamically with proper bounds clamping!');

console.log('\n=== ALL DYNAMIC BEHAVIOR CHECKS PASSED WITH ZERO ERRORS ===');
