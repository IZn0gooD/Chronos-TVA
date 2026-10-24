import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/cn";

export type FrameLight = "stable" | "temporal" | "anomaly" | "off";

interface FrameProps extends ComponentPropsWithoutRef<"div"> {
  /** Mono heading set into the top rule, like a file tab: "REGISTRY", "BRANCH 03". */
  heading?: ReactNode;
  /** A square indicator in the top-right corner. Colour echoes a state the text already states. */
  light?: FrameLight;
  /** A short mono stamp printed on the top rule, right side: "OBSERVED", "VARIANCE CONTAINED". */
  stamp?: string;
  /** The heading element for `heading`, when it is a real heading. */
  as?: "div" | "section" | "article";
  padding?: "none" | "default";
  /** Surface behind the content. */
  tone?: "bg" | "surface" | "deep";
}

const LIGHT: Record<FrameLight, string> = {
  stable: "bg-sage",
  temporal: "bg-temporal",
  anomaly: "bg-accent",
  off: "bg-fg-subtle/60",
};

const TONE: Record<NonNullable<FrameProps["tone"]>, string> = {
  bg: "bg-bg",
  surface: "bg-surface-1",
  deep: "bg-bg-deep",
};

/**
 * The notched frame: a 1px rule with marked corners, a heading sitting on
 * the top rule, an indicator light and an optional stamp. Every panel of
 * the site, HTML or ascii, shares this geometry. Generic: only the words
 * and the light's state belong to the universe.
 */
export function Frame({
  heading,
  light,
  stamp,
  as: Tag = "div",
  padding = "default",
  tone = "bg",
  className,
  children,
  ...props
}: FrameProps) {
  return (
    <Tag
      className={cn("frame relative rounded-xs ring-1 ring-inset ring-line-strong", TONE[tone], className)}
      data-light={light}
      {...props}
    >
      {(heading || light || stamp) && (
        <div className="pointer-events-none absolute inset-x-3 -top-[0.55rem] z-10 flex items-center justify-between gap-3">
          <span className={cn("meta-label truncate px-1.5 text-fg-muted", TONE[tone])}>{heading}</span>
          <span className={cn("flex items-center gap-2 px-1.5", TONE[tone])}>
            {stamp && (
              <span key={stamp} className="frame-stamp meta-label whitespace-nowrap text-temporal-text">
                {stamp}
              </span>
            )}
            {light && (
              <span
                className={cn("frame-light block h-2 w-2 transition-colors duration-[var(--dur-instant)]", LIGHT[light])}
                aria-hidden="true"
              />
            )}
          </span>
        </div>
      )}
      <div className={cn(padding === "default" && "p-5 sm:p-6", Boolean(heading) && padding === "default" && "pt-6")}>{children}</div>
    </Tag>
  );
}
