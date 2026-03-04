/**
 * FoldPDF - Pro Upgrade Nudge
 *
 * --- ADMIN: Stripe Integration ---
 * Replace STRIPE_PAYMENT_LINK below with your Stripe Payment Link URL.
 * Create one at https://dashboard.stripe.com/payment-links
 * Set the success_url to redirect back with ?pro=true
 * ---
 *
 * Two variants:
 *   - "inline"  (default): compact bar shown inside the toolbar area
 *   - "banner": slightly larger card for the "active" confirmation
 */

"use client";

import { useState } from "react";
import { usePro } from "@/lib/pro-context";
import { Crown, Infinity, GripVertical, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

async function startCheckout() {
  const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
  const res = await fetch(`${base}/api/create-checkout`, { method: "POST" });
  const data = await res.json();
  if (data.url) window.location.href = data.url;
}

// ─── Compact inline nudge (sits next to action buttons) ─────────────────

export function ProNudgeInline({ reason }: { reason?: string }) {
  const { isPro, unlockPro } = usePro();
  const [loading, setLoading] = useState(false);

  if (isPro) return null;

  return (
    <div className="flex items-center gap-3 rounded-xl border-2 border-pro-badge/30 bg-pro-badge/5 px-4 py-2.5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-pro-badge/15">
        <Crown className="h-4 w-4 text-pro-badge" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground leading-tight">
          {reason || "Upgrade to Pro"}
        </p>
        <p className="text-xs text-muted-foreground">
          Unlimited pages, reordering & more —{" "}
          <span className="font-semibold text-pro-badge">$5 one-time</span>
        </p>
      </div>
      <Button
        size="sm"
        disabled={loading}
        className="gap-1.5 bg-pro-badge text-pro-badge-foreground hover:bg-pro-badge/90 font-bold shadow-sm shadow-pro-badge/20 transition-all hover:shadow-md hover:shadow-pro-badge/25"
        onClick={async () => { setLoading(true); await startCheckout(); setLoading(false); }}
      >
        <Crown className="h-3.5 w-3.5" />
        {loading ? "Loading…" : "Go Pro — $5"}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={unlockPro}
        className="text-[10px] text-muted-foreground hover:text-foreground px-2"
      >
        Test
      </Button>
    </div>
  );
}

// ─── Active Pro confirmation badge ──────────────────────────────────────

export function ProActiveBadge() {
  const { isPro } = usePro();

  if (!isPro) return null;

  return (
    <div className="flex items-center gap-2 rounded-lg border border-pro-badge/30 bg-pro-badge/5 px-3 py-1.5">
      <Crown className="h-3.5 w-3.5 text-pro-badge" />
      <span className="text-xs font-semibold text-pro-badge">Pro Active</span>
    </div>
  );
}

// ─── Full upgrade card (used in features section) ───────────────────────

const PRO_PERKS = [
  { icon: Infinity, text: "Unlimited PDFs & pages" },
  { icon: GripVertical, text: "Drag-and-drop reordering" },
  { icon: Zap, text: "Priority processing" },
];

export function ProUpgradeCard() {
  const { isPro, unlockPro } = usePro();
  const [cardLoading, setCardLoading] = useState(false);

  if (isPro) return null;

  return (
    <div className="relative overflow-hidden rounded-xl border-2 border-pro-badge/30 bg-card p-5">
      <div className="h-1 w-full bg-pro-badge absolute top-0 left-0 right-0" />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-pro-badge/15 ring-1 ring-pro-badge/20">
            <Crown className="h-5 w-5 text-pro-badge" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-foreground">Upgrade to Pro</h3>
              <Badge className="bg-pro-badge text-pro-badge-foreground text-[10px] font-bold tracking-wider">
                ONE-TIME
              </Badge>
            </div>
            <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
              {PRO_PERKS.map((perk) => (
                <span
                  key={perk.text}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground"
                >
                  <perk.icon className="h-3 w-3 text-pro-badge" />
                  {perk.text}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            disabled={cardLoading}
            className="gap-1.5 bg-pro-badge text-pro-badge-foreground hover:bg-pro-badge/90 font-bold shadow-sm shadow-pro-badge/20"
            onClick={async () => { setCardLoading(true); await startCheckout(); setCardLoading(false); }}
          >
            <Crown className="h-4 w-4" />
            {cardLoading ? "Loading…" : "Buy Pro — $5"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={unlockPro}
            className="text-xs text-muted-foreground"
          >
            Test
          </Button>
        </div>
      </div>
    </div>
  );
}
