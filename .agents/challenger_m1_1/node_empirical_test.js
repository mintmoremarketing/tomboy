/**
 * Empirical Node.js Test Harness for Storefront 1 In-Page Scripts
 * Tests Mobile Navigation Drawer State Machine & Carousel Counter Dynamic Logic
 */

const fs = require('fs');
const path = require('path');

class ClassList {
    constructor() { this.classes = new Set(); }
    add(...cls) { cls.forEach(c => this.classes.add(c)); }
    remove(...cls) { cls.forEach(c => this.classes.delete(c)); }
    contains(c) { return this.classes.has(c); }
    toString() { return Array.from(this.classes).join(' '); }
}

class MockElement {
    constructor(id, tag, classes = []) {
        this.id = id;
        this.tagName = tag.toUpperCase();
        this.classList = new ClassList();
        classes.forEach(c => this.classList.add(c));
        this.attributes = {};
        this.listeners = {};
        this.style = {};
        this.children = [];
        this.textContent = '';
        this.scrollLeft = 0;
        this.offsetWidth = 320;
    }
    setAttribute(k, v) { this.attributes[k] = String(v); }
    getAttribute(k) { return this.attributes[k] !== undefined ? this.attributes[k] : null; }
    addEventListener(event, fn) {
        if (!this.listeners[event]) this.listeners[event] = [];
        this.listeners[event].push(fn);
    }
    dispatchEvent(eventObj) {
        const fns = this.listeners[eventObj.type] || [];
        fns.forEach(fn => fn(eventObj));
    }
    click() { this.dispatchEvent({ type: 'click' }); }
    focus() { this.focused = true; }
    querySelectorAll(selector) {
        if (selector === 'a') return this.children.filter(c => c.tagName === 'A');
        return [];
    }
}

class MockDocument {
    constructor() {
        this.elements = new Map();
        this.body = new MockElement('body', 'body');
        this.listeners = {};
    }
    register(el) { this.elements.set(el.id, el); return el; }
    getElementById(id) { return this.elements.get(id) || null; }
    addEventListener(event, fn) {
        if (!this.listeners[event]) this.listeners[event] = [];
        this.listeners[event].push(fn);
    }
    dispatchEvent(eventObj) {
        const fns = this.listeners[eventObj.type] || [];
        fns.forEach(fn => fn(eventObj));
    }
}

const doc = new MockDocument();
global.document = doc;
global.window = {};

// Register elements as structured in Storefront 1 code.html
const trigger = doc.register(new MockElement('mobile-menu-trigger', 'button', ['flex', 'xl:hidden']));
trigger.setAttribute('aria-expanded', 'false');

const s1Trigger = doc.register(new MockElement('s1-drawer-trigger', 'button', ['hidden']));

const drawer = doc.register(new MockElement('s1-drawer', 'div', ['fixed', 'inset-0', 'pointer-events-none', 'opacity-0']));
drawer.setAttribute('aria-hidden', 'true');

const panel = doc.register(new MockElement('mobile-drawer', 'aside', ['fixed', 'translate-x-full']));
panel.setAttribute('aria-hidden', 'true');

const backdrop = doc.register(new MockElement('mobile-drawer-backdrop', 'div', ['fixed', 'opacity-0', 'pointer-events-none']));

const closeBtn = doc.register(new MockElement('mobile-drawer-close', 'button', []));
const s1CloseBtn = doc.register(new MockElement('s1-drawer-close', 'button', ['hidden']));

// Mock nav links inside panel
const link1 = new MockElement('link1', 'a');
const link2 = new MockElement('link2', 'a');
panel.children.push(link1, link2);

// Mock Carousel and Counters
const carousel = doc.register(new MockElement('s1-arrivals-carousel', 'div', ['flex', 'overflow-x-auto', 'snap-x']));
const counter = doc.register(new MockElement('carousel-counter', 'span', []));
counter.textContent = '[ 01 / 04 ]';
const s1Counter = doc.register(new MockElement('s1-arrivals-counter', 'span', []));
s1Counter.textContent = '[ 01 / 04 ]';

for (let i = 0; i < 4; i++) {
    const card = new MockElement('card' + i, 'article', ['snap-start', 'shrink-0']);
    card.offsetWidth = 260;
    carousel.children.push(card);
}

// Load and execute script from code.html
const htmlPath = path.resolve(__dirname, '../../tomboy_clothing_home_latest_drop/code.html');
const html = fs.readFileSync(htmlPath, 'utf8');
const scriptMatches = html.match(/<script\b[^>]*>([\s\S]*?)<\/script>/gi);
const lastScriptTag = scriptMatches[scriptMatches.length - 1];
const scriptContent = lastScriptTag.replace(/<\/?script\b[^>]*>/gi, '');

// Execute the extracted script
eval(scriptContent);

// Test Results Collector
const results = [];
function record(cond, name, msg) {
    results.push({ test: name, pass: Boolean(cond), msg: msg || '' });
}

// Suite 1: Initial Invariants
record(panel.classList.contains('translate-x-full'), 'initial_panel_offcanvas', 'Panel is translate-x-full initially');
record(drawer.classList.contains('pointer-events-none') && drawer.classList.contains('opacity-0'), 'initial_drawer_hidden', 'Drawer container pointer-events-none & opacity-0');
record(backdrop.classList.contains('pointer-events-none') && backdrop.classList.contains('opacity-0'), 'initial_backdrop_hidden', 'Backdrop pointer-events-none & opacity-0');
record(trigger.getAttribute('aria-expanded') === 'false', 'initial_aria_expanded', 'Trigger aria-expanded is false');
record(doc.body.style.overflow === undefined || doc.body.style.overflow === '', 'initial_body_scroll', 'Body scroll is not locked');

