/**
 * FoldPDF - Sticky Pro Upgrade Banner
 *
 * Sits just below the header and stays in view until the user
 * either buys Pro (isPro === true) or manually dismisses it.
 * Dismissal is remembered in sessionStorage so it doesn't
 * reappear on the same tab, but shows again on a fresh visit.
 */

"use client";

import { useState, useEffect } from "react";
import { Crown, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePro } from "@/lib/pro-context";

/* ADMIN: keep in sync with pro-upgrade-card.tsx */
const STRIPE_PAYMENT_LINK = "https://buy.stripe.com/test_5kQ4gz8TQ7Jt4o44E908g00";
const DISMISS_KEY = "foldpdf-pro-banner-dismissed";

export function ProStickyBanner() {
  const { isPro } = usePro();
  const [dismissed, setDismissed] = useState(true); // start hidden to avoid flash

  // Hydrate from sessionStorage after mount
  useEffect(() => {
    const stored = sessionStorage.getItem(DISMISS_KEY);
    if (!stored) setDismissed(false);
  }, []);

  function handleDismiss() {
    sessionStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  }

  // Hide when Pro is active or user dismissed
  if (isPro || dismissed) return null;

  return (
    <div
      role="banner"
      aria-label="Upgrade to Pro"
      className="sticky top-[57px] z-30 w-full border-b border-pro-badge/30 bg-pro-badge/10 backdrop-blur-sm"
    >
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2 md:px-6">
        {/* Icon */}
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-pro-badge/20">
          <Crown className="h-3.5 w-3.5 text-pro-badge" />
        </div>

        {/* Message */}
        <p className="flex-1 text-xs leading-snug text-foreground md:text-sm">
          <span className="font-semibold">Free tier:</span> up to 3 files &
          10 pages.{" "}
          <span className="hidden sm:inline">
            Upgrade to Pro for unlimited PDFs, page reordering &amp; more — just{" "}
            <span className="font-semibold text-pro-badge">$5 one-time</span>.
          </span>
        </p>

        {/* CTA */}
        <Button
          size="sm"
          className="h-7 gap-1.5 bg-pro-badge px-3 text-xs font-bold text-pro-badge-foreground shadow-sm hover:bg-pro-badge/90"
          onClick={() => { window.location.href = STRIPE_PAYMENT_LINK; }}
        >
          <Zap className="h-3 w-3" />
          Go Pro — $5
        </Button>

        {/* Dismiss */}
        <button
          onClick={handleDismiss}
          aria-label="Dismiss banner"
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
