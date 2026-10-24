import { cn } from "@/lib/cn";

/** One decimal: the server and the browser then print identical coordinates whatever their float rounding. */
const px = (n: number) => Number(n.toFixed(1));

/** Deterministic dust for the plate: the same specks on every visit. */
const DUST = Array.from({ length: 46 }, (_, i) => {
  const a = i * 2.399963;
  const r = 118 + ((i * 37) % 70);
  return { x: px(200 + Math.cos(a) * r * 1.18), y: px(160 + Math.sin(a) * r * 0.78), o: 0.25 + ((i * 13) % 10) / 20 };
});

/**
 * The temporal chamber as a still plate: the artifact as a banded disc with
 * a displaced outline, three orbital ellipses, dust. It is the first paint
 * under the canvas and the whole picture where WebGL is not available.
 */
export function ChamberFallback({ className }: { className?: string }) {
  const outline = Array.from({ length: 72 }, (_, i) => {
    const a = (i / 72) * Math.PI * 2;
    const wobble = 1 + 0.07 * Math.sin(a * 3 + 0.6) + 0.04 * Math.sin(a * 7);
    const r = 62 * wobble;
    return `${i === 0 ? "M" : "L"} ${(200 + Math.cos(a) * r).toFixed(1)} ${(160 + Math.sin(a) * r).toFixed(1)}`;
  }).join(" ");
  return (
    <svg viewBox="0 0 400 320" preserveAspectRatio="xMidYMid slice" className={cn("h-full w-full", className)} aria-hidden="true" focusable="false">
      <rect width="400" height="320" className="fill-green" />
      {DUST.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r="1.1" className="fill-sage" opacity={d.o} />
      ))}
      <ellipse cx="200" cy="160" rx="150" ry="40" className="stroke-temporal" strokeWidth="1" fill="none" opacity="0.8" transform="rotate(-14 200 160)" />
      <ellipse cx="200" cy="160" rx="124" ry="58" className="stroke-sage" strokeWidth="0.8" fill="none" opacity="0.6" transform="rotate(22 200 160)" />
      <ellipse cx="200" cy="160" rx="104" ry="96" className="stroke-temporal" strokeWidth="0.7" fill="none" opacity="0.45" transform="rotate(-40 200 160)" />
      <path d={`${outline} Z`} className="fill-obsidian" opacity="0.55" />
      {Array.from({ length: 9 }, (_, i) => {
        const y = 110 + i * 12.5;
        const half = px(Math.sqrt(Math.max(0, 60 * 60 - (y - 160) * (y - 160))));
        return <line key={i} x1={px(200 - half)} x2={px(200 + half)} y1={y} y2={y} className="stroke-sage" strokeWidth="1.2" opacity={0.35 + (i % 2) * 0.25} />;
      })}
      <path d={`${outline} Z`} className="stroke-sage" strokeWidth="1.4" fill="none" />
      <circle cx="262" cy="118" r="3.2" className="fill-accent" />
    </svg>
  );
}
