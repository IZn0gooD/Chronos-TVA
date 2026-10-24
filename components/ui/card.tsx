import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/cn";

interface CardProps extends ComponentPropsWithoutRef<"article"> {
  /** Interactive cards change surface on hover and focus; static ones stay put. */
  interactive?: boolean;
}

/**
 * A ruled cell for grids. Deliberately plain: the content (figure, type,
 * metadata) carries the identity, not the frame.
 */
export function Card({ interactive = false, className, ...props }: CardProps) {
  return (
    <article
      className={cn(
        "group/card relative flex flex-col bg-bg",
        interactive &&
          "transition-colors duration-[var(--dur-base)] ease-[var(--ease-swift)] focus-within:bg-surface-1 hover:bg-surface-1",
        className,
      )}
      {...props}
    />
  );
}
