# Mobile Navigation Drawer Architecture & Specification Report (Storefront 3: Neo Tokyo Color Clash)

**Agent**: `teamwork_preview_explorer_m3_2`  
**Working Directory**: `c:\Users\devde\OneDrive\Desktop\Demo projects\Mint-more\tomboy clothing\.agents\teamwork_preview_explorer_m3_2`  
**Target Storefront**: `tomboy_neo_tokyo_color_clash/code.html`  
**Timestamp**: 2026-09-05T11:25:00Z  
**Handoff Type**: Hard Handoff (Investigation & Specification Complete)

---

## 1. Observation

### 1.1 Existing Navigation DOM Architecture in `tomboy_neo_tokyo_color_clash/code.html`
Direct inspection of `tomboy_neo_tokyo_color_clash/code.html` (lines 113–148) reveals the following existing header and desktop navigation structure:

```html
<!-- MAIN CHUNKY HEADER -->
<header class="w-full bg-white text-black border-b-2 border-black px-4 lg:px-8 py-3">
<div class="max-w-7xl mx-auto flex items-center justify-between">
<!-- Brand Logo & Badge -->
<div class="flex items-center gap-4">
<a class="flex items-center gap-3 group" href="#">
<img alt="Tomboy Streetwear Logo" class="h-9 w-auto object-contain border-2 border-black p-0.5 bg-white neo-shadow-sm group-hover:-translate-y-0.5 transition-transform" src="https://lh3.googleusercontent.com/aida/AEtjO1VsApCZr_OXfOP7a10cL68n9xqWnWNuQwHHwp0MSPvh_OkYiXXyHJkuO6Hado7PwiyWLyc2YDZdhy4L-t1liMcH4OUwKO-jNACeWilqG4E_asTCHXp7PrW_JnHp7dicyLg-jt5dC7i48WK6pZse9iNToyNEyUffBSqyyvaFsmrK97_mwTgg0FImOcWtTzc3JXbXmhgdqX39LbaQWVYQzBwzB21CDn-sfjXq0llOfMgYn-Sz3_B-KUP6vuY"/>
<span class="font-headline-lg text-2xl md:text-3xl font-bold tracking-tighter uppercase text-black">TOMBOY</span>
</a>
<span class="hidden xl:inline-block px-2.5 py-0.5 rounded-full bg-hyper-yellow border-2 border-black font-label-caps-sm text-[9px] uppercase font-bold neo-shadow-sm">
            COLOR-CLASH '25
          </span>
</div>
<!-- Pill Nav Tabs -->
<nav class="hidden lg:flex items-center gap-2 font-label-caps-md text-[11px] font-bold uppercase tracking-wider">
<a class="px-3.5 py-1.5 rounded-full bg-black text-white hover:bg-berry-magenta transition-colors border-2 border-black" href="#product-wall">DROPS</a>
<a class="px-3.5 py-1.5 rounded-full bg-white text-black hover:bg-slate-100 transition-colors border-2 border-black" href="#product-wall">TOPS</a>
<a class="px-3.5 py-1.5 rounded-full bg-[#6D28D9] text-white hover:bg-[#5b21b6] transition-colors border-2 border-black" href="#collectibles-section">TOYS</a>
<a class="px-3.5 py-1.5 rounded-full bg-[#15803D] text-white hover:bg-[#166534] transition-colors border-2 border-black" href="#blanks-section">BLANKS</a>
<a class="px-3.5 py-1.5 rounded-full bg-[#EA580C] text-white hover:bg-[#c2410c] transition-colors border-2 border-black" href="#editorial-shift">LOOKBOOK</a>
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

**Key Direct Observations**:
1. **Desktop Nav Suppression**: Desktop navigation `<nav>` uses `hidden lg:flex`. When the viewport is `< 1024px` (mobile and tablet), this element evaluates to `display: none`.
2. **Missing Mobile Trigger & Drawer**: There is no `#mobile-menu-trigger`, `#mobile-drawer`, `#mobile-drawer-backdrop`, or `#mobile-drawer-close` element in the static HTML.
3. **Right Tools Congestion on Mobile (360px–390px)**: The right utility flex container contains three elements: Currency badge (`hidden sm:flex`), Search button (`w-9 h-9`), and Bag button (`BAG [ 0 ]`). On 360px screens, available header width is 328px (360px - 32px padding). With Logo (~130px), Search (~36px), Bag (~80px), and adding a 44px menu button, the total width exceeds available space, causing wrapping or clipping unless secondary utilities are relocated into the drawer.

