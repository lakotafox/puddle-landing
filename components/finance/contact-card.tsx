"use client";

// The "Get Started" destination. There is no signup flow yet, so every CTA on the
// site opens this instead of a dead form: Connor's name, a tappable number, and
// an email link, with both visible at once so the visitor picks.
//
// Centred card: droplet mark, heading, and the two ways to reach us as plain
// underlined links — a phone number and an email already look like what they
// are, so wrapping them in buttons added chrome without adding meaning.
//
// Provider + hook rather than one modal per button, because four separate CTAs
// (header desktop, header mobile, hero, final CTA) all open the same thing.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { AnimatePresence, motion } from "motion/react";

import { CONTACT } from "@/lib/contact";

const ContactCtx = createContext<{ open: () => void }>({ open: () => {} });

export const useContactCard = () => useContext(ContactCtx);

/** The logo mark, same droplet-over-ripples as the card face and the wordmark. */
function Droplet({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path
        d="M12 3.2c2.6 3.1 4.3 5.4 4.3 7.4a4.3 4.3 0 0 1-8.6 0c0-2 1.7-4.3 4.3-7.4z"
        fill="currentColor"
      />
      <ellipse
        cx="12"
        cy="17.6"
        rx="5.4"
        ry="2"
        stroke="currentColor"
        strokeWidth="1.3"
        opacity="0.85"
      />
      <ellipse
        cx="12"
        cy="17.6"
        rx="8.6"
        ry="3.2"
        stroke="currentColor"
        strokeWidth="1.05"
        opacity="0.45"
      />
    </svg>
  );
}

export function ContactCardProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  // Escape to dismiss, and hold the page still while the card is up so the
  // background doesn't scroll behind it.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [isOpen, close]);

  return (
    <ContactCtx.Provider value={{ open }}>
      {children}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-[2000] grid place-items-center px-4 py-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <button
              type="button"
              aria-label="Close"
              onClick={close}
              className="absolute inset-0 h-full w-full cursor-default bg-neutral-950/80 backdrop-blur-sm"
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="contact-card-title"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
              className="relative flex w-full max-w-lg flex-col items-center rounded-3xl border border-neutral-200 bg-neutral-50 p-10 text-center sm:p-14 dark:border-neutral-800 dark:bg-neutral-900"
            >
              <button
                ref={closeRef}
                type="button"
                onClick={close}
                aria-label="Close"
                className="absolute right-5 top-5 grid h-9 w-9 cursor-pointer place-items-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-200 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-white"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>

              {/* No badge — the mark sits directly on the card and is *carved*
                  into it. Debossing is just two offset shadows: a dark edge on
                  the top-left where the recess would fall into shadow, and a
                  light edge on the bottom-right where it catches the light.
                  The fill stays near-transparent so the card surface reads
                  through, which is what sells it as cut rather than printed. */}
              <Droplet
                className="h-16 w-16 text-white/25 dark:text-white/30 [filter:drop-shadow(0_-1px_0_rgba(0,0,0,0.55))_drop-shadow(0_1.5px_0_rgba(255,255,255,0.35))]"
              />

              <h2
                id="contact-card-title"
                className="mt-6 text-3xl font-medium leading-[1.1] tracking-tight text-neutral-900 sm:text-4xl dark:text-white"
              >
                Get in contact
                <br />
                with the CEO today
              </h2>

              {/* An underlined link, not a button. An email already looks like
                  what it is — wrapping it in a pill added chrome without adding
                  meaning. The underline sits low and thickens on hover, so the
                  hit target still reads as active. */}
              <div className="mt-8 flex flex-col items-center">
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="text-lg text-neutral-900 underline decoration-neutral-400 decoration-1 underline-offset-[6px] transition-colors hover:decoration-neutral-900 sm:text-xl dark:text-white dark:decoration-white/35 dark:hover:decoration-white"
                >
                  {CONTACT.email}
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ContactCtx.Provider>
  );
}
