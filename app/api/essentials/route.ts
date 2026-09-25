import { NextResponse } from 'next/server';
import { getCollectionByHandle } from '@/lib/shopify';
import { shopEssentials } from '@/data/homepage';

type Audience = keyof typeof shopEssentials;

// Several collections are shared across audiences (e.g. "brief" lists a boy's
// brief first), so pick the first product whose title fits the audience.
const titleFits: Record<Audience, (title: string) => boolean> = {
  men: (t) => !/\b(boy|girl|kid|women)/i.test(t),
  women: (t) => !/\b(boy|girl|kid)/i.test(t) && !/\bmen[’']s\b/i.test(t),
  kids: (t) => /\b(boy|girl|kid)/i.test(t),
};

// Collections that only hold women's products, so any product in them fits.
const womenOnlyHandles = /^(bra|panties|womens?-.*|women)$/;

// GET /api/essentials?audience=men → { "brief": "https://cdn…", "boxer": … }
// One photo per Shop Essentials card, keyed by the card's collection handle.
export async function GET(request: Request) {
  const audience = new URL(request.url).searchParams.get('audience') as Audience | null;
  if (!audience || !(audience in shopEssentials)) {
    return NextResponse.json({ error: 'Unknown audience' }, { status: 400 });
  }

  try {
    const handles = shopEssentials[audience].map((item) => item.href.split('/').pop() as string);
    const collections = await Promise.all(
      handles.map(async (handle) => {
        const products: any[] = (await getCollectionByHandle(handle, 20))?.products?.edges ?? [];
        return products.filter((p) => p.node.images.edges.length > 0);
      })
    );

    // Pick in card order, skipping products an earlier card already shows
    // (e.g. the "All Kids" card would otherwise repeat the Kids Pants photo).
    const used = new Set<string>();
    const images: Record<string, string | null> = {};
    handles.forEach((handle, i) => {
      const candidates = collections[i];
      // Women's cards never fall back to an unrelated product: a shared or
      // men-only collection would otherwise put a man's photo on the card.
      const strict = audience === 'women' && !womenOnlyHandles.test(handle);
      const fits = (title: string) =>
        strict ? /\b(women|girl|ladies|lady)/i.test(title) : titleFits[audience](title);
      const pick =
        candidates.find((p) => fits(p.node.title) && !used.has(p.node.handle)) ??
        (strict ? undefined : candidates.find((p) => !used.has(p.node.handle)) ?? candidates[0]);
      if (pick) used.add(pick.node.handle);
      const url: string | undefined = pick?.node.images.edges[0].node.url;
      // Shopify CDN resizes on the fly; cards are ~200px wide
      images[handle] = url ? `${url}${url.includes('?') ? '&' : '?'}width=480` : null;
    });
    return NextResponse.json(images);
  } catch (error) {
    console.error('Essentials API error:', error);
    return NextResponse.json({ error: 'Failed to fetch essentials images' }, { status: 500 });
  }
}
