import Link from "next/link";
import { SystemStatus } from "@/components/chronos/system-status";
import { enabledNav, siteConfig } from "@/config/site";
import { MobileNav } from "./mobile-nav";
import { MotionToggle } from "./motion-toggle";

/** The institutional mark: the favicon's geometry, inline. */
function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true" focusable="false">
      <circle cx="32" cy="32" r="21" fill="none" stroke="currentColor" strokeWidth="4" />
      <path d="M6 32h52" stroke="var(--temporal)" strokeWidth="4" />
      <path d="M36 32l14 12" stroke="var(--accent)" strokeWidth="4" strokeLinecap="square" />
      <circle cx="32" cy="32" r="4.5" fill="currentColor" />
    </svg>
  );
}

/**
 * Translucent administrative header: mark and name, the in-page
 * navigation, the system status. Content scrolls under it.
 */
export function SiteHeader() {
  const nav = enabledNav();
  return (
    <header
      className="fixed inset-x-0 top-0 z-[var(--z-header)] h-[var(--header-h)] border-b border-line bg-bg/95 text-fg backdrop-blur-md [@media(prefers-reduced-transparency:reduce)]:bg-bg"
    >
      <div className="mx-auto flex h-full w-full max-w-[var(--content-max)] items-center gap-6 px-[var(--gutter)]">
        <Link href="/#top" className="flex items-center gap-3 rounded-xs">
          <Mark className="h-6 w-6 text-sage" />
          <span className="font-display text-body font-medium tracking-tight">{siteConfig.name}</span>
          <span className="meta-label hidden text-fg-subtle md:inline">{siteConfig.designation}</span>
          <span className="sr-only">, back to top</span>
        </Link>

        <nav aria-label="Primary" className="ml-auto hidden md:block">
          <ul className="flex items-center gap-1">
            {nav.map((item, i) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="group flex h-9 items-center gap-2 rounded-xs px-3 font-mono text-mono text-fg-muted transition-colors duration-[var(--dur-fast)] hover:bg-surface-2 hover:text-fg"
                >
                  <span className="text-micro text-temporal-text transition-colors group-hover:text-temporal-text">{String(i + 1).padStart(2, "0")}</span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-2 md:ml-6 md:gap-4">
          <div className="hidden lg:block">
            <SystemStatus />
          </div>
          <MotionToggle />
          <MobileNav items={nav} />
        </div>
      </div>
      {/* Scroll progress: a one-pixel rule along the bottom edge, driven by ScrollSignals. */}
      <div id="scroll-progress" aria-hidden="true" className="absolute inset-x-0 -bottom-px h-px origin-left scale-x-0 bg-temporal" />
    </header>
  );
}
