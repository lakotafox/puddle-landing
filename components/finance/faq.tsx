"use client";

import { useState, type ReactNode } from "react";
import { Plus, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const ease = [0.16, 1, 0.3, 1] as const;

type FAQItem = {
  question: string;
  answer: string;
};

const faqs: FAQItem[] = [
  {
    question: "How does Puddl3 work?",
    answer:
      "Your team clocks in and their wages start accumulating in real time. Instead of waiting for a pay cycle, workers can see what they've earned and take it home whenever they want. Payroll runs itself in the background.",
  },
  {
    question: "When can workers actually get their money?",
    answer:
      "Any time. There's no payday and no waiting period — earnings are available the moment they're earned. A worker can cash out mid-shift, after work, or let it build up. It's their call.",
  },
  {
    question: "Does it cost employers anything?",
    answer:
      "Offering instant pay costs you nothing extra. Puddl3 turns payroll from a burden into a benefit you can give your team — one that helps you attract and keep good people without adding to your bill.",
  },
  {
    question: "Why does instant pay matter to my team?",
    answer:
      "Life doesn't wait for the 1st and the 15th. When people can reach the money they've already earned, they stay longer, stress less, and stop asking for advances. Faster pay is one of the simplest benefits you can offer.",
  },
  {
    question: "How hard is it to get started?",
    answer:
      "Minutes, not weeks. Create an account, add your team, and start streaming wages. There's nothing for your workers to install to see their earnings grow and cash out.",
  },
];

function FAQAccordionItem({
  item,
  isOpen,
  onToggle,
  index,
}: {
  item: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}): ReactNode {
  const answerId = `faq-answer-${index}`;
  const questionId = `faq-question-${index}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1, ease }}
      className="border-b border-foreground/10"
    >
      <button
        type="button"
        id={questionId}
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={answerId}
        className="w-full flex items-center justify-between py-6 text-left cursor-pointer group"
      >
        <span className="text-base sm:text-lg font-medium text-foreground pr-8">
          {item.question}
        </span>
        <div className="shrink-0 w-6 h-6 flex items-center justify-center">
          <motion.div
            animate={{ rotate: isOpen ? 45 : 0 }}
            transition={{ duration: 0.2, ease }}
          >
            <Plus className="w-5 h-5 text-foreground/60 group-hover:text-foreground transition-colors" aria-hidden="true" />
          </motion.div>
        </div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={answerId}
            role="region"
            aria-labelledby={questionId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-foreground/60 leading-relaxed max-w-2xl">
              {item.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function FAQ(): ReactNode {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="relative w-full bg-background py-24 sm:py-32 overflow-hidden">
      <div className="relative mx-auto max-w-7xl px-0 xl:px-12">
        <div className="px-8 sm:px-12">
          <div className="max-w-2xl mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease }}
              className="text-3xl sm:text-4xl lg:text-5xl font-medium font-serif leading-tight text-foreground"
            >
              Frequently asked questions
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1, ease }}
              className="mt-4 text-foreground/60"
            >
              Everything you need to know about real-time payroll.
            </motion.p>
          </div>

          <div className="border-t border-foreground/10">
            {faqs.map((faq, index) => (
              <FAQAccordionItem
                key={faq.question}
                item={faq}
                isOpen={openIndex === index}
                onToggle={() =>
                  setOpenIndex(openIndex === index ? null : index)
                }
                index={index}
              />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2, ease }}
            className="mt-12 flex flex-col sm:flex-row sm:items-center gap-4"
          >
            <p className="text-foreground/60">Still have questions?</p>
            <a
              href="#contact"
              className="group inline-flex items-center gap-2 text-foreground font-medium hover:opacity-70 transition-opacity"
            >
              Get in touch
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
