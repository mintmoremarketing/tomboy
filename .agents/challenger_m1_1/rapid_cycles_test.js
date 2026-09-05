
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
    const scriptMatches = html.match(/<script\b[^>]*>([\s\S]*?)<\/script>/gi);
    const lastScript = scriptMatches[scriptMatches.length - 1].replace(/<\/?script\b[^>]*>/gi, '');
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
    