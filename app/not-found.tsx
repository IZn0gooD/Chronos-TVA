import type { Metadata } from "next";
import { NotFoundArt } from "@/components/chronos/not-found-art";
import { NothingFollows } from "@/components/chronos/nothing-follows";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SkipLink } from "@/components/layout/skip-link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = { title: "No such record" };

/** The global 404 renders inside the root layout only, so it brings the site chrome itself. */
export default function NotFound() {
  return (
    <>
      <SkipLink />
      <SiteHeader />
      <main id="main" className="flex-1">
    <section className="pt-[calc(var(--header-h)+4rem)] pb-24" aria-labelledby="nf-title">
      <Container size="content" className="grid gap-10">
        <p className="meta-label text-fg-muted">Error 404 // Record not found</p>
        <NotFoundArt />
        <h1 id="nf-title" className="font-display text-title font-medium tracking-tight text-fg">
          This route is not on any timeline we keep.
        </h1>
        <p className="max-w-prose text-body text-fg-muted">
          The address may have been pruned, or never filed. Everything the terminal keeps is reachable from its first page.
        </p>
        <div>
          <Button href="/" index="←">
            Return to the terminal
          </Button>
        </div>
      </Container>
    </section>
      </main>
      <SiteFooter closing={<NothingFollows />} />
    </>
  );
}
