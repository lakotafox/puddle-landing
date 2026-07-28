/**
 * ============================================================================
 * SITE CONFIGURATION
 * ============================================================================
 *
 * Customize your landing page by editing the values below.
 * All text, links, and settings are centralized here for easy editing.
 */

export const siteConfig = {
  name: "Puddl3",
  tagline: "Payday, every second.",
  description:
    "Puddle streams wages to your team in real time. No paydays, no waiting — money that moves the moment work happens.",
  url: "https://puddl3.xyz",
  twitter: "@puddl3",

  nav: {
    cta: {
      text: "Get Started",
      href: "/register",
    },
    signIn: {
      text: "Sign in",
      href: "/login",
    },
  },
} as const;

/**
 * ============================================================================
 * FEATURE FLAGS
 * ============================================================================
 *
 * Toggle features on/off without touching component code.
 */
export const features = {
  smoothScroll: true,
  darkMode: true,
} as const;

/**
 * ============================================================================
 * AUTH KILL-SWITCH
 * ============================================================================
 *
 * Backend isn't live yet, so every Sign In / Get Started entry point on the
 * landing is hidden. The /login, /register (with its stepper) and /dashboard
 * routes still exist and work — there's just no link to them.
 *
 * Flip this to `true` when the backend is up to re-enable all of it at once.
 */
export const AUTH_LIVE = false;

/**
 * ============================================================================
 * THEME CONFIGURATION
 * ============================================================================
 *
 * Colors are defined in globals.css using CSS custom properties.
 * This config controls which theme features are enabled.
 */
export const themeConfig = {
  defaultTheme: "dark" as const,
  enableSystem: true,
} as const;
