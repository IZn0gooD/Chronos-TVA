import { cn } from "@/lib/cn";

interface CornerMarksProps {
  /** Which corners carry a mark. */
  position?: "top" | "bottom" | "all";
  className?: string;
}

const MARK = "pointer-events-none absolute h-3 w-3 text-fg-subtle before:absolute before:left-1/2 before:top-0 before:h-full before:w-px before:bg-current after:absolute after:left-0 after:top-1/2 after:h-px after:w-full after:bg-current";

/**
 * Registration marks: the small crosses a printer uses to align the inks,
 * set at the corners of a sheet. Decorative; the parent is positioned.
 */
export function CornerMarks({ position = "all", className }: CornerMarksProps) {
  const top = position !== "bottom";
  const bottom = position !== "top";
  return (
    <div aria-hidden="true" className={cn("pointer-events-none absolute inset-0", className)}>
      {top && <span className={cn(MARK, "left-0 top-0")} />}
      {top && <span className={cn(MARK, "right-0 top-0")} />}
      {bottom && <span className={cn(MARK, "bottom-0 left-0")} />}
      {bottom && <span className={cn(MARK, "bottom-0 right-0")} />}
    </div>
  );
}
