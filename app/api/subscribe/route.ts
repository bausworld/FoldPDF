/**
 * FoldPDF - CampaignCore Proxy Route
 *
 * The browser cannot call CampaignCore directly due to CORS.
 * This API route runs server-side, forwards the subscription request,
 * and returns the result — no CORS issue.
 *
 * ADMIN: API key and segment ID are set here server-side only.
 * They are never exposed to the browser.
 */

import { NextResponse } from "next/server";

/* --- ADMIN: CampaignCore credentials (server-side only) --- */
const CAMPAIGNCORE_API_URL = "https://dev.campaigncore.cc/api/public/contacts";
const CAMPAIGNCORE_API_KEY = "0f45ded1467fb522d6a240529561a4b0fed0997dd58369792c0b950ffabf8e86";
const CAMPAIGNCORE_SEGMENT_ID = "recXTVHnts2WmDZty";
/* ---------------------------------------------------------- */

/* --- MailerSend email verification (key stored in Netlify env vars) --- */
const MAILERSEND_API_KEY = process.env.MAILERSEND_API_KEY ?? "";
/* --------------------------------------------------------------------- */

async function verifyEmail(email: string): Promise<{ valid: boolean; reason?: string }> {
  if (!MAILERSEND_API_KEY) return { valid: true }; // skip if key not configured

  try {
    const res = await fetch("https://api.mailersend.com/v1/email-verification/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${MAILERSEND_API_KEY}`,
      },
      body: JSON.stringify({ email }),
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) return { valid: true }; // fail open on API error

    const data = await res.json();
    // MailerSend single-verify returns { "status": "deliverable" | "undeliverable" | "risky" | "unknown" | "mailbox_not_found" | ... }
    const state: string = data?.status ?? "unknown";

    const undeliverable = ["undeliverable", "mailbox_not_found", "invalid_address", "invalid_domain"];
    if (undeliverable.includes(state)) {
      return {
        valid: false,
        reason: "That email address doesn't appear to exist. Please double-check and try again.",
      };
    }
    return { valid: true };
  } catch {
    return { valid: true }; // fail open on timeout / network error
  }
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    // Verify the email exists before adding to CampaignCore
    const verification = await verifyEmail(email);
    if (!verification.valid) {
      return NextResponse.json({ error: verification.reason }, { status: 422 });
    }

    const response = await fetch(CAMPAIGNCORE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": CAMPAIGNCORE_API_KEY,
      },
      body: JSON.stringify({
        email,
        first_name: "",
        last_name: "",
        source: "FoldPDF",
        segment_id: CAMPAIGNCORE_SEGMENT_ID,
      }),
    });

    const text = await response.text();
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    if (!response.ok) {
      console.error("[CampaignCore proxy] upstream error:", response.status, text);
      return NextResponse.json(
        { error: "Subscription failed", upstream: data },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("[CampaignCore proxy] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