---

### 1.2 Flawed Legacy Injected Script (`<!-- RESPONSIVE ENHANCEMENTS -->`)
In lines 893–945 of `tomboy_neo_tokyo_color_clash/code.html`, a legacy script from `responsive_fix.py` exists:

```html
<!-- RESPONSIVE ENHANCEMENTS -->
<script>
document.addEventListener("DOMContentLoaded", () => {
    // Mobile menu toggle
    const navs = document.querySelectorAll('nav');
    navs.forEach(nav => {
        const header = nav.closest('header');
        if (!header) return;
        const btn = document.createElement('button');
        btn.innerHTML = '<span class="material-symbols-outlined">menu</span>';
        btn.className = 'flex lg:hidden items-center justify-center p-2 text-current';
        ...
        nav.classList.add('mobile-nav');
        btn.addEventListener('click', () => {
            nav.classList.toggle('hidden');
            nav.classList.toggle('flex');
            nav.classList.toggle('flex-col');
            nav.classList.toggle('absolute');
            nav.classList.toggle('top-full');
            nav.classList.toggle('left-0');
            nav.classList.toggle('w-full');
            ...
        });
    });
});
</script>
<style>
@media (max-width: 1024px) {
    .mobile-nav {
        background-color: #080808; /* Dark mode fallback */
        border-bottom: 1px solid rgba(255,255,255,0.1);
    }
}
/* Ensure text scales */
html { font-size: 14px; }
@media (min-width: 768px) { html { font-size: 16px; } }
</style>
```

**Observed Defects**:
- Violates `test_tier1_legacy_naive_injection_removed` in `tests/test_responsive_storefronts.py` (explicitly asserts absence of `"<!-- RESPONSIVE ENHANCEMENTS -->"` and `".mobile-nav {"`).
- Mutates desktop `<nav>` inline into an unstyled, overlapping dropdown rather than providing an off-canvas drawer.
- Injects conflicting root font-size mutations (`html { font-size: 14px; }`).
- Does NOT provide `#mobile-menu-trigger`, `#mobile-drawer`, `#mobile-drawer-backdrop`, or `#mobile-drawer-close` required by contracts.

---

### 1.3 Exact Test Suite Assertions in `tests/test_responsive_storefronts.py`
Direct inspection of `tests/test_responsive_storefronts.py` verifies the following mandatory contract assertions:

1. **`test_tier1_mobile_menu_trigger_attributes` (Lines 283–295)**:
   - Target: `dom.find_by_id("mobile-menu-trigger")`
   - Must be tag `<button>`
   - Must have non-empty `aria-label`
   - Must have `lg:hidden` (or `xl:hidden`)
2. **`test_tier1_mobile_drawer_element_and_positioning` (Lines 297–306)**:
   - Target: `dom.find_by_id("mobile-drawer")`
   - Must be tag `<aside>`
   - Must have class `"fixed"`
   - Must start off-canvas with `"translate-x-full"` (or `"-translate-x-full"`)
3. **`test_tier1_mobile_drawer_backdrop_overlay` (Lines 308–317)**:
   - Target: `dom.find_by_id("mobile-drawer-backdrop")`
   - Must be tag `<div>`
   - Must have class `"fixed"`
   - Must be initially hidden: contains `"opacity-0"`, `"hidden"`, or `"pointer-events-none"`
