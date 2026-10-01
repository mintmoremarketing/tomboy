import { ApiError as GeminiApiError, GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

// Fit Finder: estimates body measurements from one photo of an adult wearing a fitted tee.
//
// Privacy: the photo only lives in this request's memory. It's sent to Google's Gemini API
// to read the measurements and is never written to disk, a database or the logs; only the
// numbers go back to the browser. Responses are marked no-store.
//
// Safety: adults only, fully clothed only. The model is told to refuse anything else, and
// the Fit Finder never offers photos for kids.

const MODELS = [process.env.GEMINI_MODEL, 'gemini-3.5-flash-lite', 'gemini-3.5-flash', 'gemini-3.6-flash', 'gemini-3.1-flash-lite'].filter(
  (m, i, all): m is string => !!m && all.indexOf(m) === i,
);
const RETRYABLE = new Set([404, 429, 500, 503, 504]);
const MAX_PHOTO_B64 = 6_000_000;
const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const noStore = { 'Cache-Control': 'no-store, max-age=0' };
const fail = (error: string, status: number) => NextResponse.json({ error }, { status, headers: noStore });

const SCHEMA = {
  type: 'object',
  properties: {
    usable: { type: 'boolean', description: 'false if the photo cannot or must not be measured' },
    reason: { type: 'string', description: 'when not usable: a short, friendly reason for the shopper' },
    chest_in: { type: 'number', description: 'chest (or bust) circumference in inches' },
    waist_in: { type: 'number', description: 'natural waist circumference in inches' },
    hip_in: { type: 'number', description: 'hip circumference in inches' },
    confidence: { type: 'string', enum: ['low', 'medium', 'high'] },
    note: { type: 'string', description: 'one short tip, e.g. what would make the estimate better' },
  },
  required: ['usable'],
};

const PROMPT = (heightCm: number, weightKg: number | null, audience: string) =>
  [
    `Estimate this person's body measurements for clothing sizing. They say they are ${heightCm} cm tall` +
      (weightKg ? ` and weigh ${weightKg} kg` : '') +
      ` and shop ${audience === 'women' ? "women's" : "men's"} sizes.`,
    'Use their height as the scale reference: compare shoulder width, torso width and depth against their full height, and allow for the fit of the clothes they are wearing.',
    'Return chest (bust), natural waist and hip circumferences in inches, rounded to whole numbers, and how confident you are.',
    'Set usable=false with a short friendly reason if: there is no person, more than one person, the full body (head to feet, or at least head to knees) is not visible,',
    'the person looks under 18, or they are not fully clothed (e.g. underwear, swimwear or shirtless). Never describe the person beyond what is needed for sizing.',
  ].join(' ');

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return fail('Fit Finder is not set up yet.', 500);

  let body: { photo?: { media_type?: unknown; data?: unknown }; heightCm?: unknown; weightKg?: unknown; audience?: unknown };
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
    return fail('Please add a photo (JPEG or PNG).', 400);
  }
  const heightCm = Number(body.heightCm);
  if (!(heightCm >= 120 && heightCm <= 230)) return fail('Please enter your height (120 to 230 cm).', 400);
  const weightKg = Number(body.weightKg) > 25 && Number(body.weightKg) < 250 ? Math.round(Number(body.weightKg)) : null;
  const audience = body.audience === 'women' ? 'women' : 'men';

  const ai = new GoogleGenAI({ apiKey });
  let lastError: unknown;
  for (const model of MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: [
          {
            role: 'user',
            parts: [{ inlineData: { mimeType: photo.media_type, data: photo.data } }, { text: PROMPT(heightCm, weightKg, audience) }],
          },
        ],
        config: {
          responseMimeType: 'application/json',
          responseJsonSchema: SCHEMA,
          maxOutputTokens: 512,
          abortSignal: AbortSignal.timeout(30_000),
        },
      });
      if (response.promptFeedback?.blockReason) {
        return NextResponse.json({ usable: false, reason: "This photo can't be used. Try a full-length photo in everyday clothes." }, { headers: noStore });
      }
      const data = JSON.parse(response.text ?? '{}');
      const clamp = (n: unknown, lo: number, hi: number) => (typeof n === 'number' && n >= lo && n <= hi ? Math.round(n) : undefined);
      return NextResponse.json(
        {
          usable: data.usable === true,
          reason: typeof data.reason === 'string' ? data.reason.slice(0, 200) : undefined,
          chestIn: clamp(data.chest_in, 24, 70),
          waistIn: clamp(data.waist_in, 20, 65),
          hipIn: clamp(data.hip_in, 26, 70),
          confidence: ['low', 'medium', 'high'].includes(data.confidence) ? data.confidence : 'low',
          note: typeof data.note === 'string' ? data.note.slice(0, 200) : undefined,
        },
        { headers: noStore },
      );
    } catch (error) {
      lastError = error;
      if (error instanceof GeminiApiError && RETRYABLE.has(error.status)) continue; // next model
      if (error instanceof SyntaxError) continue; // unreadable answer: try the next model
      break;
    }
  }
  // log the failure type only — never the request, which contains the shopper's photo
  console.error('Fit Finder failed:', lastError instanceof GeminiApiError ? `Gemini ${lastError.status}` : (lastError as Error)?.name);
  if (lastError instanceof GeminiApiError && lastError.status === 429) return fail('Too many requests right now. Try again in a minute, or enter your details instead.', 429);
  return fail("Couldn't read the photo right now. Try again, or enter your details instead.", 503);
}
