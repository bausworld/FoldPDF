/**
 * FoldPDF - Site Footer
 *
 * Includes nav links, branding, and privacy message.
 */

import { FileText, Heart, ExternalLink } from "lucide-react";

const FOOTER_LINKS = [
  { label: "Home", href: "https://pixel-and-purpose.com" },
  { label: "Privacy", href: "/privacy" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <a
              href="https://pixel-and-purpose.com"
              className="flex items-center gap-2 text-sm text-foreground transition-opacity hover:opacity-80"
            >
              <FileText className="h-4 w-4" />
              <span className="font-semibold">FoldPDF</span>
            </a>
            {/* Pixel & Purpose pill */}
            <a
              href="https://pixel-and-purpose.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
            >
              <span>by Pixel & Purpose</span>
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
          </div>

          {/* Nav links */}
          <nav aria-label="Footer navigation">
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              {FOOTER_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Bottom bar */}
        <div className="mt-6 flex flex-col items-center gap-2 border-t border-border pt-6 text-xs text-muted-foreground md:flex-row md:justify-between">
          <span>
            {"© "}{new Date().getFullYear()} Pixel & Purpose. All rights reserved.
          </span>
          <span className="flex items-center gap-1">
            Made with <Heart className="h-3 w-3 text-destructive" /> and a
            commitment to privacy
          </span>
        </div>
      </div>
    </footer>
  );
}