4. **`test_tier1_mobile_drawer_close_button` (Lines 319–327)**:
   - Target: `dom.find_by_id("mobile-drawer-close")`
   - Must be tag `<button>`
   - Must have non-empty `aria-label`
5. **`test_tier1_mobile_drawer_navigation_links` (Lines 329–338)**:
   - Drawer must contain at least 3 navigational links (`<a>`)
6. **`test_tier2_escape_key_dismissal_contract` (Lines 544–550)**:
   - Script must match `re.search(r'["\']Escape["\']|\.key\s*===\s*["\']Escape["\']', scripts)`
7. **`test_tier2_backdrop_click_dismissal_contract` (Lines 552–558)**:
   - Script must reference `"mobile-drawer-backdrop"` or `"mobileDrawerBackdrop"` with click handler
8. **`test_tier2_body_scroll_lock_on_open` (Lines 560–566)**:
   - Script must match `re.search(r'document\.body\.style\.overflow\s*=\s*["\']hidden["\']', scripts)`
9. **`test_tier2_body_scroll_lock_restoration_on_close` (Lines 568–575)**:
   - Script must match `re.search(r'document\.body\.style\.overflow\s*=\s*["\'](unset|auto|)["\']', scripts)`
10. **`test_tier2_no_malformed_or_duplicate_tailwind_classes` (Lines 576–588)**:
    - Zero instances of `py-0.2`, zero mismatched brackets `[` / `]`
11. **`test_tier3_drawer_contains_cart_shortcut_or_clean_handoff` (Lines 609–622)**:
    - Drawer must contain an anchor tag pointing to `cart`, `bag`, or `shop`
12. **`test_tier3_drawer_overlay_z_index_hierarchy` (Lines 624–636)**:
    - Drawer must have `z-50` and backdrop must have `z-40`
13. **`test_tier4_neo_tokyo_mobile_shopper_journey` & `test_tier4_cross_storefront_contract_uniformity` (Lines 734–796)**:
    - Explicitly assert presence of `#mobile-menu-trigger`, `#mobile-drawer`, `#mobile-drawer-backdrop`, `#mobile-drawer-close`

---

## 2. Logic Chain

### Step 1: Why the Current Navbar Leaves Mobile Shoppers Stranded
- *From Observation 1.1*: `tomboy_neo_tokyo_color_clash/code.html` hides its entire navigation tab strip at `< 1024px` using Tailwind's `hidden lg:flex`.
- *From Observation 1.1*: No static trigger button exists in the HTML.
- *Inference*: On iPhone, iPad Mini, and Android smartphones, users have zero mechanism to reach the core storefront sections (`#product-wall`, `#collectibles-section`, `#blanks-section`, `#editorial-shift`).

### Step 2: Why Naive Dropdowns Must Be Replaced by an Off-Canvas Drawer
- *From Observation 1.2*: The naive script injected by `responsive_fix.py` merely toggles desktop nav classes inline. On Storefront 3, this results in a black block that breaks below the fixed header, covering hero content and failing the brutalist design language.
- *From Observation 1.3*: `test_tier1_legacy_naive_injection_removed` explicitly fails if `<!-- RESPONSIVE ENHANCEMENTS -->` or `.mobile-nav` remains in the file.
- *Inference*: The naive script must be purged completely, and replaced with a static DOM off-canvas drawer (`<aside id="mobile-drawer">`) and clean JavaScript controller.

