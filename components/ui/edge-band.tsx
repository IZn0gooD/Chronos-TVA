import { cn } from "@/lib/cn";

interface EdgeBandProps {
  /** Short mono items, printed with separators along the band. */
  items: ReadonlyArray<string>;
  /** Large figure at the band's end: a folio, an issue number. */
  figure?: string;
  className?: string;
}

/**
 * The spine of a folder: a flat band of colour hugging the right edge of
 * the viewport on wide screens, read bottom to top; a horizontal strip on
 * small ones. Generic: words and colours come from the caller.
 */
export function EdgeBand({ items, figure, className }: EdgeBandProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "flex items-center justify-between gap-6 bg-sage px-[var(--gutter)] py-3 text-on-sage",
        "lg:absolute lg:inset-y-0 lg:right-0 lg:w-[var(--spine-w)] lg:flex-col-reverse lg:px-0 lg:py-8",
        className,
      )}
    >
      <p className="meta-label whitespace-nowrap lg:[writing-mode:vertical-rl] lg:rotate-180">
        {items.map((item, i) => (
          <span key={item} className={i > 0 ? "hidden lg:inline" : undefined}>
            {i > 0 && "  —  "}
            {item}
          </span>
        ))}
      </p>
      {figure && <p className="shrink-0 font-display text-lead font-medium tabular">{figure}</p>}
    </div>
  );
}
