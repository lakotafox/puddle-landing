"use client";

import { useEffect, useRef, useLayoutEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useMotionValue,
  useVelocity,
  useAnimationFrame,
} from "motion/react";
import { WaterRipple } from "./water-ripple";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

function useElementWidth<T extends HTMLElement>(ref: React.RefObject<T | null>): number {
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    const updateWidth = () => ref.current && setWidth(ref.current.offsetWidth);
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, [ref]);
  return width;
}

function VelocityText({ children, baseVelocity = 100, className = "" }: { children: React.ReactNode; baseVelocity?: number; className?: string }) {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], { clamp: false });
  const copyRef = useRef<HTMLSpanElement>(null);
  const copyWidth = useElementWidth(copyRef);

  const wrap = (min: number, max: number, v: number) => {
    const range = max - min;
    return ((((v - min) % range) + range) % range) + min;
  };

  const x = useTransform(baseX, (v) => (copyWidth === 0 ? "0px" : `${wrap(-copyWidth, 0, v)}px`));
  const directionFactor = useRef(1);

  useAnimationFrame((_, delta) => {
    let moveBy = directionFactor.current * baseVelocity * (delta / 1000);
    if (velocityFactor.get() < 0) directionFactor.current = -1;
    else if (velocityFactor.get() > 0) directionFactor.current = 1;
    moveBy += directionFactor.current * moveBy * velocityFactor.get();
    baseX.set(baseX.get() + moveBy);
  });

  return (
    <div className="relative overflow-hidden w-full">
      <motion.div className="flex whitespace-nowrap" style={{ x }}>
        {Array.from({ length: 6 }, (_, i) => (
          <span className={`shrink-0 ${className}`} key={i} ref={i === 0 ? copyRef : null}>
            {children}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

interface Project {
  id: string;
  titleUp: string;
  titleDown: string;
  image: string;
  description: string;
}

const projects: Project[] = [
  { id: "1", titleUp: "Clock", titleDown: "In", image: "/img/puddle-1.webp", description: "The moment your team starts a shift, their pay starts adding up — second by second, in plain sight." },
  { id: "2", titleUp: "Watch it", titleDown: "Grow", image: "/img/puddle-2.webp", description: "Earnings climb in real time, visible to worker and employer alike. No mystery, no month-end surprises." },
  { id: "3", titleUp: "Money", titleDown: "Lands Instantly", image: "/img/puddle-3.webp", description: "Pay arrives the moment the work does — any hour, any day. Payday stops being a date on the calendar." },
];

function ProjectItem({ project, index }: { project: Project; index: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const [maskRadius, setMaskRadius] = useState(0);
  const isEven = index % 2 === 0;

  const xTo = useRef<gsap.QuickToFunc | null>(null);
  const yTo = useRef<gsap.QuickToFunc | null>(null);
  const scaleTo = useRef<gsap.QuickToFunc | null>(null);

  useEffect(() => {
    if (!canvasWrapperRef.current) return;
    xTo.current = gsap.quickTo(canvasWrapperRef.current, "x", { duration: 0.8, ease: "power3.out" });
    yTo.current = gsap.quickTo(canvasWrapperRef.current, "y", { duration: 0.8, ease: "power3.out" });
    scaleTo.current = gsap.quickTo(canvasWrapperRef.current, "scale", { duration: 0.6, ease: "power2.out" });
  }, []);

  // Desktop: subtle parallax as the cursor drifts across the bubble.
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = imageContainerRef.current?.getBoundingClientRect();
    if (!rect || !xTo.current || !yTo.current) return;
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    xTo.current(-x * 30);
    yTo.current(-y * 30);
  };

  const handleMouseEnter = () => scaleTo.current?.(1.22);
  const handleMouseLeave = () => { xTo.current?.(0); yTo.current?.(0); scaleTo.current?.(1.15); };

  useEffect(() => {
    if (!containerRef.current) return;
    const title = titleRef.current, desc = descRef.current;
    gsap.set(title, { y: 60, opacity: 0 });
    gsap.set(desc, { y: 40, opacity: 0 });

    const maskTl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 80%",
        end: "top -20%",
        scrub: 1.5,
        invalidateOnRefresh: true,
        onUpdate: (self) => setMaskRadius(self.progress * 1200),
        onLeaveBack: () => setMaskRadius(0),
      },
    });
    maskTl.to({}, { duration: 1 });

    const textTl = gsap.timeline({
      scrollTrigger: { trigger: containerRef.current, start: "top 50%", toggleActions: "play none none reverse" },
    });
    textTl.to(title, { y: 0, opacity: 1, duration: 1, ease: "power3.out" })
      .to(desc, { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" }, "-=0.6");

    return () => { maskTl.kill(); textTl.kill(); };
  }, []);

  return (
    <div ref={containerRef} className="group py-16 md:py-24">
      <div className="mx-auto max-w-360 px-6 sm:px-12 lg:px-24 2xl:max-w-450 3xl:max-w-550">
        <div className={`flex flex-col gap-8 ${isEven ? "md:flex-row" : "md:flex-row-reverse"} md:items-center md:gap-16`}>
          <div
            ref={imageContainerRef}
            className="relative aspect-4/3 w-full overflow-hidden rounded-full md:w-3/5"
            style={{ touchAction: "pan-y" }}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div
              ref={canvasWrapperRef}
              className="absolute inset-0 w-full h-full"
              style={{ willChange: "transform", transformStyle: "preserve-3d", backfaceVisibility: "hidden", transform: "scale(1.15)" }}
            >
              <WaterRipple src={project.image} maskRadius={maskRadius} />
            </div>
          </div>
          <div className={`flex flex-col md:w-2/5 ${isEven ? "" : "md:text-right"}`}>
            <span className="text-base font-medium uppercase tracking-widest text-muted-foreground mb-6">0{index + 1}</span>
            <h3 ref={titleRef} className="text-[clamp(2.5rem,6vw,6rem)] leading-[1.05] tracking-tight text-foreground mb-8">
              <span className="font-medium">{project.titleUp}</span><br />
              <span className="font-serif italic">{project.titleDown}</span>
            </h3>
            <p ref={descRef} className={`text-muted-foreground text-xl leading-relaxed ${isEven ? "max-w-lg" : "max-w-lg md:ml-auto"}`}>
              {project.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Projects() {
  return (
    <section id="projects" className="projects bg-background relative py-24">
      <div className="pb-16">
        <VelocityText baseVelocity={80} className="text-[clamp(4rem,12vw,14rem)] font-medium italic tracking-tight text-foreground uppercase px-8">
          Streaming <span className="font-serif font-thin">Wages</span>&nbsp;
        </VelocityText>
      </div>
      <div className="flex flex-col">
        {projects.map((project, index) => (
          <ProjectItem key={project.id} project={project} index={index} />
        ))}
      </div>
    </section>
  );
}
