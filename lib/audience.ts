// The shopper's lineup (Men / Women / Kids). Kept in localStorage for the client and mirrored
// into a cookie so the server renders the homepage in the right lineup straight away (no
// flash of Men before switching).
export type Audience = "men" | "women" | "kids";
export const AUDIENCE_KEY = "tomboy-audience";

export const isAudience = (v: unknown): v is Audience => v === "men" || v === "women" || v === "kids";

export function saveAudience(value: Audience) {
  try {
    window.localStorage.setItem(AUDIENCE_KEY, value);
  } catch {}
  document.cookie = `${AUDIENCE_KEY}=${value}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
}
