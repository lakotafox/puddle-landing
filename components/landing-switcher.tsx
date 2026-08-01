"use client";

/**
 * Two landing designs, one set of Puddl3 content — flip between them with the
 * pill in the top-left, and flip light/dark with the button beside it. Both
 * choices persist to localStorage so a reload (or a link handed to someone
 * mid-demo) comes back the same way.
 *
 * Both templates style themselves off the same CSS variable names
 * (--background, --foreground, --muted…), so each variant scopes its own
 * palette on its own wrapper class — see .theme-agency / .theme-finance in
 * globals.css. The palettes live in CSS rather than inline styles here
 * specifically so the .dark branch can override them; inline styles would win
 * and light mode would silently do nothing.
 *
 * Only one design is mounted at a time, which also keeps the two smooth-scroll
 * providers from fighting over the scroll container.
 */
import { ThemeProvider, useTheme } from "next-themes";
import { useEffect, useState, type ReactNode } from "react";

// Agency (the original)
import { Providers as AgencyProviders } from "@/components/agency/providers";
import { Header as AgencyHeader } from "@/components/agency/header";
import { Hero as AgencyHero } from "@/components/agency/hero";
import { Projects } from "@/components/agency/projects";
import { Services } from "@/components/agency/services";
import { About } from "@/components/agency/about";
import { SocialProof } from "@/components/agency/social-proof";
import { Faq as AgencyFaq } from "@/components/agency/faq";
import { Footer as AgencyFooter } from "@/components/agency/footer";

// Finance
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

type Variant = "agency" | "finance";
const VARIANT_KEY = "puddl3_landing_variant";

function AgencyLanding(): ReactNode {
  return (
    <AgencyProviders>
      <div className="theme-agency bg-background text-foreground">
        <AgencyHeader />
        <main
          id="main-content"
          className="lg:relative lg:z-10 flex-1 bg-background"
        >
          <AgencyHero />
          <Projects />
          <Services />
          <About />
          <SocialProof />
          <AgencyFaq />
        </main>
        <AgencyFooter />
      </div>
    </AgencyProviders>
  );
}

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

// These controls sit outside both theme wrappers, so they can't read
// --ring/--background (they'd pick up the base greyscale palette off :root).
// They carry the brand colour directly instead: cyan on dark ground, the
// darkened hue on light so it stays legible.
function pillStyle(isDark: boolean): React.CSSProperties {
  const brand = isDark ? "#2FD8E8" : "#0B7A88";
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.45rem 0.85rem",
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
  };
}

function DemoControls({
  variant,
  onFlip,
}: {
  variant: Variant;
  onFlip: () => void;
}): ReactNode {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // The server can't know the stored theme, so render nothing until mount —
  // otherwise the icon flashes the wrong state on load.
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";

  return (
    <div
      style={{
        // Bottom-left, not top — both designs put their wordmark in the
        // top-left corner and these pills would sit right on top of it.
        position: "fixed",
        bottom: "1rem",
        left: "1rem",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
      }}
    >
      <button
        type="button"
        onClick={onFlip}
        style={pillStyle(isDark)}
        aria-label={`Switch to the ${
          variant === "agency" ? "finance" : "agency"
        } design`}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: 999,
            background: isDark ? "#2FD8E8" : "#0B7A88",
          }}
        />
        {variant === "agency" ? "Design A" : "Design B"}
      </button>

      <button
        type="button"
        onClick={() => setTheme(isDark ? "light" : "dark")}
        style={{ ...pillStyle(isDark), padding: "0.45rem 0.7rem" }}
        aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      >
        {isDark ? (
          // sun
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </svg>
        ) : (
          // moon
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
          </svg>
        )}
        {isDark ? "Light" : "Dark"}
      </button>
    </div>
  );
}

export function LandingSwitcher(): ReactNode {
  const [variant, setVariant] = useState<Variant>("agency");

  // Read the saved choice after mount — reading localStorage during render
  // would mismatch the server-rendered markup.
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(VARIANT_KEY);
      if (saved === "finance" || saved === "agency") setVariant(saved);
    } catch {}
  }, []);

  const flip = () => {
    const next: Variant = variant === "agency" ? "finance" : "agency";
    setVariant(next);
    try {
      window.localStorage.setItem(VARIANT_KEY, next);
    } catch {}
    window.scrollTo({ top: 0 });
  };

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      {variant === "agency" ? <AgencyLanding /> : <FinanceLanding />}
      <DemoControls variant={variant} onFlip={flip} />
    </ThemeProvider>
  );
}
