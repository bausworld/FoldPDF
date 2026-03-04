"use client";

import { ProProvider } from "@/lib/pro-context";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ProStickyBanner } from "@/components/pro-sticky-banner";

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProProvider>
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader />
        <ProStickyBanner />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </div>
    </ProProvider>
  );
}
