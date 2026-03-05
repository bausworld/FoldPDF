/**
 * FoldPDF - Free-tier Follow-up Email
 *
 * Called immediately after a free user processes their first PDF.
 * Schedules a MailerSend email to send 5 minutes later asking how it went
 * and inviting them to upgrade to Pro for $5.
 *
 * POST /api/followup
 * Body: { "email": "user@example.com" }
 */

import { NextResponse } from "next/server";

const MAILERSEND_API_KEY = process.env.MAILERSEND_API_KEY ?? "";
const FROM_EMAIL = "foldpdf@pixel-and-purpose.com";
const FROM_NAME = "FoldPDF";
const UPGRADE_URL = "https://pdf.pixel-and-purpose.com/pdf";

const emailHtml = (upgradeUrl: string) => `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0D0D0D;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0D0D0D;padding:48px 20px;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;">

<tr><td align="center" style="padding-bottom:36px;">
<span style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:24px;font-weight:700;letter-spacing:-0.5px;">
<span style="color:#00C48C;">Fold</span><span style="color:#FFFFFF;">PDF</span>
</span>
</td></tr>

<tr><td style="background:#1A1A1A;border:1px solid #2A2A2A;border-radius:16px;padding:44px 40px;">
<table width="100%" cellpadding="0" cellspacing="0" border="0">

<tr><td style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:26px;font-weight:700;color:#FFFFFF;line-height:1.2;padding-bottom:14px;">
How did it go? &#128075;
</td></tr>

<tr><td style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:15px;color:#999999;line-height:1.7;padding-bottom:22px;">
You just processed a PDF entirely in your browser &mdash; no uploads, no servers, no one seeing your files. We hope it saved you some time.
</td></tr>

<tr><td style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:15px;color:#CCCCCC;line-height:1.7;padding-bottom:28px;">
If you ran into limits, <strong style="color:#FFFFFF;">FoldPDF Pro</strong> removes every restriction for a single payment of <strong style="color:#00C48C;">$5</strong>. No subscription. No renewal. Pay once and it&rsquo;s yours.
</td></tr>

<tr><td style="padding-bottom:32px;">
<table cellpadding="0" cellspacing="0" border="0">
<tr><td style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:14px;color:#AAAAAA;padding:5px 0;"><span style="color:#00C48C;font-weight:700;padding-right:10px;">&#10003;</span>Unlimited files &amp; pages</td></tr>
<tr><td style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:14px;color:#AAAAAA;padding:5px 0;"><span style="color:#00C48C;font-weight:700;padding-right:10px;">&#10003;</span>Drag-and-drop page reordering</td></tr>
<tr><td style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:14px;color:#AAAAAA;padding:5px 0;"><span style="color:#00C48C;font-weight:700;padding-right:10px;">&#10003;</span>Still 100% private &mdash; nothing leaves your device</td></tr>
<tr><td style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:14px;color:#AAAAAA;padding:5px 0;"><span style="color:#00C48C;font-weight:700;padding-right:10px;">&#10003;</span>One-time payment &mdash; no recurring charges, ever</td></tr>
</table>
</td></tr>

<tr><td align="left" style="padding-bottom:36px;">
<a href="${upgradeUrl}" style="background:linear-gradient(135deg,#00C48C 0%,#00A0FF 100%);border-radius:10px;color:#FFFFFF;display:inline-block;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:15px;font-weight:700;line-height:50px;padding:0 32px;text-align:center;text-decoration:none;">
Upgrade to Pro &mdash; $5 one-time &rarr;
</a>
</td></tr>

<tr><td style="border-top:1px solid #2A2A2A;padding-top:24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:13px;color:#555555;line-height:1.6;">
Have feedback or questions? Just reply &mdash; this goes straight to the team.
</td></tr>

</table>
</td></tr>

<tr><td align="center" style="padding-top:28px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:12px;color:#444444;line-height:1.8;">
FoldPDF by <a href="https://pixel-and-purpose.com" style="color:#555555;text-decoration:none;">Pixel &amp; Purpose</a><br>
You received this because you used FoldPDF.
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;

const emailText = `Hey — how did your PDF turn out?

You just used FoldPDF to split or merge a PDF, completely privately. We hope it went smoothly.

If you hit the free-tier limits, FoldPDF Pro removes them all for a one-time $5 payment:
- Unlimited files & pages
- Drag-and-drop page reordering
- Still 100% private — nothing leaves your device
- Pay once, yours forever

Upgrade here: ${UPGRADE_URL}

Questions? Just reply to this email.

— The FoldPDF team`;

export async function POST(request: Request) {
  if (!MAILERSEND_API_KEY) {
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    // Schedule 5 minutes from now
    const sendAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    const res = await fetch("https://api.mailersend.com/v1/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${MAILERSEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: { email: FROM_EMAIL, name: FROM_NAME },
        to: [{ email }],
        subject: "How did it go? Your PDF is ready",
        html: emailHtml(UPGRADE_URL),
        text: emailText,
        send_at: Math.floor(Date.now() / 1000) + 5 * 60, // Unix timestamp
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[followup] MailerSend error:", res.status, err);
      return NextResponse.json({ error: "Email failed" }, { status: 502 });
    }

    return NextResponse.json({ success: true, scheduled: sendAt });
  } catch (err) {
    console.error("[followup] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
