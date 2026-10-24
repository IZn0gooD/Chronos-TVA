import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/cn";

interface SectionProps extends ComponentPropsWithoutRef<"section"> {
  /** Required: every section is a navigation target and a landmark. */
  id: string;
  /** `flush` removes the vertical rhythm, for sections that paint their own. */
  spacing?: "default" | "flush";
  /** Surface the section sits on. */
  surface?: "bg" | "sage" | "paper" | "deep" | "green" | "olive";
}

const SURFACES: Record<NonNullable<SectionProps["surface"]>, string> = {
  bg: "bg-bg text-fg",
  deep: "bg-bg-deep text-fg",
  sage: "bg-sage text-on-sage",
  paper: "bg-paper text-on-paper",
  green: "surface-green bg-bg text-fg",
  olive: "bg-olive text-on-olive",
};

/** A landmark section with the site's vertical rhythm and surface tokens. */
export function Section({ id, spacing = "default", surface = "bg", className, ...props }: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "relative scroll-mt-20",
        SURFACES[surface],
        spacing === "default" && "py-[var(--space-section)]",
        className,
      )}
      {...props}
    />
  );
}
