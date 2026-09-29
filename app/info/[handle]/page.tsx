import { cache } from "react";
import type { Metadata } from "next";
import { getPageByHandle } from "@/lib/shopify";
import { metaDescription } from "@/lib/site";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const loadPage = cache((handle: string) => getPageByHandle(handle));

type Props = { params: Promise<{ handle: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const page = await loadPage(handle);
  if (!page) return { title: "Page not found", robots: { index: false } };
  const text = (page.body || "").replace(/<[^>]+>/g, " ");
  return {
    title: page.title,
    description: metaDescription(text),
    alternates: { canonical: `/info/${page.handle}` },
  };
}

export default async function Page({ params }: Props) {
  const { handle } = await params;
  const page = await loadPage(handle);

  if (!page) {
    notFound();
  }

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

      <main className="page-content">
        <h1 className="page-title">{page.title}</h1>
        <div
          className="page-body prose"
          dangerouslySetInnerHTML={{ __html: page.body }}
        />
      </main>
    </div>
  );
}
