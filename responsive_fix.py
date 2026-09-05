import os
import re

directories = [
    r"c:\Users\devde\OneDrive\Desktop\Demo projects\Mint-more\tomboy clothing\tomboy_clothing_home_latest_drop",
    r"c:\Users\devde\OneDrive\Desktop\Demo projects\Mint-more\tomboy clothing\tomboy_editorial_darkroom_runway",
    r"c:\Users\devde\OneDrive\Desktop\Demo projects\Mint-more\tomboy clothing\tomboy_neo_tokyo_color_clash",
    r"c:\Users\devde\OneDrive\Desktop\Demo projects\Mint-more\tomboy clothing\tomboy_raw_brutalist_archive_index"
]

script_to_add = """
<!-- RESPONSIVE ENHANCEMENTS -->
<script>
document.addEventListener("DOMContentLoaded", () => {
    // Mobile menu toggle
    const navs = document.querySelectorAll('nav');
    navs.forEach(nav => {
        // Find closest header
        const header = nav.closest('header');
        if (!header) return;
        
        // Add hamburger
        const btn = document.createElement('button');
        btn.innerHTML = '<span class="material-symbols-outlined">menu</span>';
        btn.className = 'flex lg:hidden items-center justify-center p-2 text-current';
        
        // Insert button
        const rightTools = header.querySelector('.flex.items-center.gap-unit-6, .flex.items-center.gap-5, .flex.items-center.gap-3');
        if (rightTools) {
            rightTools.appendChild(btn);
        } else {
            header.appendChild(btn);
        }
        
        // Ensure nav has a class we can toggle
        nav.classList.add('mobile-nav');
        
        btn.addEventListener('click', () => {
            nav.classList.toggle('hidden');
            nav.classList.toggle('flex');
            nav.classList.toggle('flex-col');
            nav.classList.toggle('absolute');
            nav.classList.toggle('top-full');
            nav.classList.toggle('left-0');
            nav.classList.toggle('w-full');
            nav.classList.toggle('bg-surface');
            nav.classList.toggle('bg-black');
            nav.classList.toggle('z-50');
            nav.classList.toggle('p-4');
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
"""

for d in directories:
    html_path = os.path.join(d, 'code.html')
    if os.path.exists(html_path):
        with open(html_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        if '<!-- RESPONSIVE ENHANCEMENTS -->' not in content:
            content = content.replace('</body>', f'{script_to_add}</body>')
            
            # Make grids responsive
            # Replace grid-cols-4 with grid-cols-1 md:grid-cols-2 lg:grid-cols-4 if not already responsive
            content = re.sub(r'class="([^"]*)grid grid-cols-4([^"]*)"', r'class="\1grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4\2"', content)
            
            # Same for grid-cols-2 (only if it doesnt already have grid-cols-1)
            def repl_cols2(m):
                s = m.group(0)
                if 'grid-cols-1' in s: return s
                return s.replace('grid-cols-2', 'grid-cols-1 md:grid-cols-2')
                
            content = re.sub(r'class="([^"]*)grid grid-cols-2([^"]*)"', repl_cols2, content)
            
            with open(html_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f'Processed {html_path}')
