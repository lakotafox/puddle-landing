"use client";

import Link from "next/link";

const socialLinks = [
  { label: "Instagram", href: "https://instagram.com" },
  { label: "LinkedIn", href: "https://linkedin.com" },
  { label: "Twitter", href: "https://twitter.com" },
];

const navLinks = [
  { label: "Home", href: "#" },
  { label: "How it works", href: "#projects" },
  { label: "Why Puddle", href: "#services" },
  { label: "Sign In", href: "/login" },
  { label: "Get Started", href: "/register" },
];

const footerLinks = [
  { label: "Sign In", href: "/login" },
  { label: "Get Started", href: "/register" },
  { label: "Dashboard", href: "/dashboard" },
];

export function Footer() {
  return (
    <footer id="contact" className="lg:sticky lg:bottom-0 lg:z-0 bg-foreground text-background">
      <div className="px-6 sm:px-12 lg:px-24 pt-24 lg:pt-32 pb-16 lg:pb-24 text-center sm:text-left max-w-360 2xl:max-w-450 3xl:max-w-550 mx-auto">
        <a
          href="/register"
          className="text-2xl sm:text-5xl lg:text-7xl font-medium tracking-tight hover:opacity-80 transition-opacity break-all sm:break-normal"
        >
          Make payday every second.
        </a>

        <div className="mt-10">
          <Link
            href="/register"
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-lg font-medium rounded-full bg-background text-foreground hover:bg-background/90 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </div>

      <div className="px-6 sm:px-12 lg:px-24 max-w-360 2xl:max-w-450 3xl:max-w-550 mx-auto">
        <div className="border-t border-background/10" />
      </div>

      <div className="px-6 sm:px-12 lg:px-24 py-16 lg:py-24 max-w-360 2xl:max-w-450 3xl:max-w-550 mx-auto">
        <div className="flex flex-col lg:flex-row justify-between gap-12 lg:gap-8">
          <div>
            <span className="text-4xl font-medium tracking-tight">puddl3</span>
            <p className="mt-4 text-background/60 text-4xl">Payday, every second.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-16 lg:gap-24">
            <div>
            <h4 className="text-sm font-medium text-background/60 mb-6">Why Puddle</h4>
            <div className="mb-6">
              <p className="font-medium mb-1">Instant access</p>
              <p className="text-background/60 text-sm">Earned wages, any moment</p>
            </div>
            <div>
              <p className="font-medium mb-1">Zero employer cost</p>
              <p className="text-background/60 text-sm">
                A benefit that pays<br />
                for itself
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-background/60 mb-6">Features</h4>
            <ul className="space-y-3">
              <li><span className="text-background">Wage Streaming</span></li>
              <li><span className="text-background">Instant Payouts</span></li>
              <li><span className="text-background">Live Dashboards</span></li>
              <li><span className="text-background">Team Roster</span></li>
              <li><span className="text-background">Lower Turnover</span></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-medium text-background/60 mb-6">Navigation</h4>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-background hover:text-background/60 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-medium text-background/60 mb-6">Social</h4>
            <ul className="space-y-3">
              {socialLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-background hover:text-background/60 transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          </div>
        </div>
      </div>

      <div className="px-6 sm:px-12 lg:px-24 py-6 max-w-360 2xl:max-w-450 3xl:max-w-550 mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            {footerLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm text-background/60 hover:text-background transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <p className="text-sm text-background/40">
            © 2026 Puddl3 - All rights reserved
          </p>

          <p className="text-sm text-background/40">
            The future of payroll is real-time
          </p>
        </div>
      </div>
    </footer>
  );
}
