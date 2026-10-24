"use client";

import { useRef } from "react";
import { gsap, MOTION_CONDITIONS, motionAllowed, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/cn";
import type { Branch, BranchState } from "@/types/content";
import { branchPath, percent, VIEW } from "./branch-geometry";

interface BranchDiagramProps {
  branches: readonly Branch[];
  selectedId: string;
  onSelect: (id: string) => void;
  /** Id of the tablist that owns the real controls; the markers here are pointer shortcuts. */
  className?: string;
}

const STROKE: Record<BranchState, string> = {
  sacred: "stroke-temporal",
  nexus: "stroke-accent",
  pruned: "stroke-fg-subtle",
  contained: "stroke-sage",
};

const FILL: Record<BranchState, string> = {
  sacred: "bg-temporal",
  nexus: "bg-accent",
  pruned: "bg-fg-subtle",
  contained: "bg-sage",
};

/**
 * The branch diagram: an SVG the keyboard never needs (the tablist beside
 * it is the accessible control), with pointer-only marker buttons laid over
 * each branch end. Lines draw themselves in when the diagram first scrolls
 * into view; the selected branch is emphasised with weight and a halo.
 */
export function BranchDiagram({ branches, selectedId, onSelect, className }: BranchDiagramProps) {
  const ref = useRef<HTMLDivElement>(null);
  const paths = branches.map(branchPath);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_CONDITIONS.motionOK, () => {
        if (!motionAllowed()) return;
        const tl = gsap.timeline({ scrollTrigger: { trigger: ref.current, start: "top 75%", once: true } });
        tl.from(".diagram-baseline", { drawSVG: "0%", duration: 1.4, ease: "power2.inOut" })
          .from(".diagram-branch", { drawSVG: "0%", duration: 0.9, ease: "power2.out", stagger: 0.12 }, "-=0.6")
          // Dashed (pruned) branches fade in: DrawSVG owns the dash array while it draws.
          .from(".diagram-branch-dashed", { autoAlpha: 0, duration: 0.7, ease: "power2.out" }, "-=0.8")
          .from(".diagram-marker", { scale: 0, autoAlpha: 0, duration: 0.4, ease: "back.out(2)", stagger: 0.06 }, "-=0.5")
          .from(".diagram-tick", { autoAlpha: 0, duration: 0.3, stagger: 0.02 }, "<");
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={cn("relative w-full", className)} style={{ aspectRatio: `${VIEW.width} / ${VIEW.height}` }}>
      <svg viewBox={`0 0 ${VIEW.width} ${VIEW.height}`} className="h-full w-full overflow-visible" aria-hidden="true" focusable="false">
        {/* Grid ticks along the baseline: the instrument's scale. */}
        {Array.from({ length: 24 }, (_, i) => {
          const x = VIEW.left + (i / 23) * (VIEW.right - VIEW.left);
          const major = i % 4 === 0;
          return (
            <line
              key={i}
              className="diagram-tick stroke-line-strong"
              x1={x}
              x2={x}
              y1={VIEW.baseline - (major ? 10 : 5)}
              y2={VIEW.baseline + (major ? 10 : 5)}
              strokeWidth={1}
            />
          );
        })}
        <line
          className="diagram-baseline stroke-temporal"
          x1={VIEW.left}
          x2={VIEW.right}
          y1={VIEW.baseline}
          y2={VIEW.baseline}
          strokeWidth={selectedId === branches[0]?.id ? 3 : 2}
          strokeLinecap="square"
        />
        {paths.map((p, i) => {
          const branch = branches[i];
          if (!p.d) return null;
          const selected = branch.id === selectedId;
          return (
            <g key={p.id}>
              {selected && <path d={p.d} className={cn(STROKE[branch.state], "opacity-25")} strokeWidth={10} fill="none" strokeLinecap="round" />}
              <path
                d={p.d}
                className={cn(
                  branch.state === "pruned" ? "diagram-branch-dashed" : "diagram-branch",
                  "fill-none transition-[stroke-width] duration-[var(--dur-base)]",
                  STROKE[branch.state],
                )}
                strokeWidth={selected ? 3 : 1.5}
                strokeDasharray={branch.state === "pruned" ? "6 8" : undefined}
                strokeLinecap="round"
              />
              <circle cx={p.from.x} cy={p.from.y} r={4} className="diagram-marker fill-bg stroke-temporal" strokeWidth={2} />
            </g>
          );
        })}
      </svg>

      {/* Pointer shortcuts over the branch ends. The tablist is the accessible control. */}
      {paths.map((p, i) => {
        const branch = branches[i];
        const selected = branch.id === selectedId;
        const pos = percent(p.to);
        return (
          <button
            key={p.id}
            type="button"
            tabIndex={-1}
            aria-hidden="true"
            onClick={() => onSelect(branch.id)}
            onMouseDown={(e) => e.preventDefault()}
            className="diagram-marker group absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full"
            style={pos}
          >
            <span
              className={cn(
                "block rounded-full ring-2 ring-bg transition-[transform,box-shadow] duration-[var(--dur-base)] ease-[var(--ease-swift)]",
                FILL[branch.state],
                selected ? "h-4 w-4 shadow-[0_0_0_6px_color-mix(in_oklab,currentColor_25%,transparent)]" : "h-3 w-3 group-hover:scale-125",
              )}
              style={{ color: "inherit" }}
            />
            <span
              className={cn(
                "meta-label pointer-events-none absolute top-1/2 hidden -translate-y-1/2 whitespace-nowrap md:block",
                p.to.x > VIEW.width * 0.78 ? "right-full mr-1" : "left-full ml-1",
                selected ? "text-fg" : "text-fg-subtle group-hover:text-fg-muted",
              )}
            >
              {branch.id}
            </span>
          </button>
        );
      })}
    </div>
  );
}
