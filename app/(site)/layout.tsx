import type { ReactNode } from "react";
import { FinalStatus } from "@/components/chronos/final-status";
import { NothingFollows } from "@/components/chronos/nothing-follows";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SkipLink } from "@/components/layout/skip-link";
import { ScrollSignals } from "@/components/motion/scroll-signals";

/** The terminal's chrome: skip link, header, main landmark, colophon. The lab routes opt out by living in app/(lab). */
export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SkipLink />
      <ScrollSignals />
      <SiteHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter closing={<NothingFollows />} plate={<FinalStatus />} />
    </>
  );
}
