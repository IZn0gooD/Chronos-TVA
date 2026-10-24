import type { CSSProperties } from "react";
import { Reveal } from "@/components/motion/reveal";
import { Grid } from "@/components/ui/grid";
import { cn } from "@/lib/cn";
import type { Directive } from "@/types/content";
import { PlateFigure } from "./directive-plates";

/**
 * Ground of each plate, in order: sage, obsidian, paper, deep green, olive,
 * obsidian. A ground names its surface (the geometry draws in currentColor),
 * the quieter text that still meets AA on it, and the figure's two colours:
 * the accent (rails, cores) and the mark (the one anomaly). Orange marks on
 * sage and paper sit at low luminance contrast on purpose: they are
 * decorative, and that pairing is the poster idiom the plates quote.
 */
interface Ground {
  surface: string;
  muted: string;
  accent: string;
  mark: string;
}

const GROUNDS: readonly Ground[] = [
  { surface: "bg-sage text-on-sage", muted: "text-on-sage", accent: "var(--tva-green)", mark: "var(--tva-orange)" },
  { surface: "bg-bg text-fg ring-1 ring-inset ring-line-strong", muted: "text-fg-muted", accent: "var(--temporal)", mark: "var(--accent)" },
  { surface: "bg-paper text-on-paper", muted: "text-on-paper", accent: "var(--tva-green)", mark: "var(--tva-orange)" },
  { surface: "bg-green text-on-green", muted: "text-paper", accent: "var(--tva-paper)", mark: "var(--tva-orange)" },
  { surface: "bg-olive text-on-olive", muted: "text-on-olive", accent: "var(--tva-obsidian)", mark: "var(--tva-orange)" },
  { surface: "bg-bg-deep text-fg ring-1 ring-inset ring-line-strong", muted: "text-fg-muted", accent: "var(--temporal)", mark: "var(--accent)" },
];

/**
 * One poster. Index top-left, figure in the upper half, monumental title
 * and the rule at the bottom. No hover: a poster does not move. The figure
 * drifts a few pixels with the scroll (see Directives), nothing more.
 */
export function DirectivePlate({ directive, index }: { directive: Directive; index: number }) {
  const ground = GROUNDS[index % GROUNDS.length];
  return (
    <article
      className={cn("relative flex aspect-[4/5] flex-col overflow-hidden rounded-xs p-6 sm:p-8", ground.surface)}
      style={{ "--plate-accent": ground.accent, "--plate-mark": ground.mark } as CSSProperties}
      aria-labelledby={`directive-${directive.article}`}
    >
      <div className="flex items-start justify-between">
        <p className="meta-label">Directive {directive.article}</p>
        <span className="grid grid-cols-3 gap-1" aria-hidden="true">
          {Array.from({ length: 9 }, (_, i) => (
            <span key={i} className={cn("h-1 w-1 rounded-full", i % 4 === 0 ? "bg-current" : "bg-current opacity-30")} />
          ))}
        </span>
      </div>
      <div className="plate-figure my-auto h-[42%] w-full max-w-[clamp(12rem,52%,24rem)] self-center opacity-95">
        <PlateFigure plate={directive.plate} />
      </div>
      <div>
        <h3 id={`directive-${directive.article}`} className="font-display text-title font-medium uppercase leading-[0.96] tracking-tight">
          {directive.title}
        </h3>
        <p className={cn("mt-4 max-w-[34ch] text-small", ground.muted)}>{directive.statement}</p>
      </div>
      <p className={cn("meta-label mt-6 flex justify-between border-t border-current/20 pt-3", ground.muted)}>
        <span>Rev. 1962 · TVA</span>
        <span>{directive.article}/06</span>
      </p>
    </article>
  );
}

/**
 * Section 06, Directives. Plates in a 7/5 alternation; the narrow plate of
 * each pair is pushed down so the grid breathes and never reads as a
 * carousel. The last pair closes flush. Each plate's figure drifts against
 * the scroll (Reveal's `drift`), the one movement a poster is allowed.
 */
export function Directives({ directives }: { directives: readonly Directive[] }) {
  return (
    <Grid columns={12} gap="default">
      {directives.map((directive, i) => {
        const pair = Math.floor(i / 2);
        const first = i % 2 === 0;
        const wideFirst = pair % 2 === 0;
        const wide = first ? wideFirst : !wideFirst;
        return (
          <Reveal
            key={directive.article}
            effect="rise"
            drift={{ selector: ".plate-figure", distance: first ? 18 : 28 }}
            delay={first ? 0 : 0.12}
            className={cn(wide ? "md:col-span-7" : "md:col-span-5", !wide && i < directives.length - 2 && "md:mt-24")}
          >
            <DirectivePlate directive={directive} index={i} />
          </Reveal>
        );
      })}
    </Grid>
  );
}
