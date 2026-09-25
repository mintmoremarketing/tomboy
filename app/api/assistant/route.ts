import { ApiError as GeminiApiError, GoogleGenAI, ThinkingLevel, type Content } from '@google/genai';
import { NextResponse } from 'next/server';
import { loadCatalog, type Audience, type Catalog } from '@/lib/assistant-catalog';

// Scout — Tomboy's shopping assistant (the red orb in the header).
// Ported from KeepUp's "Bouncy" agenda-ai function: Gemini with a hedged race
// across Flash models (the first good answer wins), model discovery when the
// known ones fail, JSON-schema output and minimal thinking for fast replies.
// Instead of tasks it gets the live Shopify catalog, so it can recommend real
// products; @tagged products/categories and attached images focus the answer.

// Flash-Lite is Google's lowest-latency model and plenty for shopping chat; bigger Flash models are fallbacks.
const GEMINI_MODEL = process.env.GEMINI_MODEL ?? 'gemini-3.5-flash-lite';
// Tried in order when the preferred model is overloaded, rate limited or unavailable.
const GEMINI_FALLBACKS = ['gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-3.1-flash-lite'];
// If the current model hasn't answered after HEDGE_MS, the next starts alongside it.
const GEMINI_HEDGE_MS = 2_500;
const GEMINI_TOTAL_TIMEOUT_MS = 35_000;
// Replies are small JSON; capping output stops a model that gets stuck emitting padding in JSON mode.
const GEMINI_MAX_OUTPUT_TOKENS = 2_048;
const GEMINI_RETRYABLE = new Set([404, 429, 500, 503, 504]);

const MAX_MESSAGE_CHARS = 1_500;
const MAX_HISTORY = 12;
const MAX_IMAGES = 4;
const MAX_IMAGE_B64 = 5_000_000;
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const AUDIENCES: Audience[] = ['men', 'women', 'kids'];

// Set once a working model has been found (survives while the server stays warm).
let discoveredGeminiModel: string | null = null;

// ---------- prompt ----------

const SYSTEM_PROMPT = `You are Scout, the shopping assistant for Tomboy India, a comfort-first innerwear and basics brand (men, women and kids).

Voice: warm, playful, confident, brief. Plain words, no corporate filler. Replies are 1-3 short sentences unless the shopper asks for detail. Use Indian context (prices in Rs.).

What you know about Tomboy:
- Fabric: 100% super combed cotton; breathable, soft, anti-odour, moisture-wicking.
- Fit: made for Indian sizing, no-pinch waistbands that don't dig in or roll down.
- Free shipping across India on orders over Rs. 899. Easy 7-day returns and exchanges.
- Garments are double-stitched to last 100+ washes.
Anything not listed here (exact size charts, stock, delivery dates, discounts, order status) you don't know: say so briefly and point the shopper to the product page or customer support. Never invent policies, prices, sizes or products.

Recommending products:
- Only recommend products from the catalog, by their exact handle, at most 4 per reply, best match first.
- Match the shopper's audience (men / women / kids) unless they ask for someone else.
- When the shopper @tags products or categories, focus your answer on those. When they ask to compare, give a short side-by-side on fabric, fit, price and best use, then a clear pick.
- When the shopper's saved sizes are given below, every reply that recommends or compares products must say which size to order (e.g. "go for L, your usual"), and lean towards their preferred fit. If they're buying a gift, recommend for the gift recipient instead.
- When the shopper attaches a photo (a garment, an outfit, a size tag), use what you see to find the closest matches in the catalog.
- Say in a few words why each pick fits; the product cards already show the name and price.

Off-topic requests: politely steer back to clothing, comfort and shopping at Tomboy.

Always respond with the JSON object the schema describes:
- reply: what you say to the shopper.
- products: catalog handles to show as cards (empty when none fit).
- suggestions: up to 3 short follow-up questions the shopper might tap next, in their voice.`;

const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    reply: { type: 'string' },
    products: { type: 'array', items: { type: 'string' } },
    suggestions: { type: 'array', items: { type: 'string' } },
  },
  required: ['reply', 'products', 'suggestions'],
};

const REFUSAL = JSON.stringify({ reply: "I can't help with that one, but I'm great at comfy cotton.", products: [], suggestions: [] });

