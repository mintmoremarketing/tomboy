import { getCollectionByHandle, getProducts } from '@/lib/shopify';
import { shopEssentials } from '@/data/homepage';

// The catalog Scout (the shopping assistant) sees, plus the @tags the chat
// input offers: every product gets a short readable tag (@classic-briefs), and
// every Shop Essentials category is a tag too (@briefs, @kids-socks) that
// stands for all of its products — like KeepUp's task and client @handles.

export type Audience = 'men' | 'women' | 'kids';
const AUDIENCES: Audience[] = ['men', 'women', 'kids'];
const TTL_MS = 10 * 60 * 1000;

export interface CatalogProduct {
  tag: string;
  handle: string;
  title: string;
  type: string;
  price: string;
  image: string | null;
  audience: Audience;
}

export interface CatalogCategory {
  tag: string;
  name: string;
  audience: Audience;
  collection: string;
  handles: string[]; // products in the collection, for the model's context
}

export interface Catalog {
  products: CatalogProduct[];
  categories: CatalogCategory[];
}

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const TAG_STOPWORDS = new Set(['tomboy', 'mens', 'womens', 'boys', 'girls', 'kids', 'the', 'and', 'with', 'for', 'a', 'of', 'in']);

// The product noun sits at the end of the main name, before any "–" subtitle:
// "TOMBOY Men’s Classic Briefs – Premium Comfort" → "classic-briefs"
// "Boy’s All Over Printed Classic Striped Outer Elastic Brief" → "outer-elastic-brief"
// When that's taken, a word from the subtitle tells them apart:
// "Men’s Graphic T-Shirt – Grunge Smiley Edition" → "graphic-t-shirt-grunge"
const words = (s: string) =>
  slugify(s)
    .split('-')
    .filter((w) => w && !TAG_STOPWORDS.has(w) && !['edition', 'edit', 'collection', 'series'].includes(w));

function productTag(title: string, taken: Set<string>) {
  const [main, ...rest] = title.split(/\s[–—|:(]\s?|\s-\s/);
  const base = words(main).slice(-3).join('-') || 'item';
  const extra = words(rest.join(' '));
  const options = [base, ...extra.slice(0, 2).map((_, i) => `${base}-${extra.slice(0, i + 1).join('-')}`)];
  const free = options.find((o) => !taken.has(o));
  return unique(free ?? base, taken);
}

function unique(tag: string, taken: Set<string>) {
  let candidate = tag;
  for (let n = 2; taken.has(candidate); n++) candidate = `${tag}-${n}`;
  taken.add(candidate);
  return candidate;
}

let cache: { at: number; catalog: Catalog } | null = null;

export async function loadCatalog(): Promise<Catalog> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.catalog;

  // Every product in the store (not all of them sit in the men/women/kids collections);
  // the audience comes from those collections, else from the title.
  const [allProducts, ...audienceCollections] = await Promise.all([
    getProducts(250),
    ...AUDIENCES.map((a) => getCollectionByHandle(a, 250)),
  ]);
  const audienceOf = new Map<string, Audience>();
  AUDIENCES.forEach((audience, i) => {
    for (const edge of audienceCollections[i]?.products?.edges ?? []) {
      if (!audienceOf.has(edge.node.handle)) audienceOf.set(edge.node.handle, audience);
    }
  });
  const guessAudience = (title: string): Audience =>
    /\b(boy|girl|kid)/i.test(title) ? 'kids' : /\b(women|ladies|bra|pant(y|ies))/i.test(title) ? 'women' : 'men';

  const byHandle = new Map<string, Omit<CatalogProduct, 'tag'>>();
  for (const edge of allProducts as any[]) {
    const p = edge.node;
    if (byHandle.has(p.handle)) continue;
    byHandle.set(p.handle, {
      handle: p.handle,
      title: p.title,
      type: p.productType || 'Product',
      price: `Rs. ${Math.round(Number(p.priceRange?.minVariantPrice?.amount ?? 0))}`,
      image: p.images?.edges?.[0]?.node?.url ?? null,
      audience: audienceOf.get(p.handle) ?? guessAudience(p.title),
    });
  }

  // sorted so tags (and the prompt built from them) stay stable between refreshes
  const taken = new Set<string>();
  const products = [...byHandle.values()]
    .sort((a, b) => a.handle.localeCompare(b.handle))
    .map((p) => ({ ...p, tag: productTag(p.title, taken) }));

  const entries = AUDIENCES.flatMap((audience) =>
    shopEssentials[audience].map((item) => ({ audience, name: item.title, collection: item.href.split('/').pop() as string })),
  );
  const collections = await Promise.all(entries.map((e) => getCollectionByHandle(e.collection, 50)));
  const categories: CatalogCategory[] = entries.map((e, i) => {
    const slug = slugify(e.name);
    return {
      ...e,
      tag: unique(taken.has(slug) ? `${e.audience}-${slug}` : slug, taken),
      handles: (collections[i]?.products?.edges ?? [])
        .map((edge: any) => edge.node.handle as string)
        .filter((h: string) => byHandle.has(h)),
    };
  });

  const catalog = { products, categories };
  cache = { at: Date.now(), catalog };
  return catalog;
}
