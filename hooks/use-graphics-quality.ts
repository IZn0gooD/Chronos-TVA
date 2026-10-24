"use client";

import { useMemo } from "react";
import { siteConfig } from "@/config/site";
import { detectQuality, readDeviceHints, resolveEffects, supportsWebGL, type Quality } from "@/lib/graphics-quality";
import type { EffectsLevel } from "@/lib/signals";
import { useHydrated } from "./use-hydrated";
import { useReducedMotion } from "./use-reduced-motion";

export interface GraphicsState {
  level: EffectsLevel;
  /** Null until hydrated, when effects are off, or without WebGL: render the fallback plate. */
  quality: Quality | null;
  webgl: boolean;
  /** False on the server and during hydration. */
  ready: boolean;
}

/**
 * What the graphics may do on this device, decided once after hydration and
 * again if the motion switch flips. In development, `?studio=1` (Theatre.js
 * Studio) lets the chamber animate even under a system reduced-motion
 * preference: an author tuning keyframes needs to see them move.
 */
export function useGraphicsQuality(): GraphicsState {
  const hydrated = useHydrated();
  const reducedPreference = useReducedMotion();
  return useMemo(() => {
    if (!hydrated) return { level: "off", quality: null, webgl: false, ready: false };
    const authoring = process.env.NODE_ENV === "development" && new URLSearchParams(window.location.search).has("studio");
    const reduced = reducedPreference && !authoring;
    const level = resolveEffects(siteConfig.graphics.effects, reduced);
    const webgl = level !== "off" && supportsWebGL();
    const quality = level !== "off" && webgl ? detectQuality(level, { ...readDeviceHints(), reducedMotion: reduced }) : null;
    return { level, quality, webgl, ready: true };
  }, [hydrated, reducedPreference]);
}
