/**
 * FoldPDF - Email Gate Dialog
 *
 * Shown when users attempt to process PDFs (split/merge/download).
 * Requires email signup before allowing the action to proceed.
 * Once subscribed, all future actions proceed without the gate.
 *
 * --- ADMIN: CampaignCore Integration ---
 * Replace CAMPAIGNCORE_API_URL, CAMPAIGNCORE_API_KEY, and CAMPAIGNCORE_FORM_ID below.
 */

"use client";

import { useState, useCallback } from "react";
import { Mail, Loader2, Lock, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

/* All CampaignCore credentials live server-side in app/api/subscribe/route.ts.
   The browser only ever calls our own /api/subscribe proxy — API key is never
   exposed in the client bundle. */


interface EmailGateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  actionLabel: string;
}

export function EmailGateDialog({
  open,
  onOpenChange,
  onSuccess,
  actionLabel,
}: EmailGateDialogProps) {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!consent || !email) return;

      setStatus("loading");
      setErrorMsg("");

      try {
        // Calls our Next.js server-side proxy to avoid CORS.
        // Credentials never leave the server.
        const response = await fetch("/pdf/api/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        if (!response.ok) {
          throw new Error("Subscription failed");
        }

        // Show a brief success screen, then proceed
        setStatus("success");
        setTimeout(() => {
          onSuccess();
          onOpenChange(false);
          // Reset for next time
          setStatus("idle");
          setEmail("");
          setConsent(false);
        }, 1400);
      } catch {
        setStatus("error");
        setErrorMsg("Something went wrong. Please try again.");
      }
    },
    [email, consent, onSuccess, onOpenChange]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 sm:mx-0">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-xl">
            Enter your email to {actionLabel.toLowerCase()}
          </DialogTitle>
          <DialogDescription className="text-pretty">
            Your PDFs are processed 100% in your browser. We just need your
            email to deliver the result and send you occasional PDF tips.
          </DialogDescription>
        </DialogHeader>

        {/* ── Success screen ──────────────────────────────────────────── */}
        {status === "success" ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10 ring-4 ring-green-500/20">
              <CheckCircle2 className="h-7 w-7 text-green-500" />
            </div>
            <div>
              <p className="font-semibold text-foreground">You&apos;re in!</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Subscribed successfully. Starting your {actionLabel.toLowerCase()}…
              </p>
            </div>
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="gate-email" className="sr-only">
              Email address
            </Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="gate-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-9"
                  autoFocus
                />
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Checkbox
              id="gate-consent"
              checked={consent}
              onCheckedChange={(checked) => setConsent(checked === true)}
              className="mt-0.5"
            />
            <Label
              htmlFor="gate-consent"
              className="text-xs leading-relaxed text-muted-foreground cursor-pointer"
            >
              I agree to receive emails from Pixel & Purpose. My email will only
              be used for newsletters and product updates. I can unsubscribe at
              any time.
            </Label>
          </div>

          {status === "error" && (
            <p className="text-xs text-destructive">{errorMsg}</p>
          )}

          <Button
            type="submit"
            disabled={!consent || !email || status === "loading"}
            className="w-full gap-2"
          >
            {status === "loading" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowRight className="h-4 w-4" />
            )}
            {status === "loading" ? "Subscribing..." : `Continue & ${actionLabel}`}
          </Button>

          <p className="text-center text-[11px] text-muted-foreground">
            Your files never leave your device. Only your email is sent.
          </p>
        </form>
        )} {/* end status === "success" ternary */}
      </DialogContent>
    </Dialog>
  );
}