const PROFILE_LABELS: Record<string, string> = {
  menUnderwear: "men's underwear size",
  menTop: "men's vest/tee size",
  womenBra: 'bra size',
  womenPanty: 'panty size',
  kidAge: "kid's age",
  kidSize: "kid's usual size",
  fit: 'preferred fit',
  notes: 'notes',
};

// "My sizes" from the + menu, as prompt lines (only known fields, trimmed).
function profileLines(profile: unknown): string[] {
  if (!profile || typeof profile !== 'object') return [];
  return Object.entries(profile as Record<string, unknown>)
    .filter(([k, v]) => k in PROFILE_LABELS && typeof v === 'string' && v.trim())
    .map(([k, v]) => `- ${PROFILE_LABELS[k]}: ${String(v).trim().slice(0, 60)}`);
}

function contextBlock(catalog: Catalog, audience: Audience, tags: string[], profile?: unknown, gift?: string) {
  const lines = catalog.products.map((p) => `${p.handle} | @${p.tag} | ${p.title} | ${p.type} | ${p.price} | ${p.audience}`);
  const tagged: string[] = [];
  for (const tag of tags) {
    const product = catalog.products.find((p) => p.tag === tag);
    if (product) tagged.push(`@${tag} = product ${product.handle} (${product.title})`);
    const category = catalog.categories.find((c) => c.tag === tag);
    if (category) tagged.push(`@${tag} = category "${category.name}" (${category.audience}): ${category.handles.join(', ') || 'no products listed'}`);
  }
  return [
    `<catalog>\nhandle | tag | title | type | from price | audience\n${lines.join('\n')}\n</catalog>`,
    `The shopper is browsing the ${audience} lineup.`,
    tagged.length ? `The shopper tagged:\n${tagged.join('\n')}` : '',
    profileLines(profile).length ? `The shopper's saved sizes:\n${profileLines(profile).join('\n')}` : '',
    gift ? `The shopper is buying a gift for: ${gift.slice(0, 80)}` : '',
  ]
    .filter(Boolean)
    .join('\n\n');
}

// ---------- Gemini (ported from KeepUp) ----------

class AssistantError extends Error {
  constructor(
    message: string,
    readonly status: number,
    public details?: string, // what each model did, shown under the error in the chat
  ) {
    super(message);
  }
}

const isTimeout = (e: unknown) => e instanceof Error && (e.name === 'TimeoutError' || e.name === 'AbortError');

