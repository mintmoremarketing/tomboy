import { NextResponse } from 'next/server';
import { randomBytes } from 'node:crypto';
import { shopifyFetch } from '@/lib/shopify';

// Newsletter sign-up: adds the email to the store's Shopify customers with marketing consent
// (Shopify → Customers, "Subscribed"). The Storefront API can only do that by creating a
// customer, so it gets a random password they never need (they can set one later with
// "Forgot password" if they ever want an account). Nothing else is stored here.

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const MUTATION = `
  mutation subscribe($input: CustomerCreateInput!) {
    customerCreate(input: $input) {
      customer { id }
      customerUserErrors { code message }
    }
  }
`;

export async function POST(request: Request) {
  let email = '';
  try {
    const body = await request.json();
    email = String(body?.email ?? '').trim().toLowerCase();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }
  if (!EMAIL.test(email) || email.length > 254) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
  }

  const res = await shopifyFetch<{ customerCreate?: { customer?: { id: string }; customerUserErrors?: { code: string; message: string }[] } }>({
    query: MUTATION,
    noCache: true,
    variables: { input: { email, password: randomBytes(24).toString('base64url'), acceptsMarketing: true } },
  });

  const result = res.body?.data?.customerCreate;
  const errors = result?.customerUserErrors ?? [];
  if (result?.customer?.id) return NextResponse.json({ status: 'subscribed' });
  // already a customer: count it as done rather than an error
  if (errors.some((e) => e.code === 'TAKEN' || /taken|already/i.test(e.message))) {
    return NextResponse.json({ status: 'already' });
  }
  if (errors.some((e) => /limit|throttl/i.test(e.message))) {
    return NextResponse.json({ error: 'Too many sign-ups right now. Please try again in a minute.' }, { status: 429 });
  }
  console.error('Subscribe failed:', errors.map((e) => e.code).join(',') || res.error || res.status);
  return NextResponse.json({ error: "Couldn't sign you up right now. Please try again." }, { status: 502 });
}
