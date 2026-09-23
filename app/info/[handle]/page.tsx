import { getPageByHandle } from "@/lib/shopify";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function Page({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const page = await getPageByHandle(handle);

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
