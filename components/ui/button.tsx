import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "accent";
type Size = "md" | "lg";

interface BaseProps {
  variant?: Variant;
  size?: Size;
  /** Optional mono index printed before the label: "01", "→", "▲". */
  index?: ReactNode;
  className?: string;
  children: ReactNode;
}

type ButtonAsButton = BaseProps &
  Omit<ComponentPropsWithoutRef<"button">, "className" | "children"> & { href?: undefined };
type ButtonAsLink = BaseProps & Omit<ComponentPropsWithoutRef<"a">, "className" | "children"> & { href: string };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

/*
 * primary   the ink of the surface, solid: the default action.
 * secondary a rule around the label: the second action.
 * ghost     label only: tertiary, inline.
 * accent    the attention colour: reserved for anomaly-related actions.
 * All colours are tokens, so a re-themed surface (see .surface-paper) inverts them.
 */
const VARIANTS: Record<Variant, string> = {
  primary: "bg-fg text-bg hover:bg-sage hover:text-on-sage focus-visible:bg-sage focus-visible:text-on-sage active:translate-y-px",
  secondary: "text-fg ring-1 ring-inset ring-fg/60 hover:bg-fg hover:text-bg active:translate-y-px",
  ghost: "text-fg-muted hover:bg-surface-2 hover:text-fg active:translate-y-px",
  accent: "bg-accent-fill text-on-accent hover:bg-accent-text focus-visible:bg-accent-text active:translate-y-px",
};

const SIZES: Record<Size, string> = {
  md: "h-10 px-4 text-small",
  lg: "h-12 px-6 text-body",
};

/**
 * One button, four intents. Renders a Next <Link> when given an href
 * (in-page anchors included), a <button> otherwise. No fake links: an
 * href is always a real destination.
 */
export function Button({ variant = "primary", size = "md", index, className, children, ...props }: ButtonProps) {
  const classes = cn(
    "group inline-flex items-center justify-center gap-3 rounded-xs font-medium",
    "transition-[background-color,color,transform] duration-[var(--dur-fast)] ease-[var(--ease-swift)]",
    "disabled:pointer-events-none disabled:opacity-50 aria-disabled:opacity-50",
    VARIANTS[variant],
    SIZES[size],
    className,
  );
  const content = (
    <>
      {index !== undefined && (
        <span
          aria-hidden="true"
          className="font-mono text-[0.8em] opacity-70 transition-opacity group-hover:opacity-100"
        >
          {index}
        </span>
      )}
      <span>{children}</span>
    </>
  );
  if ("href" in props && props.href !== undefined) {
    const { href, ...anchor } = props;
    return (
      <Link href={href} className={classes} {...anchor}>
        {content}
      </Link>
    );
  }
  const { type = "button", ...button } = props as ButtonAsButton;
  return (
    <button type={type} className={classes} {...button}>
      {content}
    </button>
  );
}
