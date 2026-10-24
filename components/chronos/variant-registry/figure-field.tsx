"use client";

import dynamic from "next/dynamic";
import { FieldPlate } from "@/components/graphics/field-plate";
import { SceneBoundary } from "@/components/graphics/scene-boundary";
import { siteConfig } from "@/config/site";
import { useGraphicsQuality } from "@/hooks/use-graphics-quality";
import { useInView } from "@/hooks/use-in-view";
import { usePageVisible } from "@/hooks/use-page-visible";
import { cn } from "@/lib/cn";
import type { VariantField } from "@/types/content";

const ShaderCanvas = dynamic(() => import("@/components/graphics/shader-canvas").then((m) => m.ShaderCanvas), { ssr: false });

/** Two readings of the same field: the reactor burns, the shadow holds half-collapsed. */
const PRESETS: Record<VariantField, { uIntensity: number; uDistortion: number; uSpeed: number; uCollapse: number }> = {
  reactor: { uIntensity: 0.95, uDistortion: 0.8, uSpeed: 0.8, uCollapse: 0 },
  shadow: { uIntensity: 0.55, uDistortion: 0.3, uSpeed: 0.35, uCollapse: 0.4 },
};

/**
 * A shader thumbnail as a card figure. The SVG plate is in the HTML; the
 * canvas mounts over it only while the card is near the viewport, at a low
 * frame rate and pixel ratio, and leaves again when it scrolls away, so the
 * registry never holds more than a couple of contexts. Decorative.
 */
export function FigureField({ field, className }: { field?: VariantField; className?: string }) {
  const graphics = useGraphicsQuality();
  const [ref, inView] = useInView<HTMLDivElement>("10% 0px");
  const visible = usePageVisible();
  if (!field) return null;
  const quality = graphics.quality ? { ...graphics.quality, fps: Math.min(graphics.quality.fps, 24), dpr: [1, 1.25] as [number, number], octaves: Math.min(graphics.quality.octaves, 4) } : null;
  const live = Boolean(quality) && siteConfig.features.shaderFigures && inView;
  return (
    <div ref={ref} className={cn("relative h-full w-full overflow-hidden", className)} aria-hidden="true">
      <FieldPlate className="absolute inset-0" intensity={PRESETS[field].uIntensity} />
      {live && quality && (
        <SceneBoundary fallback={null}>
          <ShaderCanvas quality={quality} active={inView && visible} params={PRESETS[field]} interactive={false} label="" className="absolute inset-0" />
        </SceneBoundary>
      )}
    </div>
  );
}
