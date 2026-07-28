"use client";

import { SmoothScroll } from "@/components/agency/smooth-scroll";
import { ReducedMotionProvider } from "@/lib/agency/motion";
import { OverlayProvider } from "@/lib/agency/overlay-context";
import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }): ReactNode {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      forcedTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      <ReducedMotionProvider>
        <OverlayProvider>
          <SmoothScroll>{children}</SmoothScroll>
        </OverlayProvider>
      </ReducedMotionProvider>
    </ThemeProvider>
  );
}
