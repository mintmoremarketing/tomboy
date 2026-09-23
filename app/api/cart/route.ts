import { NextResponse } from "next/server";
import { createCart } from "@/lib/shopify";

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
      checkoutUrl: cart.checkoutUrl,
      cost: cart.cost,
      lines: cart.lines,
    });
  } catch (error: any) {
    console.error("Cart API Error:", error);
    return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
  }
}
