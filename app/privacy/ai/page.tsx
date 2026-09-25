import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ClearDataButton } from "./clear-data-button";

export const metadata: Metadata = {
  title: "Scout, Try-on & your privacy | Tomboy India",
  description: "What happens to your messages and photos when you use Scout, Tomboy's shopping assistant, and AI try-on.",
};

// Plain-language explainer for the AI features. Supplements the store's main
// Privacy Policy (a Shopify page at /info/privacy-policy).
export default function AiPrivacyPage() {
  return (
    <div className="page-container">
      <header className="page-header">
        <Link href="/" className="brand" aria-label="Tomboy homepage">
          <img src="/logo.webp" alt="Tomboy India" className="brand-logo" />
        </Link>
        <Link href="/" className="back-link">
          <ArrowLeft size={16} /> Back to store
        </Link>
      </header>

      <main className="page-content privacy-page">
        <p className="eyebrow">Your privacy</p>
        <h1 className="page-title">Scout, Try-on &amp; your data</h1>
        <p className="privacy-lead">
          We built Scout (our shopping assistant) and AI try-on to help you shop, not to collect data about you. Here&apos;s exactly
          what happens, in plain words.
        </p>

        <section className="privacy-summary" aria-label="The short version">
          <div>
            <strong>No account, no profile.</strong>
            <span>You don&apos;t sign in, and we don&apos;t build a profile of you.</span>
          </div>
          <div>
            <strong>Your chats stay on your device.</strong>
            <span>History and saved sizes are kept in your browser, not on our servers.</span>
          </div>
          <div>
            <strong>Try-on photos are never stored.</strong>
            <span>Your photo is used once to make the preview, then discarded.</span>
          </div>
        </section>

        <section className="page-body prose">
          <h2>When you chat with Scout</h2>
          <p>
            To answer you, we send your message to Google&apos;s Gemini AI, together with anything you add to it: tagged products, photos
            you attach, and your saved sizes if you&apos;ve set them. Gemini writes the reply and sends it back. It goes over an
            encrypted (HTTPS) connection.
          </p>
          <p>
            <strong>Tomboy doesn&apos;t keep your messages.</strong> Our server passes them to Gemini and returns the answer. It doesn&apos;t
            save them to a database or a file.
          </p>
          <p>
            <strong>What stays in your browser:</strong> your chat history, your saved sizes (&ldquo;My sizes&rdquo;) and the products
            you&apos;ve recently viewed. These are stored on this device only (in your browser&apos;s local storage), so another
            device or person can&apos;t see them, and you can delete them any time (below). Photos you attach to a chat aren&apos;t
            kept in your history, only a note that an image was attached.
          </p>

          <h2>When you use AI try-on</h2>
          <ul>
            <li>
              You upload a photo of yourself. We send it, with the product&apos;s photo, to Google&apos;s Gemini AI over an encrypted
              connection to create the preview.
            </li>
            <li>
              <strong>We never save your photo or the preview.</strong> They exist only while the preview is being made and on your
              screen. Closing the try-on window clears them. If you want to keep the preview, use &ldquo;Save image&rdquo;; it
              downloads straight to your device.
            </li>
            <li>Nothing is posted, shared, or shown to anyone else.</li>
            <li>
              Try-on is only for your own photo, only for people 18 or older, and only for tees, track pants, shorts and joggers.
              We don&apos;t offer it for innerwear or kids&apos; products.
            </li>
          </ul>

          <h2>Google&apos;s role</h2>
          <p>
            Google provides the AI (Gemini) that powers Scout and try-on. What you send is processed by Google to produce the
            answer or image, under the{" "}
            <a href="https://ai.google.dev/gemini-api/terms" target="_blank" rel="noreferrer">
              Gemini API Terms
            </a>{" "}
            and{" "}
            <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">
              Google&apos;s Privacy Policy
            </a>
            . Please don&apos;t share sensitive personal details (like payment or health information) in the chat.
          </p>

          <h2>What we don&apos;t do</h2>
          <ul>
            <li>We don&apos;t sell your data or use your chats or photos for advertising.</li>
            <li>We don&apos;t use your photos for anything except the preview you asked for.</li>
            <li>We don&apos;t need your name, email or phone number to use Scout or try-on.</li>
          </ul>

          <h2>Your controls</h2>
          <p>
            You can delete your Scout chat history, saved sizes and recently viewed products from this device at any time. You can
            also delete individual chats from Scout&apos;s history.
          </p>
        </section>

        <ClearDataButton />

        <p className="privacy-foot">
          This page covers Scout and AI try-on. For orders, payments and everything else, see our{" "}
          <Link href="/info/privacy-policy">Privacy Policy</Link>. Questions? <Link href="/info/contact">Contact us</Link>.
          <br />
          Last updated: 25 September 2026.
        </p>
      </main>
    </div>
  );
}
