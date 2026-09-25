"use client";

import { useState } from "react";
import type { Audience, Fit, ShoppingFor, SizeProfile } from "@/components/assistant/client";

// Sheets opened from Scout's "+" menu. They slide up over the input, in the
// same style as the @ picker. Styles: `.ap-sheet*` in globals.css.

function Sheet({
  title,
  onClose,
  children,
  footer,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="ap-sheet" role="dialog" aria-label={title}>
      <div className="ap-sheet__head">
        <span className="ap-label">{title}</span>
        <button type="button" className="ap-sheet__close" onClick={onClose} aria-label="Close">
          ✕
        </button>
      </div>
      <div className="ap-sheet__body">{children}</div>
      {footer && <div className="ap-sheet__foot">{footer}</div>}
    </div>
  );
}

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

function SizeRow({ label, value, onChange }: { label: string; value?: string; onChange: (v: string) => void }) {
  return (
    <div className="ap-field">
      <span className="ap-field__label">{label}</span>
      <div className="ap-seg">
        {SIZES.map((s) => (
          <button
            key={s}
            type="button"
            className={`ap-seg__opt ${value === s ? "is-on" : ""}`}
            onClick={() => onChange(value === s ? "" : s)}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

function TextRow({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value?: string;
  placeholder: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="ap-field">
      <span className="ap-field__label">{label}</span>
      <input className="ap-text" value={value ?? ""} placeholder={placeholder} maxLength={40} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

// "My sizes": a small profile Scout uses to recommend the right size.
export function SizesSheet({
  initial,
  audience,
  onSave,
  onClose,
}: {
  initial: SizeProfile;
  audience: Audience;
  onSave: (p: SizeProfile) => void;
  onClose: () => void;
}) {
  const [p, setP] = useState<SizeProfile>(initial);
  const set = (key: keyof SizeProfile) => (v: string) => setP((prev) => ({ ...prev, [key]: v || undefined }));
  // the audience being shopped for comes first
  const sections: Record<Audience, React.ReactNode> = {
    men: (
      <div className="ap-sheet__section" key="men">
        <SizeRow label="Men · underwear" value={p.menUnderwear} onChange={set("menUnderwear")} />
        <SizeRow label="Men · vests & tees" value={p.menTop} onChange={set("menTop")} />
      </div>
    ),
    women: (
      <div className="ap-sheet__section" key="women">
        <TextRow label="Women · bra" value={p.womenBra} placeholder="e.g. 34B" onChange={set("womenBra")} />
        <SizeRow label="Women · panties" value={p.womenPanty} onChange={set("womenPanty")} />
      </div>
    ),
    kids: (
      <div className="ap-sheet__section" key="kids">
        <TextRow label="Kid · age" value={p.kidAge} placeholder="e.g. 8" onChange={set("kidAge")} />
        <TextRow label="Kid · usual size" value={p.kidSize} placeholder="e.g. 7-8Y" onChange={set("kidSize")} />
      </div>
    ),
  };
  const order: Audience[] = [audience, ...(["men", "women", "kids"] as Audience[]).filter((a) => a !== audience)];

  return (
    <Sheet
      title="My sizes"
      onClose={onClose}
      footer={
        <>
          <span className="ap-sheet__note">Saved in this browser only.</span>
          <button
            type="button"
            className="ap-primary"
            onClick={() => {
              onSave(p);
              onClose();
            }}
          >
            Save
          </button>
        </>
      }
    >
      {order.map((a) => sections[a])}
      <div className="ap-sheet__section">
        <div className="ap-field">
          <span className="ap-field__label">Fit I like</span>
          <div className="ap-seg">
            {(["snug", "regular", "relaxed"] as Fit[]).map((f) => (
              <button
                key={f}
                type="button"
                className={`ap-seg__opt ${p.fit === f ? "is-on" : ""}`}
                onClick={() => setP((prev) => ({ ...prev, fit: prev.fit === f ? undefined : f }))}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <TextRow label="Anything else" value={p.notes} placeholder="e.g. sensitive skin" onChange={set("notes")} />
      </div>
    </Sheet>
  );
}

export interface PickProduct {
  tag: string;
  handle: string;
  title: string;
  price?: string;
  thumb?: string | null;
}

export interface PickGroup {
  key: string;
  label: string;
  handles: string[];
}

// "TOMBOY Men’s Classic Briefs – Premium Comfort" → "Classic Briefs – Premium Comfort"
const shortTitle = (t: string) =>
  t.replace(/^\s*tomboy\s+/i, "").replace(/^(men|women|boy|girl|kid)[’']?s\s+/i, "").trim();

// A product list to pick from: Recently viewed (insert tags) and Compare (2–3, then ask).
// With `groups`, category chips narrow the list (Compare); search looks across everything.
export function ProductPickSheet({
  title,
  products,
  groups,
  defaultGroup,
  min = 1,
  max,
  actionLabel,
  emptyText,
  searchable = false,
  onPick,
  onClose,
}: {
  title: string;
  products: PickProduct[];
  groups?: PickGroup[];
  defaultGroup?: string;
  min?: number;
  max: number;
  actionLabel: string;
  emptyText: string;
  searchable?: boolean;
  onPick: (picked: PickProduct[]) => void;
  onClose: () => void;
}) {
  const [picked, setPicked] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState<string | undefined>(defaultGroup ?? groups?.[0]?.key);
  const q = query.trim().toLowerCase();
  const byTag = new Map(products.map((p) => [p.tag, p]));
  const activeGroup = groups?.find((g) => g.key === group);
  const shown = q
    ? products.filter((p) => p.title.toLowerCase().includes(q) || p.tag.includes(q)).slice(0, 30)
    : activeGroup
      ? products.filter((p) => activeGroup.handles.includes(p.handle))
      : products.slice(0, 30);
  const toggle = (tag: string) =>
    setPicked((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : prev.length < max ? [...prev, tag] : prev));

  return (
    <Sheet
      title={title}
      onClose={onClose}
      footer={
        <>
          <span className="ap-sheet__note">
            {max > 1 ? `${picked.length} of ${max} picked` : picked.length ? "1 picked" : "Pick one"}
          </span>
          <button
            type="button"
            className="ap-primary"
            disabled={picked.length < min}
            onClick={() => onPick(picked.map((t) => byTag.get(t)!))}
          >
            {actionLabel}
          </button>
        </>
      }
    >
      {picked.length > 0 && max > 1 && (
        <div className="ap-tray">
          {picked.map((t) => (
            <button key={t} type="button" className="ap-tray__chip" onClick={() => toggle(t)} title="Remove">
              {byTag.get(t)?.thumb && <img src={byTag.get(t)!.thumb!} alt="" />}
              <span>{shortTitle(byTag.get(t)?.title ?? t)}</span>
              <span aria-hidden="true">✕</span>
            </button>
          ))}
        </div>
      )}
      {searchable && (
        <input className="ap-text ap-sheet__search" value={query} placeholder="Search all products…" onChange={(e) => setQuery(e.target.value)} />
      )}
      {groups && groups.length > 0 && !q && (
        <div className="ap-groups">
          {groups.map((g) => (
            <button
              key={g.key}
              type="button"
              className={`ap-seg__opt ${g.key === group ? "is-on" : ""}`}
              onClick={() => setGroup(g.key)}
            >
              {g.label}
            </button>
          ))}
        </div>
      )}
      {products.length === 0 ? (
        <p className="ap-sheet__empty">{emptyText}</p>
      ) : shown.length === 0 ? (
        <p className="ap-sheet__empty">Nothing matches.</p>
      ) : (
        <div className="ap-sheet__list">
          {shown.map((p) => (
            <button
              key={p.tag}
              type="button"
              className={`ap-pick ${picked.includes(p.tag) ? "is-on" : ""}`}
              onClick={() => toggle(p.tag)}
            >
              <span className="ap-pick__check" aria-hidden="true">
                {picked.includes(p.tag) ? "✓" : ""}
              </span>
              <span className="ap-pick__thumb">{p.thumb && <img src={p.thumb} alt="" loading="lazy" />}</span>
              <span className="ap-pick__title">{shortTitle(p.title)}</span>
              {p.price && <span className="ap-pick__price">{p.price}</span>}
            </button>
          ))}
        </div>
      )}
    </Sheet>
  );
}

// "Shopping for…": the chat's audience, plus an optional gift note.
export function ShoppingForSheet({
  value,
  onSave,
  onClose,
}: {
  value: ShoppingFor;
  onSave: (v: ShoppingFor) => void;
  onClose: () => void;
}) {
  const [v, setV] = useState<ShoppingFor>(value);
  const [gift, setGift] = useState(Boolean(value.gift));
  return (
    <Sheet
      title="Shopping for…"
      onClose={onClose}
      footer={
        <>
          <span className="ap-sheet__note">Only changes this chat.</span>
          <button
            type="button"
            className="ap-primary"
            onClick={() => {
              onSave({ audience: v.audience, gift: gift && v.gift?.trim() ? v.gift.trim() : undefined });
              onClose();
            }}
          >
            Done
          </button>
        </>
      }
    >
      <div className="ap-seg ap-seg--wide">
        {(["men", "women", "kids"] as Audience[]).map((a) => (
          <button key={a} type="button" className={`ap-seg__opt ${v.audience === a ? "is-on" : ""}`} onClick={() => setV({ ...v, audience: a })}>
            {a}
          </button>
        ))}
      </div>
      <label className="ap-check">
        <input type="checkbox" checked={gift} onChange={(e) => setGift(e.target.checked)} />
        It&apos;s a gift
      </label>
      {gift && (
        <input
          className="ap-text"
          value={v.gift ?? ""}
          maxLength={80}
          placeholder="Who's it for? e.g. my dad, usually size L"
          onChange={(e) => setV({ ...v, gift: e.target.value })}
        />
      )}
    </Sheet>
  );
}
