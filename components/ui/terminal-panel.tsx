import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/cn";

interface TerminalPanelProps extends ComponentPropsWithoutRef<"div"> {
  /** Window title printed in the top bar, mono. */
  title: string;
  /** Right side of the bar: an id, a status. */
  meta?: ReactNode;
  /** Bottom rule content: a prompt, a legend, a notice. */
  footer?: ReactNode;
}

/**
 * A terminal window: a bar with three inert indicators and a title, a mono
 * body, an optional footer rule. The look is generic (any console); the
 * content gives it its universe.
 */
export function TerminalPanel({ title, meta, footer, className, children, ...props }: TerminalPanelProps) {
  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-sm bg-bg-deep font-mono text-mono text-fg ring-1 ring-inset ring-line-strong",
        className,
      )}
      {...props}
    >
      <div className="flex items-center gap-3 border-b border-line-strong px-4 py-2">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="h-2 w-2 rounded-full bg-fg-subtle" />
          <span className="h-2 w-2 rounded-full bg-fg-subtle" />
          <span className="h-2 w-2 rounded-full bg-temporal-text" />
        </span>
        <span className="meta-label flex-1 truncate text-fg-muted">{title}</span>
        {meta && <span className="meta-label text-fg-subtle">{meta}</span>}
      </div>
      <div className="min-h-0 flex-1 p-4 sm:p-5">{children}</div>
      {footer && <div className="border-t border-line-strong px-4 py-2 text-fg-subtle">{footer}</div>}
    </div>
  );
}
