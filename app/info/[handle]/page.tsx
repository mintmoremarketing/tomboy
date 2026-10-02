import { cache } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { getPageByHandle } from "@/lib/shopify";
import { metaDescription } from "@/lib/site";
import { SiteHeader } from "@/components/layout/site-header";
import { INFO_PAGES, STORE, type InfoPage } from "@/data/info-pages";

// Footer pages (About, Contact, policies). The store's own text in Shopify wins; while a
// Shopify page is empty (they all are right now), the drafts in data/info-pages.ts are shown.
const loadPage = cache((handle: string) => getPageByHandle(handle).catch(() => null));

const hasText = (html?: string | null) => !!html && html.replace(/<[^>]+>/g, "").trim().length > 0;

type Props = { params: Promise<{ handle: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const page = await loadPage(handle);
  const draft = INFO_PAGES[handle];
  if (!page && !draft) return { title: "Page not found", robots: { index: false } };
  const useShopify = page && hasText(page.body);
  return {
    title: useShopify ? page.title : draft?.title ?? page?.title,
    description: metaDescription(useShopify ? page.body.replace(/<[^>]+>/g, " ") : draft?.lead),
    alternates: { canonical: `/info/${handle}` },
  };
}

function ContactCard() {
  return (
    <div className="info-contact">
      <a className="info-contact__item" href={`mailto:${STORE.email}`}>
        <Mail size={20} />
        <span>
          <small>Email</small>
          {STORE.email}
        </span>
      </a>
      <a className="info-contact__item" href={STORE.phoneHref}>
        <Phone size={20} />
        <span>
          <small>Call</small>
          {STORE.phone}
        </span>
      </a>
      <div className="info-contact__item">
        <MapPin size={20} />
        <span>
          <small>Address</small>
          {STORE.address.map((line) => (
            <span key={line} className="info-contact__line">
              {line}
            </span>
          ))}
        </span>
      </div>
      <div className="info-contact__item info-contact__item--scout">
        <MessageCircle size={20} />
        <span>
          <small>Quick question?</small>
          Ask Scout, the red button at the top of any page, for sizing and product help.
        </span>
      </div>
    </div>
  );
}

function Draft({ page }: { page: InfoPage }) {
  return (
    <>
      {page.contactCard && <ContactCard />}
      {page.sections.map((s, i) => (
        <section key={i}>
          {s.heading && <h2>{s.heading}</h2>}
          {s.paragraphs?.map((p) => <p key={p}>{p}</p>)}
          {s.list && (
            <ul>
              {s.list.map((li) => (
                <li key={li}>{li}</li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </>
  );
}

const POLICY_LINKS = [
  { href: "/info/shipping-policy", label: "Shipping" },
  { href: "/info/refunds-returns-policy", label: "Refunds & returns" },
  { href: "/info/privacy-policy", label: "Privacy" },
  { href: "/privacy/ai", label: "Scout & your data" },
  { href: "/info/terms-conditions", label: "Terms" },
  { href: "/info/contact", label: "Contact" },
];

export default async function Page({ params }: Props) {
  const { handle } = await params;
  const page = await loadPage(handle);
  const draft = INFO_PAGES[handle];
  if (!page && !draft) notFound();

  const useShopify = page && hasText(page.body);
  const title = useShopify ? page.title : draft?.title ?? page?.title;

  return (
    <>
      <SiteHeader />
      <div className="page-container info-page">
        <main className="page-content">
          {draft?.eyebrow && <p className="eyebrow">{draft.eyebrow}</p>}
          <h1 className="page-title">{title}</h1>
          {!useShopify && draft?.lead && <p className="info-lead">{draft.lead}</p>}
          {!useShopify && draft?.updated && <p className="info-updated">Last updated {draft.updated}</p>}

          <div className="page-body prose">
            {useShopify ? <div dangerouslySetInnerHTML={{ __html: page.body }} /> : draft && <Draft page={draft} />}
          </div>

          <nav className="info-links" aria-label="Help and policies">
            {POLICY_LINKS.filter((l) => l.href !== `/info/${handle}`).map((l) => (
              <Link key={l.href} href={l.href}>
                {l.label}
              </Link>
            ))}
          </nav>
        </main>
      </div>
    </>
  );
}
