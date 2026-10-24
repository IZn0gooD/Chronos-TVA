import { MotionCard } from "@/components/motion/motion-card";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import type { Variant, VariantStatus } from "@/types/content";
import { VariantFigure } from "./variant-figure";

export const STATUS_TONE: Record<VariantStatus, BadgeTone> = {
  monitored: "outline",
  contained: "sage",
  pruned: "neutral",
  escalated: "accent",
};

interface VariantCardProps {
  variant: Variant;
  statusLabel: string;
  categoryLabel: string;
  onOpen: (id: string) => void;
}

/** One file of the registry: id, figure, name, summary, and the action that opens it. */
export function VariantCard({ variant, statusLabel, categoryLabel, onOpen }: VariantCardProps) {
  return (
    <MotionCard className="h-full">
      <Card interactive className="h-full">
      <div className="flex items-center justify-between gap-3 px-5 pt-5">
        <span className="font-mono text-mono text-temporal-text">{variant.id}</span>
        <Badge tone={STATUS_TONE[variant.status]}>{statusLabel}</Badge>
      </div>

      <div className="mx-5 mt-4 aspect-[4/3] overflow-hidden rounded-xs bg-surface-1 ring-1 ring-inset ring-line transition-transform duration-[var(--dur-slow)] ease-[var(--ease-swift)] motion-safe:group-hover/card:-translate-y-0.5">
        <VariantFigure variant={variant} />
      </div>

      <div className="flex flex-1 flex-col px-5 pb-5 pt-5">
        <p className="meta-label text-fg-subtle">{categoryLabel}</p>
        <h3 className="mt-2 font-display text-heading font-medium tracking-tight text-fg">{variant.name}</h3>
        <p className="mt-3 text-small text-fg-muted">{variant.summary}</p>
        <div className="mt-auto flex items-center justify-between gap-4 pt-6">
          <span className="font-mono text-micro text-fg-subtle">Opened {variant.meta.opened}</span>
          <button
            type="button"
            onClick={() => onOpen(variant.id)}
            aria-label={`Open file ${variant.id}, ${variant.name}`}
            className={cn(
              "group/open inline-flex h-9 items-center gap-2 rounded-xs px-3 font-mono text-mono text-fg transition-colors duration-[var(--dur-fast)]",
              "hover:bg-fg hover:text-bg focus-visible:bg-fg focus-visible:text-bg",
            )}
          >
            Open file
            <span aria-hidden="true" className="transition-transform duration-[var(--dur-fast)] group-hover/open:translate-x-0.5">
              →
            </span>
          </button>
        </div>
      </div>
      </Card>
    </MotionCard>
  );
}
