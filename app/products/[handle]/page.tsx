import { getProductByHandle } from "@/lib/shopify";
import { notFound } from "next/navigation";
import ProductView from "./ProductView";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const product = await getProductByHandle(handle);

  if (!product) {
    notFound();
  }

  return <ProductView product={product} />;
}
