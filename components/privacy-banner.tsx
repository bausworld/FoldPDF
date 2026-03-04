/**
 * FoldPDF - Privacy Banner
 * 
 * Prominently communicates the privacy-first approach.
 * Displayed at the top of the tool to build trust.
 */

import { Shield, Eye, Server, Cookie } from "lucide-react";

const PRIVACY_POINTS = [
  {
    icon: Eye,
    label: "No Tracking",
    description: "No analytics or tracking scripts",
  },
  {
    icon: Server,
    label: "No Uploads",
    description: "Files never leave your browser",
  },
  {
    icon: Cookie,
    label: "No Cookies",
    description: "Zero cookies or local storage",
  },
  {
    icon: Shield,
    label: "No Data Selling",
    description: "Your data is yours alone",
  },
];

export function PrivacyBanner() {
  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Shield className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold text-foreground">
          Privacy-First Processing
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {PRIVACY_POINTS.map((point) => (
          <div key={point.label} className="flex items-start gap-2">
            <point.icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
            <div>
              <p className="text-xs font-medium text-foreground">
                {point.label}
              </p>
              <p className="text-[11px] leading-snug text-muted-foreground">
                {point.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