### Step 3: Visual & Architectural Alignment with Neo Tokyo Cyber-Brutalism
- *From Observation 1.1 & SCOPE.md*: Storefront 3 uses a high-voltage palette: acid green (`#ccff00` / `#15803D`), berry magenta (`#E11D48` / `bg-berry-magenta`), cobalt purple (`#6D28D9`), hyper yellow (`#FACC15`), solid 2px/3px black borders, and hard offset drop shadows (`neo-shadow`, `neo-shadow-sm`).
- *Inference*: The mobile navigation drawer must not be a generic dark box. It must embody the Neo Tokyo color-clash identity:
  1. Trigger button: `#mobile-menu-trigger` with acid green (`#ccff00`) background, sharp 2px black border, brutalist `[ MENU ]` text, and tactile neo-brutalist hover/active translations.
  2. Drawer container: `<aside id="mobile-drawer">` with crisp white background, thick 3px black left border (`border-l-3 border-black`), and heavy drop shadow (`neo-shadow`).
  3. Drawer links: Bold pill or rectangular list items featuring high-contrast hover colors (`#ccff00`, `#FACC15`, `#6D28D9`, `#15803D`, `#E11D48`).
  4. Header & Footer tools: Integrated search bar, currency selector (`[ USD $ // GLOBAL ]`), live drop status badge, and direct `VIEW SHOPPING BAG` checkout shortcut.

### Step 4: Header Utility De-Cluttering on Narrow Viewports (360px–390px)
- *From Observation 1.1*: At 360px viewport width, total horizontal room is 328px after `px-4` padding.
  - Logo + Image icon = ~130px.
  - Cart `BAG` button (touch-target $\ge 44 \times 44\text{px}$) = ~80px.
  - Mobile menu trigger `[ MENU ]` ($\ge 44 \times 44\text{px}$) = ~95px.
  - Search button (`w-9 h-9`) + Currency button (`hidden sm:flex`) = ~45px.
  - Stacking all 4 items = $130 + 80 + 95 + 45 = 350\text{px} > 328\text{px}$, causing wrapping.
- *Inference*: By making the Search icon `hidden md:flex` in the navbar and embedding an accessible, brutalist search input inside `#mobile-drawer`, the top header requires only $130 + 80 + 95 = 305\text{px} \le 328\text{px}$. This preserves generous breathing room while guaranteeing touch targets $\ge 44\text{px}$.

### Step 5: JavaScript Interaction Lifecycle & Regex Adherence
- *From Observation 1.3*: The test harness specifically parses script bodies using regular expressions for:
  - `document.body.style.overflow = "hidden"` on open
  - `document.body.style.overflow = ""` (or `"unset"`) on close
  - `e.key === "Escape"` (or `'Escape'`) on keydown
  - Click listener on `"mobile-drawer-backdrop"`
- *Inference*: The JavaScript implementation must use these exact patterns without abstractions or indirection to ensure 100% test pass rates across all test tiers.

---

## 3. Caveats

1. **Scope Boundaries**: This report specifically addresses the Mobile Navigation Drawer, trigger, backdrop, styling, and JS controller. Product section carousel touch-swiping is assigned to Explorer 3, and cart badge `[ 0 ]` removal and legacy Python cleanup are assigned to Explorer 1.
2. **Desktop Preservation ($\ge 1024\text{px}$)**: The desktop navigation (`<nav class="hidden lg:flex ...">`) must NOT be removed or modified in a way that breaks desktop rendering; it must remain intact at `lg:flex`.
3. **Tailwind Version Compatibility**: The project uses Tailwind CDN (`cdn.tailwindcss.com?plugins=forms,container-queries`). Arbitrary classes like `border-l-3` or `neo-shadow` rely on the custom CSS in `<style>` (lines 29–40). Standard utility classes (`z-50`, `z-40`, `translate-x-full`, `translate-x-0`, `opacity-0`, `opacity-100`) must be used for transitions.

---

## 4. Conclusion & Concrete Implementation Recommendations

The Worker should implement the following three code blocks in `tomboy_neo_tokyo_color_clash/code.html`.

### 4.1 Header Trigger & De-Cluttering (Target: Lines 135–146)
Replace lines 135–146 inside `<header class="...">` with:

