import { ApiError as GeminiApiError, GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';
import { loadCatalog } from '@/lib/assistant-catalog';
import { garmentSlot } from '@/lib/try-on';

// AI try-on: the shopper's own photo + a product photo → a preview of them wearing it.
//
// Privacy: the shopper's photo only lives in this request's memory. It's sent to
// Google's Gemini API to generate the image and is never written to disk, a
// database or the logs; the generated image goes straight back to the browser.
// Responses are marked no-store so nothing caches them either.
//
// Safety: only adult outerwear is allowed (see lib/try-on.ts), checked here on the
// server so the UI can't be bypassed.

// Image generation needs a Gemini key with billing enabled (the free tier has no image quota).
const TRY_ON_MODELS = [process.env.GEMINI_IMAGE_MODEL, 'gemini-3.1-flash-image', 'gemini-2.5-flash-image', 'gemini-3.1-flash-lite-image'].filter(
  (m): m is string => !!m,
);
const MAX_PHOTO_B64 = 6_000_000;
const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const RETRYABLE = new Set([404, 429, 500, 503, 504]);

const noStore = { 'Cache-Control': 'no-store, max-age=0' };
const fail = (error: string, status: number) => NextResponse.json({ error }, { status, headers: noStore });

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return fail('Try-on is not set up yet (no API key).', 500);

  let body: { handle?: unknown; photo?: { media_type?: unknown; data?: unknown } };
  try {
    body = await request.json();
  } catch {
    return fail('Invalid request.', 400);
  }

  const photo = body.photo;
  if (
    !photo ||
    typeof photo.data !== 'string' ||
    typeof photo.media_type !== 'string' ||
    !PHOTO_TYPES.includes(photo.media_type) ||
    photo.data.length === 0 ||
    photo.data.length > MAX_PHOTO_B64
  ) {
    return fail('Please add a photo (JPEG or PNG, under 5 MB).', 400);
  }

  const catalog = await loadCatalog().catch(() => null);
  const product = catalog?.products.find((p) => p.handle === body.handle);
  if (!product) return fail("Couldn't find that product.", 404);
  if (!product.tryOn) return fail('Try-on is only available for adult tees, track pants, shorts and joggers.', 403);
  if (!product.image) return fail("This product doesn't have a photo to try on.", 422);

  // the garment photo, fetched server-side from Shopify's CDN
  let garment: { mimeType: string; data: string };
  try {
    const url = `${product.image}${product.image.includes('?') ? '&' : '?'}width=1024`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(String(res.status));
    garment = {
      mimeType: res.headers.get('content-type')?.split(';')[0] || 'image/jpeg',
      data: Buffer.from(await res.arrayBuffer()).toString('base64'),
    };
  } catch {
    return fail("Couldn't load the product photo. Try again.", 502);
  }

  const slot = garmentSlot(product.title, product.type);
  const prompt = [
    'Image 1 is a photo of a person. Image 2 is a product photo of a clothing item: ' + `"${product.title}".`,
    `Create a realistic photo of the same person from image 1 wearing the ${slot === 'top' ? 'top' : 'bottoms'} from image 2,`,
    `replacing only the ${slot === 'top' ? 'top they are wearing' : 'trousers, shorts or skirt they are wearing'}.`,
    'Match the garment exactly: its colour, print, graphics, fabric and cut. It should fit naturally for their body.',
    "Keep the person's face, identity, hair, skin tone, body, pose, other clothing and the background unchanged.",
    'Photorealistic, same lighting and camera angle as image 1. Return only the image.',
  ].join(' ');

  const ai = new GoogleGenAI({ apiKey });
  let lastError: unknown;
  for (const model of TRY_ON_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: [
          {
            role: 'user',
            parts: [
              { inlineData: { mimeType: photo.media_type, data: photo.data } },
              { inlineData: garment },
              { text: prompt },
            ],
          },
        ],
        config: { responseModalities: ['IMAGE'], abortSignal: AbortSignal.timeout(60_000) },
      });
      const image = response.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data)?.inlineData;
      if (!image?.data) {
        // the model declined (e.g. the photo isn't suitable) rather than failing
        return fail("Couldn't create a preview from this photo. Try a clear, well-lit photo of yourself facing the camera.", 422);
      }
      return NextResponse.json(
        { image: `data:${image.mimeType ?? 'image/png'};base64,${image.data}`, model },
        { headers: noStore },
      );
    } catch (error) {
      lastError = error;
      if (error instanceof GeminiApiError && RETRYABLE.has(error.status)) continue; // try the next model
      break;
    }
  }

  if (lastError instanceof GeminiApiError && lastError.status === 429) {
    // Gemini's free tier has no image-generation quota: every image model answers 429 "check your plan and billing"
    if (/billing|plan/i.test(lastError.message)) {
      console.error('Try-on unavailable: the Gemini API key has no image-generation quota. Enable billing on its Google Cloud project.');
      return fail("Try-on isn't available right now. Please check back soon.", 503);
    }
    return fail('Too many try-ons right now. Try again in a minute.', 429);
  }
  // log the failure type only — never the request, which contains the shopper's photo
  console.error('Try-on failed:', lastError instanceof GeminiApiError ? `Gemini ${lastError.status}` : (lastError as Error)?.name);
  return fail('Try-on is busy right now. Try again in a moment.', 503);
}
