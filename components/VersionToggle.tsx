"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Temporary demo control — lets us flip between the current landing (v1)
// and the new template-based landing (v2). Remove before real launch.
export function VersionToggle() {
  const pathname = usePathname();
  const isV2 = pathname?.startsWith("/v2");

  return (
    <div className="fixed left-4 top-4 z-[200] flex items-center gap-1 rounded-full border border-white/15 bg-black/60 p-1 text-xs font-medium backdrop-blur-md">
      <Link
        href="/"
        className={`rounded-full px-3 py-1 transition-colors ${
          isV2 ? "text-white/50 hover:text-white" : "bg-white text-black"
        }`}
      >
        v1
      </Link>
      <Link
        href="/v2"
        className={`rounded-full px-3 py-1 transition-colors ${
          isV2 ? "bg-white text-black" : "text-white/50 hover:text-white"
        }`}
      >
        v2
      </Link>
    </div>
  );
}
