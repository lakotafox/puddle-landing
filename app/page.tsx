import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Providers } from "@/components/agency/providers";
import { Header } from "@/components/agency/header";
import { Hero } from "@/components/agency/hero";
import { Projects } from "@/components/agency/projects";
import { Services } from "@/components/agency/services";
import { About } from "@/components/agency/about";
import { SocialProof } from "@/components/agency/social-proof";
import { Faq } from "@/components/agency/faq";
import { Footer } from "@/components/agency/footer";

export const metadata: Metadata = {
  title: "Puddle — Get paid the moment you earn it",
  description:
    "Puddle streams wages to your team in real time. No paydays, no waiting — money that moves the moment work happens.",
};

// Dark-blue / light-blue / purple palette, scoped to the landing.
// Overriding these vars on a wrapper cascades to every bg-background /
// text-foreground / bg-muted utility in the template components.
const puddleTheme = {
  ["--background" as string]: "#070b18",
  ["--foreground" as string]: "#eef2fb",
  ["--muted" as string]: "#121d38",
  ["--muted-foreground" as string]: "#93a3c4",
  ["--border" as string]: "#1e2b47",
  ["--ring" as string]: "#3b82f6",
} as React.CSSProperties;

export default function HomePage(): ReactNode {
  return (
    <Providers>
      <div style={puddleTheme} className="bg-background text-foreground">
        <Header />
        <main id="main-content" className="lg:relative lg:z-10 flex-1 bg-background">
          <Hero />
          <Projects />
          <Services />
          <About />
          <SocialProof />
          <Faq />
        </main>
        <Footer />
      </div>
    </Providers>
  );
}
