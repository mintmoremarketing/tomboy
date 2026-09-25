"use client";

// Client helpers for Scout, ported from KeepUp (src/lib/ai.ts, src/lib/chats.ts).
// Chats are kept in localStorage instead of Supabase: shoppers aren't signed in.

export interface AiImage {
  media_type: string;
  data: string; // base64, no data: prefix
  previewUrl: string;
}

export interface ProductCard {
  handle: string;
  tag: string;
  title: string;
  price: string;
  image: string | null;
}

export interface AiMeta {
  model: string;
  tried: string[];
  ms: { catalog: number; ai: number; total: number };
}

export type Entry =
  | { id: string; role: "user"; text: string; images: string[]; imageCount?: number; mentions: string[] }
  | {
      id: string;
      role: "assistant";
      text: string;
      raw: string; // the model's JSON, replayed as its turn in later history
      products: ProductCard[];
      suggestions: string[];
      ms: number;
      meta?: AiMeta;
    }
  | { id: string; role: "error"; text: string; details?: string };

export interface ChatSummary {
  id: string;
  title: string;
  updated_at: string;
}

interface StoredChat extends ChatSummary {
  entries: Entry[];
}

const CHATS_KEY = "tomboy-scout-chats";
const MAX_CHATS = 30;

export const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;

function readChats(): StoredChat[] {
  try {
    return JSON.parse(window.localStorage.getItem(CHATS_KEY) ?? "[]") as StoredChat[];
  } catch {
    return [];
  }
}

function writeChats(chats: StoredChat[]) {
  window.localStorage.setItem(CHATS_KEY, JSON.stringify(chats.slice(0, MAX_CHATS)));
}

export function listChats(): ChatSummary[] {
  return readChats()
    .map(({ id, title, updated_at }) => ({ id, title, updated_at }))
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at));
}

export function loadChat(id: string): Entry[] {
  return readChats().find((c) => c.id === id)?.entries ?? [];
}

// Photos are kept as small previews only; full images would fill localStorage.
const forStorage = (entries: Entry[]): Entry[] =>
  entries.map((e) => (e.role === "user" && e.images.length ? { ...e, images: [], imageCount: e.images.length } : e));

export function saveChat(id: string, title: string, entries: Entry[]) {
  const chats = readChats().filter((c) => c.id !== id);
  chats.unshift({ id, title, updated_at: new Date().toISOString(), entries: forStorage(entries).slice(-60) });
  writeChats(chats);
}

export function deleteChat(id: string) {
  writeChats(readChats().filter((c) => c.id !== id));
}

// Downscale to ≤1568px on the long edge and re-encode as JPEG to keep requests small.
export async function prepareImage(file: Blob): Promise<AiImage> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1568 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#ffffff"; // flatten transparency
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
  return { media_type: "image/jpeg", data: dataUrl.split(",")[1], previewUrl: dataUrl };
}

// Grab one frame of a screen/window/tab the user picks.
export async function captureScreenshot(): Promise<Blob | null> {
  if (!navigator.mediaDevices?.getDisplayMedia) return null;
  const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  try {
    video.srcObject = stream;
    await video.play();
    await new Promise((r) => setTimeout(r, 150)); // let a real frame arrive
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    if (!canvas.width || !canvas.height) return null;
    canvas.getContext("2d")!.drawImage(video, 0, 0);
    return await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  } finally {
    stream.getTracks().forEach((t) => t.stop());
    video.srcObject = null;
  }
}

// ---------- shopper context for the "+" menu ----------

export type Audience = "men" | "women" | "kids";
export type Fit = "snug" | "regular" | "relaxed";

// "My sizes": saved once in this browser, sent with every question.
export interface SizeProfile {
  menUnderwear?: string; // S / M / L / XL / XXL
  menTop?: string;
  womenBra?: string; // e.g. 34B
  womenPanty?: string;
  kidAge?: string;
  kidSize?: string;
  fit?: Fit;
  notes?: string; // e.g. "sensitive skin"
}

// "Shopping for…": who this chat is shopping for, independent of the site's audience.
export interface ShoppingFor {
  audience: Audience;
  gift?: string; // e.g. "my dad, size L"
}

const PROFILE_KEY = "tomboy-scout-sizes";
const RECENT_KEY = "tomboy-recently-viewed";

export function loadProfile(): SizeProfile {
  try {
    return JSON.parse(window.localStorage.getItem(PROFILE_KEY) ?? "{}") as SizeProfile;
  } catch {
    return {};
  }
}

export function saveProfile(profile: SizeProfile) {
  try {
    window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {
    // storage blocked: the sizes still apply to this session
  }
}

export const hasProfile = (p: SizeProfile) => Object.values(p).some((v) => typeof v === "string" && v.trim());

// Product pages record what the shopper opened, newest first.
export function recordRecentlyViewed(handle: string) {
  try {
    const list = loadRecentlyViewed().filter((h) => h !== handle);
    window.localStorage.setItem(RECENT_KEY, JSON.stringify([handle, ...list].slice(0, 12)));
  } catch {
    // ignore
  }
}

export function loadRecentlyViewed(): string[] {
  try {
    return JSON.parse(window.localStorage.getItem(RECENT_KEY) ?? "[]") as string[];
  } catch {
    return [];
  }
}
