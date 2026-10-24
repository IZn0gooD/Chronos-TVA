import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type BadgeTone = "neutral" | "sage" | "temporal" | "accent" | "outline";

const TONES: Record<BadgeTone, string> = {
  neutral: "bg-surface-2 text-fg",
  sage: "bg-sage text-on-sage",
  temporal: "ring-1 ring-inset ring-temporal text-temporal-text",
  accent: "bg-accent-fill text-on-accent",
  outline: "ring-1 ring-inset ring-line-strong text-fg-muted",
};

/** A stamped label: mono, uppercase, square corners. */
export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span className={cn("meta-label inline-flex h-6 items-center rounded-xs px-2", TONES[tone], className)}>
      {children}
    </span>
  );
}
