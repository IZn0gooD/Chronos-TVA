import Link from "next/link";
import type { ReactNode } from "react";
import { AsciiBanner } from "@/components/ascii/ascii-banner";
import { CornerMarks } from "@/components/ui/corner-marks";
import { Metadata } from "@/components/ui/metadata";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { enabledNav, siteConfig } from "@/config/site";

interface SiteFooterProps {
  /** The last line of the record, supplied by the universe (a typed piece, a motto, nothing). */
  closing?: ReactNode;
  /** A full-width plate above the end-of-record rule: a readout, a last figure. */
  plate?: ReactNode;
}

/**
 * Colophon and back cover. Identity and status, the index of the folder,
 * the colophon from the configuration; then a graduated rule ends on a
 * teal square ("end of record") and the record closes. The layout layer
 * knows no universe words: they all come from config or the `closing` slot.
 */
export function SiteFooter({ closing, plate }: SiteFooterProps) {
  const nav = enabledNav();
  return (
    <footer id="system-status" className="relative border-t border-line-strong bg-bg-deep text-fg">
      <div className="mx-auto w-full max-w-[var(--content-max)] px-[var(--gutter)] pb-16 pt-14">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="text-paper/80">
              <AsciiBanner text={siteConfig.name} font="tall" pixel={1} gap={1} shadow="none" effect="still" fontSize="clamp(8px, 0.7vw, 10px)" style={{ lineHeight: 1 }} label={siteConfig.name} />
            </div>
            <div className="mt-6">
              <StatusIndicator status="nominal" label={siteConfig.footer.statusLabel} />
            </div>
            <Metadata
              className="mt-8 grid-cols-2"
              items={[
                { term: "System", value: siteConfig.systemId },
                { term: "Version", value: `v${siteConfig.version}` },
                { term: "Designation", value: siteConfig.designation },
                { term: "Folio", value: siteConfig.footer.folio },
              ]}
            />
          </div>

          <nav aria-label="Footer" className="md:col-span-3">
            <p className="meta-label text-fg-subtle">Index</p>
            <ul className="mt-3 grid gap-1">
              {nav.map((item, i) => (
                <li key={item.href}>
                  <Link href={item.href} className="group inline-flex h-8 items-center gap-3 font-mono text-mono text-fg-muted hover:text-fg">
                    <span className="text-micro text-temporal-text group-hover:text-temporal-text">{String(i + 2).padStart(2, "0")}</span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="md:col-span-4">
            <p className="meta-label text-fg-subtle">Colophon</p>
            <p className="mt-3 max-w-prose text-small text-fg-muted">{siteConfig.footer.colophon}</p>
            <p className="mt-3 max-w-prose text-small text-fg-subtle">{siteConfig.footer.disclaimer}</p>
          </div>
        </div>

        {plate && <div className="mt-16 border-t border-line-strong pt-10">{plate}</div>}

        {/* The line, ending: a graduated rule that stops on a teal square. Anchored from the right on small screens. */}
        <div className="relative mt-16 h-6" aria-hidden="true">
          <div className="absolute inset-y-0 left-0 w-[calc(100%-7.5rem)] bg-[repeating-linear-gradient(90deg,var(--line-strong)_0_1px,transparent_1px_24px)] [mask-image:linear-gradient(to_bottom,transparent_0,transparent_40%,#000_40%,#000_60%,transparent_60%)] md:w-[88%]" />
          <div className="absolute left-0 top-1/2 h-px w-[calc(100%-7.5rem)] -translate-y-1/2 bg-sage md:w-[88%]" />
          <div className="absolute left-[calc(100%-7.5rem)] top-1/2 h-2 w-2 -translate-y-1/2 bg-temporal md:left-[88%]" />
          <span className="meta-label absolute left-[calc(100%-6.5rem)] top-1/2 -translate-y-1/2 whitespace-nowrap text-fg-subtle md:left-[calc(88%+1rem)]">
            {siteConfig.footer.endMark}
          </span>
        </div>

        <div className="mt-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {closing}
          <p className="font-mono text-micro text-fg-subtle">{siteConfig.footer.signOff}</p>
        </div>
      </div>
      <CornerMarks position="bottom" className="inset-x-[var(--gutter)] bottom-6" />
    </footer>
  );
}
