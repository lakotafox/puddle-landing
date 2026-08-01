/**
 * ============================================================================
 * SITE CONFIGURATION
 * ============================================================================
 *
 * Customize your landing page by editing the values below.
 * All text, links, and settings are centralized here for easy editing.
 */

export const siteConfig = {
  name: "Finaro",
  tagline: "Modern Banking for Modern Business",
  description:
    "The financial platform that grows with you. From personal accounts to enterprise solutions, manage your money with confidence.",
  url: "https://finaro.com",
  twitter: "@finaro",

  nav: {
    cta: {
      text: "Get Started",
      href: "#",
    },
    signIn: {
      text: "Sign in",
      href: "#",
    },
  },
} as const;

export const heroConfig = {
  headline: {
    line1: "Banking that",
    line2: "works for you",
  },
  description:
    "The financial platform that grows with you. From personal accounts to enterprise solutions.",
  cta: {
    primary: {
      text: "Open an Account",
      href: "#",
    },
    secondary: {
      text: "Book a Demo",
      href: "#",
    },
  },
} as const;

export const trustedByConfig = {
  title: "Trusted by industry leaders",
} as const;

export const featureCardsConfig = {
  title: "The new standard",
  subtitle: "for modern banking",
} as const;

export const featureHighlightConfig = {
  features: [
    {
      icon: "trending-up",
      text: "Real-time analytics and insights for smarter decisions.",
    },
    {
      icon: "message-square",
      text: "Ask questions about your finances in plain English.",
    },
  ],
} as const;

export const principlesConfig = {
  title: "Built on principles that matter",
} as const;

export const statsConfig = {
  stats: [
    { value: 5, suffix: "B+", prefix: "$", label: "Processed annually" },
    { value: 99.9, suffix: "%", label: "Uptime guarantee" },
    { value: 150, suffix: "+", label: "Countries supported" },
    { value: 2, suffix: "M+", label: "Active users" },
  ],
} as const;

export const testimonialsConfig = {
  title: "Trusted by Finance Leaders",
} as const;

export const pricingConfig = {
  title: "Plans that grow with you",
  trustBadge: "Trusted by 50,000+ businesses",
} as const;

export const faqConfig = {
  title: "Frequently Asked Questions",
  contact: {
    text: "Still have questions?",
    cta: {
      text: "Contact Support",
      href: "mailto:support@finaro.com",
    },
  },
} as const;

export const blogConfig = {
  title: "Latest from our blog",
  description: "Insights, guides, and news to help you make smarter financial decisions.",
  cta: {
    text: "View all articles",
    href: "#",
  },
} as const;

export const finalCtaConfig = {
  headline: "Ready to transform your finances?",
  description: "Join thousands of businesses already using Finaro to manage their money smarter.",
  cta: {
    text: "Get Started Free",
    href: "#",
  },
} as const;

export const footerConfig = {
  description:
    "The financial platform built for modern businesses. Secure, fast, and designed to scale with you.",
  cta: {
    text: "Open an Account",
    href: "#",
  },
  links: {
    product: [
      { label: "Personal", href: "#" },
      { label: "Business", href: "#" },
      { label: "Enterprise", href: "#" },
      { label: "API", href: "#" },
    ],
    company: [
      { label: "About", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Contact", href: "#" },
    ],
    legal: [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
      { label: "Security", href: "#" },
    ],
  },
  contact: {
    location: "San Francisco",
    address: "548 Market St, Suite 95000\nSan Francisco, CA 94104",
    hours: "Mon-Fri 9:00 am - 6:00 pm (PST)",
    email: "hello@finaro.com",
  },
  copyright: `© ${new Date().getFullYear()} Finaro Inc. All rights reserved.`,
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
  statsSection: true,
  blogSection: true,
  testimonialsSection: true,
} as const;

/**
 * ============================================================================
 * THEME CONFIGURATION
 * ============================================================================
 *
 * Colors are defined in globals.css using CSS custom properties.
 * This config controls which theme features are enabled.
 */
export const themeConfig = {
  defaultTheme: "system" as "light" | "dark" | "system",
  enableSystemTheme: true,
} as const;
