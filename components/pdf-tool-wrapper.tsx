/**
 * FoldPDF - Client Wrapper
 *
 * Wraps the entire tool in ProProvider for state management.
 * This is a client component that enables the Pro context throughout the app.
 */

"use client";

import { ProProvider } from "@/lib/pro-context";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PdfTool } from "@/components/pdf-tool";
import { ProUpgradeCard } from "@/components/pro-upgrade-card";
import { CookieConsent } from "@/components/cookie-consent";
import { ProStickyBanner } from "@/components/pro-sticky-banner";
import {
  FileText,
  Scissors,
  Merge,
  GripVertical,
  Download,
  Shield,
} from "lucide-react";

const FEATURES = [
  {
    icon: Scissors,
    title: "Split PDFs",
    description:
      "Extract individual pages from any PDF. Select the pages you need and download them as separate files.",
  },
  {
    icon: Merge,
    title: "Merge PDFs",
    description:
      "Combine multiple PDFs into a single document. Upload several files and merge them in one click.",
  },
  {
    icon: GripVertical,
    title: "Reorder Pages",
    description:
      "Drag and drop to rearrange pages before merging. Get exactly the order you want.",
  },
  {
    icon: Download,
    title: "Instant Download",
    description:
      "Results are generated instantly in your browser and ready to download. No waiting for server processing.",
  },
  {
    icon: Shield,
    title: "100% Private",
    description:
      "Your files never leave your browser. Zero uploads, zero tracking, zero data collection.",
  },
  {
    icon: FileText,
    title: "No Limits (Pro)",
    description:
      "Free tier handles up to 3 files and 10 pages. Upgrade to Pro for unlimited processing — just $5, one-time.",
  },
];

export function PdfToolWrapper() {
  return (
    <ProProvider>
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader />
        <ProStickyBanner />

        <main className="flex-1">
          {/* Hero Section — h1 is critical for SEO; only one per page */}
          <section className="border-b border-border bg-card">
            <div className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-20">
              <div className="mx-auto max-w-2xl text-center">
                <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl text-balance">
                  Split, Merge & Reorder PDFs — Free &amp; Private
                </h1>
                <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg text-pretty">
                  FoldPDF processes your files{" "}
                  <strong className="text-foreground">100% inside your browser</strong>
                  {" "}— no uploads, no server, no tracking. Split any PDF into
                  individual pages, merge multiple PDFs into one, or reorder
                  pages before downloading. Free forever.
                </p>
                <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-xs text-muted-foreground">
                  {[
                    "No file uploads",
                    "No sign-up required",
                    "Works offline",
                    "Zero tracking",
                  ].map((t) => (
                    <span key={t} className="flex items-center gap-1">
                      <span className="text-primary">✓</span> {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* PDF Tool Section */}
          <section className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12">
            <PdfTool />
          </section>

          {/* Features Grid */}
          <section className="border-t border-border bg-muted/30">
            <div className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
              <h2 className="mb-8 text-center text-2xl font-bold tracking-tight text-foreground">
                Everything you need
              </h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {FEATURES.map((feature) => (
                  <div
                    key={feature.title}
                    className="flex gap-3 rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-sm"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {feature.title}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pro card below features */}
              <div className="mt-8">
                <ProUpgradeCard />
              </div>
            </div>
          </section>
        </main>

        <SiteFooter />
        <CookieConsent />
      </div>
    </ProProvider>
  );
}
