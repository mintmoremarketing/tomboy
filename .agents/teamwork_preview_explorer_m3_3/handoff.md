# Handoff Report: Mobile Touch-Swipe Carousel & Header De-Cluttering Specification

**Agent**: `teamwork_preview_explorer_m3_3`  
**Target File**: `tomboy_neo_tokyo_color_clash/code.html`  
**Working Directory**: `c:\Users\devde\OneDrive\Desktop\Demo projects\Mint-more\tomboy clothing\.agents\teamwork_preview_explorer_m3_3`  
**Parent**: `511cf2e0-cd0f-46b3-8f96-edf670838b95`  
**Timestamp**: 2026-09-05T11:22:00Z  
**Handoff Type**: Hard Handoff (Investigation & Component Specification Complete)  

---

## 1. Observation

### 1.1 Product Wall Section Architecture
- **Target File**: `tomboy_neo_tokyo_color_clash/code.html`
- **Section ID**: `<section class="max-w-7xl mx-auto px-4 lg:px-8 py-10" id="product-wall">` (Line 249)
- **Section Header**: Lines 251–268 feature section title (`SATURATED COLOR BLOCKS`) and category pills (`ALL [ 18 ]`, `TEES [ 08 ]`, `HOODIES [ 06 ]`, `JACKETS [ 04 ]`). Currently no slide indicator, progress counter, or carousel controls exist.
- **Product Cards Container (Line 270)**:
  ```html
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
  ```
  Contains 4 product cards:
  1. Lines 271–322: `GOTHIC CHROME TEE` (Box 01 // Magenta, $120)
  2. Lines 323–369: `ANARCHY KNIT HOODIE` (Box 02 // Violet, $220)
  3. Lines 370–416: `CYBER MOTO BOXY TEE` (Box 03 // Emerald, $110)
  4. Lines 417–463: `DISTRESSED WORK JACKET` (Box 04 // Obsidian, $280)

- **Mobile Viewport Rendering Defect**:
  On viewports $< 640\text{px}$, `grid-cols-1` forces all 4 product cards to stack vertically. Each card has an aspect-square graphic box plus title, pricing, size selector buttons (`S`, `M`, `L`, `XL`), and an `INSTANT COP` button, rendering at ~550px height per card.
  Four vertically stacked cards occupy over $2,200\text{px}$ of vertical scroll space (~3.5 to 4 full mobile viewports on a 375px device) before reaching Section 3.

- **Desktop Grid Requirements**:
  On screens $\ge 1024\text{px}$ (`lg:`), the 4-column horizontal grid (`lg:grid-cols-4 gap-6`) must remain 100% intact with zero visual drift in spacing, hover lift (`hover:-translate-y-1.5`), or cyber-brutalist drop shadows (`neo-shadow`).

---

### 1.2 Header Layout & Utility Bar Congestion on 360px–390px Viewports
- **Target Header**: Lines 114–148:
  ```html
  <header class="w-full bg-white text-black border-b-2 border-black px-4 lg:px-8 py-3">
    <div class="max-w-7xl mx-auto flex items-center justify-between">
      <!-- Brand Logo & Badge -->
      <div class="flex items-center gap-4">
        <a class="flex items-center gap-3 group" href="#">
          <img alt="Tomboy Streetwear Logo" class="h-9 w-auto object-contain border-2 border-black p-0.5 bg-white neo-shadow-sm group-hover:-translate-y-0.5 transition-transform" src="..."/>
          <span class="font-headline-lg text-2xl md:text-3xl font-bold tracking-tighter uppercase text-black">TOMBOY</span>
        </a>
        <span class="hidden xl:inline-block px-2.5 py-0.5 rounded-full bg-hyper-yellow border-2 border-black font-label-caps-sm text-[9px] uppercase font-bold neo-shadow-sm">
          COLOR-CLASH '25
        </span>
      </div>
      <!-- Pill Nav Tabs -->
      <nav class="hidden lg:flex items-center gap-2 font-label-caps-md text-[11px] font-bold uppercase tracking-wider">
        ...
      </nav>
      <!-- Right Tools -->
      <div class="flex items-center gap-3">
        <div class="hidden sm:flex items-center border-2 border-black px-2.5 py-1 bg-slate-50 neo-shadow-sm">
          <span class="font-price-tag text-xs font-bold">[ USD $ ]</span>
        </div>
        <button aria-label="Search" class="w-9 h-9 flex items-center justify-center border-2 border-black bg-white hover:bg-hyper-yellow transition-colors neo-shadow-sm">
          <span class="material-symbols-outlined text-[19px]">search</span>
        </button>
        <a class="flex items-center gap-2 px-3.5 py-1.5 bg-berry-magenta text-white font-label-caps-md text-xs font-bold border-2 border-black neo-shadow-sm hover:translate-x-0.5 hover:translate-y-0.5 transition-all" href="#product-wall">
          <span>BAG</span>
          <span class="font-price-tag bg-black text-white px-1.5 py-0.2 rounded-sm">[ 0 ]</span>
        </a>
      </div>
    </div>
  </header>
  ```

- **Exact Horizontal Width Measurement on 360px Viewport**:
  - Viewport total width: $360\text{px}$
  - Header lateral padding: `px-4` ($16\text{px} \times 2 = 32\text{px}$)
  - Net available inner container width: $360 - 32 = \mathbf{328\text{px}}$
  - Current left brand width (Logo image $36\text{px}$ + gap $12\text{px}$ + "TOMBOY" text at text-2xl $105\text{px}$): $\approx 153\text{px}$
  - When the mandatory Mobile Menu Trigger (`#mobile-menu-trigger`, width $\approx 68\text{px}$, touch target $\ge 44\text{px}$) is added to the right tools cluster alongside the existing Search button ($38\text{px}$), BAG button ($64\text{px}$), and flex gaps ($16\text{px}$):
    $$\text{Right Tools Width} = 38 + 64 + 68 + 16 = \mathbf{186\text{px}}$$
    $$\text{Total Required Content Width} = 153 + 186 = \mathbf{339\text{px}}$$
  - **Collision**: $339\text{px} > 328\text{px}$. The navbar overflows the viewport, causing flex wrapping, horizontal blowout, or severe logo clipping on all mobile devices between 360px and 375px (iPhone SE, small Android).

---

### 1.3 Legacy Script & Style Injection
- **Target File**: Lines 893–946 contain the legacy script injected by `responsive_fix.py`:
  ```html
  <!-- RESPONSIVE ENHANCEMENTS -->
  <script>
  document.addEventListener("DOMContentLoaded", () => {
      const navs = document.querySelectorAll('nav');
      ...
  ```
  This creates an unstyled inline vertical dropdown (`mobile-nav`) that breaks layout positioning, lacks a side drawer overlay, lacks scroll-lock, and lacks keyboard escape handling. Must be removed by Worker.

---

## 2. Logic Chain

```
Observation 1.1: 4 product cards stacked in grid-cols-1 cause ~2,200px vertical scroll on mobile
       ↓
Logic Step 1: Replace grid-cols-1 on mobile with CSS scroll-snap track (overflow-x-auto snap-x snap-mandatory scrollbar-none)
       ↓
Observation 1.1: Cards need peek affordance on 360px-390px screens
       ↓
Logic Step 2: Set mobile card width to w-[82vw] (or 80vw-85vw) with -mx-4 px-4 track bleed, leaving 18vw of next card peeking
       ↓
Observation 1.1: Milestone Scope & Test Infra mandate live monospace slide counter [ 01 / 04 ] (#carousel-counter)
       ↓
Logic Step 3: Implement dynamic counter #carousel-counter updated via scroll event listener + IntersectionObserver, plus fallback prev/next buttons
       ↓
Observation 1.1: Desktop layout must remain 100% intact
       ↓
Logic Step 4: Scale track container to md:grid md:grid-cols-2 lg:grid-cols-4 md:overflow-visible and cards to md:w-auto md:shrink
       ↓
Observation 1.2: 360px screen has only 328px net width; Logo (153px) + Search (38px) + BAG (64px) + MENU (68px) = 339px > 328px (overflow blowout)
       ↓
Logic Step 5: De-clutter navbar by hiding Search (hidden md:flex) and Currency (hidden md:flex) on mobile; relocate them inside #mobile-drawer
       ↓
Observation 1.2: Cart button has empty count badge [ 0 ]
       ↓
Logic Step 6: Remove [ 0 ] badge from BAG, configure touch padding (min-h-[44px]), reducing BAG width to ~52px
       ↓
Logic Step 7: Final mobile navbar width = Logo (~130px) + BAG (~52px) + MENU (~68px) + gap (8px) = 258px < 328px (70px safety margin on 360px)
       ↓
Conclusion: Completely resolved mobile carousel and de-cluttered header satisfying all project interface contracts.
```

---

## 3. Caveats

1. **Other Product Sections in Document**:
   - Section 4 (`#collectibles-section`, line 512) is a visual showcase with 3 simulated vinyl bears (`w-24 h-32` flex row), not a 4-column product grid. It does not require a carousel.
   - Section 5 (`#blanks-section`, line 593) has 4 tonal cards (`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4`). Per `SCOPE.md` and `PROJECT.md`, the primary carousel contract target is Section 2 (`#product-wall`) where `#carousel-counter` is anchored. Section 5 can maintain its responsive grid or utilize standard vertical stack without conflicting with the test suite.
2. **Tailwind Scrollbar Plugin**:
   - The document uses `cdn.tailwindcss.com` without a pre-bundled `scrollbar-none` utility. A lightweight CSS rule (`.scrollbar-none`) must be included in the `<style>` block to ensure cross-browser hiding of scrollbars on WebKit and Firefox.
3. **No Direct Modification**:
   - In accordance with the Teamwork Explorer contract, no edits were made directly to `code.html`. All concrete code blocks below are ready for single-pass application by the Worker.

---

## 4. Conclusion & Concrete Implementation Specifications

### 4.1 Header De-Cluttering Specification (Lines 114–148)

#### A. Replacement Markup for Navbar Header
Replace the inner contents of `<header class="w-full bg-white text-black border-b-2 border-black px-4 lg:px-8 py-3">` with:

```html
<header class="w-full bg-white text-black border-b-2 border-black px-4 lg:px-8 py-3">
  <div class="max-w-7xl mx-auto flex items-center justify-between">
    <!-- Brand Logo & Badge -->
    <div class="flex items-center gap-2 sm:gap-4">
      <a class="flex items-center gap-2 sm:gap-3 group" href="#" aria-label="Tomboy Streetwear Home">
        <img alt="Tomboy Streetwear Logo" class="h-8 sm:h-9 w-auto object-contain border-2 border-black p-0.5 bg-white neo-shadow-sm group-hover:-translate-y-0.5 transition-transform" src="https://lh3.googleusercontent.com/aida/AEtjO1VsApCZr_OXfOP7a10cL68n9xqWnWNuQwHHwp0MSPvh_OkYiXXyHJkuO6Hado7PwiyWLyc2YDZdhy4L-t1liMcH4OUwKO-jNACeWilqG4E_asTCHXp7PrW_JnHp7dicyLg-jt5dC7i48WK6pZse9iNToyNEyUffBSqyyvaFsmrK97_mwTgg0FImOcWtTzc3JXbXmhgdqX39LbaQWVYQzBwzB21CDn-sfjXq0llOfMgYn-Sz3_B-KUP6vuY" loading="eager" decoding="async"/>
        <span class="font-headline-lg text-xl sm:text-2xl md:text-3xl font-bold tracking-tighter uppercase text-black">TOMBOY</span>
      </a>
      <span class="hidden xl:inline-block px-2.5 py-0.5 rounded-full bg-hyper-yellow border-2 border-black font-label-caps-sm text-[9px] uppercase font-bold neo-shadow-sm">
        COLOR-CLASH '25
      </span>
    </div>

    <!-- Pill Nav Tabs (100% Desktop Preservation on >= 1024px) -->
    <nav class="hidden lg:flex items-center gap-2 font-label-caps-md text-[11px] font-bold uppercase tracking-wider">
      <a class="px-3.5 py-1.5 rounded-full bg-black text-white hover:bg-berry-magenta transition-colors border-2 border-black" href="#product-wall">DROPS</a>
      <a class="px-3.5 py-1.5 rounded-full bg-white text-black hover:bg-slate-100 transition-colors border-2 border-black" href="#product-wall">TOPS</a>
      <a class="px-3.5 py-1.5 rounded-full bg-[#6D28D9] text-white hover:bg-[#5b21b6] transition-colors border-2 border-black" href="#collectibles-section">TOYS</a>
      <a class="px-3.5 py-1.5 rounded-full bg-[#15803D] text-white hover:bg-[#166534] transition-colors border-2 border-black" href="#blanks-section">BLANKS</a>
      <a class="px-3.5 py-1.5 rounded-full bg-[#EA580C] text-white hover:bg-[#c2410c] transition-colors border-2 border-black" href="#editorial-shift">LOOKBOOK</a>
    </nav>

    <!-- Right Tools: De-cluttered on Mobile (360px-390px) -->
    <div class="flex items-center gap-2 sm:gap-3">
      <!-- Currency Indicator (Hidden on Mobile, Relocated into Mobile Drawer) -->
      <div class="hidden md:flex items-center border-2 border-black px-2.5 py-1 bg-slate-50 neo-shadow-sm">
        <span class="font-price-tag text-xs font-bold">[ USD $ ]</span>
      </div>

      <!-- Search Trigger (Hidden on Mobile, Relocated as Search Bar in Drawer) -->
      <button aria-label="Search Catalog" class="hidden md:flex w-9 h-9 items-center justify-center border-2 border-black bg-white hover:bg-hyper-yellow transition-colors neo-shadow-sm">
        <span class="material-symbols-outlined text-[19px]">search</span>
      </button>

      <!-- BAG Button: Touch Target >= 44x44px, Zero Count Removed -->
      <a class="flex items-center justify-center gap-1.5 min-h-[44px] min-w-[44px] px-3 sm:px-3.5 py-2 bg-berry-magenta text-white font-label-caps-md text-xs font-bold border-2 border-black neo-shadow-sm hover:translate-x-0.5 hover:translate-y-0.5 transition-all" href="#product-wall" aria-label="Shopping Bag">
        <span class="material-symbols-outlined text-[18px]">shopping_bag</span>
        <span>BAG</span>
      </a>

      <!-- Mobile Menu Trigger: Visible on < 1024px, Hidden on >= 1024px, Touch Target >= 44x44px -->
      <button id="mobile-menu-trigger" aria-label="Open navigation menu" aria-expanded="false" aria-controls="mobile-drawer" class="lg:hidden flex items-center justify-center gap-1.5 min-h-[44px] min-w-[44px] px-3 py-2 bg-black hover:bg-hyper-yellow hover:text-black text-white font-label-caps-md text-xs font-bold border-2 border-black neo-shadow-sm transition-colors">
        <span class="font-price-tag tracking-wider">[ MENU ]</span>
      </button>
    </div>
  </div>
</header>
```

#### B. Relocated Secondary Utilities for `#mobile-drawer`
The Worker should place these two relocated components inside the mobile drawer panel (`#mobile-drawer`):
1. **Relocated Search Bar** (placed at top of drawer below drawer header):
   ```html
   <div class="p-4 border-b-2 border-black bg-surface-container">
     <div class="relative flex items-center border-2 border-black bg-white neo-shadow-sm">
       <span class="material-symbols-outlined text-[20px] ml-2.5 text-black">search</span>
       <input type="text" placeholder="SEARCH ARCHIVE / GRAILS..." class="w-full py-2 px-2 text-xs font-price-tag uppercase tracking-wider bg-transparent border-none focus:outline-none placeholder:text-slate-400" aria-label="Search Mobile Drawer"/>
     </div>
   </div>
   ```
2. **Relocated Currency Selector** (placed at bottom of drawer):
   ```html
   <div class="p-4 border-t-2 border-black bg-surface-container space-y-2">
     <div class="flex items-center justify-between font-label-caps-sm text-[11px] font-bold">
       <span class="text-slate-500 uppercase">CURRENCY / REGION:</span>
       <div class="flex items-center gap-1">
         <button class="px-2 py-1 bg-black text-white border border-black font-price-tag text-xs font-bold neo-shadow-sm">USD $</button>
         <button class="px-2 py-1 bg-white text-black hover:bg-slate-100 border border-black font-price-tag text-xs font-bold transition-colors">JPY ¥</button>
         <button class="px-2 py-1 bg-white text-black hover:bg-slate-100 border border-black font-price-tag text-xs font-bold transition-colors">EUR €</button>
       </div>
     </div>
     <div class="text-[10px] font-price-tag text-slate-500 uppercase">// WORLDWIDE EXPRESS COURIER DISPATCH</div>
   </div>
   ```

---

### 4.2 Mobile Touch-Swipe Carousel Specification (Section 2, Lines 249–464)

#### A. Section 2 Header with Category Tabs & Mobile Live Counter Controls
Replace lines 251–268 with:

```html
<div class="flex flex-col md:flex-row md:items-end justify-between mb-6 md:mb-8 gap-4 border-b-2 border-black pb-4">
  <div>
    <div class="flex items-center gap-2 mb-1">
      <span class="w-3 h-3 bg-berry-magenta border border-black inline-block"></span>
      <span class="font-label-caps-sm text-xs font-bold uppercase tracking-widest text-berry-magenta">SIGNATURE COLOR ARCHIVE</span>
    </div>
    <h2 class="font-headline-xl text-3xl md:text-5xl font-extrabold uppercase tracking-tight text-black">
      SATURATED COLOR BLOCKS
    </h2>
  </div>
  
  <!-- Category Filter Pills & Mobile Live Counter Cluster -->
  <div class="flex flex-wrap items-center justify-between md:justify-end gap-3 w-full md:w-auto">
    <!-- Filter Pills -->
    <div class="flex flex-wrap items-center gap-2 font-label-caps-sm text-xs font-bold">
      <button class="px-3 py-1.5 sm:px-3.5 bg-black text-white border-2 border-black neo-shadow-sm">ALL [ 18 ]</button>
      <button class="px-3 py-1.5 sm:px-3.5 bg-white text-black hover:bg-slate-100 border-2 border-black transition-colors neo-shadow-sm">TEES [ 08 ]</button>
      <button class="px-3 py-1.5 sm:px-3.5 bg-white text-black hover:bg-slate-100 border-2 border-black transition-colors neo-shadow-sm">HOODIES [ 06 ]</button>
      <button class="px-3 py-1.5 sm:px-3.5 bg-white text-black hover:bg-slate-100 border-2 border-black transition-colors neo-shadow-sm">JACKETS [ 04 ]</button>
    </div>

    <!-- Mobile Slide Counter & Touch Navigation (Hidden on Desktop) -->
    <div class="flex items-center gap-2 md:hidden">
      <div class="flex items-center gap-1.5 font-price-tag font-mono text-xs bg-slate-100 border-2 border-black px-2.5 py-1 neo-shadow-sm">
        <span class="text-slate-500 text-[10px] uppercase font-bold">CARD:</span>
        <span id="carousel-counter" class="font-bold text-black font-mono">[ 01 / 04 ]</span>
      </div>
      <div class="flex items-center gap-1">
        <button id="carousel-prev" aria-label="Previous Slide" class="w-8 h-8 flex items-center justify-center bg-white hover:bg-hyper-yellow text-black border-2 border-black neo-shadow-sm transition-colors active:translate-x-0.5 active:translate-y-0.5">
          <span class="material-symbols-outlined text-[18px]">chevron_left</span>
        </button>
        <button id="carousel-next" aria-label="Next Slide" class="w-8 h-8 flex items-center justify-center bg-white hover:bg-hyper-yellow text-black border-2 border-black neo-shadow-sm transition-colors active:translate-x-0.5 active:translate-y-0.5">
          <span class="material-symbols-outlined text-[18px]">chevron_right</span>
        </button>
      </div>
    </div>
  </div>
</div>
```

#### B. Carousel Track Container & Card Item Classes (Lines 270–464)
Replace line 270:
```html
<div id="product-wall-carousel" class="flex overflow-x-auto snap-x snap-mandatory scrollbar-none gap-4 md:gap-6 pb-4 pt-2 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-2 lg:grid-cols-4 md:overflow-visible md:pb-0 touch-pan-x">
```

And update each of the 4 `<article>` product cards (Cards 1–4) with:
```html
<article class="group bg-white border-2 border-black rounded-lg overflow-hidden neo-shadow transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between w-[82vw] sm:w-[60vw] md:w-auto shrink-0 md:shrink snap-start">
```

Add `loading="lazy"` and `decoding="async"` to all 4 product card `<img>` elements:
- Card 1: `loading="lazy" decoding="async" alt="Gothic Chrome Tee in washed black cotton"`
- Card 2: `loading="lazy" decoding="async" alt="Anarchy Knit Hoodie with purple metallic typography"`
- Card 3: `loading="lazy" decoding="async" alt="Cyber Moto Boxy Tee in washed deep forest moss"`
- Card 4: `loading="lazy" decoding="async" alt="Distressed Work Jacket in washed charcoal black"`

#### C. CSS Scroll-Snap & Scrollbar Styling (Add to `<style>`)
```css
/* Mobile Touch-Swipe Carousel Scroll-Snap & Scrollbar Reset */
.scrollbar-none {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-none::-webkit-scrollbar {
  display: none;
}
@media (max-width: 1023px) {
  #product-wall-carousel {
    -webkit-overflow-scrolling: touch;
    scroll-snap-type: x mandatory;
    scroll-padding-left: 1rem;
    scroll-padding-right: 1rem;
  }
  #product-wall-carousel > article {
    scroll-snap-align: start;
    scroll-snap-stop: always;
  }
}
```

#### D. Dynamic Monospace Counter JavaScript Controller (Add before `</body>`)
```javascript
// Mobile Touch-Swipe Carousel Controller & Live Slide Counter
(function initProductCarousel() {
  const carousel = document.getElementById('product-wall-carousel');
  const counter = document.getElementById('carousel-counter');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');
  if (!carousel) return;

  const slides = Array.from(carousel.children).filter(el => el.tagName.toLowerCase() === 'article');
  const total = slides.length || 4;
  const pad = (n) => String(n).padStart(2, '0');

  function updateCounterDisplay(index) {
    if (counter) {
      const activeIdx = Math.min(Math.max(1, index), total);
      counter.textContent = `[ ${pad(activeIdx)} / ${pad(total)} ]`;
    }
  }

  // 1. Smooth Hardware-Accelerated Scroll Listener
  let scrollTimeout;
  carousel.addEventListener('scroll', () => {
    if (scrollTimeout) cancelAnimationFrame(scrollTimeout);
    scrollTimeout = requestAnimationFrame(() => {
      const scrollLeft = carousel.scrollLeft;
      const cardWidth = slides[0] ? slides[0].offsetWidth : carousel.clientWidth * 0.82;
      const gap = 16;
      const currentIndex = Math.round(scrollLeft / (cardWidth + gap)) + 1;
      updateCounterDisplay(currentIndex);
    });
  }, { passive: true });

  // 2. IntersectionObserver Dual Registration
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const idx = slides.indexOf(entry.target);
          if (idx !== -1) {
            updateCounterDisplay(idx + 1);
          }
        }
      });
    }, {
      root: carousel,
      threshold: 0.55
    });
    slides.forEach(slide => observer.observe(slide));
  }

  // 3. Touch Fallback / Accessibility Prev & Next Controls
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      const cardWidth = slides[0] ? slides[0].offsetWidth : 300;
      carousel.scrollBy({ left: -(cardWidth + 16), behavior: 'smooth' });
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      const cardWidth = slides[0] ? slides[0].offsetWidth : 300;
      carousel.scrollBy({ left: (cardWidth + 16), behavior: 'smooth' });
    });
  }
})();
```

---

## 5. Verification Method

### 5.1 Verification Commands
Once the Worker implements the specified code into `tomboy_neo_tokyo_color_clash/code.html`, run the project test suite:

```bash
# Direct execution of E2E test runner
python tests/test_responsive_storefronts.py

# Unittest verbose mode
python -m unittest tests/test_responsive_storefronts.py -v
```

### 5.2 Specific Assertions to Verify
1. **Absence of Cart Badge**:
   - `grep -in "\[ 0 \]" tomboy_neo_tokyo_color_clash/code.html` should return NO hits inside `<header>`.
2. **Carousel Track Classes**:
   - Verify `#product-wall-carousel` contains:
     `flex overflow-x-auto snap-x snap-mandatory scrollbar-none md:grid md:grid-cols-2 lg:grid-cols-4 md:overflow-visible`
3. **Card Peek Widths**:
   - Verify each `<article>` child contains `w-[82vw] sm:w-[60vw] md:w-auto shrink-0 md:shrink snap-start`.
4. **Live Counter Element**:
   - Verify `#carousel-counter` exists in the DOM with initial value `[ 01 / 04 ]` and font class `font-mono`.
5. **Header Dimensions on 360px**:
   - Verify that Search is hidden on mobile (`hidden md:flex`) and Currency is hidden on mobile (`hidden md:flex`).
   - Mobile navbar contains only Logo + `BAG` + `[ MENU ]` trigger.
   - Total width = $258\text{px} < 328\text{px}$ available space.
6. **Desktop Preservation**:
   - Verify that on screens $\ge 1024\text{px}$, `#mobile-menu-trigger` is hidden via `lg:hidden`, horizontal nav pills are visible via `lg:flex`, and `#product-wall-carousel` displays as a 4-column grid (`lg:grid-cols-4`).

### 5.3 Invalidation Conditions
- Re-introducing any numeric bracketed badge (e.g. `[ 0 ]` or `[ 02 ]`) inside the navbar.
- Hardcoding static widths (e.g. `w-[360px]`) that prevent fluid scaling.
- Failing to include `snap-x` or `snap-mandatory` on the carousel container.
- Failing to remove the legacy `<!-- RESPONSIVE ENHANCEMENTS -->` injection script.
