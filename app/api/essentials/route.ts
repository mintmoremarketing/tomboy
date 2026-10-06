import { NextResponse } from 'next/server';
import { shopEssentials } from '@/data/homepage';
import { getEssentialPhotos, type Audience } from '@/lib/essentials';

// GET /api/essentials?audience=men → { "brief": "https://cdn…", "boxer": … }
// (the homepage gets these from the server already; this is for switching audience later)
export async function GET(request: Request) {
  const audience = new URL(request.url).searchParams.get('audience') as Audience | null;
  if (!audience || !(audience in shopEssentials)) {
    return NextResponse.json({ error: 'Unknown audience' }, { status: 400 });
  }
  try {
    return NextResponse.json(await getEssentialPhotos(audience), {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=600' },
    });
  } catch (error) {
    console.error('Essentials API error:', error);
    return NextResponse.json({ error: 'Failed to fetch essentials images' }, { status: 500 });
  }
}
