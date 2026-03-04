import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia",
});

const PRODUCT_ID = "prod_U5TKJ0cdWVA06W";

export async function POST(req: NextRequest) {
  try {
    // Build success URL from the incoming request origin so it works in
    // both local dev (localhost:3000) and production (vercel domain).
    const origin = req.headers.get("origin") || req.nextUrl.origin;
    const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
    const successUrl = `${origin}${base}?pro=true`;
    const cancelUrl = `${origin}${base}`;

    // Find the first active price for our product
    const prices = await stripe.prices.list({
      product: PRODUCT_ID,
      active: true,
      limit: 1,
    });

    if (!prices.data.length) {
      return NextResponse.json({ error: "No active price found for product" }, { status: 500 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: prices.data[0].id, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Checkout session error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
