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

/**
 * Theme toggle — the ripple mark from the logo, and the theme change spreads
 * out from it as a circular wipe rather than cutting over.
 *
 * The mark is a droplet above two rings, so the button *is* the point a ripple
 * starts; the wipe is that ripple crossing the page. No sun, no moon, no label.
 * Same View Transitions technique the webapp's toggle uses.
 */
function ThemeToggle(): ReactNode {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [hover, setHover] = useState(false);

  // The server can't know the stored theme, so render nothing until mount —
  // otherwise the mark flashes the wrong state on load.
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";
  // Sits outside the theme wrapper, so it can't read --ring/--background (it
  // would pick up the base greyscale palette off :root). Carries the brand
  // colour directly: cyan on dark ground, the darkened hue on light.
  const brand = isDark ? "#2FD8E8" : "#0B7A88";

  const toggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    const next = isDark ? "light" : "dark";
    const apply = () => setTheme(next);

    const doc = document as Document & {
      startViewTransition?: (cb: () => void) => { ready: Promise<void> };
    };
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // No View Transitions support (Firefox, older Safari) or reduced motion —
    // switch instantly rather than half-animating.
    if (!doc.startViewTransition || reduced) {
      apply();
      return;
    }

    // Emanate from the button itself, and reach the furthest corner.
    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const r = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    doc
      .startViewTransition(apply)
      .ready.then(() => {
        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${r}px at ${x}px ${y}px)`,
            ],
          },
          {
            duration: 780,
            easing: "cubic-bezier(0.32, 0, 0.15, 1)",
            pseudoElement: "::view-transition-new(root)",
          }
        );
      })
      .catch(() => {});
  };

  return (
    <button
      type="button"
      onClick={toggle}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      style={{
        position: "fixed",
        bottom: "1.25rem",
        left: "1.25rem",
        zIndex: 9999,
        width: 42,
        height: 42,
        display: "grid",
        placeItems: "center",
        padding: 0,
        borderRadius: 999,
        border: `1px solid ${isDark ? "rgba(47,216,232,0.28)" : "rgba(11,122,136,0.26)"}`,
        background: isDark ? "rgba(7,11,24,0.6)" : "rgba(255,255,255,0.7)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        color: brand,
        cursor: "pointer",
        transition: "border-color 220ms ease, background 220ms ease",
      }}
    >
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        {/* droplet — solid in dark, hollow in light, so the state reads at a glance */}
        <path
          d="M12 3.2c2.6 3.1 4.3 5.4 4.3 7.4a4.3 4.3 0 0 1-8.6 0c0-2 1.7-4.3 4.3-7.4z"
          fill={isDark ? brand : "none"}
          stroke={brand}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        {/* two ripple rings — they widen on hover, previewing the wipe */}
        <ellipse
          cx="12" cy="17.6" rx={hover ? 6.6 : 5.4} ry={hover ? 2.5 : 2}
          stroke={brand} strokeWidth="1.4" opacity="0.85"
          style={{ transition: "all 260ms cubic-bezier(0.32,0,0.15,1)" }}
        />
        <ellipse
          cx="12" cy="17.6" rx={hover ? 10.4 : 8.6} ry={hover ? 3.9 : 3.2}
          stroke={brand} strokeWidth="1.1" opacity={hover ? 0.5 : 0.35}
          style={{ transition: "all 320ms cubic-bezier(0.32,0,0.15,1)" }}
        />
      </svg>
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
