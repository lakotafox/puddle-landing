import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Providers } from "@/components/agency/providers";
import { VersionToggle } from "@/components/VersionToggle";

export const metadata: Metadata = {
  title: "Puddle — Get paid the moment you earn it",
  description:
    "Puddle streams wages to your team in real time. No paydays, no waiting — money that moves the moment work happens.",
};

// Dark-blue / light-blue / purple palette, scoped to the v2 landing.
// Overriding these vars on a wrapper cascades to every bg-background /
// text-foreground / bg-muted utility in the ported template.
const puddleTheme = {
  ["--background" as string]: "#070b18",
  ["--foreground" as string]: "#eef2fb",
  ["--muted" as string]: "#121d38",
  ["--muted-foreground" as string]: "#93a3c4",
  ["--border" as string]: "#1e2b47",
  ["--ring" as string]: "#3b82f6",
} as React.CSSProperties;

export default function V2Layout({
  children,
}: Readonly<{ children: ReactNode }>): ReactNode {
  return (
    <Providers>
      <VersionToggle />
      <div style={puddleTheme} className="bg-background text-foreground">
        {children}
      </div>
    </Providers>
  );
}
