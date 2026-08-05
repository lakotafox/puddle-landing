"use client";

/**
 * The live landing page.
 *
 * Design B (components/finance) is what ships. Design A (components/agency) is
 * still in the repo, fully working — it just isn't wired up here. To bring it
 * back, import its pieces the way FinanceLanding does below and swap which one
 * LandingPage renders; its palette is already defined as `.theme-agency` in
 * globals.css.
 *
 * Both designs style themselves off the same CSS variable names, so each scopes
 * its palette on its own wrapper class rather than setting them globally. Those
 * palettes have to live in CSS and not as inline styles on the wrapper, so the
 * `.dark` branch can override them — inline styles would win and the light/dark
 * toggle would silently do nothing.
 */
import { ThemeProvider, useTheme } from "next-themes";
import { useEffect, useState, type ReactNode } from "react";

import { Providers as FinanceProviders } from "@/components/finance/providers";
import { Header as FinanceHeader } from "@/components/finance/header";
import { Hero as FinanceHero } from "@/components/finance/hero";
import { FeatureCards } from "@/components/finance/feature-cards";
import { FeatureHighlight } from "@/components/finance/feature-highlight";
import { Principles } from "@/components/finance/principles";
import { Stats } from "@/components/finance/stats";
import { TestimonialsSlider } from "@/components/finance/testimonials-slider";
import { FAQ as FinanceFaq } from "@/components/finance/faq";
import { FinalCTA } from "@/components/finance/final-cta";
import { Footer as FinanceFooter } from "@/components/finance/footer";

function FinanceLanding(): ReactNode {
  return (
    <FinanceProviders>
      <div className="theme-finance bg-background text-foreground">
        <FinanceHeader />
        {/* The template's TrustedBy (client logos), Pricing (tiers) and blog
            sections are deliberately left out: Puddl3 has no customers, no
            published pricing and no blog, and the only honest way to fill them
            would be to invent them. */}
        <main id="main-content" className="flex-1 bg-background">
          <FinanceHero />
          <FeatureCards />
          <FeatureHighlight />
          <Principles />
          <Stats />
          <TestimonialsSlider />
          <FinanceFaq />
          <FinalCTA />
        </main>
        <FinanceFooter />
      </div>
    </FinanceProviders>
  );
}

function ThemeToggle(): ReactNode {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // The server can't know the stored theme, so render nothing until mount —
  // otherwise the icon flashes the wrong state on load.
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";
  // This sits outside the theme wrapper, so it can't read --ring/--background
  // (it would pick up the base greyscale palette off :root). It carries the
  // brand colour directly: cyan on dark ground, the darkened hue on light.
  const brand = isDark ? "#2FD8E8" : "#0B7A88";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      style={{
        position: "fixed",
        bottom: "1rem",
        left: "1rem",
        zIndex: 9999,
        display: "inline-flex",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0.45rem 0.7rem",
        borderRadius: 999,
        border: `1px solid ${isDark ? "rgba(47,216,232,0.45)" : "rgba(11,122,136,0.4)"}`,
        background: isDark ? "rgba(7,11,24,0.72)" : "rgba(255,255,255,0.8)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        color: brand,
        fontSize: "0.72rem",
        fontWeight: 700,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        cursor: "pointer",
        lineHeight: 1,
      }}
    >
      {isDark ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
      )}
      {isDark ? "Light" : "Dark"}
    </button>
  );
}

export function LandingSwitcher(): ReactNode {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      <FinanceLanding />
      <ThemeToggle />
    </ThemeProvider>
  );
}
