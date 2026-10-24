import { cn } from "@/lib/cn";

interface DividerProps {
  /** A mono label set into the rule, like a file tab. */
  label?: string;
  /** `strong` uses the olive rule; `dashed` the perforation. */
  tone?: "default" | "strong" | "dashed";
  className?: string;
}

/** A horizontal rule with an optional label. Decorative: hidden from assistive tech when unlabelled. */
export function Divider({ label, tone = "default", className }: DividerProps) {
  const rule = cn(
    "h-px flex-1",
    tone === "strong" ? "bg-line-strong" : "bg-line",
    tone === "dashed" && "bg-[repeating-linear-gradient(90deg,var(--line-strong)_0_6px,transparent_6px_12px)]",
  );
  if (!label) return <hr className={cn("border-0", rule, className)} aria-hidden="true" />;
  return (
    <div role="separator" aria-label={label} className={cn("flex items-center gap-4", className)}>
      <span className={rule} />
      <span className="meta-label text-fg-muted">{label}</span>
      <span className={rule} />
    </div>
  );
}