// Suite 2: Open via Trigger
trigger.click();
record(panel.classList.contains('translate-x-0'), 'open_panel_translated', 'Panel slides in (translate-x-0)');
record(!panel.classList.contains('translate-x-full'), 'open_panel_no_offcanvas', 'Panel removes translate-x-full');
record(drawer.classList.contains('pointer-events-auto') && drawer.classList.contains('opacity-100'), 'open_drawer_visible', 'Drawer container becomes interactive & visible');
record(backdrop.classList.contains('pointer-events-auto') && backdrop.classList.contains('opacity-100'), 'open_backdrop_visible', 'Backdrop becomes interactive & visible');
record(trigger.getAttribute('aria-expanded') === 'true', 'open_aria_expanded', 'Trigger aria-expanded set to true');
record(drawer.getAttribute('aria-hidden') === 'false', 'open_drawer_aria_hidden', 'Drawer aria-hidden set to false');
record(panel.getAttribute('aria-hidden') === 'false', 'open_panel_aria_hidden', 'Panel aria-hidden set to false');
record(doc.body.style.overflow === 'hidden', 'open_body_scroll_locked', 'Body scroll locked (overflow: hidden)');

// Suite 3: Close via Close Button
closeBtn.click();
record(panel.classList.contains('translate-x-full'), 'close_btn_panel_offcanvas', 'Panel slides out (translate-x-full)');
record(backdrop.classList.contains('pointer-events-none') && backdrop.classList.contains('opacity-0'), 'close_btn_backdrop_hidden', 'Backdrop hidden');
record(drawer.classList.contains('pointer-events-none') && drawer.classList.contains('opacity-0'), 'close_btn_drawer_hidden', 'Drawer container hidden');
record(trigger.getAttribute('aria-expanded') === 'false', 'close_btn_aria_expanded', 'Trigger aria-expanded restored to false');
record(doc.body.style.overflow === '', 'close_btn_body_scroll_restored', 'Body scroll restored to empty string');

// Suite 4: Open & Close via Backdrop Click
trigger.click();
record(doc.body.style.overflow === 'hidden', 'reopen1_overflow_hidden', 'Body scroll locked on 2nd open');
backdrop.click();
record(panel.classList.contains('translate-x-full'), 'backdrop_close_panel_offcanvas', 'Panel slides out on backdrop click');
record(doc.body.style.overflow === '', 'backdrop_close_body_scroll_restored', 'Body scroll restored on backdrop click');

// Suite 5: Open & Close via Nav Link Click
trigger.click();
link1.click();
record(panel.classList.contains('translate-x-full'), 'link_close_panel_offcanvas', 'Panel slides out on nav link click');
record(doc.body.style.overflow === '', 'link_close_body_scroll_restored', 'Body scroll restored on nav link click');

// Suite 6: Open & Close via Escape Key
trigger.click();
doc.dispatchEvent({ type: 'keydown', key: 'Escape' });
record(panel.classList.contains('translate-x-full'), 'escape_close_panel_offcanvas', 'Panel slides out on Escape key');
record(doc.body.style.overflow === '', 'escape_close_body_scroll_restored', 'Body scroll restored on Escape key');

// Suite 7: Escape key while closed is safe no-op
doc.dispatchEvent({ type: 'keydown', key: 'Escape' });
record(panel.classList.contains('translate-x-full'), 'escape_closed_safe', 'Panel remains offcanvas when Escape pressed while closed');
record(doc.body.style.overflow === '', 'escape_closed_overflow_safe', 'Body scroll unaffected by stray Escape key');

// Suite 8: Alternate Trigger (s1-drawer-trigger)
s1Trigger.click();
record(panel.classList.contains('translate-x-0'), 's1_trigger_open', 's1-drawer-trigger opens drawer');
s1CloseBtn.click();
record(panel.classList.contains('translate-x-full'), 's1_close_btn', 's1-drawer-close closes drawer');

// Suite 9: Carousel Dynamic Scroll Counter Updates
carousel.scrollLeft = 0;
carousel.dispatchEvent({ type: 'scroll' });

setTimeout(() => {
    // Scroll to card 2 (index 1)
    carousel.scrollLeft = 260;
    carousel.dispatchEvent({ type: 'scroll' });

    setTimeout(() => {
        record(counter.textContent === '[ 02 / 04 ]', 'carousel_scroll_to_card_2', 'Counter dynamically updates to [ 02 / 04 ] on scroll to 2nd card (actual: ' + counter.textContent + ')');
        record(s1Counter.textContent === '[ 02 / 04 ]', 's1_counter_sync', 's1-arrivals-counter synchronized to [ 02 / 04 ]');

        // Scroll to card 4 (index 3)
        carousel.scrollLeft = 780;
        carousel.dispatchEvent({ type: 'scroll' });

        setTimeout(() => {
            record(counter.textContent === '[ 04 / 04 ]', 'carousel_scroll_to_card_4', 'Counter dynamically updates to [ 04 / 04 ] on scroll to 4th card (actual: ' + counter.textContent + ')');

            // Scroll with boundary rubber-banding (negative)
            carousel.scrollLeft = -40;
            carousel.dispatchEvent({ type: 'scroll' });

            setTimeout(() => {
                // Negative index is guarded by (activeIndex >= 0), so it stays at previous or clamped
                record(!counter.textContent.includes('-'), 'carousel_negative_scroll_guarded', 'Negative scroll does not produce invalid counter string');

                console.log(JSON.stringify(results));
            }, 70);
        }, 70);
    }, 70);
}, 70);
