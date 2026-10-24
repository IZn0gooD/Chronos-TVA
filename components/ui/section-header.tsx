import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface SectionHeaderProps {
  /** Administrative index printed in mono: "03" or "SEC. 03". */
  index?: string;
  /** Small label above the title, e.g. the division or file reference. */
  eyebrow?: string;
  title: ReactNode;
  /** The heading level the title renders as. */
  level?: "h1" | "h2" | "h3";
  lede?: ReactNode;
  /** Right-hand slot on wide screens: metadata, a status, an action. */
  aside?: ReactNode;
  className?: string;
}

/**
 * Editorial section opening: index and eyebrow in mono, a display title and
 * an optional lede. The grid puts the aside on the right column on desktop
 * and below the title on narrow screens.
 */
export function SectionHeader({
  index,
  eyebrow,
  title,
  level = "h2",
  lede,
  aside,
  className,
}: SectionHeaderProps) {
  const Heading = level;
  return (
    <header className={cn("grid gap-6 lg:grid-cols-12 lg:gap-x-8", className)}>
      <div className="lg:col-span-8">
        {(index || eyebrow) && (
          <p className="meta-label mb-5 flex items-baseline gap-4 text-fg-muted">
            {index && <span className="text-temporal-text">{index}</span>}
            {eyebrow && <span>{eyebrow}</span>}
          </p>
        )}
        <Heading className="text-balance font-display text-title font-medium tracking-tight text-fg">
          {title}
        </Heading>
        {lede && <div className="mt-6 max-w-prose text-lead text-fg-muted">{lede}</div>}
      </div>
      {aside && <div className="lg:col-span-4 lg:justify-self-end lg:text-right">{aside}</div>}
    </header>
  );
}
