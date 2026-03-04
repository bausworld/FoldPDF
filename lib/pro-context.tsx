/**
 * FoldPDF - Pro Tier Context
 * 
 * Manages the "Pro" state for the application.
 * In production, this should verify the Stripe payment session server-side.
 * For now, it checks for a "pro=true" query parameter (set after Stripe redirect)
 * or can be toggled manually for testing.
 * 
 * FREE TIER LIMITS:
 * - Max 3 PDF files at once
 * - Max 10 pages total
 * - No page reordering
 * 
 * PRO TIER (one-time payment):
 * - Unlimited PDFs and pages
 * - Page reordering enabled
 * - Optional watermark removal
 */

"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

interface ProContextType {
  isPro: boolean;
  unlockPro: () => void;
  /** Free tier limits */
  maxFiles: number;
  maxPages: number;
  canReorder: boolean;
}

const ProContext = createContext<ProContextType | undefined>(undefined);

/* ─── ADMIN: Free-tier limits (adjust as needed) ──────────────────────── */
const FREE_MAX_FILES = 3;
const FREE_MAX_PAGES = 10;

/** localStorage key where Pro status is persisted across sessions */
const PRO_STORAGE_KEY = "foldpdf-pro-unlocked";

export function ProProvider({ children }: { children: ReactNode }) {
  const [isPro, setIsPro] = useState(false);

  // On mount: restore from localStorage OR detect Stripe success redirect
  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Already paid on a previous visit → restore silently
    if (localStorage.getItem(PRO_STORAGE_KEY) === "1") {
      setIsPro(true);
      return;
    }

    // 2. Returning from Stripe payment (?pro=true)
    const params = new URLSearchParams(window.location.search);
    if (params.get("pro") === "true") {
      setIsPro(true);
      localStorage.setItem(PRO_STORAGE_KEY, "1");
      // Clean URL – drop ?pro=true&session_id=... from address bar
      const url = new URL(window.location.href);
      url.searchParams.delete("pro");
      url.searchParams.delete("session_id");
      window.history.replaceState({}, "", url.toString());
    }
  }, []);

  const unlockPro = useCallback(() => {
    setIsPro(true);
    if (typeof window !== "undefined") {
      localStorage.setItem(PRO_STORAGE_KEY, "1");
    }
  }, []);

  return (
    <ProContext.Provider
      value={{
        isPro,
        unlockPro,
        maxFiles: isPro ? Infinity : FREE_MAX_FILES,
        maxPages: isPro ? Infinity : FREE_MAX_PAGES,
        canReorder: isPro,
      }}
    >
      {children}
    </ProContext.Provider>
  );
}

export function usePro() {
  const context = useContext(ProContext);
  if (!context) {
    throw new Error("usePro must be used within a ProProvider");
  }
  return context;
}
