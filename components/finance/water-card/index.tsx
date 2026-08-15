"use client";

// The Puddl3 card surfacing from water — a bounded section, not a page background.
// Sits directly under "How it works": the card is what the worker actually ends up
// holding, so it lands right after the explanation of how the money reaches them.
//
// Composition: <HalcyonGate> paints the water and sky into a canvas filling the
// section; <TiltCard> floats above it and pokes ripples into the shader through
// the ripple bus. Both are gated on `inView` so nothing animates — and no GPU is
// spent — until the section is actually on screen.

import { useRef } from "react";

import { useInView } from "motion/react";

import { HalcyonGate } from "@/components/finance/water-card/halcyon-gate";
import { TiltCard } from "@/components/finance/water-card/tilt-card";

export interface WaterCardProps {
  /** Overline above the heading. */
  eyebrow?: string;
  heading?: string;
  body?: string;
}

export function WaterCard({
  eyebrow = "The card",
  heading = "Your wages, the moment you earn them",
  body = "Every second you work, your balance goes up. Spend it straight from the card — no pay cycle, no waiting on a transfer.",
}: WaterCardProps) {
  const ref = useRef<HTMLElement>(null);
  // Fires only once the section reaches the middle of the viewport, not merely
  // when it peeks in from the bottom. The negative margins shrink the detection
  // box to the central 30% band, so the card starts surfacing when the section
  // is roughly centred and the whole rise happens on screen.
  //
  // `once` so it surfaces a single time; re-running the wake on every scroll-by
  // would turn a moment into a tic.
  const inView = useInView(ref, { once: true, margin: "-35% 0px -35% 0px" });

  return (
    <section
      ref={ref}
      aria-labelledby="water-card-heading"
      className="relative isolate min-h-[760px] w-full overflow-hidden bg-black lg:min-h-[820px]"
    >
      <HalcyonGate active={inView} />
      <TiltCard src="/assets/puddl3-card.svg" alt="The Puddl3 card" active={inView} />

      {/* Copy sits above the scene, top-left, clear of the card's centre column */}
      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 pt-16 lg:pt-24">
        <div className="max-w-md">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#2FD8E8]">
            {eyebrow}
          </p>
          <h2
            id="water-card-heading"
            className="mt-4 text-balance text-3xl font-semibold leading-tight text-white lg:text-4xl"
          >
            {heading}
          </h2>
          <p className="mt-4 text-pretty text-base leading-relaxed text-white/70">
            {body}
          </p>
        </div>
      </div>
    </section>
  );
}
