import { cn } from "@/lib/cn";

export type Status = "nominal" | "temporal" | "watch" | "anomaly" | "offline";

const STATUS: Record<Status, { dot: string; text: string; pulse: boolean }> = {
  nominal: { dot: "bg-ok", text: "text-fg", pulse: false },
  temporal: { dot: "bg-temporal", text: "text-fg", pulse: false },
  watch: { dot: "bg-warn", text: "text-fg", pulse: false },
  anomaly: { dot: "bg-accent", text: "text-accent-text", pulse: true },
  offline: { dot: "bg-fg-subtle", text: "text-fg-muted", pulse: false },
};

interface StatusIndicatorProps {
  status: Status;
  /** The words carry the meaning; the colour only echoes it. */
  label: string;
  /** Optional mono detail after the label: a code, a timestamp. */
  detail?: string;
  className?: string;
}

/** A live-looking status: dot + label. Colour never stands alone. */
export function StatusIndicator({ status, label, detail, className }: StatusIndicatorProps) {
  const s = STATUS[status];
  return (
    <span className={cn("inline-flex items-center gap-2.5 font-mono text-mono", s.text, className)}>
      <span className="relative flex h-2 w-2" aria-hidden="true">
        {s.pulse && (
          <span
            className={cn("absolute inline-flex h-full w-full rounded-full opacity-60 motion-safe:animate-ping", s.dot)}
          />
        )}
        <span className={cn("relative inline-flex h-2 w-2 rounded-full", s.dot)} />
      </span>
      <span>{label}</span>
      {detail && <span className="text-fg-subtle">{detail}</span>}
    </span>
  );
}
