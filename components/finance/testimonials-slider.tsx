"use client";

import { type ReactNode } from "react";
import { motion } from "motion/react";

const ease = [0.16, 1, 0.3, 1] as const;

type Testimonial = {
  quote: string;
  role: string;
  detail: string;
  badge?: string;
};

// Puddl3 has exactly one testimonial from an early pilot. Do not add invented
// quotes, names, companies or logos here — this is a real public marketing site.
const testimonial: Testimonial = {
  quote:
    "My crew watches their pay grow while they're still on the clock. Nobody asks me for an advance anymore — the money is just there.",
  role: "Shift Manager",
  detail: "Hourly crew of 12",
  badge: "Early pilot",
};

export function TestimonialsSlider(): ReactNode {
  return (
    <section
      id="reviews"
      className="relative w-full bg-background py-24 sm:py-32 overflow-hidden"
    >
      <div className="relative mx-auto max-w-270 px-6 sm:px-8">
        <div className="px-4 sm:px-8 lg:px-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease }}
            className="text-3xl sm:text-4xl lg:text-5xl font-medium font-serif leading-tight text-foreground text-center mb-16"
          >
            From an early pilot
          </motion.h2>

          <motion.figure
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1, ease }}
            className="mx-auto max-w-3xl text-center"
          >
            {testimonial.badge && (
              <span className="inline-flex items-center rounded-full border border-accent/30 bg-accent/5 px-3 py-1 text-xs font-medium text-accent mb-8">
                {testimonial.badge}
              </span>
            )}
            <blockquote className="text-2xl sm:text-3xl lg:text-4xl font-medium font-serif leading-snug text-foreground text-balance">
              &ldquo;{testimonial.quote}&rdquo;
            </blockquote>
            <figcaption className="mt-8">
              <p className="text-lg font-medium text-foreground">
                {testimonial.role}
              </p>
              <p className="text-sm text-foreground/60 mt-1">
                {testimonial.detail}
              </p>
            </figcaption>
          </motion.figure>
        </div>
      </div>
    </section>
  );
}
