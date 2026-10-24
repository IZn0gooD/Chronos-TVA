"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type CSSProperties, type PointerEvent as ReactPointerEvent, type RefObject } from "react";
import type { IUniform, ShaderMaterial } from "three";
import { readPalette } from "@/config/palette";
import { cn } from "@/lib/cn";
import type { Quality } from "@/lib/graphics-quality";
import { watchRenderer } from "@/lib/webgl-health";
import { fieldColors } from "./colors";
import { useSceneHealth } from "./scene-boundary";
import { quietKnownThreeWarnings } from "./three-console";
import { TEMPORAL_FIELD_DEFAULTS, TEMPORAL_FIELD_FRAGMENT, TEMPORAL_FIELD_VERTEX } from "./shaders/temporal-field";

quietKnownThreeWarnings();

export type FieldUniforms = Record<keyof typeof TEMPORAL_FIELD_DEFAULTS, IUniform>;

/** Called every rendered frame with the live uniforms: the owner animates what it likes, from refs or signals. */
export type Drive = (uniforms: FieldUniforms, delta: number, elapsed: number) => void;

type Params = Partial<Record<"uIntensity" | "uDistortion" | "uSpeed" | "uCollapse", number>>;

interface ShaderCanvasProps {
  quality: Quality;
  /** Renders only while true (in view, tab visible). */
  active: boolean;
  /** Static parameter values, re-applied when they change (no recompile). */
  params?: Params;
  drive?: Drive;
  /** Pointer tracking relative to this canvas; false keeps uPointer at the centre. */
  interactive?: boolean;
  fragment?: string;
  className?: string;
  style?: CSSProperties;
  /** Spoken description; "" marks the canvas decorative. */
  label: string;
}

/** Requests frames at the given rate while active; the canvas sleeps otherwise (frameloop="demand"). */
export function Ticker({ fps, active }: { fps: number; active: boolean }) {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    if (!active) return;
    let raf = 0;
    let last = 0;
    const step = 1000 / fps;
    const tick = (now: number) => {
      if (now - last >= step) {
        last = now;
        invalidate();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [fps, active, invalidate]);
  return null;
}

interface PlaneProps {
  quality: Quality;
  params?: Params;
  drive?: Drive;
  pointer: RefObject<{ x: number; y: number }>;
  fragment: string;
}

function FieldPlane({ quality, params, drive, pointer, fragment }: PlaneProps) {
  const material = useRef<ShaderMaterial>(null);
  const gl = useThree((s) => s.gl);
  const report = useSceneHealth();
  // Shader errors and lost contexts become the fallback plate, not a blank.
  useEffect(() => watchRenderer(gl, report), [gl, report]);

  // Built once; later changes mutate the material's own (stable) uniforms, see useFrame.
  const uniforms = useMemo<FieldUniforms>(() => {
    const u = {} as FieldUniforms;
    for (const [key, value] of Object.entries(TEMPORAL_FIELD_DEFAULTS)) {
      u[key as keyof FieldUniforms] = { value: Array.isArray(value) ? [...value] : value };
    }
    return { ...u, ...fieldColors(readPalette()) } as FieldUniforms;
  }, []);

  useFrame((state, delta) => {
    const m = material.current;
    if (!m) return;
    const u = m.uniforms as FieldUniforms;
    u.uTime.value += Math.min(delta, 0.1);
    const res = u.uResolution.value as number[];
    res[0] = state.size.width;
    res[1] = state.size.height;
    const pt = u.uPointer.value as number[];
    pt[0] += (pointer.current.x - pt[0]) * 0.08;
    pt[1] += (pointer.current.y - pt[1]) * 0.08;
    u.uOctaves.value = quality.octaves;
    if (params) {
      for (const key of Object.keys(params) as Array<keyof Params>) {
        const value = params[key];
        if (value !== undefined) u[key].value = value;
      }
    }
    drive?.(u, delta, state.clock.elapsedTime);
  });

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial ref={material} uniforms={uniforms} vertexShader={TEMPORAL_FIELD_VERTEX} fragmentShader={fragment} depthTest={false} depthWrite={false} />
    </mesh>
  );
}

/**
 * A fullscreen shader on its own WebGL canvas. Generic: the fragment program
 * and its uniforms are the only universe-specific parts. Renders on demand at
 * the quality's frame rate, fills the box its owner reserves with CSS, and
 * reports shader or context failures to the enclosing SceneBoundary.
 */
export function ShaderCanvas({ quality, active, params, drive, interactive = true, fragment = TEMPORAL_FIELD_FRAGMENT, className, style, label }: ShaderCanvasProps) {
  // The pointer lives in a ref: handlers write it, the render loop reads it, React never re-renders for it.
  const pointer = useRef({ x: 0, y: 0 });
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!interactive) return;
    const r = e.currentTarget.getBoundingClientRect();
    pointer.current.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    pointer.current.y = -(((e.clientY - r.top) / r.height) * 2 - 1);
  };
  const onPointerLeave = () => {
    pointer.current.x = 0;
    pointer.current.y = 0;
  };
  return (
    <div
      className={cn("relative h-full w-full", className)}
      style={style}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      role={label ? "img" : undefined}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : true}
    >
      <Canvas
        frameloop="demand"
        dpr={quality.dpr}
        flat
        gl={{ antialias: false, alpha: false, powerPreference: "high-performance", depth: false, stencil: false }}
        orthographic
        camera={{ position: [0, 0, 1], near: 0, far: 2 }}
        style={{ position: "absolute", inset: 0 }}
      >
        <Ticker fps={quality.animate ? quality.fps : 8} active={active} />
        <FieldPlane quality={quality} params={params} drive={drive} pointer={pointer} fragment={fragment} />
      </Canvas>
    </div>
  );
}
