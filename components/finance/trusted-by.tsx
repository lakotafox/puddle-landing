"use client";

import { type ReactNode } from "react";
import { Star } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import { LogoLoop, type LogoItem } from "@/components/finance/logo-loop";

const ease = [0.16, 1, 0.3, 1] as const;

const logos: LogoItem[] = [
  {
    node: (
      <Image
        src="/finance/mock-logos/acmecorp.svg"
        alt="Acme Corp"
        width={120}
        height={32}
        className="h-[1em] w-auto dark:invert"
      />
    ),
  },
  {
    node: (
      <Image
        src="/finance/mock-logos/altshift.svg"
        alt="Altshift"
        width={120}
        height={32}
        className="h-[1em] w-auto dark:invert"
      />
    ),
  },
  {
    node: (
      <Image
        src="/finance/mock-logos/globalbank.svg"
        alt="Global Bank"
        width={120}
        height={32}
        className="h-[1em] w-auto dark:invert"
      />
    ),
  },
  {
    node: (
      <Image
        src="/finance/mock-logos/boltshift.svg"
        alt="Boltshift"
        width={120}
        height={32}
        className="h-[1em] w-auto dark:invert"
      />
    ),
  },
  {
    node: (
      <Image
        src="/finance/mock-logos/capsule.svg"
        alt="Capsule"
        width={120}
        height={32}
        className="h-[1em] w-auto dark:invert"
      />
    ),
  },
  {
    node: (
      <Image
        src="/finance/mock-logos/catalog.svg"
        alt="Catalog"
        width={120}
        height={32}
        className="h-[1em] w-auto dark:invert"
      />
    ),
  },
  {
    node: (
      <Image
        src="/finance/mock-logos/commandr.svg"
        alt="Commandr"
        width={120}
        height={32}
        className="h-[1em] w-auto dark:invert"
      />
    ),
  },
  {
    node: (
      <Image
        src="/finance/mock-logos/interlock.svg"
        alt="Interlock"
        width={120}
        height={32}
        className="h-[1em] w-auto dark:invert"
      />
    ),
  },
];

export function TrustedBy(): ReactNode {
  return (
    <section className="relative w-full bg-background py-16 sm:py-20">
      <div className="flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease }}
          className="flex items-center gap-0.5 mb-4"
        >
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className="w-3.5 h-3.5 fill-accent text-accent"
              aria-hidden="true"
            />
          ))}
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1, ease }}
          className="text-lg sm:text-xl font-serif italic text-foreground/80 mb-10"
        >
          Trusted by over 500+ companies
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2, ease }}
          className="w-full"
        >
          <LogoLoop logos={logos} speed={50} logoHeight={36} gap={80} />
        </motion.div>
      </div>
    </section>
  );
}
