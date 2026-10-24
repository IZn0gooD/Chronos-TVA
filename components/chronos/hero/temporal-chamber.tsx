"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { SceneBoundary, type SceneFailure } from "@/components/graphics/scene-boundary";
import { Frame } from "@/components/ui/frame";
import { siteConfig } from "@/config/site";
import { BRANCH_STATE_LABELS } from "@/data/branches";
import { useGraphicsQuality } from "@/hooks/use-graphics-quality";
import { useIdleMount } from "@/hooks/use-idle-mount";
import { useInView } from "@/hooks/use-in-view";
import { usePageVisible } from "@/hooks/use-page-visible";
import { cn } from "@/lib/cn";
import { scene, useScene } from "@/lib/signals";
import { ChamberFallback } from "./chamber-fallback";

// The WebGL scene ships in its own chunk and only on the client; the plate below is in the HTML.
const TemporalScene = dynamic(() => import("@/components/graphics/temporal-scene").then((m) => m.TemporalScene), { ssr: false });

const LABEL =
  "Temporal chamber: a banded sphere, distorted by noise, turns inside three orbital rings and a field of dust. A variance makes it ripple and burn orange; the branch under review lights its ring.";

/**
 * The hero's instrument: the 3D temporal artifact in a notched frame, on a
 * deep green ground. The still plate paints first and stays underneath; the
 * canvas renders over it once WebGL is confirmed and the frame is in view.
 * Every reading the canvas could convey is also printed in the HTML readout.
 */
export function TemporalChamber({ className, variance }: { className?: string; variance: boolean }) {
  const graphics = useGraphicsQuality();
  const [ref, inView] = useInView<HTMLDivElement>("15% 0px");
  const visible = usePageVisible();
  // The scene waits for a quiet moment after load: the plate is already painted, the title is already in.
  const idle = useIdleMount(1800);
  const [failure, setFailure] = useState<SceneFailure | null>(null);
  const branch = useScene((s) => s.branchState);
  const branchId = useScene((s) => s.branchId);
  const events = useScene((s) => s.events);

  useEffect(() => {
    if (graphics.ready) scene.set({ effects: graphics.quality ? graphics.level : "off" });
  }, [graphics]);

  const live = Boolean(graphics.quality) && siteConfig.features.scene3d && !failure && idle;
  const mode = !graphics.ready || (!idle && graphics.quality)
    ? "Initialising"
    : !siteConfig.features.scene3d || graphics.level === "off"
      ? "Static plate · effects off"
      : !graphics.webgl
        ? "Static plate · WebGL unavailable"
        : failure
          ? `Static plate · ${failure === "context-lost" ? "context lost" : "renderer fault"}`
          : `Live · ${graphics.level}${graphics.quality?.animate ? "" : " · held still"}`;

  return (
    <Frame heading="Temporal chamber" light={variance ? "anomaly" : "temporal"} stamp={events > 0 ? `Variance ${String(events).padStart(2, "0")}` : undefined} tone="deep" padding="none" className={className}>
      <div ref={ref} className="relative aspect-[4/3] w-full overflow-hidden rounded-xs lg:aspect-square">
        <ChamberFallback className="absolute inset-0" />
        {live && graphics.quality && (
          <SceneBoundary fallback={null} onFailure={setFailure}>
            <TemporalScene quality={graphics.quality} active={inView && visible} label={LABEL} className="scene-enter absolute inset-0" />
          </SceneBoundary>
        )}
        {/* HTML readout over the glass: nothing essential lives only in the canvas. */}
        <div className="pointer-events-none absolute inset-x-3 bottom-3 flex items-end justify-between gap-4 font-mono text-micro uppercase tracking-[0.08em] text-paper/90">
          <span>
            Specimen 00 · {branchId ?? "SL-0"} · {BRANCH_STATE_LABELS[branch]}
          </span>
          <span className={cn("text-right", live ? "text-temporal-text" : "text-paper/70")}>{mode}</span>
        </div>
      </div>
    </Frame>
  );
}
