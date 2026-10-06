import { NextResponse } from 'next/server';

// Order tracking without an account: the shopper gives their order number + the email they
// ordered with, and we look the order up with the Shopify Admin API. Both have to match, so
// nobody can browse other people's orders by guessing numbers. Only the shipping status,
// tracking links and item names go back to the browser (no address, phone or payment info).
//
// Uses the "Tomboy Order Tracking" app from the Shopify Dev Dashboard (read_orders scope,
// installed on the store). Server-only env vars, never NEXT_PUBLIC_:
//   SHOPIFY_CLIENT_ID + SHOPIFY_CLIENT_SECRET  (Dev Dashboard → app → Settings)
// We trade those for an Admin API token (client credentials grant, valid ~24h) and reuse it
// until shortly before it expires. A fixed SHOPIFY_ADMIN_ACCESS_TOKEN also works if set.

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const QUERY = `
  query track($q: String!) {
    orders(first: 5, query: $q) {
      edges {
        node {
          name
          email
          createdAt
          cancelledAt
          displayFulfillmentStatus
          statusPageUrl
          fulfillments(first: 10) {
            displayStatus
            updatedAt
            trackingInfo(first: 5) { company number url }
          }
          lineItems(first: 20) { edges { node { title quantity } } }
        }
      }
    }
  }
`;

let cached: { token: string; expires: number } | null = null;

async function adminToken(domain: string): Promise<string | null> {
  if (process.env.SHOPIFY_ADMIN_ACCESS_TOKEN) return process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
  const id = process.env.SHOPIFY_CLIENT_ID;
  const secret = process.env.SHOPIFY_CLIENT_SECRET;
  if (!id || !secret) return null;
  if (cached && cached.expires > Date.now()) return cached.token;

  const res = await fetch(`https://${domain}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'client_credentials', client_id: id, client_secret: secret }),
    cache: 'no-store',
  });
  const body = await res.json().catch(() => null);
  if (!res.ok || !body?.access_token) {
    console.error('track-order: token request failed', res.status, body?.error ?? body);
    return null;
  }
  // refresh 5 minutes before Shopify's expiry
  cached = { token: body.access_token, expires: Date.now() + ((body.expires_in ?? 86400) - 300) * 1000 };
  return cached.token;
}

export async function POST(request: Request) {
  const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;

  let order = '';
  let email = '';
  try {
    const body = await request.json();
    order = String(body?.order ?? '').replace(/[^0-9]/g, '');
    email = String(body?.email ?? '').trim().toLowerCase();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }
  if (!order || order.length > 12) {
    return NextResponse.json({ error: 'Please enter your order number, e.g. #1024.' }, { status: 400 });
  }
  if (!EMAIL.test(email) || email.length > 254) {
    return NextResponse.json({ error: 'Please enter the email you ordered with.' }, { status: 400 });
  }

  const token = domain ? await adminToken(domain) : null;
  if (!token || !domain) {
    return NextResponse.json(
      { error: "Order tracking isn't switched on yet. Check the shipping email we sent you, or contact us and we'll look it up." },
      { status: 503 },
    );
  }

  try {
    const res = await fetch(`https://${domain}/admin/api/2025-01/graphql.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
      body: JSON.stringify({ query: QUERY, variables: { q: `name:#${order}` } }),
      cache: 'no-store',
    });
    const body = await res.json();
    if (!res.ok || body.errors) {
      console.error('track-order: Shopify error', body.errors ?? res.status);
      return NextResponse.json({ error: "We couldn't check right now. Please try again in a minute." }, { status: 502 });
    }

    const match = (body.data?.orders?.edges ?? [])
      .map((e: any) => e.node)
      .find((o: any) => o.name === `#${order}` && String(o.email ?? '').toLowerCase() === email);

    // same answer whether the number doesn't exist or the email is wrong
    if (!match) {
      return NextResponse.json(
        { error: "We couldn't find an order with that number and email. Check both and try again." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      name: match.name,
      placedAt: match.createdAt,
      cancelled: !!match.cancelledAt,
      status: match.displayFulfillmentStatus,
      statusPageUrl: match.statusPageUrl,
      shipments: (match.fulfillments ?? []).map((f: any) => ({
        status: f.displayStatus,
        updatedAt: f.updatedAt,
        tracking: (f.trackingInfo ?? []).map((t: any) => ({ company: t.company, number: t.number, url: t.url })),
      })),
      items: (match.lineItems?.edges ?? []).map((e: any) => ({ title: e.node.title, quantity: e.node.quantity })),
    });
  } catch (err) {
    console.error('track-order failed', err);
    return NextResponse.json({ error: "We couldn't check right now. Please try again in a minute." }, { status: 502 });
  }
}