```html
<!-- Right Tools -->
<div class="flex items-center gap-2 sm:gap-3">
  <!-- Currency / Region Toggle (hidden on mobile, visible on sm+) -->
  <div class="hidden sm:flex items-center border-2 border-black px-2.5 py-1 bg-slate-50 neo-shadow-sm">
    <span class="font-price-tag text-xs font-bold">[ USD $ ]</span>
  </div>

  <!-- Search Button (hidden on mobile, relocated to drawer; visible on md+) -->
  <button aria-label="Search" class="hidden md:flex w-9 h-9 items-center justify-center border-2 border-black bg-white hover:bg-hyper-yellow transition-colors neo-shadow-sm">
    <span class="material-symbols-outlined text-[19px]">search</span>
  </button>

  <!-- BAG Button (Cleaned: no [ 0 ] badge, min 44x44px touch target) -->
  <a class="flex items-center justify-center gap-1.5 min-h-[44px] min-w-[44px] px-3 bg-berry-magenta text-white font-label-caps-md text-xs font-bold border-2 border-black neo-shadow-sm hover:translate-x-0.5 hover:translate-y-0.5 transition-all" href="#product-wall" aria-label="Shopping Bag">
    <span class="material-symbols-outlined text-[18px]">shopping_bag</span>
    <span>BAG</span>
  </a>

  <!-- Mobile Menu Trigger Button (Cyber-Brutalist [ MENU ], min 44x44px touch target, lg:hidden) -->
  <button id="mobile-menu-trigger" 
          aria-label="Open navigation menu" 
          aria-expanded="false" 
          aria-controls="mobile-drawer" 
          class="flex lg:hidden items-center justify-center gap-1.5 min-h-[44px] min-w-[44px] px-3 bg-[#ccff00] text-black font-label-caps-md text-xs font-bold border-2 border-black neo-shadow-sm hover:bg-hyper-yellow hover:translate-x-0.5 hover:translate-y-0.5 transition-all active:translate-x-1 active:translate-y-1 cursor-pointer">
    <span class="material-symbols-outlined text-[18px]">menu</span>
    <span>[ MENU ]</span>
  </button>
</div>
```

---

### 4.2 Backdrop Overlay & Mobile Navigation Drawer DOM (Target: Directly after `</header>`, before `<main>`)
Insert the following backdrop and drawer structure:

