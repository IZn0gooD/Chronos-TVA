"use client";

import { setMotionPaused, useMotionPaused } from "@/lib/motion-store";
import { cn } from "@/lib/cn";

/** Pause or resume every moving thing on the page. Pressed means paused. */
export function MotionToggle({ className }: { className?: string }) {
  const paused = useMotionPaused();
  return (
    <button
      type="button"
      aria-pressed={paused}
      onClick={() => setMotionPaused(!paused)}
      className={cn(
        "meta-label inline-flex h-9 items-center gap-2 rounded-xs px-3 text-fg-muted transition-colors duration-[var(--dur-fast)] hover:bg-surface-2 hover:text-fg",
        className,
      )}
    >
      <span aria-hidden="true" className={cn("block h-2 w-2", paused ? "bg-fg-subtle" : "bg-sage")} />
      Motion {paused ? "off" : "on"}
    </button>
  );
}
