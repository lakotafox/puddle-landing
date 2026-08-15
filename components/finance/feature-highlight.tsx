"use client";

import { type ReactNode } from "react";
import { ArrowRight, TrendingUp, MessageSquare, Zap } from "lucide-react";
import { motion } from "motion/react";

const ease = [0.16, 1, 0.3, 1] as const;

const features = [
  {
    icon: <TrendingUp className="w-4 h-4" />,
    text: "Earnings visible in real time, to worker and employer alike.",
  },
  {
    icon: <Zap className="w-4 h-4" />,
    text: "Money lands any hour of the day. No pay-cycle math.",
  },
  {
    icon: <MessageSquare className="w-4 h-4" />,
    text: "Nothing for workers to install. It just works.",
  },
];

function PhoneInCard(): ReactNode {
  return (
    <div className="relative bg-accent/5 rounded-md border border-accent/10 pt-10 px-16 overflow-hidden h-full flex flex-col">
      <div className="relative w-full max-w-70 mx-auto flex-1 flex flex-col">
        <div className="relative bg-neutral-900 rounded-t-4xl pt-1 px-1 flex-1 flex flex-col">
          <div className="bg-background rounded-t-[1.75rem] pt-6 flex-1">
            <div className="px-5 pb-6">
              <p className="text-[10px] text-muted-foreground mb-1">Earned Today</p>
              <p className="text-2xl font-semibold tracking-tight text-foreground mb-1">$184.26</p>
              <p className="text-xs text-emerald-500 font-medium mb-6">accruing every second</p>

              <div className="h-20 mb-6">
                <svg viewBox="0 0 200 80" className="w-full h-full" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0,60 Q20,55 40,50 T80,45 T120,35 T160,40 T200,20 V80 H0 Z"
                    fill="url(#chartGradient)"
                  />
                  <path
                    d="M0,60 Q20,55 40,50 T80,45 T120,35 T160,40 T200,20"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2"
                  />
                </svg>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#2FD8E8]/10 flex items-center justify-center">
                      <span className="text-[#2FD8E8] text-xs">↑</span>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-foreground">Earned</p>
                      <p className="text-[10px] text-muted-foreground">This shift</p>
                    </div>
                  </div>
                  <p className="text-xs font-medium text-foreground">+$184.26</p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center">
                      <span className="text-rose-500 text-xs">↓</span>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-foreground">Cashed out</p>
                      <p className="text-[10px] text-muted-foreground">1:12 PM</p>
                    </div>
                  </div>
                  <p className="text-xs font-medium text-foreground">-$60.00</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-16 bg-linear-to-t from-accent/5 to-transparent pointer-events-none" />
    </div>
  );
}

export function FeatureHighlight(): ReactNode {
  return (
    <section className="relative w-full bg-background pb-24 sm:pb-32 overflow-hidden">
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-stretch">
          <div className="flex flex-col justify-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease }}
              className="text-3xl sm:text-4xl lg:text-5xl font-medium font-serif leading-tight text-foreground"
            >
              Payday shouldn&apos;t make people wait.
              <br />
              <span className="italic">Money should move like they do.</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1, ease }}
              className="mt-6 text-foreground/70 leading-relaxed max-w-lg"
            >
              At Puddl3, we think a two-week wait for money you already earned is a relic. So we made payday every second.
            </motion.p>

            <motion.ul
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2, ease }}
              className="mt-8 space-y-4"
            >
              {features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="shrink-0 mt-0.5 text-foreground/60">
                    {feature.icon}
                  </span>
                  <span className="text-foreground/80">{feature.text}</span>
                </li>
              ))}
            </motion.ul>

            <motion.a
              href="#"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3, ease }}
              className="group inline-flex items-center gap-2 mt-10 text-foreground font-medium hover:opacity-70 transition-opacity"
            >
              Learn more
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </motion.a>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease }}
            className="flex justify-center lg:justify-end h-full"
          >
            <PhoneInCard />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