```html
<!-- CYBER-BRUTALIST MOBILE NAVIGATION DRAWER & BACKDROP OVERLAY -->
<!-- Backdrop Overlay -->
<div id="mobile-drawer-backdrop" 
     class="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm opacity-0 pointer-events-none transition-opacity duration-300" 
     aria-hidden="true"></div>

<!-- Mobile Navigation Drawer Container -->
<aside id="mobile-drawer" 
       class="fixed inset-y-0 right-0 z-50 w-[85vw] max-w-[380px] bg-white text-black border-l-3 border-black transform translate-x-full transition-transform duration-300 ease-in-out neo-shadow flex flex-col justify-between overflow-y-auto" 
       role="dialog" 
       aria-modal="true" 
       aria-label="Mobile Navigation Menu" 
       aria-hidden="true">

  <!-- Top Section: Header, Live Banner, Search & Links -->
  <div class="flex flex-col">
    <!-- Drawer Header Bar -->
    <div class="flex items-center justify-between p-4 border-b-2 border-black bg-slate-50">
      <div class="flex items-center gap-2">
        <span class="px-2 py-0.5 bg-berry-magenta text-white font-label-caps-sm text-[10px] font-bold border border-black neo-shadow-sm">
          TOMBOY // CLASH
        </span>
        <span class="font-price-tag text-[10px] text-slate-500 font-bold">[ NAV // V2.5 ]</span>
      </div>
      <!-- Close Button (min 44x44px touch target) -->
      <button id="mobile-drawer-close" 
              aria-label="Close navigation menu" 
              class="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center border-2 border-black bg-white hover:bg-berry-magenta hover:text-white transition-all neo-shadow-sm cursor-pointer active:translate-x-0.5 active:translate-y-0.5">
        <span class="material-symbols-outlined text-[20px]">close</span>
      </button>
    </div>

    <!-- Live Status Banner Inside Drawer -->
    <div class="px-4 py-2 bg-black text-white border-b-2 border-black flex items-center justify-between font-label-caps-sm text-[10px] tracking-wider">
      <div class="flex items-center gap-2">
        <span class="w-1.5 h-1.5 bg-[#ccff00] rounded-full animate-ping"></span>
        <span class="text-[#ccff00] font-bold">NEXT DROP:</span>
        <span class="font-price-tag text-slate-300">03D : 14H : 22M</span>
      </div>
      <span class="text-hyper-yellow font-bold">[ FW25 ]</span>
    </div>

    <!-- Relocated Search Tool Inside Drawer -->
    <div class="p-4 border-b-2 border-black bg-slate-100/60">
      <label class="block font-label-caps-sm text-[10px] font-bold text-slate-600 uppercase mb-1.5 tracking-wider">
        // SEARCH CATALOG
      </label>
      <div class="relative">
        <input type="text" 
               placeholder="SEARCH ARCHIVE / GRAILS..." 
               class="w-full px-3 py-2.5 bg-white border-2 border-black font-price-tag text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-berry-magenta neo-shadow-sm"/>
        <button aria-label="Submit search" 
                class="absolute right-1 top-1 h-8 px-2.5 bg-black text-white hover:bg-berry-magenta transition-colors font-label-caps-sm text-[10px] font-bold border border-black">
          GO
        </button>
      </div>
    </div>

    <!-- Navigation Links Hierarchy -->
    <nav class="flex flex-col p-4 gap-2.5" aria-label="Mobile Navigation Links">
      <a href="#product-wall" 
         class="flex items-center justify-between p-3.5 bg-white text-black font-headline-md text-sm font-bold uppercase tracking-wider border-2 border-black neo-shadow-sm hover:bg-[#ccff00] hover:translate-x-1 transition-all">
        <span>[ 01 ] DROPS // LATEST</span>
        <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
      </a>
      <a href="#product-wall" 
         class="flex items-center justify-between p-3.5 bg-white text-black font-headline-md text-sm font-bold uppercase tracking-wider border-2 border-black neo-shadow-sm hover:bg-hyper-yellow hover:translate-x-1 transition-all">
        <span>[ 02 ] TOPS // TEES</span>
        <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
      </a>
      <a href="#collectibles-section" 
         class="flex items-center justify-between p-3.5 bg-white text-black font-headline-md text-sm font-bold uppercase tracking-wider border-2 border-black neo-shadow-sm hover:bg-cobalt-purple hover:text-white hover:translate-x-1 transition-all">
        <span>[ 03 ] TOYS // COLLECTIBLES</span>
        <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
      </a>
      <a href="#blanks-section" 
         class="flex items-center justify-between p-3.5 bg-white text-black font-headline-md text-sm font-bold uppercase tracking-wider border-2 border-black neo-shadow-sm hover:bg-[#15803D] hover:text-white hover:translate-x-1 transition-all">
        <span>[ 04 ] BLANKS // ESSENTIALS</span>
        <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
      </a>
      <a href="#editorial-shift" 
         class="flex items-center justify-between p-3.5 bg-white text-black font-headline-md text-sm font-bold uppercase tracking-wider border-2 border-black neo-shadow-sm hover:bg-rich-tangerine hover:text-white hover:translate-x-1 transition-all">
        <span>[ 05 ] LOOKBOOK // EDITORIAL</span>
        <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
      </a>
      <a href="#product-wall" 
         class="flex items-center justify-between p-3.5 bg-white text-black font-headline-md text-sm font-bold uppercase tracking-wider border-2 border-black neo-shadow-sm hover:bg-berry-magenta hover:text-white hover:translate-x-1 transition-all">
        <span>[ 06 ] ARCHIVE // GRAILS</span>
        <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
      </a>
    </nav>
  </div>

  <!-- Bottom Section: Currency/Region & Bag Shortcut -->
  <div class="p-4 border-t-2 border-black bg-slate-50 flex flex-col gap-3">
    <!-- Currency / Region Switcher -->
    <div class="flex items-center justify-between p-2.5 border-2 border-black bg-white font-label-caps-sm text-xs font-bold neo-shadow-sm">
      <span class="text-slate-600">CURRENCY / REGION</span>
      <span class="px-2 py-0.5 bg-[#ccff00] text-black border border-black font-price-tag">[ USD $ // GLOBAL ]</span>
    </div>

    <!-- Quick BAG Checkout CTA -->
    <a href="#product-wall" 
       class="flex items-center justify-between p-3.5 bg-berry-magenta text-white font-label-caps-md text-xs font-bold border-2 border-black neo-shadow-sm hover:translate-x-0.5 hover:translate-y-0.5 transition-all">
      <span class="flex items-center gap-2">
        <span class="material-symbols-outlined text-[18px]">shopping_bag</span>
        <span>VIEW SHOPPING BAG</span>
      </span>
      <span class="font-price-tag text-xs">[ CHECKOUT ]</span>
    </a>

    <!-- Monospace Meta Ledger -->
    <div class="flex items-center justify-between text-[9px] font-price-tag text-slate-500 pt-1">
      <span>TOMBOY ARCHIVE CORP // TOKYO</span>
      <span>EDITION FW25</span>
    </div>
  </div>
</aside>
```

