"use client";

import { type ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";

const ease = [0.16, 1, 0.3, 1] as const;

type PricingPlan = {
  name: string;
  tagline: string;
  price: string;
  priceDetail?: string;
  description: string;
  cta: string;
  ctaSecondary?: string;
  featured?: boolean;
  preferredBy: string[];
};

const plans: PricingPlan[] = [
  {
    name: "Personal",
    tagline: "No credit card required",
    price: "Free forever",
    description:
      "Everything you need to manage your personal finances. Unlimited transactions, up to 2 accounts, and basic analytics.",
    cta: "Get Started",
    preferredBy: ["Individuals", "Students", "Freelancers"],
  },
  {
    name: "Business",
    tagline: "Scale your financial operations",
    price: "Starts at $0",
    priceDetail: "$0/mo for first 10K transactions, then $0.10 per transaction. Unlimited accounts, team access, and priority support.",
    description:
      "$0/mo for first 10K transactions, then $0.10 per transaction. Unlimited accounts, team access, and priority support.",
    cta: "Start for Free",
    featured: true,
    preferredBy: ["Startups", "SMBs", "Agencies"],
  },
  {
    name: "Enterprise",
    tagline: "Custom solutions at scale",
    price: "Let's chat",
    description:
      "Unlimited everything. Dedicated account manager, custom integrations, SLA guarantees, and compliance support.",
    cta: "Contact Sales",
    preferredBy: ["Banks", "Fintechs", "Enterprises"],
  },
];

function AvatarStack(): ReactNode {
  return (
    <div className="flex items-center -space-x-2">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="w-8 h-8 rounded-full bg-background border-2 border-background flex items-center justify-center overflow-hidden"
        >
          <div className="w-full h-full bg-linear-to-br from-foreground/20 to-foreground/5" />
        </div>
      ))}
    </div>
  );
}

function PricingCard({ plan, index }: { plan: PricingPlan; index: number }): ReactNode {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.1 * index, ease }}
      className={`relative flex flex-col p-6 sm:p-8 rounded-md border bg-background border-border transition-shadow ${
        plan.featured
          ? "shadow-xl hover:shadow-2xl"
          : "shadow-sm hover:shadow-lg"
      }`}
    >
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
        <p className="text-sm text-muted-foreground mt-1">{plan.tagline}</p>
      </div>
      <div className="mb-6">
        <p className="text-3xl sm:text-4xl font-semibold text-foreground">
          {plan.price}
        </p>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed mb-8 flex-1">
        {plan.description}
      </p>
      <div className="flex flex-col gap-3 mb-8">
        <a
          href="#"
          className={`group inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-150 active:scale-[0.97] ${
            plan.featured
              ? "bg-foreground text-background hover:bg-foreground/90"
              : "bg-transparent border border-border text-foreground hover:bg-muted"
          }`}
        >
          {plan.cta}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </a>
        {plan.ctaSecondary && (
          <a
            href="#"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors text-center"
          >
            {plan.ctaSecondary}
          </a>
        )}
      </div>
      <div className="pt-6 border-t border-border">
        <p className="text-xs text-muted-foreground mb-2">Preferred by:</p>
        <div className="flex items-center gap-4">
          {plan.preferredBy.map((company) => (
            <span
              key={company}
              className="text-xs font-medium text-foreground/70"
            >
              {company}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export function Pricing(): ReactNode {
  return (
    <section className="relative w-full bg-background py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        <div className="flex flex-col items-center text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease }}
            className="flex items-center gap-3 mb-6"
          >
            <AvatarStack />
            <span className="text-sm text-muted-foreground">
              Trusted by <span className="text-foreground font-medium">50,000+</span> businesses
            </span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1, ease }}
            className="text-3xl sm:text-4xl lg:text-5xl font-medium font-serif leading-tight text-foreground"
          >
            Plans that grow with you
          </motion.h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <PricingCard key={plan.name} plan={plan} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
