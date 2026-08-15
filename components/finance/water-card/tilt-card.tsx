"use client";

// The Puddl3 card, floating dead-centre of the water section. It (1) tilts
// toward the pointer, (2) rises out of the water when the section scrolls into
// view — softly masked at the waterline so it *surfaces*, throwing a one-time
// fan of waves — and (3) carries a glossy chrome reflection that tracks the tilt.
//
// Two notes on how this is built:
//   - Springs run on `motion` (already a dependency) rather than a second spring
//     library, so the site doesn't ship two animation engines for one component.
//   - Every measurement is section-relative. Sizing against the viewport would be
//     correct for a full-screen hero and is wrong here.

import { useEffect, useRef } from "react";

import { motion, useSpring, useTransform } from "motion/react";

import { spawnRipple } from "@/lib/animation/ripple-bus";

export interface TiltCardProps {
  src: string;
  alt: string;
  /** Section is in view — triggers the surfacing. */
  active?: boolean;
}

const MAX_TILT = 12; // degrees of rotation at the section edges
const WATERLINE = "79%"; // height within the section where the reflection meets the sea

// One-time fan of waves as the card breaks the surface (section UV, sy bottom-up).
// No idle ripples — the water only reacts to this and the cursor.
//
// Timings are stretched to match the slow rise below: the waves should spread
// while the card is still emerging, not fire and finish before it clears the
// surface. Roughly the back half of the ascent.
const WAKE: readonly [number, number, number][] = [
  [0.5, 0.23, 700],
  [0.4, 0.21, 950],
  [0.6, 0.21, 1080],
  [0.34, 0.19, 1400],
  [0.66, 0.19, 1540],
  [0.5, 0.25, 1900],
];

export const TiltCard = ({ src, alt, active = false }: TiltCardProps) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const surfaced = useRef(false);

  // tension/friction in the original map to stiffness/damping here.
  const rx = useSpring(0, { stiffness: 120, damping: 18 });
  const ry = useSpring(0, { stiffness: 120, damping: 18 });
  // Overdamped so it eases up and settles without bounce. Roughly a two-second
  // ascent — the original's stiffness 45 popped it up in under a second, and a
  // first pass at stiffness 7 overshot into a five-second crawl.
  const ey = useSpring(600, {
    stiffness: 26,
    damping: 30,
    mass: 1.1,
    restDelta: 0.4,
  });

  // Mount: hold the card below the surface, and tilt from pointer position
  // measured against the section rather than the window.
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const section = host.parentElement ?? host;
    ey.jump(section.getBoundingClientRect().height * 0.62); // fully below the surface

    const onMove = (e: PointerEvent) => {
      const r = section.getBoundingClientRect();
      const nx = ((e.clientX - r.left) / r.width) * 2 - 1; // -1..1
      const ny = ((e.clientY - r.top) / r.height) * 2 - 1;
      if (nx < -1.2 || nx > 1.2 || ny < -1.2 || ny > 1.2) return;
      rx.set(-ny * MAX_TILT);
      ry.set(nx * MAX_TILT);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [rx, ry, ey]);

  // In view: surface the card once and throw the wave fan.
  useEffect(() => {
    if (!active || surfaced.current) return;
    surfaced.current = true;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      ey.jump(0);
      return;
    }
    // A beat of still water before anything moves, so the section settles
    // before the card starts up through it.
    const rise = window.setTimeout(() => ey.set(0), 450);
    const timers = WAKE.map(([sx, sy, delay]) =>
      window.setTimeout(() => spawnRipple(sx, sy), delay),
    );
    return () => {
      clearTimeout(rise);
      timers.forEach(clearTimeout);
    };
  }, [active, ey]);

  const riseCard = useTransform(ey, (y) => `translate(-50%, calc(-50% + ${y}px))`);
  const riseReflection = useTransform(ey, (y) => `translateX(-50%) translateY(${y}px)`);
  const cardTilt = useTransform(
    [rx, ry],
    ([x, y]: number[]) => `perspective(1100px) rotateX(${x}deg) rotateY(${y}deg)`,
  );
  const reflectionTilt = useTransform(
    [rx, ry],
    ([x, y]: number[]) =>
      `perspective(1100px) scaleY(-1) rotateX(${x}deg) rotateY(${y}deg)`,
  );

  // Polished-metal look: a soft mirror "environment" reflection — gentle
  // dark/bright bands that sweep as the card pitches, blended with `hard-light`
  // so a restrained highlight reads through the dark card without blowing out.
  const chrome = useTransform([rx, ry], ([x, y]: number[]) => {
    const p = 50 - x * 4; // reflected horizon sweeps with pitch
    const a = 108 + y * 1.5; // angle rakes with yaw
    return (
      `linear-gradient(${a}deg,` +
      `rgba(0,0,0,0.20) 0%,` +
      `rgba(255,255,255,0.04) ${p - 24}%,` +
      `rgba(0,0,0,0.16) ${p - 13}%,` +
      `rgba(255,255,255,0.22) ${p - 5}%,` +
      `rgba(255,255,255,0.34) ${p}%,` +
      `rgba(255,255,255,0.2) ${p + 5}%,` +
      `rgba(0,0,0,0.16) ${p + 16}%,` +
      `rgba(255,255,255,0.08) ${p + 32}%,` +
      `rgba(0,0,0,0.14) ${p + 50}%,` +
      `rgba(255,255,255,0.03) 100%)`
    );
  });

  const maskStyle = {
    maskImage: `url(${src})`,
    WebkitMaskImage: `url(${src})`,
  } as const;

  return (
    <>
      {/* CARD — centred; soft waterline mask so it surfaces on load */}
      <div
        ref={hostRef}
        className="pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,#000_78%,transparent_83%)] [mask-repeat:no-repeat] [mask-size:100%_100%]"
      >
        <motion.div
          style={{ transform: riseCard }}
          // Sits lower on small screens: the copy runs full-width there instead
          // of being a left column, so a centred card would collide with it.
          className="absolute left-1/2 top-[60%] h-[30%] aspect-[900/1314] will-change-transform sm:top-1/2 sm:h-[38%] lg:h-[44%]"
        >
          <motion.div
            style={{ transform: cardTilt }}
            className="absolute inset-0 will-change-transform"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={alt} className="absolute inset-0 h-full w-full" />
            {/* mirror environment reflection (soft chrome contrast) */}
            <motion.div
              aria-hidden
              style={{ backgroundImage: chrome, ...maskStyle }}
              className="absolute inset-0 mix-blend-hard-light [mask-repeat:no-repeat] [mask-size:100%_100%]"
            />
          </motion.div>
        </motion.div>
      </div>

      {/* REFLECTION on the water — faint, synced to the same rise/tilt */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 overflow-hidden"
        style={{ top: WATERLINE }}
      >
        <motion.div
          style={{ transform: riseReflection }}
          className="absolute left-1/2 top-0 aspect-[900/1314] h-[30%] will-change-transform sm:h-[38%] lg:h-[44%]"
        >
          <motion.img
            src={src}
            alt=""
            aria-hidden
            style={{ transform: reflectionTilt }}
            className="absolute inset-0 h-full w-full opacity-20 blur-[3px] [mask-image:linear-gradient(to_top,rgba(0,0,0,0.5),transparent_50%)]"
          />
        </motion.div>
      </div>
    </>
  );
};
