"use client";

import { type ReactNode } from "react";
import {
  Sparkles,
  Landmark,
  CreditCard,
  BarChart3,
  ArrowRight,
  Shield,
} from "lucide-react";
import { motion } from "motion/react";

const ease = [0.16, 1, 0.3, 1] as const;

type PrincipleCard = {
  icon: ReactNode;
  label: string;
  description: string;
};

const principles: PrincipleCard[] = [
  {
    icon: <Landmark className="w-12 h-12" strokeWidth={1} />,
    label: "Instant Access",
    description:
      "Earned wages, any moment. No advances, no waiting period, no approval.",
  },
  {
    icon: <Shield className="w-12 h-12" strokeWidth={1} />,
    label: "Lower Turnover",
    description:
      "When people can reach the money they've earned, they stay longer and stress less.",
  },
  {
    icon: <CreditCard className="w-12 h-12" strokeWidth={1} />,
    label: "Instant Payouts",
    description:
      "Spend it mid-shift, spend it after work, or let it build. It's the worker's call.",
  },
  {
    icon: <BarChart3 className="w-12 h-12" strokeWidth={1} />,
    label: "Zero Employer Cost",
    description:
      "A benefit that pays for itself. Offering instant pay costs you nothing extra.",
  },
];

export function Principles(): ReactNode {
  return (
    <section id="why" className="relative w-full bg-muted text-foreground py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="flex flex-col">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease }}
              className="flex items-center gap-2 mb-6"
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Why Puddl3</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1, ease }}
              className="text-3xl sm:text-4xl lg:text-5xl font-medium font-serif leading-tight"
            >
              Payroll that moves{" "}
              <span className="italic">at the speed of work</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2, ease }}
              className="mt-6 text-foreground/70 leading-relaxed max-w-lg"
            >
              Wages accrue by the second and land the moment they&apos;re asked
              for, so nobody has to wait out a pay cycle to reach their own
              money.
            </motion.p>

            <motion.a
              href="#"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3, ease }}
              className="group inline-flex items-center gap-2 mt-8 px-6 py-3 bg-foreground text-background rounded-full text-sm font-medium w-fit hover:bg-foreground/90 transition-colors"
            >
              Get started
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </motion.a>
          </div>

          <div className="grid grid-cols-2 gap-2 max-w-md lg:ml-auto">
            {principles.map((principle, index) => (
              <motion.div
                key={principle.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * index, ease }}
                className="aspect-square flex flex-col items-center justify-center bg-foreground/5 rounded-sm"
              >
                <div className="mb-3 text-foreground/80">{principle.icon}</div>
                <p className="text-sm text-center text-foreground/80 px-4">
                  {principle.label}
                </p>
                <p className="mt-1.5 text-[11px] leading-snug text-center text-foreground/55 px-4">
                  {principle.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
