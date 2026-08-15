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
import { WaterCard } from "@/components/finance/water-card";
import { FeatureHighlight } from "@/components/finance/feature-highlight";
import { Principles } from "@/components/finance/principles";
import { Stats } from "@/components/finance/stats";
import { FAQ as FinanceFaq } from "@/components/finance/faq";
import { FinalCTA } from "@/components/finance/final-cta";
import { Footer as FinanceFooter } from "@/components/finance/footer";
import { ContactCardProvider } from "@/components/finance/contact-card";

function FinanceLanding(): ReactNode {
  return (
    <FinanceProviders>
      <ContactCardProvider>
      <div className="theme-finance bg-background text-foreground">
        <FinanceHeader />
        {/* The template's TrustedBy (client logos), Pricing (tiers), blog and
            testimonials sections are deliberately left out: Puddl3 has no
            customers, no pilot employer, no published pricing and no blog, and
            the only honest way to fill them would be to invent them. Don't add
            them back without something real to put in. */}
        <main id="main-content" className="flex-1 bg-background">
          <FinanceHero />
          <FeatureCards />
          <WaterCard />
          <FeatureHighlight />
          <Principles />
          <Stats />
          <FinanceFaq />
          <FinalCTA />
        </main>
        <FinanceFooter />
      </div>
      </ContactCardProvider>
    </FinanceProviders>
  );
}

/**
 * Theme toggle — sun and moon, and the theme change spreads out from the button
 * as a circular wipe rather than cutting over.
 *
 * The mark shows the *current* theme: a moon in dark, a sun in light. The
 * earlier droplet-and-ripples mark tied into the brand but read as "water", not
 * "light/dark", and its solid-vs-hollow state cue was too subtle to catch. The
 * ripple stays where it belongs — in the wipe, which still emanates from this
 * button. Same View Transitions technique the webapp's toggle uses.
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
        {isDark ? (
          /* moon — we're in dark mode. Crescent cut with a mask so the shape
             stays clean at 19px instead of relying on a hairline stroke. */
          <>
            <defs>
              <mask id="puddl3-moon-mask">
                <rect width="24" height="24" fill="#fff" />
                <circle cx={hover ? 16.4 : 15.8} cy="8.6" r="7.4" fill="#000"
                  style={{ transition: "all 300ms cubic-bezier(0.32,0,0.15,1)" }} />
              </mask>
            </defs>
            <circle cx="12" cy="12" r="7.4" fill={brand} mask="url(#puddl3-moon-mask)" />
          </>
        ) : (
          /* sun — we're in light mode. Rays reach out on hover, previewing the wipe. */
          <>
            <circle cx="12" cy="12" r="4.3" fill={brand} />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
              <line
                key={deg}
                x1="12"
                y1={hover ? 5.0 : 5.6}
                x2="12"
                y2={hover ? 2.2 : 3.0}
                stroke={brand}
                strokeWidth="1.6"
                strokeLinecap="round"
                transform={`rotate(${deg} 12 12)`}
                style={{ transition: "all 300ms cubic-bezier(0.32,0,0.15,1)" }}
              />
            ))}
          </>
        )}
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
