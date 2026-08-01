"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useInView } from "motion/react";

const ease = [0.16, 1, 0.3, 1] as const;

type Stat = {
  value: number;
  suffix: string;
  prefix?: string;
  label: string;
};

const stats: Stat[] = [
  { value: 0, suffix: "s", label: "Wait for earned pay" },
  { value: 24, suffix: "/7", label: "Streaming, always on" },
  { value: 0, suffix: "", prefix: "$", label: "Cost to employers to offer instant pay" },
  { value: 5, suffix: "s", label: "How often wages can land" },
];

function AnimatedCounter({
  value,
  suffix,
  prefix = "",
  duration = 2000,
}: {
  value: number;
  suffix: string;
  prefix?: string;
  duration?: number;
}): ReactNode {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isInView || hasAnimated.current) return;
    hasAnimated.current = true;

    const startTime = performance.now();
    const isDecimal = value % 1 !== 0;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = easeOut * value;

      setCount(isDecimal ? Math.round(currentValue * 10) / 10 : Math.floor(currentValue));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(value);
      }
    };

    requestAnimationFrame(animate);
  }, [isInView, value, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {count.toLocaleString("en-US", {
        minimumFractionDigits: value % 1 !== 0 ? 1 : 0,
        maximumFractionDigits: 1,
      })}
      {suffix}
    </span>
  );
}

export function Stats(): ReactNode {
  return (
    <section className="relative w-full bg-muted pb-16 sm:pb-20 overflow-hidden">
      <div className="relative mx-auto max-w-7xl px-6 sm:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 * index, ease }}
              className="flex flex-col items-center text-center"
            >
              <div className="text-4xl sm:text-5xl lg:text-6xl font-medium font-serif tracking-tight text-foreground mb-2">
                <AnimatedCounter
                  value={stat.value}
                  suffix={stat.suffix}
                  prefix={stat.prefix ?? ""}
                />
              </div>
              <p className="text-sm sm:text-base text-foreground/70">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
