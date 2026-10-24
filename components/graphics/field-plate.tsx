import { cn } from "@/lib/cn";

/**
 * The temporal field as a still SVG plate: concentric rings beating against
 * each other, five broken spokes, a paper core. It is the server's first
 * paint under every ShaderCanvas and the whole picture where WebGL is not
 * available, so it is drawn with care rather than as a placeholder.
 */
export function FieldPlate({ className, intensity = 1, rings = 11 }: { className?: string; intensity?: number; rings?: number }) {
  const spokes = Array.from({ length: 5 }, (_, i) => (i / 5) * Math.PI * 2 - Math.PI / 2 + 0.3);
  return (
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className={cn("h-full w-full", className)} aria-hidden="true" focusable="false">
      <rect width="400" height="300" className="fill-green" />
      {Array.from({ length: rings }, (_, i) => {
        const r = 14 + i * 12;
        const beat = 0.35 + 0.65 * Math.abs(Math.sin(i * 1.7));
        const opacity = (beat * intensity * (1 - i / (rings + 2))).toFixed(3);
        return <circle key={i} cx="200" cy="150" r={r} className={i % 3 === 2 ? "stroke-sage" : "stroke-temporal"} strokeWidth={i % 3 === 2 ? 1.4 : 0.8} fill="none" opacity={opacity} />;
      })}
      {spokes.map((a, i) => {
        // One decimal, so the server and the browser print the same coordinates whatever their float rounding.
        const x1 = (200 + Math.cos(a) * 36).toFixed(1);
        const y1 = (150 + Math.sin(a) * 36).toFixed(1);
        const x2 = (200 + Math.cos(a + 0.12) * 128).toFixed(1);
        const y2 = (150 + Math.sin(a + 0.12) * 128).toFixed(1);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} className="stroke-sage" strokeWidth="0.9" strokeDasharray="6 5" opacity={0.6 * intensity} />;
      })}
      <circle cx="200" cy="150" r="9" className="fill-paper" opacity={0.9} />
      <circle cx="200" cy="150" r="22" className="stroke-paper" strokeWidth="0.6" fill="none" opacity={0.5} />
      <circle cx="296" cy="112" r="3" className="fill-accent" opacity={0.85 * intensity} />
    </svg>
  );
}
