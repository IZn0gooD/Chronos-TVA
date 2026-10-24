import type { Directive } from "@/types/content";

/*
 * Six vector plates in the manner of 1960s institutional posters: flat
 * grounds, hard geometry, one rare accent. Decorative; the directive's
 * words carry the meaning. Each takes the plate's palette classes from the
 * surface it sits on (see DirectivePlate).
 */

type Plate = Directive["plate"];

export function PlateFigure({ plate }: { plate: Plate }) {
  switch (plate) {
    case "eye":
      return (
        <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden="true" focusable="false">
          <ellipse cx="100" cy="100" rx="88" ry="46" className="fill-none stroke-current" strokeWidth="4" />
          <circle cx="100" cy="100" r="30" className="fill-current" />
          <circle cx="100" cy="100" r="9" className="fill-[var(--plate-accent)]" />
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i / 12) * Math.PI * 2;
            return <line key={i} x1={100 + Math.cos(a) * 56} y1={100 + Math.sin(a) * 56} x2={100 + Math.cos(a) * 64} y2={100 + Math.sin(a) * 64} className="stroke-current" strokeWidth="3" />;
          })}
        </svg>
      );
    case "bars":
      return (
        <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden="true" focusable="false">
          <line x1="20" x2="180" y1="100" y2="100" className="stroke-[var(--plate-accent)]" strokeWidth="4" />
          {Array.from({ length: 7 }, (_, i) => (
            <rect key={i} x={28 + i * 22} y={i === 3 ? 56 : 72} width="10" height={i === 3 ? 88 : 56} className="fill-current" />
          ))}
          <rect x="94" y="40" width="10" height="10" className="fill-[var(--plate-mark)]" />
        </svg>
      );
    case "hourglass":
      return (
        <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden="true" focusable="false">
          <path d="M50 30h100L108 100l42 70H50l42-70z" className="fill-none stroke-current" strokeWidth="4" strokeLinejoin="round" />
          <path d="M70 46h60l-30 48z" className="fill-current" />
          <path d="M86 164h28l-14-34z" className="fill-[var(--plate-accent)]" />
          <line x1="40" x2="160" y1="30" y2="30" className="stroke-current" strokeWidth="6" />
          <line x1="40" x2="160" y1="170" y2="170" className="stroke-current" strokeWidth="6" />
        </svg>
      );
    case "branch":
      return (
        <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden="true" focusable="false">
          <line x1="20" x2="180" y1="120" y2="120" className="stroke-[var(--plate-accent)]" strokeWidth="4" />
          <path d="M80 120 C 110 120, 110 60, 150 50" className="fill-none stroke-current" strokeWidth="4" strokeDasharray="8 8" strokeLinecap="round" />
          <circle cx="80" cy="120" r="8" className="fill-current" />
          <path d="M142 42l16 16M158 42l-16 16" className="stroke-[var(--plate-mark)]" strokeWidth="4" strokeLinecap="square" />
          <circle cx="180" cy="120" r="6" className="fill-[var(--plate-accent)]" />
        </svg>
      );
    case "grid":
      return (
        <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden="true" focusable="false">
          {Array.from({ length: 16 }, (_, i) => {
            const x = 32 + (i % 4) * 36;
            const y = 32 + Math.floor(i / 4) * 36;
            return <rect key={i} x={x} y={y} width="28" height="28" className={i === 9 ? "fill-[var(--plate-mark)]" : "fill-none stroke-current"} strokeWidth="3" />;
          })}
        </svg>
      );
    case "circle":
      return (
        <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden="true" focusable="false">
          <circle cx="100" cy="100" r="78" className="fill-none stroke-current" strokeWidth="4" />
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
            const r0 = i % 3 === 0 ? 62 : 70;
            return <line key={i} x1={100 + Math.cos(a) * r0} y1={100 + Math.sin(a) * r0} x2={100 + Math.cos(a) * 78} y2={100 + Math.sin(a) * 78} className="stroke-current" strokeWidth="3" />;
          })}
          <line x1="100" y1="100" x2="100" y2="48" className="stroke-current" strokeWidth="5" strokeLinecap="square" />
          <line x1="100" y1="100" x2="138" y2="100" className="stroke-[var(--plate-accent)]" strokeWidth="5" strokeLinecap="square" />
          <circle cx="100" cy="100" r="6" className="fill-current" />
        </svg>
      );
  }
}
