"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { LiveOrb } from "@/components/ui/live-orb";
import { prepareImage, type AiImage } from "@/components/assistant/client";

// AI try-on: the shopper's own photo + the product → a preview of them wearing it.
// Explains what happens to the photo *before* asking for it, and asks for consent.
// Nothing is kept: closing the dialog drops the photo and the result from memory.
// Styles: `.to-*` in globals.css (same tokens as Scout's panel).

export interface TryOnProduct {
  handle: string;
  title: string;
  image: string | null;
}

type Step = "intro" | "ready" | "working" | "result" | "error";

export function TryOnDialog({ product, onClose }: { product: TryOnProduct; onClose: () => void }) {
  const [step, setStep] = useState<Step>("intro");
  const [consent, setConsent] = useState(false);
  const [photo, setPhoto] = useState<AiImage | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [showBefore, setShowBefore] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const choosePhoto = async (file?: File) => {
    if (!file || !file.type.startsWith("image/")) return;
    try {
      setPhoto(await prepareImage(file));
      setResult(null);
      setStep("ready");
    } catch {
      setError("That photo couldn't be read. Try a JPEG or PNG.");
      setStep("error");
    }
  };

  const generate = async () => {
    if (!photo) return;
    setStep("working");
    setError(null);
    const started = performance.now();
    setElapsed(0);
    const tick = window.setInterval(() => setElapsed(performance.now() - started), 100);
    try {
      const res = await fetch("/api/try-on", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle: product.handle, photo: { media_type: photo.media_type, data: photo.data } }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.image) throw new Error(data?.error ?? "Try-on ran into a problem. Try again.");
      setResult(data.image);
      setShowBefore(false);
      setStep("result");
    } catch (err) {
      setError((err as Error).message);
      setStep("error");
    } finally {
      window.clearInterval(tick);
    }
  };

  return (
    <div className="to-overlay" onClick={onClose}>
      <div className="to" role="dialog" aria-label={`Try on ${product.title}`} onClick={(e) => e.stopPropagation()}>
        <div className="to-head">
          <span className="to-head__title">Try it on</span>
          <button type="button" className="to-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="to-product">
          <span className="to-product__img">{product.image && <img src={product.image} alt="" />}</span>
          <span className="to-product__title">{product.title}</span>
        </div>

        {step === "intro" && (
          <div className="to-body">
            <p className="to-lead">See this on you. Upload a photo of yourself and we&apos;ll create an AI preview of you wearing it.</p>
            <ul className="to-privacy">
              <li>
                <strong>Not stored.</strong> Your photo is used once to make the preview and then discarded. Tomboy never saves it
                or keeps a copy.
              </li>
              <li>
                <strong>Processed by Google.</strong> To create the image, your photo is sent securely (encrypted) to Google&apos;s
                Gemini AI.
              </li>
              <li>
                <strong>Only yours.</strong> The preview is shown only to you. Nothing is posted or shared.
              </li>
            </ul>
            <label className="to-consent">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
              <span>This is a photo of me, and I&apos;m 18 or older.</span>
            </label>
            <button type="button" className="to-primary" disabled={!consent} onClick={() => fileInput.current?.click()}>
              Choose a photo
            </button>
            <p className="to-fine">
              Best results: a clear, well-lit photo, facing the camera. <Link href="/privacy/ai" target="_blank">How we handle your data</Link>
            </p>
          </div>
        )}

        {step === "ready" && photo && (
          <div className="to-body">
            <img className="to-photo" src={photo.previewUrl} alt="Your photo" />
            <div className="to-actions">
              <button type="button" className="to-secondary" onClick={() => fileInput.current?.click()}>
                Change photo
              </button>
              <button type="button" className="to-primary" onClick={generate}>
                Create preview
              </button>
            </div>
          </div>
        )}

        {step === "working" && (
          <div className="to-body to-body--center">
            <LiveOrb size={64} variant="custom" color="#FF3333" eyeColor="#FAFAFA" mood="thinking" />
            <p className="to-lead">Tailoring your preview…</p>
            <p className="to-fine to-timer">{(elapsed / 1000).toFixed(1)}s · usually 10–20s</p>
          </div>
        )}

        {step === "result" && result && photo && (
          <div className="to-body">
            <div className="to-result">
              <img src={showBefore ? photo.previewUrl : result} alt={showBefore ? "Your photo" : "AI preview of you wearing it"} />
              <div className="to-toggle">
                <button type="button" className={!showBefore ? "is-on" : ""} onClick={() => setShowBefore(false)}>
                  Preview
                </button>
                <button type="button" className={showBefore ? "is-on" : ""} onClick={() => setShowBefore(true)}>
                  Original
                </button>
              </div>
            </div>
            <p className="to-fine">AI preview: actual fit and colour may differ slightly. Closing this clears your photo.</p>
            <div className="to-actions">
              <a className="to-secondary" href={result} download="tomboy-try-on.png">
                Save image
              </a>
              <button type="button" className="to-primary" onClick={() => fileInput.current?.click()}>
                Try another photo
              </button>
            </div>
          </div>
        )}

        {step === "error" && (
          <div className="to-body to-body--center">
            <p className="to-lead">{error}</p>
            <div className="to-actions">
              <button type="button" className="to-secondary" onClick={onClose}>
                Close
              </button>
              {photo && (
                <button type="button" className="to-primary" onClick={generate}>
                  Try again
                </button>
              )}
            </div>
          </div>
        )}

        <input
          ref={fileInput}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          hidden
          onChange={(e) => {
            choosePhoto(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}
