import { cn } from "@/lib/cn";

/*
 * Four kinds of figure for the registry cards. All decorative (hidden from
 * assistive technology); each varies with a seed taken from the file id,
 * so no two cards of the same kind look alike.
 */

export function seedOf(id: string): number {
  let h = 7;
  for (const ch of id) h = (h * 33 + ch.charCodeAt(0)) >>> 0;
  return h;
}

/** A technical plate: a baseline, a scale, a measured curve and one annotated point. */
export function FigureDiagram({ seed, className }: { seed: number; className?: string }) {
  const freq = 1.5 + (seed % 5) * 0.5;
  const phase = (seed % 7) / 7;
  const markX = 30 + (seed % 60);
  const points = Array.from({ length: 61 }, (_, i) => {
    const x = 10 + i * (100 / 60);
    const y = 48 - Math.sin((i / 60) * Math.PI * freq + phase * Math.PI * 2) * 16 * Math.exp(-((i - 30) ** 2) / 900);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  const markY = 48 - Math.sin(((markX - 10) / 100) * Math.PI * freq + phase * Math.PI * 2) * 16 * Math.exp(-((((markX - 10) * 60) / 100 - 30) ** 2) / 900);
  return (
    <svg viewBox="0 0 120 90" className={cn("h-full w-full", className)} aria-hidden="true" focusable="false">
      {Array.from({ length: 11 }, (_, i) => (
        <line key={i} x1={10 + i * 10} x2={10 + i * 10} y1={i % 5 === 0 ? 70 : 73} y2={76} className="stroke-fg-subtle" strokeWidth={0.6} />
      ))}
      <line x1={10} x2={110} y1={76} y2={76} className="stroke-fg-subtle" strokeWidth={0.8} />
      <line x1={10} x2={110} y1={48} y2={48} className="stroke-line-strong" strokeWidth={0.6} strokeDasharray="1.5 2.5" />
      <polyline points={points} fill="none" className="stroke-temporal" strokeWidth={1.4} strokeLinejoin="round" />
      <line x1={markX} x2={markX} y1={markY} y2={76} className="stroke-accent" strokeWidth={0.8} strokeDasharray="1 2" />
      <circle cx={markX} cy={markY} r={2.4} className="fill-accent" />
      <text x={markX + 4} y={markY - 3} className="fill-fg-muted font-mono" fontSize={4.5}>
        Δt
      </text>
      <text x={10} y={14} className="fill-fg-subtle font-mono" fontSize={4}>
        FIG. {String(seed % 97).padStart(2, "0")}
      </text>
    </svg>
  );
}

/** A typographic plate: the file number oversized and cropped, with a running head. */
export function FigureTypographic({ id, seed, className }: { id: string; seed: number; className?: string }) {
  const digits = id.replace(/\D/g, "") || id;
  const right = seed % 2 === 0;
  return (
    <div className={cn("relative h-full w-full overflow-hidden", className)} aria-hidden="true">
      <span
        className={cn(
          "absolute -bottom-[0.18em] font-display text-[6.5rem] font-medium leading-none tracking-[-0.06em] text-fg/90 select-none",
          right ? "-right-[0.06em]" : "-left-[0.06em]",
        )}
      >
        {digits}
      </span>
      <span className={cn("meta-label absolute top-3 text-fg-subtle", right ? "left-3" : "right-3")}>{id}</span>
      <span className={cn("absolute top-10 h-px w-10 bg-temporal", right ? "left-3" : "right-3")} />
    </div>
  );
}

/** A propaganda plate: flat sage ground, obsidian geometry, one orange accent. */
export function FigureGeometric({ seed, className }: { seed: number; className?: string }) {
  const variant = seed % 3;
  return (
    <svg viewBox="0 0 120 90" className={cn("h-full w-full", className)} aria-hidden="true" focusable="false">
      <rect width="120" height="90" className="fill-sage" />
      {variant === 0 && (
        <>
          <circle cx="40" cy="45" r="26" className="fill-bg" />
          <rect x="66" y="19" width="40" height="52" className="fill-bg" />
          <circle cx="86" cy="45" r="9" className="fill-sage" />
          <rect x="14" y="19" width="6" height="52" className="fill-accent" />
        </>
      )}
      {variant === 1 && (
        <>
          <path d="M14 76 L60 14 L106 76 Z" className="fill-bg" />
          <circle cx="60" cy="52" r="10" className="fill-sage" />
          <rect x="14" y="78" width="92" height="3" className="fill-bg" />
          <circle cx="98" cy="22" r="6" className="fill-accent" />
        </>
      )}
      {variant === 2 && (
        <>
          {Array.from({ length: 4 }, (_, i) => (
            <rect key={i} x={14 + i * 24} y={14} width={12} height={62} className="fill-bg" />
          ))}
          <path d="M14 45 H106" className="stroke-sage" strokeWidth={3} />
          <circle cx="104" cy="45" r="7" className="fill-accent" />
        </>
      )}
    </svg>
  );
}
