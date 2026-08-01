import type { Metadata } from "next";
import type { ReactNode } from "react";
import { LandingSwitcher } from "@/components/landing-switcher";

export const metadata: Metadata = {
  title: "Puddl3 — Payday, every day",
  description:
    "Puddl3 streams wages to your team in real time. No paydays, no waiting — money that moves the moment work happens.",
};

// Stays a server component so the metadata above still applies; the switcher
// (and both landing designs) run on the client.
export default function HomePage(): ReactNode {
  return <LandingSwitcher />;
}
