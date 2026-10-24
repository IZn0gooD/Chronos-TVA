import type { EffectsLevel } from "./signals";

/**
 * Rendering quality, decided once per mount from what the device tells us.
 * Every graphics component takes a `Quality`; nothing reads window sizes
 * inside a render loop. `effects: "off"` is handled before this is called
 * (the fallback composition renders instead of a canvas).
 */
export interface Quality {
  /** Device pixel ratio bounds handed to the renderer. */
  dpr: [number, number];
  /** Dust particles in the temporal chamber. */
  particles: number;
  /** Noise octaves evaluated per fragment (a uniform, not a recompile). */
  octaves: number;
  /** Frames per second the loops aim for; the renderer sleeps between them. */
  fps: number;
  antialias: boolean;
  /** Pointer parallax and continuous motion; false holds the composed still. */
  animate: boolean;
}

export interface DeviceHints {
  width: number;
  reducedMotion: boolean;
  saveData?: boolean;
  deviceMemory?: number;
  hardwareConcurrency?: number;
}

export const QUALITY_PRESETS: Record<Exclude<EffectsLevel, "off">, Quality> = {
  full: { dpr: [1, 1.75], particles: 1200, octaves: 5, fps: 60, antialias: true, animate: true },
  reduced: { dpr: [1, 1], particles: 240, octaves: 3, fps: 24, antialias: false, animate: false },
};

/** Picks a preset, then trims it for small or constrained devices. */
export function detectQuality(level: Exclude<EffectsLevel, "off">, hints: DeviceHints): Quality {
  const base = { ...QUALITY_PRESETS[level] };
  if (level === "reduced") return base;
  const constrained =
    hints.saveData === true ||
    (hints.deviceMemory !== undefined && hints.deviceMemory <= 4) ||
    (hints.hardwareConcurrency !== undefined && hints.hardwareConcurrency <= 4);
  if (hints.width < 768) {
    base.dpr = [1, 1.5];
    base.particles = 500;
    base.octaves = 4;
  }
  if (constrained) {
    base.dpr = [1, Math.min(base.dpr[1], 1.25)];
    base.particles = Math.min(base.particles, 400);
    base.octaves = Math.min(base.octaves, 4);
    base.fps = 30;
    base.antialias = false;
  }
  if (hints.reducedMotion) base.animate = false;
  return base;
}

/** Reads the device hints from the browser; a plain object so tests can pass their own. */
export function readDeviceHints(): DeviceHints {
  const nav = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number };
  return {
    width: window.innerWidth,
    reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    saveData: nav.connection?.saveData,
    deviceMemory: nav.deviceMemory,
    hardwareConcurrency: nav.hardwareConcurrency,
  };
}

/** True when the browser can give us a WebGL context at all. Cached: the probe creates a context. */
let webglSupport: boolean | null = null;
export function supportsWebGL(): boolean {
  if (webglSupport !== null) return webglSupport;
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    webglSupport = Boolean(gl);
    // Release the probe's context right away: browsers cap live contexts.
    (gl as WebGLRenderingContext | null)?.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    webglSupport = false;
  }
  return webglSupport;
}

/** The effects level in force: the configuration, then the reader's reduced-motion preference. */
export function resolveEffects(configured: "auto" | EffectsLevel, reducedMotion: boolean): EffectsLevel {
  if (configured !== "auto") return configured;
  return reducedMotion ? "reduced" : "full";
}
