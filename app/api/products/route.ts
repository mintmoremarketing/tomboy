import { NextResponse } from 'next/server';
import { getCollectionByHandle, getProductByHandle, getProducts } from '@/lib/shopify';

// GET /api/products                 → store-wide products
// GET /api/products?collection=men  → products in that collection (same shape)
// GET /api/products?handle=x        → one product's summary card (Scout's "still thinking about it?")
export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    const handle = params.get('handle');
    if (handle) {
      const p = await getProductByHandle(handle);
      if (!p) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      const variants = p.variants?.edges?.map((e: any) => e.node) ?? [];
      return NextResponse.json({
        handle: p.handle,
        title: p.title,
        image: p.images?.edges?.[0]?.node?.url ?? null,
        price: Number(p.priceRange?.minVariantPrice?.amount) || 0,
        compareAt: Number(p.compareAtPriceRange?.minVariantPrice?.amount) || 0,
        available: variants.some((v: any) => v.availableForSale !== false),
        // "M / Black" style titles of in-stock variants, to say "still in stock in your size"
        inStock: variants.filter((v: any) => v.availableForSale !== false).map((v: any) => v.title),
      });
    }
    const collection = params.get('collection');
    const products = collection
      ? (await getCollectionByHandle(collection, 20))?.products?.edges ?? []
      : await getProducts();
    return NextResponse.json(products);
  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
