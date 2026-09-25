import { NextResponse } from 'next/server';
import { getCollectionByHandle, getProducts } from '@/lib/shopify';

// GET /api/products                 → store-wide products
// GET /api/products?collection=men  → products in that collection (same shape)
export async function GET(request: Request) {
  try {
    const collection = new URL(request.url).searchParams.get('collection');
    const products = collection
      ? (await getCollectionByHandle(collection, 20))?.products?.edges ?? []
      : await getProducts();
    return NextResponse.json(products);
  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
