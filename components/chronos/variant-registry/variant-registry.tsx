"use client";

import { m } from "motion/react";
import { useId, useMemo, useState } from "react";
import { Grid } from "@/components/ui/grid";
import { useHydrated } from "@/hooks/use-hydrated";
import { cn } from "@/lib/cn";
import { consultFile } from "@/lib/signals";
import type { Variant, VariantCategory, VariantStatus } from "@/types/content";
import { VariantCard } from "./variant-card";
import { VariantDialog } from "./variant-dialog";

interface VariantRegistryProps {
  variants: readonly Variant[];
  statusLabels: Record<VariantStatus, string>;
  categoryLabels: Record<VariantCategory, string>;
}

type CategoryFilter = VariantCategory | "all";
type StatusFilter = VariantStatus | "all";

function FilterGroup<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T | "all";
  options: ReadonlyArray<{ value: T | "all"; label: string; count: number }>;
  onChange: (value: T | "all") => void;
}) {
  const labelId = useId();
  return (
    <div role="group" aria-labelledby={labelId} className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <span id={labelId} className="meta-label text-fg-subtle">
        {label}
      </span>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => {
          const active = o.value === value;
          return (
            <button
              key={o.value}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(o.value)}
              disabled={o.count === 0 && !active}
              className={cn(
                "relative inline-flex h-8 items-center gap-2 rounded-xs px-2.5 font-mono text-mono transition-colors duration-[var(--dur-fast)]",
                active ? "text-bg" : "text-fg-muted hover:bg-surface-2 hover:text-fg disabled:opacity-40 disabled:hover:bg-transparent",
              )}
            >
              {active && <m.span layoutId={`${labelId}-indicator`} className="absolute inset-0 rounded-xs bg-fg" aria-hidden="true" />}
              <span className="relative">{o.label}</span>
              <span className={cn("tabular relative text-micro", active ? "text-bg" : "text-fg-subtle")}>{o.count}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** The registry: two working filter groups, a ruled grid of files, and the file dialog. */
export function VariantRegistry({ variants, statusLabels, categoryLabels }: VariantRegistryProps) {
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  // Motion writes `initial` as an inline style on the server; without this guard the files would ship invisible.
  const hydrated = useHydrated();

  const shown = useMemo(
    () => variants.filter((v) => (category === "all" || v.category === category) && (status === "all" || v.status === status)),
    [variants, category, status],
  );

  const countBy = (pick: (v: Variant) => string, key: string, other: (v: Variant) => boolean) =>
    variants.filter((v) => (key === "all" || pick(v) === key) && other(v)).length;

  const categoryOptions = (["all", ...Object.keys(categoryLabels)] as CategoryFilter[]).map((key) => ({
    value: key,
    label: key === "all" ? "All" : categoryLabels[key],
    count: countBy((v) => v.category, key, (v) => status === "all" || v.status === status),
  }));
  const statusOptions = (["all", ...Object.keys(statusLabels)] as StatusFilter[]).map((key) => ({
    value: key,
    label: key === "all" ? "All" : statusLabels[key],
    count: countBy((v) => v.status, key, (v) => category === "all" || v.category === category),
  }));

  const filtered = category !== "all" || status !== "all";
  const open = openId ? (variants.find((v) => v.id === openId) ?? null) : null;

  return (
    <div>
      <div className="flex flex-col gap-4 border-y border-line py-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 lg:flex-row lg:gap-10">
          <FilterGroup label="Category" value={category} options={categoryOptions} onChange={setCategory} />
          <FilterGroup label="Status" value={status} options={statusOptions} onChange={setStatus} />
        </div>
        <div className="flex items-center gap-4">
          <p role="status" aria-live="polite" className="font-mono text-mono text-fg-muted">
            <span className="tabular text-fg">{shown.length}</span> of {variants.length} files
          </p>
          {filtered && (
            <button
              type="button"
              onClick={() => {
                setCategory("all");
                setStatus("all");
              }}
              className="meta-label rounded-xs px-2 py-1 text-accent-text hover:bg-surface-2"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      <Grid as="ul" columns={4} gap="line" className="mt-px" aria-label="Registry files">
        {shown.map((variant) => (
          // Files that enter after a filter change fade in; files that leave go at once, so the list is never stale.
          <m.li key={variant.id} initial={hydrated ? { opacity: 0 } : false} animate={{ opacity: 1 }} transition={{ duration: 0.18 }} className="min-w-0">
            <VariantCard
              variant={variant}
              statusLabel={statusLabels[variant.status]}
              categoryLabel={categoryLabels[variant.category]}
              onOpen={(id) => {
                setOpenId(id);
                consultFile(id);
              }}
            />
          </m.li>
        ))}
      </Grid>

      {shown.length === 0 && (
        <p className="border-b border-line py-16 text-center font-mono text-mono text-fg-muted">
          No file matches these filters. The registry is complete; the combination is not.
        </p>
      )}

      <VariantDialog
        variant={open}
        statusLabel={open ? statusLabels[open.status] : ""}
        categoryLabel={open ? categoryLabels[open.category] : ""}
        onClose={() => setOpenId(null)}
      />
    </div>
  );
}
