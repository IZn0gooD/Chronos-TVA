"use client";

import { m } from "motion/react";
import { useEffect, useRef, type MouseEvent } from "react";
import { Badge } from "@/components/ui/badge";
import { Metadata } from "@/components/ui/metadata";
import type { Variant } from "@/types/content";
import { STATUS_TONE } from "./variant-card";
import { VariantFigure } from "./variant-figure";

interface VariantDialogProps {
  variant: Variant | null;
  statusLabel: string;
  categoryLabel: string;
  onClose: () => void;
}

/**
 * The file, opened. A native <dialog> gives the focus trap, Escape and the
 * focus return for free; Motion adds the entrance. Clicking the backdrop
 * closes it.
 */
export function VariantDialog({ variant, statusLabel, categoryLabel, onClose }: VariantDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (variant && !dialog.open) dialog.showModal();
    if (!variant && dialog.open) dialog.close();
  }, [variant]);

  const onBackdropClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) onClose();
  };

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={onBackdropClick}
      aria-labelledby="variant-dialog-title"
      className="m-auto w-[min(100vw-2rem,56rem)] bg-transparent p-0 text-fg backdrop:bg-bg-deep/80 backdrop:backdrop-blur-sm open:flex"
    >
      {variant && (
        <m.article
          key={variant.id}
          initial={{ opacity: 0, y: 12, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="grid w-full overflow-hidden rounded-sm bg-bg shadow-dialog md:grid-cols-5"
        >
          <div className="relative aspect-[4/3] bg-surface-1 md:col-span-2 md:aspect-auto md:min-h-full">
            <VariantFigure variant={variant} />
          </div>
          <div className="flex flex-col p-6 md:col-span-3 md:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-mono text-temporal-text">{variant.id}</p>
                <h2 id="variant-dialog-title" className="mt-2 font-display text-title font-medium tracking-tight text-fg">
                  {variant.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close file"
                className="meta-label -mr-2 -mt-1 flex h-10 items-center gap-2 rounded-xs px-3 text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg"
              >
                Close <span aria-hidden="true">✕</span>
              </button>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <Badge tone={STATUS_TONE[variant.status]}>{statusLabel}</Badge>
              <Badge tone="outline">{categoryLabel}</Badge>
            </div>
            <p className="mt-6 text-lead text-fg">{variant.summary}</p>
            <p className="mt-4 text-body text-fg-muted">{variant.detail}</p>
            <Metadata
              className="mt-8 grid-cols-3 border-t border-line pt-6"
              items={[
                { term: "Sector", value: variant.meta.sector },
                { term: "Opened", value: variant.meta.opened },
                { term: "Analyst", value: variant.meta.analyst },
              ]}
            />
            <p className="mt-6 font-mono text-micro text-fg-subtle">Fictional file. Nothing here describes a real person, place or event.</p>
          </div>
        </m.article>
      )}
    </dialog>
  );
}
