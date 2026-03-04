/**
 * FoldPDF - Privacy Policy Page
 * ADMIN: Update contact email and company details as needed.
 */

import type { Metadata } from "next";
import { Shield } from "lucide-react";

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'FoldPDF is a privacy-first PDF tool. Your files never leave your browser. No tracking, no data selling, no ads. Read our full privacy policy.',
  alternates: { canonical: 'https://pixel-and-purpose.com/privacy' },
  robots: { index: true, follow: true },
};

const SECTIONS = [
  {
    title: "1. What We Collect",
    body: `FoldPDF collects the absolute minimum necessary to operate:
• Email address — only if you voluntarily subscribe through our opt-in form before downloading.
• Stripe payment data — processed entirely by Stripe. We never see or store your card details.
We do not collect names, addresses, IP addresses, or any device identifiers beyond what your browser sends by default.`,
  },
  {
    title: "2. Your Files Stay On Your Device",
    body: `All PDF processing happens 100% inside your browser using pdf-lib. Your files are never uploaded to our servers, never transmitted over the network, and never stored anywhere outside your own device. Once you close the tab, all in-memory data is cleared automatically.`,
  },
  {
    title: "3. No Ads. No Tracking. No Data Selling.",
    body: `We do not run advertising. We do not embed third-party tracking pixels, ad networks, or behavioural analytics. We will never sell, rent, or trade your personal data to any third party. Full stop.`,
  },
  {
    title: "4. Email Marketing",
    body: `If you subscribe to our mailing list, your email is stored with CampaignCore and used only to send you product updates and tips related to Pixel & Purpose tools. Every email includes an unsubscribe link. You can also email us at any time to be removed.`,
  },
  {
    title: "5. Stripe Payments",
    body: `Pro tier purchases are handled by Stripe. When you click "Buy Pro" you are taken to Stripe's hosted checkout. Stripe's own Privacy Policy (stripe.com/privacy) governs the handling of payment data. We receive only a notification that a payment succeeded and the email address used — which is used solely to unlock Pro features.`,
  },
  {
    title: "6. Cookies & Local Storage",
    body: `We use browser localStorage for one purpose only: remembering whether you accepted or declined our cookie consent banner. No advertising cookies, no session tracking cookies, and no fingerprinting.`,
  },
  {
    title: "7. Third-Party Services",
    body: `• Netlify — this site is hosted on Netlify. Netlify may log standard HTTP request metadata (IP, browser, timestamp) for security and abuse prevention. See netlify.com/privacy.
• CampaignCore — email delivery. See campaigncore.cc for their privacy policy.
• Stripe — payment processing. See stripe.com/privacy.
No other third-party services are embedded on this page.`,
  },
  {
    title: "8. Data Retention & Deletion",
    body: `PDF data: never retained — it only exists in your browser's memory while the tab is open.
Email data: retained until you unsubscribe or request deletion.
Payment records: retained by Stripe per their legal obligations.
To request deletion of your email, contact us at privacy@pixel-and-purpose.com.`,
  },
  {
    title: "9. Your Rights",
    body: `Depending on your location, you may have rights under GDPR, CCPA, or other privacy laws, including the right to access, correct, or delete your personal data. To exercise any of these rights, email privacy@pixel-and-purpose.com and we will respond within 30 days.`,
  },
  {
    title: "10. Changes to This Policy",
    body: `We may update this policy occasionally. The "Last updated" date below will reflect any changes. Continued use of FoldPDF after changes constitutes acceptance of the updated policy.`,
  },
];

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12 md:px-6 md:py-20">
      {/* Header */}
      <div className="mb-10 flex flex-col gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <Shield className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Privacy Policy
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Last updated: March 2026 &nbsp;·&nbsp;{" "}
            <a
              href="https://pixel-and-purpose.com"
              className="text-primary hover:underline"
            >
              Pixel & Purpose
            </a>
          </p>
        </div>
        <p className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm leading-relaxed text-foreground">
          <strong>Short version:</strong> Your PDF files never leave your
          browser. We only collect your email if you choose to subscribe. We
          don&apos;t run ads. We don&apos;t track you. We don&apos;t sell data.
        </p>
      </div>

      {/* Sections */}
      <div className="flex flex-col gap-8">
        {SECTIONS.map((s) => (
          <section key={s.title}>
            <h2 className="mb-2 text-base font-semibold text-foreground">
              {s.title}
            </h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
              {s.body}
            </p>
          </section>
        ))}
      </div>

      {/* Contact */}
      <div className="mt-12 rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
        Questions? Email us at{" "}
        <a
          href="mailto:privacy@pixel-and-purpose.com"
          className="font-medium text-primary hover:underline"
        >
          privacy@pixel-and-purpose.com
        </a>
      </div>

      {/* Back link */}
      <div className="mt-8">
        <a
          href="/"
          className="text-sm font-medium text-primary hover:underline"
        >
          ← Back to FoldPDF
        </a>
      </div>
    </main>
  );
}