---

### 4.3 JavaScript Controller (Target: Replacing lines 893–945)
Replace the legacy `<!-- RESPONSIVE ENHANCEMENTS -->` and inline `<style>` completely with:

```html
<!-- MOBILE NAVIGATION DRAWER CONTROLLER -->
<script>
document.addEventListener("DOMContentLoaded", () => {
  const trigger = document.getElementById("mobile-menu-trigger");
  const drawer = document.getElementById("mobile-drawer");
  const backdrop = document.getElementById("mobile-drawer-backdrop");
  const closeBtn = document.getElementById("mobile-drawer-close");
  const drawerLinks = drawer ? drawer.querySelectorAll("a") : [];

  if (!trigger || !drawer || !backdrop) return;

  function openDrawer() {
    drawer.classList.remove("translate-x-full");
    drawer.classList.add("translate-x-0");
    backdrop.classList.remove("opacity-0", "pointer-events-none");
    backdrop.classList.add("opacity-100", "pointer-events-auto");
    trigger.setAttribute("aria-expanded", "true");
    drawer.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeDrawer() {
    drawer.classList.remove("translate-x-0");
    drawer.classList.add("translate-x-full");
    backdrop.classList.remove("opacity-100", "pointer-events-auto");
    backdrop.classList.add("opacity-0", "pointer-events-none");
    trigger.setAttribute("aria-expanded", "false");
    drawer.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  // Trigger button opens drawer
  trigger.addEventListener("click", openDrawer);

  // Close button dismisses drawer
  if (closeBtn) {
    closeBtn.addEventListener("click", closeDrawer);
  }

  // Backdrop click dismisses drawer
  backdrop.addEventListener("click", closeDrawer);

  // Close on drawer link navigation
  drawerLinks.forEach((link) => {
    link.addEventListener("click", closeDrawer);
  });

  // Keyboard Escape key dismissal
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && drawer.getAttribute("aria-hidden") === "false") {
      closeDrawer();
    }
  });

  // Touch swipe-to-close gesture support (swiping right closes drawer)
  let touchStartX = 0;
  drawer.addEventListener("touchstart", (e) => {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });

  drawer.addEventListener("touchend", (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    if (touchEndX - touchStartX > 50) {
      closeDrawer();
    }
  }, { passive: true });
});
</script>
```

