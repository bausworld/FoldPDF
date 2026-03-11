/**
 * FoldPDF – Stripe Webhook Handler
 *
 * Listens for Stripe payment events and tags paid customers in CampaignCore.
 * This is the authoritative record of who has paid — independent of localStorage.
 *
 * Setup (one-time):
 *  1. Add STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET to Netlify env vars (Site settings → Environment variables) or .env.local
 *  2. In Stripe Dashboard → Developers → Webhooks → Add endpoint:
 *       URL:    https://yourdomain.com/api/stripe-webhook
 *       Events: checkout.session.completed
 *  3. Copy the Signing Secret into STRIPE_WEBHOOK_SECRET
 *  4. (Optional) Create a "Pro Customers" segment in CampaignCore and set
 *     CAMPAIGNCORE_PRO_SEGMENT_ID below.
 */

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

/* ── ADMIN: env vars ──────────────────────────────────────────────────── */
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY ?? "";
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? "";

/* ── CampaignCore settings (shared with /api/subscribe) ──────────────── */
const CC_BASE_URL = "https://dev.campaigncore.cc/api/public/contacts";
const CC_API_KEY = process.env.CAMPAIGNCORE_API_KEY ?? "0f45ded1467fb522d6a240529561a4b0fed0997dd58369792c0b950ffabf8e86";
/** Segment to add paid customers to — create one in CampaignCore and replace this */
const CC_PRO_SEGMENT_ID = process.env.CAMPAIGNCORE_PRO_SEGMENT_ID ?? "";

export async function POST(request: NextRequest) {
  console.log("[stripe-webhook] Webhook request received");
  
  if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET) {
    console.error("[stripe-webhook] Missing environment variables:", {
      hasSecretKey: !!STRIPE_SECRET_KEY,
      hasWebhookSecret: !!STRIPE_WEBHOOK_SECRET
    });
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  // Initialize Stripe inside the function to avoid build-time issues
  const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2025-01-27.acacia" });

  // Read raw body for signature verification
  let rawBody: string;
  try {
    rawBody = await request.text();
    console.log("[stripe-webhook] Raw body length:", rawBody.length);
  } catch (err) {
    console.error("[stripe-webhook] Failed to read request body:", err);
    return NextResponse.json({ error: "Could not read request body" }, { status: 400 });
  }

  const signature = request.headers.get("stripe-signature") ?? "";
  if (!signature) {
    console.error("[stripe-webhook] Missing Stripe signature header");
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, STRIPE_WEBHOOK_SECRET);
    console.log("[stripe-webhook] Event verified successfully:", event.type);
  } catch (err) {
    console.error("[stripe-webhook] Signature verification failed:", {
      error: err instanceof Error ? err.message : err,
      signaturePresent: !!signature,
      bodyLength: rawBody.length
    });
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // ── Handle checkout completion ────────────────────────────────────────
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const email =
      session.customer_details?.email ??
      session.customer_email ??
      null;

    console.log(`[stripe-webhook] Payment confirmed: ${email} — session ${session.id}`);

    // Tag the customer in CampaignCore as a Pro buyer
    if (email && CC_PRO_SEGMENT_ID) {
      try {
        const res = await fetch(CC_BASE_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": CC_API_KEY,
          },
          body: JSON.stringify({
            email,
            segment_id: CC_PRO_SEGMENT_ID,
            source: "foldpdf-stripe-webhook",
            tags: ["pro", "paid"],
          }),
        });
        
        if (!res.ok) {
          const errorText = await res.text();
          console.error("[stripe-webhook] CampaignCore error response:", {
            status: res.status,
            statusText: res.statusText,
            body: errorText
          });
        } else {
          const data = await res.json();
          console.log("[stripe-webhook] CampaignCore response:", data);
        }
      } catch (ccErr) {
        // Non-fatal — payment is recorded by Stripe regardless
        console.error("[stripe-webhook] CampaignCore tagging failed:", ccErr);
      }
    } else {
      console.warn("[stripe-webhook] Missing email or pro segment ID:", {
        hasEmail: !!email,
        hasSegmentId: !!CC_PRO_SEGMENT_ID
      });
    }
  } else {
    // Log unhandled events for debugging
    console.log(`[stripe-webhook] Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true, eventType: event.type, timestamp: new Date().toISOString() });
}

// Health check endpoint
export async function GET() {
  console.log("[stripe-webhook] Health check requested");
  
  return NextResponse.json({ 
    status: "healthy",
    timestamp: new Date().toISOString(),
    env: {
      hasStripeSecretKey: !!STRIPE_SECRET_KEY,
      hasWebhookSecret: !!STRIPE_WEBHOOK_SECRET,
      hasCampaignCoreApiKey: !!CC_API_KEY,
      hasProSegmentId: !!CC_PRO_SEGMENT_ID
    }
  });
}
