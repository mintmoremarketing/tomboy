"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Camera, Check, ChevronLeft, PencilLine, Ruler, ShieldCheck, X } from "lucide-react";
import { loadProfile, prepareImage, saveProfile, type Fit, type SizeProfile } from "@/components/assistant/client";
import { SIZE_CHARTS } from "@/data/size-charts";
import { measurementNote, recommend, toInches, type FitAudience, type Measurements } from "@/lib/fit";

// Fit Finder: works out someone's sizes from a photo (adults) or from details they type in,
// then saves them to Scout's "My sizes" so Scout, its nudges and product pages use them.
// Nothing is stored on our side: the photo is only used for the one request (see /api/fit).

const OPEN_EVENT = "tomboy-fit-open";

export function openFitFinder(audience?: FitAudience) {
  window.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: audience }));
}

type Step = "who" | "how" | "photo" | "details" | "result";

const FITS: { value: Fit; label: string }[] = [
  { value: "snug", label: "Snug" },
  { value: "regular", label: "Regular" },
  { value: "relaxed", label: "Relaxed" },
];

// size options for each saved-size slot (for adjusting a recommendation)
const OPTIONS: Partial<Record<keyof SizeProfile, string[]>> = {
  menTop: Object.keys(SIZE_CHARTS.mensTops.rows),
  menUnderwear: Object.keys(SIZE_CHARTS.mensInnerwear.rows),
  womenPanty: Object.keys(SIZE_CHARTS.womensBottoms.rows),
  womenBra: Object.keys(SIZE_CHARTS.bra.rows),
  kidSize: Object.keys(SIZE_CHARTS.kids.rows),
};

const num = (v: string) => (v.trim() === "" ? undefined : Number(v));

