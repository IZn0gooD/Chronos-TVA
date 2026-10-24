import type { ComponentPropsWithoutRef, ElementType } from "react";
import { cn } from "@/lib/cn";

type ContainerProps<T extends ElementType> = {
  as?: T;
  /** `content` is the reading measure; `wide` the full editorial grid. */
  size?: "content" | "wide";
} & Omit<ComponentPropsWithoutRef<T>, "as">;

/** Horizontal rhythm: gutters that scale with the viewport and a capped width. */
export function Container<T extends ElementType = "div">({
  as,
  size = "wide",
  className,
  ...props
}: ContainerProps<T>) {
  const Tag = (as ?? "div") as ElementType;
  return (
    <Tag
      className={cn(
        "mx-auto w-full px-[var(--gutter)]",
        size === "wide" ? "max-w-[var(--content-max)]" : "max-w-prose",
        className,
      )}
      {...props}
    />
  );
}
