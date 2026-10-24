"use client";

import { useRef } from "react";
import { gsap, MOTION_CONDITIONS, motionAllowed, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/cn";
import { useMediaQuery } from "@/hooks/use-media-query";

interface SacredTimelineProps {
  /** Seconds before the drawing starts, to follow the title. */
  delay?: number;
  /** Incremented by the hero when the reader asks to replay the entrance: the drawing plays again, whatever the preference. */
  replay?: number;
  className?: string;
}

const W = 1200;
const H = 300;
const BASE = 150;

/** Branches leaving the baseline: start x, end x, end y, kind. The left third is kept clear for the stations. */
const BRANCHES = [
  { x0: 560, x1: 720, y1: 62, kind: "pruned" },
  { x0: 760, x1: 930, y1: 238, kind: "nexus" },
  { x0: 950, x1: 1090, y1: 96, kind: "contained" },
] as const;

const STROKE = { pruned: "stroke-fg-subtle", nexus: "stroke-accent", contained: "stroke-sage" } as const;

function curve(x0: number, x1: number, y1: number) {
  const len = x1 - x0;
  return `M ${x0} ${BASE} C ${x0 + len * 0.5} ${BASE}, ${x0 + len * 0.45} ${y1}, ${x1} ${y1}`;
}

/**
 * The hero's timeline figure. An abstract instrument plate: a scale, the
 * sacred line in teal, three ramifications, markers and mono annotations.
 * It draws itself in once on mount; without motion it is simply there.
 */
export function SacredTimeline({ delay = 0, replay = 0, className }: SacredTimelineProps) {
  const ref = useRef<SVGSVGElement>(null);
  // Small screens show the right stretch only: the stations stand below the figure there, not on it.
  const wide = useMediaQuery("(min-width: 48rem)", true);

  useGSAP(
    () => {
      const draw = () => {
        const tl = gsap.timeline({ delay, defaults: { ease: "power2.inOut" } });
        // The figure is hidden by CSS until the choreography starts (see base.css, `.js .tl-figure`).
        tl.set(ref.current, { autoAlpha: 1 }, 0)
          .from(".tl-scale", { autoAlpha: 0, duration: 0.6, stagger: 0.012 }, 0)
          .from(".tl-base", { drawSVG: "0%", duration: 1.8 }, "<0.2")
          .from(".tl-branch", { drawSVG: "0%", duration: 1, stagger: 0.18, ease: "power2.out" }, "-=1.1")
          // A dashed stroke cannot be drawn in (DrawSVG owns the dash array), so the pruned branch fades in.
          .from(".tl-branch-dashed", { autoAlpha: 0, duration: 0.8, ease: "power2.out" }, "-=1")
          .from(".tl-node", { scale: 0, transformOrigin: "center", autoAlpha: 0, duration: 0.35, stagger: 0.08, ease: "back.out(2.5)" }, "-=0.6")
          .from(".tl-label", { autoAlpha: 0, y: 4, duration: 0.5, stagger: 0.08 }, "-=0.3");
      };
      if (replay > 0) {
        draw();
        return;
      }
      const mm = gsap.matchMedia();
      mm.add(MOTION_CONDITIONS.motionOK, () => {
        if (!motionAllowed()) return;
        draw();
      });
      return () => mm.revert();
    },
    { scope: ref, dependencies: [delay, replay], revertOnUpdate: true },
  );

  return (
    <svg
      ref={ref}
      viewBox={wide ? `0 40 ${W} ${H - 80}` : `500 40 ${W - 500} ${H - 80}`}
      className={cn("tl-figure h-auto w-full overflow-visible", className)}
      role="img"
      aria-label="Diagram of the sacred timeline with three branches: one pruned, one nexus event, one contained."
    >
      {/* Scale */}
      {Array.from({ length: 41 }, (_, i) => {
        const x = 40 + (i / 40) * (W - 80);
        const major = i % 5 === 0;
        return <line key={i} className="tl-scale stroke-line-strong" x1={x} x2={x} y1={BASE - (major ? 9 : 4)} y2={BASE + (major ? 9 : 4)} strokeWidth={1} />;
      })}
      {/* Scale labels from T-0 onwards: the stations stand on the left stretch. */}
      {Array.from({ length: 5 }, (_, i) => {
        const x = 40 + ((i + 4) / 8) * (W - 80);
        return (
          <text key={i} x={x} y={BASE + 34} textAnchor="middle" className="tl-label hidden fill-fg-subtle font-mono text-[11px] md:block">
            {i === 0 ? "T-0" : `+${i}`}
          </text>
        );
      })}

      {/* Sacred line */}
      <line className="tl-base stroke-temporal" x1={40} x2={W - 40} y1={BASE} y2={BASE} strokeWidth={2} vectorEffect="non-scaling-stroke" strokeLinecap="square" />

      {/* Branches */}
      {BRANCHES.map((b) => (
        <g key={b.x0}>
          <path
            d={curve(b.x0, b.x1, b.y1)}
            className={cn(b.kind === "pruned" ? "tl-branch-dashed" : "tl-branch", "fill-none", STROKE[b.kind])}
            strokeWidth={b.kind === "nexus" ? 2 : 1.5}
            vectorEffect="non-scaling-stroke"
            strokeDasharray={b.kind === "pruned" ? "5 8" : undefined}
            strokeLinecap="round"
          />
          <circle className="tl-node fill-bg stroke-temporal" cx={b.x0} cy={BASE} r={5} strokeWidth={2} vectorEffect="non-scaling-stroke" />
          {b.kind === "nexus" ? (
            <rect className="tl-node fill-accent" x={b.x1 - 7} y={b.y1 - 7} width={14} height={14} />
          ) : b.kind === "pruned" ? (
            <path className="tl-node stroke-fg-subtle" d={`M ${b.x1 - 6} ${b.y1 - 6} l 12 12 M ${b.x1 + 6} ${b.y1 - 6} l -12 12`} strokeWidth={2} vectorEffect="non-scaling-stroke" />
          ) : (
            <rect className="tl-node fill-none stroke-sage" x={b.x1 - 6} y={b.y1 - 6} width={12} height={12} strokeWidth={2} vectorEffect="non-scaling-stroke" />
          )}
          <text
            x={b.x1 > 1000 ? b.x1 - 18 : b.x1 + 18}
            y={b.y1 + 4}
            textAnchor={b.x1 > 1000 ? "end" : "start"}
            className="tl-label fill-fg-muted font-mono text-[24px] md:text-[11px]"
          >
            {b.kind === "nexus" ? "NEXUS · VAR 0.88" : b.kind === "pruned" ? "PRUNED · 1961" : "CONTAINED · 0.19"}
          </text>
        </g>
      ))}

      {/* Origin and terminus */}
      <rect className="tl-node fill-temporal" x={36} y={BASE - 4} width={8} height={8} />
      <path className="tl-node fill-temporal" d={`M ${W - 40} ${BASE - 6} l 10 6 l -10 6 z`} />
    </svg>
  );
}
