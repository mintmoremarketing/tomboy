import { NextResponse } from "next/server";
import { createCart } from "@/lib/shopify";

// Shopify builds the checkout link on the store's primary domain. SHOPIFY_CHECKOUT_DOMAIN
// (e.g. houseoftomboy.myshopify.com) sends shoppers there instead, so checkout keeps working
// even if the custom domain's DNS is broken. Leave it unset to use Shopify's link as is.
function checkoutOn(url: string) {
  const host = process.env.SHOPIFY_CHECKOUT_DOMAIN;
  if (!host || !url) return url;
  try {
    const u = new URL(url);
    u.host = host;
    return u.toString();
  } catch {
    return url;
  }
}

export async function POST(req: Request) {
  try {
    const { lines } = await req.json();

    if (!lines || !lines.length) {
      return NextResponse.json({ error: "Missing lines" }, { status: 400 });
    }

    const cart = await createCart(lines);

    if (!cart) {
      return NextResponse.json({ error: "Failed to create cart in Shopify" }, { status: 500 });
    }

    return NextResponse.json({
      cartId: cart.id,
      checkoutUrl: checkoutOn(cart.checkoutUrl),
      cost: cart.cost,
      lines: cart.lines,
    });
  } catch (error: any) {
    console.error("Cart API Error:", error);
    return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
  }
}