---

## 5. Verification Method

### 5.1 Automated Test Execution Command
Run the standalone regression test harness:

```powershell
python -m unittest tests/test_responsive_storefronts.py -v
```

Specifically to verify Storefront 3 Mobile Drawer assertions:
- `Tier1FeatureCoverageTests.test_tier1_mobile_menu_trigger_attributes`
- `Tier1FeatureCoverageTests.test_tier1_mobile_drawer_element_and_positioning`
- `Tier1FeatureCoverageTests.test_tier1_mobile_drawer_backdrop_overlay`
- `Tier1FeatureCoverageTests.test_tier1_mobile_drawer_close_button`
- `Tier1FeatureCoverageTests.test_tier1_mobile_drawer_navigation_links`
- `Tier1FeatureCoverageTests.test_tier1_legacy_naive_injection_removed`
- `Tier2BoundaryCornerCaseTests.test_tier2_desktop_1024px_nav_transition`
- `Tier2BoundaryCornerCaseTests.test_tier2_escape_key_dismissal_contract`
- `Tier2BoundaryCornerCaseTests.test_tier2_backdrop_click_dismissal_contract`
- `Tier2BoundaryCornerCaseTests.test_tier2_body_scroll_lock_on_open`
- `Tier2BoundaryCornerCaseTests.test_tier2_body_scroll_lock_restoration_on_close`
- `Tier2BoundaryCornerCaseTests.test_tier2_no_malformed_or_duplicate_tailwind_classes`
- `Tier3CrossFeatureIntegrationTests.test_tier3_drawer_contains_cart_shortcut_or_clean_handoff`
- `Tier3CrossFeatureIntegrationTests.test_tier3_drawer_overlay_z_index_hierarchy`
- `Tier3CrossFeatureIntegrationTests.test_tier3_carousel_scroll_lock_isolation`
- `Tier4RealWorldWorkloadScenarios.test_tier4_neo_tokyo_mobile_shopper_journey`
- `Tier4RealWorldWorkloadScenarios.test_tier4_cross_storefront_contract_uniformity`

### 5.2 Manual Browser Verification Checklist
1. **Viewport `< 1024px`**:
   - The desktop pill nav (`DROPS`, `TOPS`, `TOYS`, `BLANKS`, `LOOKBOOK`) is hidden.
   - The `#mobile-menu-trigger` button with `[ MENU ]` in acid green `#ccff00` is visible.
   - Touching/clicking `[ MENU ]` slides `#mobile-drawer` into view from the right with a smooth 300ms transition.
   - `#mobile-drawer-backdrop` fades in with blurred overlay.
   - Background scrolling is completely locked (`overflow: hidden`).
2. **Dismissal Pathways**:
   - Clicking `#mobile-drawer-close` closes the drawer and restores scroll.
   - Clicking `#mobile-drawer-backdrop` closes the drawer and restores scroll.
   - Pressing the `Escape` key closes the drawer and restores scroll.
   - Swiping right on the drawer by > 50px closes the drawer and restores scroll.
   - Clicking any navigation link inside the drawer closes the drawer and scrolls to the anchor.
3. **Viewport $\ge 1024px$**:
   - `#mobile-menu-trigger` is hidden (`lg:hidden`).
   - Desktop pill nav is visible (`hidden lg:flex`).
   - `#mobile-drawer` and backdrop remain hidden off-canvas.

### 5.3 Invalidation Conditions
- Failure of `#mobile-menu-trigger` to hide on `lg:` viewports.
- Failure of `#mobile-drawer` to use `<aside>` tag.
- Omission of `document.body.style.overflow = "hidden"` or restoration `""`.
- Retention of legacy strings `"<!-- RESPONSIVE ENHANCEMENTS -->"` or `".mobile-nav {"`.