export function FitFinder() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("who");
  const [audience, setAudience] = useState<FitAudience>("men");
  const [fit, setFit] = useState<Fit>("regular");
  const [unit, setUnit] = useState<"in" | "cm">("in");
  const [heightUnit, setHeightUnit] = useState<"ft" | "cm">("ft");
  const [form, setForm] = useState<Record<string, string>>({});
  const [photo, setPhoto] = useState<{ data: string; media_type: string; previewUrl: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [measured, setMeasured] = useState<Measurements | null>(null);
  const [source, setSource] = useState<"photo" | "manual">("manual");
  const [photoInfo, setPhotoInfo] = useState<{ confidence: string; note?: string } | null>(null);
  const [overrides, setOverrides] = useState<Partial<Record<keyof SizeProfile, string>>>({});
  const [saved, setSaved] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onOpen = (e: Event) => {
      const wanted = (e as CustomEvent<FitAudience | undefined>).detail;
      let siteAudience: FitAudience = "men";
      try {
        const s = window.localStorage.getItem("tomboy-audience");
        if (s === "women" || s === "kids") siteAudience = s;
      } catch {}
      const a = wanted ?? siteAudience;
      setAudience(a);
      setFit(loadProfile().fit ?? "regular");
      setStep(a === "kids" ? "details" : "who");
      setForm({});
      setPhoto(null);
      setError("");
      setMeasured(null);
      setOverrides({});
      setSaved(false);
      setOpen(true);
    };
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_EVENT, onOpen);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const field = (k: string, label: string, hint?: string, suffix?: string) => (
    <label className="fit-field">
      <span>
        {label}
        {hint && <small> {hint}</small>}
      </span>
      <span className="fit-field__input">
        <input inputMode="decimal" value={form[k] ?? ""} onChange={set(k)} />
        {suffix && <em>{suffix}</em>}
      </span>
    </label>
  );

  // height from "5 ft 11 in" or "180 cm"
  const heightCm = (): number | undefined => {
    if (heightUnit === "cm") return num(form.height ?? "");
    const ft = num(form.heightFt ?? "");
    const inch = num(form.heightIn ?? "") ?? 0;
    if (!ft) return undefined;
    return Math.round((ft * 12 + inch) * 2.54);
  };

  const heightField = (hint: string) => (
    <div className="fit-field">
      <span className="fit-field__label">
        <span>
          Height<small> {hint}</small>
        </span>
        <span className="fit-mini-toggle" role="radiogroup" aria-label="Height unit">
          {(["ft", "cm"] as const).map((u) => (
            <button key={u} type="button" role="radio" aria-checked={heightUnit === u} className={heightUnit === u ? "is-active" : ""} onClick={() => setHeightUnit(u)}>
              {u}
            </button>
          ))}
        </span>
      </span>
      {heightUnit === "ft" ? (
        <span className="fit-field__pair">
          <span className="fit-field__input">
            <input inputMode="numeric" aria-label="Feet" placeholder="5" value={form.heightFt ?? ""} onChange={set("heightFt")} />
            <em>ft</em>
          </span>
          <span className="fit-field__input">
            <input inputMode="numeric" aria-label="Inches" placeholder="8" value={form.heightIn ?? ""} onChange={set("heightIn")} />
            <em>in</em>
          </span>
        </span>
      ) : (
        <span className="fit-field__input">
          <input inputMode="numeric" aria-label="Height in centimetres" placeholder="172" value={form.height ?? ""} onChange={set("height")} />
          <em>cm</em>
        </span>
      )}
      {heightUnit === "ft" && heightCm() ? <small className="fit-field__conv">= {heightCm()} cm</small> : null}
    </div>
  );

  async function pickPhoto(file?: File) {
    if (!file) return;
    setError("");
    try {
      // re-encoded on the phone: smaller, and without location or other hidden metadata
      setPhoto(await prepareImage(file));
    } catch {
      setError("Couldn't open that photo. Try a JPEG or PNG.");
    }
  }

  async function measurePhoto() {
    const height = heightCm();
    if (!height || height < 120 || height > 230)
      return setError(heightUnit === "ft" ? "Please enter your height, e.g. 5 ft 8 in." : "Please enter your height in cm, e.g. 172.");
    if (!photo) return setError("Please add a photo first.");
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/fit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photo: { media_type: photo.media_type, data: photo.data },
          heightCm: height,
          weightKg: num(form.weight ?? ""),
          audience,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      if (!data.usable) throw new Error(data.reason || "That photo can't be measured. Try a full-length photo in a fitted tee.");
      setMeasured({ heightCm: height, weightKg: num(form.weight ?? ""), chestIn: data.chestIn, waistIn: data.waistIn, hipIn: data.hipIn });
      setPhotoInfo({ confidence: data.confidence, note: data.note });
      setSource("photo");
      setPhoto(null); // done with it: drop the photo from memory
      setStep("result");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function useDetails() {
    const m: Measurements = { heightCm: heightCm(), weightKg: num(form.weight ?? "") };
    const inch = (k: string) => {
      const v = num(form[k] ?? "");
      return v ? toInches(v, unit) : undefined;
    };
    if (audience === "kids") {
      m.kidAge = num(form.age ?? "");
      if (!m.kidAge && !m.heightCm) return setError("Add your child's age or height.");
    } else {
      m.chestIn = inch("chest");
      m.waistIn = inch("waist");
      m.hipIn = inch("hip");
      m.underbustIn = inch("underbust");
      if (!m.chestIn && !m.waistIn && !m.hipIn && !m.underbustIn)
        return setError(audience === "women" ? "Add at least your waist or hip." : "Add at least your chest or waist.");
    }
    setError("");
    setMeasured(m);
    setPhotoInfo(null);
    setSource("manual");
    setStep("result");
  }

  const recs = measured ? recommend(audience, measured, fit) : [];

  function save() {
    if (!measured) return;
    const profile = loadProfile();
    const next: SizeProfile = { ...profile, fit };
    for (const r of recs) (next as Record<string, string>)[r.key] = overrides[r.key] ?? r.size;
    if (audience === "kids" && measured.kidAge) next.kidAge = String(measured.kidAge);
    // measurements go into Scout's notes (replacing any earlier Fit Finder line)
    const note = measurementNote(audience, measured, source);
    const others = (profile.notes ?? "")
      .split("\n")
      .filter((l) => l.trim() && !l.startsWith("Fit Finder"));
    next.notes = [...others, note].filter(Boolean).join("\n");
    saveProfile(next);
    setSaved(true);
  }

  const back: Partial<Record<Step, Step>> = { how: "who", photo: "how", details: audience === "kids" ? undefined : "how", result: source === "photo" ? "photo" : "details" };

  return (
    <div className="pdp-sheet fit-finder" role="dialog" aria-modal="true" aria-label="Fit Finder">
      <button className="pdp-sheet__backdrop" aria-label="Close" onClick={() => setOpen(false)} />
      <div className="pdp-sheet__panel fit-finder__panel">
        <div className="fit-finder__head">
          {back[step] ? (
            <button className="icon-button" aria-label="Back" onClick={() => setStep(back[step]!)}>
              <ChevronLeft size={20} />
            </button>
          ) : (
            <span className="fit-finder__icon" aria-hidden>
              <Ruler size={18} />
            </span>
          )}
          <div>
            <p className="size-chart__eyebrow">Fit Finder</p>
            <h3>
              {step === "who" && "Who are we sizing?"}
              {step === "how" && "How should we measure?"}
              {step === "photo" && "Measure from a photo"}
              {step === "details" && (audience === "kids" ? "Your child's details" : "Your measurements")}
              {step === "result" && "Your sizes"}
            </h3>
          </div>
          <button className="icon-button" aria-label="Close" onClick={() => setOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="fit-finder__body">
          {step === "who" && (
            <div className="fit-choices">
              {(["men", "women", "kids"] as FitAudience[]).map((a) => (
                <button
                  key={a}
                  className="fit-choice"
                  onClick={() => {
                    setAudience(a);
                    setStep(a === "kids" ? "details" : "how");
                  }}
                >
                  <strong>{a === "men" ? "Me · men's sizes" : a === "women" ? "Me · women's sizes" : "My kid"}</strong>
                  <small>{a === "kids" ? "By age and height" : "Tees, innerwear, bottoms" + (a === "women" ? ", bras" : "")}</small>
                </button>
              ))}
            </div>
          )}

          {step === "how" && (
            <div className="fit-choices">
              <button className="fit-choice" onClick={() => setStep("photo")}>
                <Camera size={20} />
                <strong>Upload a photo</strong>
                <small>A full-length photo in a fitted tee + your height. AI estimates your measurements.</small>
              </button>
              <button className="fit-choice" onClick={() => setStep("details")}>
                <PencilLine size={20} />
                <strong>Enter my details</strong>
                <small>Type your measurements. Most accurate if you have a tape measure.</small>
              </button>
            </div>
          )}

          {step === "photo" && (
            <>
              <ul className="fit-tips">
                <li>Stand straight, facing the camera, arms slightly away from your body</li>
                <li>Full length (head to feet), in a fitted tee and everyday clothes</li>
                <li>Plain background, good light, camera at chest height</li>
              </ul>
              <div className="fit-row">
                {heightField("(required)")}
                {field("weight", "Weight", "(optional)", "kg")}
              </div>
              <input
                ref={fileInput}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                hidden
                onChange={(e) => {
                  void pickPhoto(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
              <button className={`fit-upload${photo ? " has-photo" : ""}`} onClick={() => fileInput.current?.click()}>
                {photo ? (
                  <>
                    <img src={photo.previewUrl} alt="Your photo" />
                    <span>Change photo</span>
                  </>
                ) : (
                  <>
                    <Camera size={22} />
                    <span>Choose a photo</span>
                  </>
                )}
              </button>
              <p className="fit-privacy">
                <ShieldCheck size={14} /> Your photo is used once to estimate your measurements and is never stored or saved.{" "}
                <Link href="/privacy/ai" onClick={() => setOpen(false)}>
                  How it works
                </Link>
              </p>
              {error && <p className="fit-error">{error}</p>}
              <button className="button button--dark fit-cta" onClick={measurePhoto} disabled={busy}>
                {busy ? "Measuring…" : "Measure me"}
              </button>
            </>
          )}

          {step === "details" && (
            <>
              {audience !== "kids" && (
                <div className="fit-units" role="radiogroup" aria-label="Units">
                  {(["in", "cm"] as const).map((u) => (
                    <button key={u} role="radio" aria-checked={unit === u} className={unit === u ? "is-active" : ""} onClick={() => setUnit(u)}>
                      {u === "in" ? "Inches" : "Centimetres"}
                    </button>
                  ))}
                </div>
              )}
              {audience === "kids" ? (
                <div className="fit-row">
                  {field("age", "Age", "", "years")}
                  {heightField("(optional)")}
                </div>
              ) : (
                <>
                  <div className="fit-row">
                    {heightField("(optional)")}
                    {field("weight", "Weight", "(optional)", "kg")}
                  </div>
                  <div className="fit-row">
                    {field("chest", audience === "women" ? "Bust" : "Chest", "", unit)}
                    {field("waist", "Waist", "", unit)}
                  </div>
                  {audience === "women" && (
                    <div className="fit-row">
                      {field("hip", "Hip", "", unit)}
                      {field("underbust", "Under-bust", "(for bras)", unit)}
                    </div>
                  )}
                  <p className="fit-hint">Measure over light clothing, tape snug but not tight. Fill in what you know.</p>
                </>
              )}
              {error && <p className="fit-error">{error}</p>}
              <button className="button button--dark fit-cta" onClick={useDetails}>
                Find my sizes
              </button>
            </>
          )}

          {step === "result" && measured && (
            <>
              {photoInfo && (
                <p className={`fit-confidence fit-confidence--${photoInfo.confidence}`}>
                  Estimated from your photo · {photoInfo.confidence} confidence
                  {photoInfo.note ? `. ${photoInfo.note}` : ""}
                </p>
              )}
              <div className="fit-measures">
                {[
                  measured.chestIn && [audience === "women" ? "Bust" : "Chest", measured.chestIn],
                  measured.waistIn && ["Waist", measured.waistIn],
                  measured.hipIn && ["Hip", measured.hipIn],
                  measured.underbustIn && ["Under-bust", measured.underbustIn],
                ]
                  .filter(Boolean)
                  .map((pair) => {
                    const [label, value] = pair as [string, number];
                    return (
                      <span key={label}>
                        {label} <strong>~{Math.round(value)}&quot;</strong> <small>({Math.round(value * 2.54)} cm)</small>
                      </span>
                    );
                  })}
                {measured.kidAge && (
                  <span>
                    Age <strong>{measured.kidAge}</strong>
                  </span>
                )}
                {measured.heightCm && (
                  <span>
                    Height{" "}
                    <strong>
                      {heightUnit === "ft"
                        ? `${Math.floor(measured.heightCm / 2.54 / 12)}'${Math.round((measured.heightCm / 2.54) % 12)}"`
                        : `${Math.round(measured.heightCm)} cm`}
                    </strong>
                  </span>
                )}
              </div>

              <p className="fit-label">How do you like your fit?</p>
              <div className="fit-units" role="radiogroup" aria-label="Fit">
                {FITS.map((f) => (
                  <button key={f.value} role="radio" aria-checked={fit === f.value} className={fit === f.value ? "is-active" : ""} onClick={() => setFit(f.value)}>
                    {f.label}
                  </button>
                ))}
              </div>

              {recs.length === 0 ? (
                <p className="fit-error">Not enough to go on. Go back and add a little more.</p>
              ) : (
                <div className="fit-recs">
                  {recs.map((r) => (
                    <label key={r.key} className="fit-rec">
                      <span>
                        <strong>{r.label}</strong>
                        <small>from your {r.basis}</small>
                      </span>
                      <select value={overrides[r.key] ?? r.size} onChange={(e) => setOverrides((o) => ({ ...o, [r.key]: e.target.value }))}>
                        {(OPTIONS[r.key] ?? [r.size]).map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    </label>
                  ))}
                </div>
              )}

              {saved ? (
                <p className="fit-saved">
                  <Check size={16} /> Saved to your sizes. Scout and product pages will use them on this device.
                </p>
              ) : (
                <button className="button button--dark fit-cta" onClick={save} disabled={recs.length === 0}>
                  Save to my sizes
                </button>
              )}
              <p className="fit-hint">Sizes are a guide. Saved only in this browser; clear them anytime from Scout&apos;s My sizes.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
