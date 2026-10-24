import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface MetadataItem {
  term: string;
  value: ReactNode;
}

interface MetadataProps {
  items: ReadonlyArray<MetadataItem>;
  /** `row` lays terms and values side by side; `stack` puts the term above. */
  layout?: "row" | "stack";
  className?: string;
}

/** Administrative key/value pairs as a real definition list. */
export function Metadata({ items, layout = "stack", className }: MetadataProps) {
  return (
    <dl
      className={cn(
        layout === "stack" ? "grid gap-x-8 gap-y-4" : "grid grid-cols-[auto_1fr] gap-x-6 gap-y-2",
        className,
      )}
    >
      {items.map((item) => (
        <div key={item.term} className={cn(layout === "row" && "contents")}>
          <dt className="meta-label text-fg-subtle">{item.term}</dt>
          <dd className={cn("font-mono text-mono text-fg", layout === "stack" && "mt-1")}>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
