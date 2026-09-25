"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ClipboardEvent,
  type DragEvent,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { LiveOrb } from "@/components/ui/live-orb";
import { useScoutQuip } from "@/components/assistant/quips";
import {
  captureScreenshot,
  clearAssistantData,
  deleteChat,
  hasProfile,
  listChats,
  loadChat,
  loadProfile,
  loadRecentlyViewed,
  newId,
  prepareImage,
  saveChat,
  saveProfile,
  type AiImage,
  type ChatSummary,
  type Entry,
  type ShoppingFor,
  type SizeProfile,
} from "@/components/assistant/client";
import { ProductPickSheet, ShoppingForSheet, SizesSheet } from "@/components/assistant/sheets";
import { TryOnDialog, type TryOnProduct } from "@/components/assistant/try-on-dialog";

// Scout — Tomboy's shopping assistant. A port of KeepUp's Bouncy AssistantPanel
// (same layout, orb moods, thought bubble, @tags, attachments, history), with
// tasks swapped for Tomboy products and categories. Styles: `.ap-*` in globals.css.

type Audience = "men" | "women" | "kids";

const ORB = { color: "#FF3333", eyeColor: "#FAFAFA" } as const;

interface TagProduct {
  tag: string;
  handle: string;
  title: string;
  audience: Audience;
  price: string;
  thumb: string | null;
}
interface TagCategory {
  tag: string;
  name: string;
  audience: Audience;
  count: number;
  handles: string[];
}

// "@query" right before the caret (at the start or after a space), or null. Tags have no spaces.
function mentionAt(value: string, caret: number) {
  const m = value.slice(0, caret).match(/(?:^|\s)@([^\s@]{0,40})$/);
  return m ? { start: caret - m[1].length - 1, query: m[1] } : null;
}

// Splits text so each known "@tag" can be drawn as a pill.
// `inline`: pills in the input backdrop must not change the text's width (they sit behind the textarea's caret).
function withMentions(text: string, tags: string[], inline = false) {
  if (!tags.length) return text;
  const alternatives = [...tags]
    .sort((a, b) => b.length - a.length)
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");
  return text.split(new RegExp(`(@(?:${alternatives}))(?![a-z0-9-])`, "gi")).map((part, i) =>
    part.startsWith("@") && tags.includes(part.slice(1).toLowerCase()) ? (
      <span key={i} className={`ap-pill ${inline ? "ap-pill--inline" : ""}`}>
        {part}
      </span>
    ) : (
      part
    ),
  );
}

const STARTERS: Record<Audience, string[]> = {
  men: ["Which briefs don't pinch?", "Boxers for hot summers?", "Help me pick a size"],
  women: ["A bra for all-day comfort?", "What's softest for sensitive skin?", "Help me pick a size"],
  kids: ["Something comfy for school?", "Best pick for active kids?", "What's easiest to wash?"],
};

const Icon = ({ d, size = 16 }: { d: string; size?: number }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d={d} />
  </svg>
);
const PLUS = "M12 5v14M5 12h14";
const ENTER = "M9 10l-5 5 5 5M20 4v7a4 4 0 0 1-4 4H4";
const IMAGE = "M4 5h16v14H4zM4 15l4-4 5 5 3-3 4 4M15 9h.01";
const MONITOR = "M3 4h18v12H3zM8 20h8M12 16v4";
const RULER = "M3 17l14-14 4 4-14 14zM7 13l2 2M10 10l2 2M13 7l2 2";
const TAG = "M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8zM7.5 7.5h.01";
const EYE = "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z";
const COLUMNS = "M4 4h6v16H4zM14 4h6v16h-6z";
const GIFT = "M20 12v9H4v-9M2 7h20v5H2zM12 21V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z";
const CLOSE = "M18 6L6 18M6 6l12 12";
const CLOCK = "M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0";
const PEN = "M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z";
const BACK = "M15 18l-6-6 6-6";