async function discoverGeminiModels(ai: GoogleGenAI): Promise<string[]> {
  const candidates: { id: string; version: number; stable: boolean }[] = [];
  for await (const m of await ai.models.list()) {
    const id = (m.name ?? '').replace(/^models\//, '');
    if (!m.supportedActions?.includes('generateContent')) continue;
    if (!/^gemini-[\d.]+-flash/.test(id)) continue;
    if (/live|image|tts|audio|embed|thinking|8b/.test(id)) continue;
    candidates.push({
      id,
      version: Number.parseFloat(id.match(/^gemini-([\d.]+)/)?.[1] ?? '0'),
      stable: !/preview|exp|latest/.test(id),
    });
  }
  candidates.sort((a, b) => Number(b.stable) - Number(a.stable) || b.version - a.version || a.id.length - b.id.length);
  return candidates.map((c) => c.id);
}

function geminiFailure(error: unknown): AssistantError {
  if (error instanceof GeminiApiError) {
    if (error.status === 429) return new AssistantError('Free-tier limit reached. Try again in a minute.', 429);
    if (error.status === 503 || error.status === 500 || error.status === 504)
      return new AssistantError('Gemini is overloaded right now. Try again in a moment.', 503);
    if (error.status === 400 || error.status === 401 || error.status === 403)
      return new AssistantError(`The assistant is not configured correctly (Gemini ${error.status}).`, 500);
    return new AssistantError(`Assistant error (Gemini ${error.status}).`, 502);
  }
  if (isTimeout(error)) return new AssistantError('Gemini is responding slowly right now. Try again in a moment.', 504);
  return new AssistantError('Could not reach Gemini.', 502);
}

const geminiRetryable = (e: unknown) =>
  isTimeout(e) ||
  (e instanceof Error && e.message === 'MAX_TOKENS') ||
  (e instanceof GeminiApiError && GEMINI_RETRYABLE.has(e.status));

async function callGemini(
  apiKey: string,
  systemInstruction: string,
  history: { role: 'user' | 'assistant'; text: string }[],
  message: string,
  images: { media_type: string; data: string }[],
): Promise<{ raw: string; model: string; tried: string[] }> {
  const ai = new GoogleGenAI({ apiKey });
  const contents: Content[] = [
    ...history.map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.text }] })),
    {
      role: 'user',
      parts: [
        ...images.map((img) => ({ inlineData: { mimeType: img.media_type, data: img.data } })),
        { text: message || 'What do you make of this?' },
      ],
    },
  ];

  const stop = new AbortController(); // cancels the losers once one model answers
  const failures: string[] = [];
  const describe = (e: unknown) =>
    e instanceof GeminiApiError ? `error ${e.status}` : isTimeout(e) ? 'timed out' : e instanceof Error ? e.message : 'failed';

  // One model call; retries once without the thinking setting if the model rejects it.
  const runOne = async (model: string, signal: AbortSignal): Promise<string> => {
    for (const thinking of [true, false]) {
      const started = Date.now();
      try {
        const response = await ai.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseJsonSchema: RESPONSE_SCHEMA,
            maxOutputTokens: GEMINI_MAX_OUTPUT_TOKENS,
            // Minimal thinking = fastest first token; the task is simple.
            ...(thinking ? { thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL } } : {}),
            abortSignal: signal,
          },
        });
        if (response.promptFeedback?.blockReason) return REFUSAL;
        // Hit the output cap: almost always runaway padding, not a real answer. Treat as a failed attempt.
        if (response.candidates?.[0]?.finishReason === 'MAX_TOKENS') throw new Error('MAX_TOKENS');
        return response.text ?? '';
      } catch (error) {
        if (stop.signal.aborted) throw error; // lost the race: cancelled on purpose, not a failure
        failures.push(`${model}: ${describe(error)} after ${((Date.now() - started) / 1000).toFixed(1)}s`);
        if (thinking && error instanceof GeminiApiError && error.status === 400 && /thinking/i.test(error.message)) continue;
        throw error;
      }
    }
    throw new Error('unreachable');
  };

  const models = [...new Set([discoveredGeminiModel, GEMINI_MODEL, ...GEMINI_FALLBACKS].filter((m): m is string => !!m))];
  const tried: string[] = [];
  const signal = AbortSignal.any([stop.signal, AbortSignal.timeout(GEMINI_TOTAL_TIMEOUT_MS)]);

  return await new Promise((resolve, reject) => {
    let next = 0;
    let running = 0;
    let settled = false;
    let discovered = false;
    let discovering = false;
    let lastError: unknown;
    let hedge: ReturnType<typeof setTimeout> | undefined;

    const finish = (fn: () => void) => {
      if (settled) return;
      settled = true;
      clearTimeout(hedge);
      stop.abort();
      fn();
    };

    const withDetails = (e: AssistantError) => {
      e.details = failures.join(' · ') || undefined;
      return e;
    };

    // Out of known models: look up this key's other models once, straight away.
    const exhausted = async () => {
      if (!discovered && (lastError === undefined || geminiRetryable(lastError))) {
        discovered = discovering = true;
        const more = await discoverGeminiModels(ai).catch(() => [] as string[]);
        discovering = false;
        models.push(...more.filter((m) => !models.includes(m)).slice(0, 3));
        if (next < models.length) return launch();
      }
      if (running === 0 && !discovering) finish(() => reject(withDetails(geminiFailure(lastError))));
    };

    const launch = () => {
      if (settled) return;
      if (next >= models.length) {
        if (!discovered || running === 0) void exhausted();
        return;
      }
      const model = models[next++];
      tried.push(model);
      running++;
      runOne(model, signal).then(
        (raw) =>
          finish(() => {
            discoveredGeminiModel = model; // try the winner first next time
            resolve({ raw, model, tried });
          }),
        (error) => {
          running--;
          if (settled) return;
          lastError = error;
          if (!geminiRetryable(error)) return finish(() => reject(withDetails(geminiFailure(error))));
          launch(); // failed fast (busy / retired): start the next model right away
        },
      );
      clearTimeout(hedge);
      hedge = setTimeout(launch, GEMINI_HEDGE_MS); // still waiting: start the next one in parallel
    };

    launch();
  });
}

// ---------- routes ----------

