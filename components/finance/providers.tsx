"use client";

import { SmoothScroll } from "@/components/finance/smooth-scroll";
import { ReducedMotionProvider } from "@/lib/finance/motion";
import type { ReactNode } from "react";

// No ThemeProvider here — LandingSwitcher owns the single one so the light/dark
// toggle keeps working across both designs.
export function Providers({ children }: { children: ReactNode }): ReactNode {
  return (
    <ReducedMotionProvider>
      <SmoothScroll>{children}</SmoothScroll>
    </ReducedMotionProvider>
  );
}