function Spinner() {
  return (
    <svg viewBox="0 0 24 24" width={16} height={16} className="ap-spin" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

const dayKey = (d: Date | string) => new Date(d).toISOString().slice(0, 10);

// Today / Yesterday / Previous 7 days / Earlier, like modern chat apps.
function groupChats(chats: ChatSummary[]) {
  const today = dayKey(new Date());
  const yesterday = dayKey(new Date(Date.now() - 86_400_000));
  const weekAgo = dayKey(new Date(Date.now() - 7 * 86_400_000));
  const groups: { label: string; chats: ChatSummary[] }[] = [
    { label: "Today", chats: [] },
    { label: "Yesterday", chats: [] },
    { label: "Previous 7 days", chats: [] },
    { label: "Earlier", chats: [] },
  ];
  for (const c of chats) {
    const k = dayKey(c.updated_at);
    groups[k === today ? 0 : k === yesterday ? 1 : k >= weekAgo ? 2 : 3].chats.push(c);
  }
  return groups.filter((g) => g.chats.length);
}

export function AssistantPanel({
  open,
  onOpenChange,
  audience: siteAudience,
  currentProduct = null,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  audience: Audience;
  /** The product page being viewed, if any: "This product" in the + menu attaches it. */
  currentProduct?: { handle: string } | null;
}) {
  // "Shopping for…" can point this chat at another audience (or a gift) without touching the site's.
  const [shoppingFor, setShoppingFor] = useState<ShoppingFor | null>(null);
  const audience: Audience = shoppingFor?.audience ?? siteAudience;
  const [profile, setProfile] = useState<SizeProfile>({});
  useEffect(() => setProfile(loadProfile()), []);
  const [sheet, setSheet] = useState<"sizes" | "recent" | "compare" | "for" | null>(null);
  const [tryOn, setTryOn] = useState<TryOnProduct | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [chatTitle, setChatTitle] = useState<string | null>(null);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [view, setView] = useState<"chat" | "history">("chat");
  const [chats, setChats] = useState<ChatSummary[] | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [text, setText] = useState("");
  // Typing paused for a moment: Scout looks up at its thought bubble instead of reading along.
  const [typingPaused, setTypingPaused] = useState(false);
  useEffect(() => {
    setTypingPaused(false);
    const t = window.setTimeout(() => setTypingPaused(true), 900);
    return () => window.clearTimeout(t);
  }, [text]);
  const [images, setImages] = useState<AiImage[]>([]);
  const [pending, setPending] = useState(false);
  const quip = useScoutQuip(text, pending, open);
  const [elapsed, setElapsed] = useState(0); // ms since the current request started
  const [menuOpen, setMenuOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [dancing, setDancing] = useState<"header" | "hero" | null>(null);
  const danceTimer = useRef<number | undefined>(undefined);
  // Phones have no hover: a tap on Scout makes it dance for a moment instead.
  const tapDance = (where: "header" | "hero") => (e: { pointerType: string }) => {
    if (e.pointerType === "mouse") return;
    window.clearTimeout(danceTimer.current);
    setDancing(where);
    danceTimer.current = window.setTimeout(() => setDancing(null), 1400);
  };
  const [picker, setPicker] = useState<{ start: number; query: string } | null>(null);
  const [pickerIndex, setPickerIndex] = useState(0);
  const [tagProducts, setTagProducts] = useState<TagProduct[]>([]);
  const [tagCategories, setTagCategories] = useState<TagCategory[]>([]);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const backdrop = useRef<HTMLDivElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const threadEnd = useRef<HTMLDivElement>(null);
  const sending = useRef(false); // blocks a second send before `pending` state has updated
  const chatId = useRef<string | null>(null);
  const chatTitleRef = useRef<string | null>(null); // state lags inside send(); saves read this

  const focusInput = () => window.setTimeout(() => textarea.current?.focus(), 0);

  // The @tags: loaded once, the first time the panel opens.
  useEffect(() => {
    if (!open || tagProducts.length) return;
    fetch("/api/assistant")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.products)) setTagProducts(data.products);
        if (Array.isArray(data.categories)) setTagCategories(data.categories);
      })
      .catch(() => {});
  }, [open, tagProducts.length]);

  // "/" opens Scout from anywhere; Esc backs out of history or menus, then closes.
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (e.key === "/" && !el.closest('input, textarea, select, [contenteditable="true"]')) {
        e.preventDefault();
        onOpenChange(true);
        setView("chat");
        focusInput();
      }
      if (e.key === "Escape" && open) {
        if (menuOpen || view === "history") {
          setMenuOpen(false);
          setView("chat");
        } else onOpenChange(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onOpenChange, open, menuOpen, view]);

  useEffect(() => {
    if (open) focusInput();
  }, [open]);

  useEffect(() => {
    if (view === "chat") threadEnd.current?.scrollIntoView({ block: "end" });
  }, [entries, pending, view, open]);

  // Saving is best-effort: storage being full or blocked must never break the conversation.
  const persist = (all: Entry[], firstMessage?: string) => {
    try {
      if (!chatId.current) {
        chatId.current = newId();
        chatTitleRef.current = firstMessage || "Image";
        setActiveChatId(chatId.current);
        setChatTitle(chatTitleRef.current);
      }
      saveChat(chatId.current, chatTitleRef.current ?? "Chat", all);
    } catch {
      // ignore
    }
  };

  const newChat = () => {
    chatId.current = null;
    chatTitleRef.current = null;
    setActiveChatId(null);
    setEntries([]);
    setChatTitle(null);
    setView("chat");
    focusInput();
  };

  const showHistory = () => {
    setView("history");
    setConfirmDeleteId(null);
    setChats(listChats());
  };

  const openChat = (chat: ChatSummary) => {
    setEntries(loadChat(chat.id));
    chatId.current = chat.id;
    chatTitleRef.current = chat.title;
    setActiveChatId(chat.id);
    setChatTitle(chat.title);
    setView("chat");
    focusInput();
  };

  const removeChat = (chat: ChatSummary) => {
    if (confirmDeleteId !== chat.id) return setConfirmDeleteId(chat.id);
    deleteChat(chat.id);
    setChats((prev) => prev?.filter((c) => c.id !== chat.id) ?? null);
    if (activeChatId === chat.id) newChat();
  };

  const addFiles = async (files: Iterable<Blob>) => {
    const list = [...files].filter((f) => f.type.startsWith("image/"));
    const prepared = await Promise.all(list.map((f) => prepareImage(f).catch(() => null)));
    setImages((prev) => [...prev, ...prepared.filter((p): p is AiImage => p !== null)].slice(0, 4));
  };

  const takeScreenshot = async () => {
    setMenuOpen(false);
    try {
      const shot = await captureScreenshot();
      if (shot) await addFiles([shot]);
    } catch {
      // user cancelled the screen picker
    }
    textarea.current?.focus();
  };

  // @tags: every product has one (@classic-briefs), and every category is one too (@briefs).
  const tagList = useMemo(() => [...tagCategories.map((c) => c.tag), ...tagProducts.map((p) => p.tag)], [tagCategories, tagProducts]);
  const tagsIn = (value: string) => {
    const found = new Set([...value.toLowerCase().matchAll(/@([a-z0-9]+(?:-[a-z0-9]+)*)/g)].map((m) => m[1]));
    return tagList.filter((t) => found.has(t));
  };

  // Picker entries for the @query: categories first when they match, then products; prefix matches first,
  // and within that the shopper's current audience first.
  const q = picker?.query.toLowerCase() ?? "";
  type PickerItem = { tag: string; label: string; detail: string; audience: Audience };
  const matches: PickerItem[] = picker
    ? [
        ...tagCategories
          .filter((c) => c.tag.includes(q) || c.name.toLowerCase().includes(q))
          .map((c) => ({ tag: c.tag, label: c.name, detail: `category · ${c.count}`, audience: c.audience })),
        ...tagProducts
          .filter((p) => p.tag.includes(q) || p.title.toLowerCase().includes(q))
          .map((p) => ({ tag: p.tag, label: p.title, detail: "", audience: p.audience })),
      ]
        .sort(
          (a, b) =>
            Number(b.tag.startsWith(q)) - Number(a.tag.startsWith(q)) ||
            Number(b.audience === audience) - Number(a.audience === audience),
        )
        .slice(0, 7)
    : [];
  const pickerOpen = picker !== null && matches.length > 0;

  const updateText = (value: string, caret: number) => {
    setText(value);
    const found = mentionAt(value, caret);
    setPicker(found);
    if (found?.query !== picker?.query) setPickerIndex(0);
  };

  const pickTag = (item: PickerItem) => {
    const el = textarea.current;
    if (!el || !picker) return;
    const caret = el.selectionStart ?? text.length;
    const insert = `@${item.tag} `;
    const value = text.slice(0, picker.start) + insert + text.slice(caret);
    const pos = picker.start + insert.length;
    setText(value);
    setPicker(null);
    window.setTimeout(() => {
      el.focus();
      el.setSelectionRange(pos, pos);
    }, 0);
  };

  const send = async (message: string) => {
    const msg = message.trim();
    if ((!msg && images.length === 0) || pending || sending.current) return;
    sending.current = true;
    setView("chat");
    const mentions = tagsIn(msg);

    const history = entries.flatMap((e): { role: "user" | "assistant"; text: string }[] => {
      if (e.role === "user") {
        const count = e.images.length || e.imageCount || 0;
        return [{ role: "user", text: e.text + (count ? ` [${count} image(s) were attached]` : "") }];
      }
      if (e.role === "assistant") return [{ role: "assistant", text: e.raw }];
      return [];
    });
    const sentImages = images;
    const userEntry: Entry = { id: newId(), role: "user", text: msg, images: sentImages.map((i) => i.previewUrl), mentions };
    const withUser = [...entries, userEntry];
    setEntries(withUser);
    persist(withUser, msg);
    setText("");
    setPicker(null);
    setImages([]);
    setPending(true);
    const started = performance.now();
    setElapsed(0);
    const tick = window.setInterval(() => setElapsed(performance.now() - started), 100);

    let reply: Entry;
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: msg,
          images: sentImages.map(({ media_type, data }) => ({ media_type, data })),
          history,
          mentions,
          audience,
          profile: hasProfile(profile) ? profile : undefined,
          gift: shoppingFor?.gift,
        }),
      });
      const data = await res.json().catch(() => null);
      reply =
        res.ok && data
          ? {
              id: newId(),
              role: "assistant",
              text: data.reply,
              raw: data.raw,
              products: data.products ?? [],
              suggestions: data.suggestions ?? [],
              ms: performance.now() - started,
              meta: data.meta,
            }
          : { id: newId(), role: "error", text: data?.error ?? "Scout ran into a problem. Try again.", details: data?.details };
    } catch {
      reply = { id: newId(), role: "error", text: "Couldn't reach Scout. Check your connection." };
    } finally {
      window.clearInterval(tick);
      setPending(false);
      sending.current = false;
    }
    const withReply = [...withUser, reply];
    setEntries(withReply);
    persist(withReply);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    send(text);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (pickerOpen) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const step = e.key === "ArrowDown" ? 1 : -1;
        setPickerIndex((i) => (i + step + matches.length) % matches.length);
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        pickTag(matches[Math.min(pickerIndex, matches.length - 1)]);
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation(); // close just the picker
        setPicker(null);
        return;
      }
    }
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send(text);
    }
    if (e.key === "Backspace" && !text && images.length) {
      e.preventDefault();
      setImages((prev) => prev.slice(0, -1));
    }
  };

  const onPaste = (e: ClipboardEvent<HTMLTextAreaElement>) => {
    const files = [...e.clipboardData.items]
      .filter((i) => i.kind === "file")
      .map((i) => i.getAsFile())
      .filter((f): f is File => !!f);
    if (files.length) {
      e.preventDefault();
      addFiles(files);
    }
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
  };

  // Put "@tag " into the input at the caret (used by This product / Recently viewed).
  const insertTags = (tags: string[]) => {
    const el = textarea.current;
    const insert = tags.map((t) => `@${t} `).join("");
    const caret = el?.selectionStart ?? text.length;
    const before = text.slice(0, caret);
    const spacer = before && !/\s$/.test(before) ? " " : "";
    const value = before + spacer + insert + text.slice(caret);
    const pos = (before + spacer + insert).length;
    setText(value);
    window.setTimeout(() => {
      el?.focus();
      el?.setSelectionRange(pos, pos);
    }, 0);
  };
  const productByHandle = useMemo(() => new Map(tagProducts.map((p) => [p.handle, p])), [tagProducts]);
  const thisProduct = currentProduct ? productByHandle.get(currentProduct.handle) : undefined;
  const recentProducts = useMemo(
    () =>
      sheet === "recent"
        ? loadRecentlyViewed()
            .map((h) => productByHandle.get(h))
            .filter((p): p is TagProduct => !!p)
        : [],
    [sheet, productByHandle],
  );
  // Compare: the audience being shopped for first
  const compareProducts = useMemo(
    () => [...tagProducts].sort((a, b) => Number(b.audience === audience) - Number(a.audience === audience)),
    [tagProducts, audience],
  );
  const profileOn = hasProfile(profile);
  // Compare: category chips for the audience being shopped for ("All …" catch-alls left out),
  // opening on the category of the product being viewed when there is one.
  const compareGroups = useMemo(
    () =>
      tagCategories
        .filter((c) => c.audience === audience && c.handles.length > 1 && !/^all /i.test(c.name))
        .map((c) => ({ key: c.tag, label: c.name, handles: c.handles })),
    [tagCategories, audience],
  );
  const compareStart = currentProduct ? compareGroups.find((g) => g.handles.includes(currentProduct.handle))?.key : undefined;

  const canSend = !pending && (text.trim().length > 0 || images.length > 0);
  const lastAssistantId = [...entries].reverse().find((e) => e.role === "assistant")?.id;

  if (!open) return null;

  return (
    <>
      <div className="ap-scrim" onClick={() => onOpenChange(false)} aria-hidden="true" />
      <aside aria-label="Scout" className="ap">
        {/* Header */}
        <div className="ap-header">
          {view === "history" ? (
            <button onClick={() => setView("chat")} className="ap-header-btn" aria-label="Back to chat" title="Back to chat">
              <Icon d={BACK} />
            </button>
          ) : (
            <span
              className="ap-header__orb"
              onMouseEnter={() => setDancing("header")}
              onMouseLeave={() => setDancing(null)}
              onPointerDown={tapDance("header")}
            >
              <LiveOrb size={26} variant="custom" {...ORB} dance={dancing === "header"} mood={pending ? "thinking" : null} />
            </span>
          )}
          <span className="ap-header__title">{view === "history" ? "History" : (chatTitle ?? "Scout")}</span>
          <button onClick={showHistory} className="ap-header-btn" aria-label="Chat history" title="Chat history">
            <Icon d={CLOCK} />
          </button>
          <button onClick={newChat} className="ap-header-btn" aria-label="New chat" title="New chat">
            <Icon d={PEN} />
          </button>
          <button onClick={() => onOpenChange(false)} className="ap-header-btn" aria-label="Close Scout" title="Close">
            <Icon d={CLOSE} />
          </button>
        </div>

        {/* Body */}
        <div className="ap-body">
          {view === "history" ? (
            <div className="ap-history">
              {chats === null ? (
                <p className="ap-muted-line">Loading…</p>
              ) : chats.length === 0 ? (
                <p className="ap-muted-line">No saved chats yet.</p>
              ) : (
                groupChats(chats).map((g) => (
                  <div key={g.label} className="ap-history__group">
                    <div className="ap-label">{g.label}</div>
                    {g.chats.map((c) => (
                      <div key={c.id} className={`ap-history__row ${activeChatId === c.id ? "is-active" : ""}`}>
                        <button onClick={() => openChat(c)} className="ap-history__open">
                          {c.title}
                        </button>
                        <button
                          onClick={() => removeChat(c)}
                          className={`ap-history__delete ${confirmDeleteId === c.id ? "is-confirming" : ""}`}
                          aria-label="Delete chat"
                        >
                          {confirmDeleteId === c.id ? "Delete?" : <Icon d={CLOSE} size={14} />}
                        </button>
                      </div>
                    ))}
                  </div>
                ))
              )}
              <div className="ap-history__foot">
                <button
                  type="button"
                  className="ap-history__clear"
                  onClick={() => {
                    if (!window.confirm("Delete all Scout chats, saved sizes and recently viewed products from this device?")) return;
                    clearAssistantData();
                    setChats([]);
                    setProfile({});
                    newChat();
                  }}
                >
                  Clear all Scout data
                </button>
                <Link href="/privacy/ai" target="_blank" className="ap-history__link">
                  Privacy
                </Link>
              </div>
            </div>
          ) : entries.length === 0 ? (
            // Empty chat: mascot + starters
            <div className="ap-empty">
              <span
                onMouseEnter={() => setDancing("hero")}
                onMouseLeave={() => setDancing(null)}
                onPointerDown={tapDance("hero")}
                className="ap-empty__orb"
              >
                <LiveOrb size={72} variant="custom" {...ORB} dance={dancing === "hero"} />
              </span>
              <div>
                <p className="ap-empty__title">Hi, I&apos;m Scout.</p>
                <p className="ap-empty__sub">What are we shopping for today?</p>
              </div>
              <div className="ap-starters">
                {STARTERS[audience].map((s) => (
                  <button key={s} onClick={() => send(s)} className="ap-chip">
                    {s}
                  </button>
                ))}
              </div>
              <p className="ap-privacy-note">
                Chats stay on this device. Messages are processed by Google Gemini to answer you.{" "}
                <Link href="/privacy/ai" target="_blank">
                  How we handle your data
                </Link>
              </p>
            </div>
          ) : (
            <div className="ap-thread">
              {entries.map((e) =>
                e.role === "user" ? (
                  <div key={e.id} className="ap-user">
                    {e.images.length > 0 && (
                      <div className="ap-user__images">
                        {e.images.map((src, i) => (
                          <img key={i} src={src} alt="" />
                        ))}
                      </div>
                    )}
                    {!e.images.length && !!e.imageCount && (
                      <span className="ap-meta">
                        {e.imageCount} image{e.imageCount === 1 ? "" : "s"} attached
                      </span>
                    )}
                    {e.text && <div className="ap-user__bubble">{withMentions(e.text, e.mentions)}</div>}
                  </div>
                ) : e.role === "assistant" ? (
                  <div key={e.id} className="ap-assistant">
                    <p className="ap-assistant__text">{e.text}</p>
                    <p
                      className="ap-meta"
                      title={
                        e.meta
                          ? [
                              `Catalog ${e.meta.ms.catalog}ms`,
                              `AI ${e.meta.ms.ai}ms (tried: ${e.meta.tried.join(", ")})`,
                              `Network + start-up ${Math.max(0, Math.round(e.ms - e.meta.ms.total))}ms`,
                            ].join("\n")
                          : undefined
                      }
                    >
                      {(e.ms / 1000).toFixed(1)}s{e.meta && ` · ${e.meta.model}`}
                    </p>
                    {e.products.length > 0 && (
                      <ul className="ap-results">
                        {e.products.map((p) => (
                          <li key={p.handle}>
                            <Link href={`/products/${p.handle}`} className="ap-result" onClick={() => onOpenChange(false)}>
                              <span className="ap-result__img">{p.image && <img src={p.image} alt="" loading="lazy" />}</span>
                              <span className="ap-result__text">
                                <span className="ap-result__title">{p.title}</span>
                                <span className="ap-result__detail">
                                  {p.price} · @{p.tag}
                                </span>
                              </span>
                              <span className="ap-result__action">View</span>
                            </Link>
                            {p.tryOn && (
                              <button
                                type="button"
                                className="ap-result__tryon"
                                onClick={() => setTryOn({ handle: p.handle, title: p.title, image: p.image })}
                              >
                                ✦ Try on
                              </button>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                    {e.id === lastAssistantId && e.suggestions.length > 0 && !pending && (
                      <div className="ap-suggestions">
                        {e.suggestions.map((s) => (
                          <button key={s} onClick={() => send(s)} className="ap-chip">
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div key={e.id} className="ap-error">
                    <p>{e.text}</p>
                    {e.details && <p className="ap-error__details">{e.details}</p>}
                  </div>
                ),
              )}
              {pending && (
                <div className="ap-pending">
                  <Spinner /> Working on it
                  <span className="ap-pending__time">{(elapsed / 1000).toFixed(1)}s</span>
                </div>
              )}
              <div ref={threadEnd} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="ap-input">
          {/* @ tag picker */}
          {pickerOpen && (
            <div className="ap-picker" role="listbox">
              <div className="ap-label ap-picker__label">Tag a product</div>
              {matches.map((m, i) => (
                <button
                  key={m.tag}
                  type="button"
                  role="option"
                  aria-selected={i === pickerIndex}
                  onMouseDown={(e) => e.preventDefault()} // keep focus in the textarea
                  onMouseEnter={() => setPickerIndex(i)}
                  onClick={() => pickTag(m)}
                  className={`ap-picker__item ${i === pickerIndex ? "is-active" : ""}`}
                >
                  <span className="ap-picker__tag">@{m.tag}</span>
                  <span className="ap-picker__name">{m.label}</span>
                  {m.detail && <span className="ap-picker__detail">{m.detail}</span>}
                </button>
              ))}
            </div>
          )}

          {sheet === "sizes" && (
            <SizesSheet
              initial={profile}
              audience={audience}
              onSave={(p) => {
                setProfile(p);
                saveProfile(p);
              }}
              onClose={() => {
                setSheet(null);
                focusInput();
              }}
            />
          )}
          {sheet === "recent" && (
            <ProductPickSheet
              title="Recently viewed"
              products={recentProducts}
              max={3}
              actionLabel="Add to message"
              emptyText="Products you open will show up here."
              onPick={(picked) => {
                setSheet(null);
                insertTags(picked.map((p) => p.tag));
              }}
              onClose={() => setSheet(null)}
            />
          )}
          {sheet === "compare" && (
            <ProductPickSheet
              title="Compare products"
              products={compareProducts}
              groups={compareGroups}
              defaultGroup={compareStart}
              min={2}
              max={3}
              searchable
              actionLabel="Compare"
              emptyText="Loading products…"
              onPick={(picked) => {
                setSheet(null);
                send(`Compare ${picked.map((p) => `@${p.tag}`).join(" ")}: fabric, fit, price and what each is best for.`);
              }}
              onClose={() => setSheet(null)}
            />
          )}
          {sheet === "for" && (
            <ShoppingForSheet
              value={shoppingFor ?? { audience: siteAudience }}
              onSave={(v) => setShoppingFor(v.audience === siteAudience && !v.gift ? null : v)}
              onClose={() => {
                setSheet(null);
                focusInput();
              }}
            />
          )}

          {(profileOn || shoppingFor) && (
            <div className="ap-context">
              {profileOn && (
                <button type="button" className="ap-context__chip" onClick={() => setSheet("sizes")} title="Scout uses your saved sizes">
                  <Icon d={RULER} size={12} /> My sizes
                </button>
              )}
              {shoppingFor && (
                <span className="ap-context__chip">
                  <Icon d={GIFT} size={12} /> For: {shoppingFor.gift ?? shoppingFor.audience}
                  {shoppingFor.gift && <span className="ap-context__sub"> · {shoppingFor.audience}</span>}
                  <button type="button" className="ap-context__x" aria-label="Stop shopping for someone else" onClick={() => setShoppingFor(null)}>
                    ✕
                  </button>
                </span>
              )}
            </div>
          )}

          <form
            onSubmit={onSubmit}
            onDragOver={(e) => {
              if (e.dataTransfer.types.includes("Files")) {
                e.preventDefault();
                setDragging(true);
              }
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={`ap-form ${dragging ? "is-dragging" : ""}`}
          >
            {images.length > 0 && (
              <div className="ap-attachments">
                {images.map((img, i) => (
                  <div key={i} className="ap-attachment">
                    <img src={img.previewUrl} alt="" />
                    <button
                      type="button"
                      aria-label="Remove image"
                      onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))}
                      className="ap-attachment__remove"
                    >
                      <Icon d={CLOSE} size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="ap-compose">
              {/* Scout reads along while you type, and thinks while it works on the answer, with a thought bubble. */}
              <span className="ap-compose__orb">
                <LiveOrb
                  size={30}
                  variant="custom"
                  {...ORB}
                  mood={pending ? "thinking" : text.trim() ? (typingPaused ? "pondering" : "reading") : null}
                  readX={Math.min(1, text.length / 48)}
                />
                <span aria-hidden="true" className={`ap-thought ${pending || text.trim() || quip ? "is-on" : ""}`}>
                  <span className="ap-thought__tail" />
                  {quip ? (
                    <span key={quip} className="ap-thought__quip">
                      {quip}
                    </span>
                  ) : (
                    <span className="ap-thought__dots">
                      <span className="ap-dot" />
                      <span className="ap-dot" />
                      <span className="ap-dot" />
                    </span>
                  )}
                </span>
              </span>
              {/* The textarea's own text is transparent; the backdrop behind it draws the same text with tags as pills. */}
              <div className="ap-compose__field">
                <div ref={backdrop} aria-hidden className="ap-compose__backdrop">
                  {withMentions(text, tagList, true)}
                  {"​" /* keeps a trailing newline's height */}
                </div>
                <textarea
                  ref={textarea}
                  value={text}
                  rows={1}
                  onChange={(e) => updateText(e.target.value, e.target.selectionStart ?? e.target.value.length)}
                  onClick={(e) => setPicker(mentionAt(text, e.currentTarget.selectionStart ?? text.length))}
                  onKeyDown={onKeyDown}
                  onPaste={onPaste}
                  onBlur={() => setPicker(null)}
                  onScroll={(e) => {
                    if (backdrop.current) backdrop.current.scrollTop = e.currentTarget.scrollTop;
                  }}
                  placeholder="Ask about fit, fabric, sizes…"
                  className="ap-compose__textarea"
                />
              </div>
            </div>

            <div className="ap-toolbar">
              <div className="ap-toolbar__left">
                <button type="button" aria-label="Add attachment" onClick={() => setMenuOpen((o) => !o)} className="ap-header-btn">
                  <Icon d={PLUS} />
                </button>
                {menuOpen && (
                  <div className="ap-menu">
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        setSheet("sizes");
                      }}
                      className="ap-menu__item"
                    >
                      <Icon d={RULER} /> My sizes
                      {profileOn && <span className="ap-menu__badge">saved</span>}
                    </button>
                    {thisProduct && (
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          insertTags([thisProduct.tag]);
                        }}
                        className="ap-menu__item"
                      >
                        <Icon d={TAG} /> This product
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        setSheet("recent");
                      }}
                      className="ap-menu__item"
                    >
                      <Icon d={EYE} /> Recently viewed
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        setSheet("compare");
                      }}
                      className="ap-menu__item"
                    >
                      <Icon d={COLUMNS} /> Compare products
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        setSheet("for");
                      }}
                      className="ap-menu__item"
                    >
                      <Icon d={GIFT} /> Shopping for…
                    </button>
                    <div className="ap-menu__sep" />
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        fileInput.current?.click();
                      }}
                      className="ap-menu__item"
                    >
                      <Icon d={IMAGE} /> Add photos or images
                    </button>
                    <button type="button" onClick={takeScreenshot} className="ap-menu__item">
                      <Icon d={MONITOR} /> Take screenshot
                    </button>
                  </div>
                )}
                <input
                  ref={fileInput}
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={(e) => {
                    if (e.target.files) addFiles(e.target.files);
                    e.target.value = "";
                  }}
                />
                <span className="ap-hint">
                  <kbd>@</kbd> to tag a product
                </span>
              </div>
              <button type="submit" disabled={!canSend} aria-label="Send" className="ap-send">
                {pending ? <Spinner /> : <Icon d={ENTER} />}
              </button>
            </div>
          </form>
        </div>
      </aside>
      {tryOn && <TryOnDialog product={tryOn} onClose={() => setTryOn(null)} />}
    </>
  );
}