// GET /api/assistant → the @tags the chat input can offer
export async function GET() {
  try {
    const catalog = await loadCatalog();
    return NextResponse.json({
      products: catalog.products.map(({ tag, handle, title, audience, price, image }) => ({
        tag,
        handle,
        title,
        audience,
        price,
        thumb: image ? `${image}${image.includes('?') ? '&' : '?'}width=120` : null,
      })),
      categories: catalog.categories.map(({ tag, name, audience, handles }) => ({
        tag,
        name,
        audience,
        count: handles.length,
        handles,
      })),
    });
  } catch (error) {
    console.error('Assistant catalog error:', error);
    return NextResponse.json({ error: "Couldn't load the catalog." }, { status: 502 });
  }
}

// POST /api/assistant { message, images, history, mentions, audience } → { reply, products, suggestions, raw, meta }
export async function POST(request: Request) {
  const started = Date.now();
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const message = typeof body.message === 'string' ? body.message.trim().slice(0, MAX_MESSAGE_CHARS) : '';
  const images: { media_type: string; data: string }[] = (Array.isArray(body.images) ? body.images : [])
    .filter(
      (i: any) =>
        i && IMAGE_TYPES.includes(i.media_type) && typeof i.data === 'string' && i.data.length > 0 && i.data.length <= MAX_IMAGE_B64,
    )
    .slice(0, MAX_IMAGES);
  if (!message && images.length === 0) return NextResponse.json({ error: 'Say something first.' }, { status: 400 });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error: 'Scout has no API key yet.',
        details: 'Add GEMINI_API_KEY to .env.local (and to your Vercel environment variables), then restart the dev server.',
      },
      { status: 500 },
    );
  }

  const audience: Audience = AUDIENCES.includes(body.audience) ? body.audience : 'men';
  const mentions: string[] = (Array.isArray(body.mentions) ? body.mentions : [])
    .filter((t: unknown): t is string => typeof t === 'string')
    .slice(0, 12);
  const history: { role: 'user' | 'assistant'; text: string }[] = (Array.isArray(body.history) ? body.history : [])
    .filter((t: any) => t && (t.role === 'user' || t.role === 'assistant') && typeof t.text === 'string' && t.text)
    .slice(-MAX_HISTORY);
  while (history.length && history[0].role !== 'user') history.shift();

  let catalog: Catalog;
  try {
    catalog = await loadCatalog();
  } catch (error) {
    console.error('Assistant catalog error:', error);
    return NextResponse.json({ error: "Couldn't load the catalog right now. Try again in a moment." }, { status: 502 });
  }
  const tCatalog = Date.now();

  let result: { raw: string; model: string; tried: string[] };
  try {
    const gift = typeof body.gift === 'string' && body.gift.trim() ? body.gift.trim() : undefined;
    result = await callGemini(
      apiKey,
      `${SYSTEM_PROMPT}\n\n${contextBlock(catalog, audience, mentions, body.profile, gift)}`,
      history,
      message,
      images,
    );
  } catch (error) {
    if (error instanceof AssistantError) {
      return NextResponse.json({ error: error.message, details: error.details }, { status: error.status });
    }
    console.error('Assistant error:', error);
    return NextResponse.json({ error: 'Scout ran into a problem. Try again.' }, { status: 502 });
  }
  const tAi = Date.now();

  let parsed: { reply?: unknown; products?: unknown; suggestions?: unknown };
  try {
    parsed = JSON.parse(result.raw);
  } catch {
    return NextResponse.json({ error: 'Scout gave an answer I could not read. Try again.' }, { status: 502 });
  }

  const byHandle = new Map(catalog.products.map((p) => [p.handle, p]));
  const products = (Array.isArray(parsed.products) ? parsed.products : [])
    .filter((h): h is string => typeof h === 'string' && byHandle.has(h))
    .filter((h, i, all) => all.indexOf(h) === i)
    .slice(0, 4)
    .map((h) => {
      const p = byHandle.get(h)!;
      return {
        handle: p.handle,
        tag: p.tag,
        title: p.title,
        price: p.price,
        image: p.image ? `${p.image}${p.image.includes('?') ? '&' : '?'}width=360` : null,
      };
    });
  const suggestions = (Array.isArray(parsed.suggestions) ? parsed.suggestions : [])
    .filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
    .slice(0, 3);

  return NextResponse.json({
    reply: typeof parsed.reply === 'string' ? parsed.reply : '',
    products,
    suggestions,
    raw: result.raw, // replayed as the model's turn in later history, like KeepUp
    meta: {
      model: result.model,
      tried: result.tried,
      ms: { catalog: tCatalog - started, ai: tAi - tCatalog, total: Date.now() - started },
    },
  });
}
