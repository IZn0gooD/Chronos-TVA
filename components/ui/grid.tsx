import type { ComponentPropsWithoutRef, ElementType } from "react";
import { cn } from "@/lib/cn";

type GridProps<T extends ElementType> = {
  as?: T;
  /** Column count on wide screens; the grid collapses to 1 then 2 below. */
  columns?: 2 | 3 | 4 | 12;
  gap?: "line" | "default" | "loose";
} & Omit<ComponentPropsWithoutRef<T>, "as">;

const COLUMNS: Record<NonNullable<GridProps<"div">["columns"]>, string> = {
  2: "md:grid-cols-2",
  3: "md:grid-cols-2 xl:grid-cols-3",
  4: "sm:grid-cols-2 xl:grid-cols-4",
  12: "md:grid-cols-12",
};

const GAPS: Record<NonNullable<GridProps<"div">["gap"]>, string> = {
  /** Each cell draws its own hairline, so empty tracks stay empty when a filter removes items. */
  line: "gap-px [&>*]:shadow-[0_0_0_1px_var(--line)]",
  default: "gap-6 lg:gap-8",
  loose: "gap-10 lg:gap-14",
};

/** The editorial grid. `gap="line"` turns the children into ruled cells. Renders any element via `as` (a list, say). */
export function Grid<T extends ElementType = "div">({ as, columns = 3, gap = "default", className, ...props }: GridProps<T>) {
  const Tag = (as ?? "div") as ElementType;
  return <Tag className={cn("grid grid-cols-1", COLUMNS[columns], GAPS[gap], className)} {...props} />;
}
