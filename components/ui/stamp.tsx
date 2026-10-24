import { cn } from "@/lib/cn";

interface StampProps {
  /** Up to three short lines. */
  lines: ReadonlyArray<string>;
  className?: string;
}

/**
 * A rubber stamp: a double ring, slightly turned, ink at 92 %. It prints
 * with the `frame-stamp` keyframe when it mounts. Colour is `currentColor`
 * so it takes the ink of the surface it is struck on.
 */
export function Stamp({ lines, className }: StampProps) {
  return (
    <div
      className={cn(
        "frame-stamp inline-flex -rotate-6 flex-col items-center justify-center rounded-xs border-2 border-current px-4 py-2 text-center opacity-90 outline outline-1 outline-offset-4 outline-current",
        className,
      )}
    >
      {lines.map((line, i) => (
        <span key={line} className={cn("meta-label", i === 0 ? "text-[0.8125rem] font-medium tracking-[0.2em]" : "mt-0.5")}>
          {line}
        </span>
      ))}
    </div>
  );
}
