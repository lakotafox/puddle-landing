import type { ReactNode } from "react";
import { Header } from "@/components/agency/header";
import { Hero } from "@/components/agency/hero";
import { Projects } from "@/components/agency/projects";
import { Services } from "@/components/agency/services";
import { About } from "@/components/agency/about";
import { SocialProof } from "@/components/agency/social-proof";
import { Faq } from "@/components/agency/faq";
import { Footer } from "@/components/agency/footer";

export default function PuddleLandingV2(): ReactNode {
  return (
    <>
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
    </>
  );
}
