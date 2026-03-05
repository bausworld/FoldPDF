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
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>How did it go?</title>
</head>
<body style="margin:0;padding:0;background:#0D0D0D;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0D0D0D;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

          <!-- Logo / header -->
          <tr>
            <td style="padding-bottom:32px;text-align:center;">
              <span style="font-size:22px;font-weight:700;letter-spacing:-0.5px;">
                <span style="color:#00C48C;">Fold</span><span style="color:#ffffff;">PDF</span>
              </span>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#1A1A1A;border:1px solid #2A2A2A;border-radius:16px;padding:40px 36px;">

              <p style="margin:0 0 8px;font-size:24px;font-weight:700;color:#ffffff;line-height:1.2;">
                How did your PDF turn out? 👋
              </p>
              <p style="margin:0 0 24px;font-size:15px;color:#888888;line-height:1.6;">
                You just split or merged a PDF with FoldPDF — all without uploading a single file to anyone's server. We hope it went smoothly.
              </p>

              <p style="margin:0 0 24px;font-size:15px;color:#CCCCCC;line-height:1.7;">
                If you hit any limits (more than 3 files, or 10+ pages), <strong style="color:#ffffff;">FoldPDF Pro</strong> removes them all for a one-time payment of just <strong style="color:#00C48C;">$5</strong>. No subscription, no recurring charges — ever.
              </p>

              <!-- Feature list -->
              <table cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="padding:4px 0;font-size:14px;color:#AAAAAA;">
                    <span style="color:#00C48C;margin-right:8px;">✓</span> Unlimited files &amp; pages
                  </td>
                </tr>
                <tr>
                  <td style="padding:4px 0;font-size:14px;color:#AAAAAA;">
                    <span style="color:#00C48C;margin-right:8px;">✓</span> Drag-and-drop page reordering
                  </td>
                </tr>
                <tr>
                  <td style="padding:4px 0;font-size:14px;color:#AAAAAA;">
                    <span style="color:#00C48C;margin-right:8px;">✓</span> Still 100% private — nothing leaves your device
                  </td>
                </tr>
                <tr>
                  <td style="padding:4px 0;font-size:14px;color:#AAAAAA;">
                    <span style="color:#00C48C;margin-right:8px;">✓</span> Pay once, yours forever
                  </td>
                </tr>
              </table>

              <!-- CTA button -->
              <table cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td align="center">
                    <a href="${upgradeUrl}"
                       style="display:inline-block;background:linear-gradient(135deg,#00C48C,#00A0FF);color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:10px;letter-spacing:0.2px;">
                      Upgrade to Pro — $5 one-time →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:13px;color:#555555;line-height:1.6;border-top:1px solid #2A2A2A;padding-top:24px;">
                If you have any questions or feedback, just reply to this email — it goes straight to the team.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:24px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#444444;line-height:1.8;">
                FoldPDF by <a href="https://pixel-and-purpose.com" style="color:#555555;">Pixel &amp; Purpose</a><br />
                You're receiving this because you used FoldPDF.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
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
        subject: "How did your PDF turn out? 👋",
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
