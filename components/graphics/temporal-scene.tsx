"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { useEffect, type CSSProperties } from "react";
import { readPalette } from "@/config/palette";
import { siteConfig } from "@/config/site";
import type { Quality } from "@/lib/graphics-quality";
import { scene, useScene } from "@/lib/signals";
import { watchRenderer } from "@/lib/webgl-health";
import { CameraRig } from "./scenes/camera-rig";
import { Orbitals } from "./scenes/orbitals";
import { Particles } from "./scenes/particles";
import { TemporalArtifact } from "./scenes/temporal-artifact";
import { useSceneHealth } from "./scene-boundary";
import { quietKnownThreeWarnings } from "./three-console";
import { Ticker } from "./shader-canvas";
import { getChamber, holdRest, playRange, RANGES } from "./theatre/project";
import { initStudio } from "./theatre/studio";

interface TemporalSceneProps {
  quality: Quality;
  active: boolean;
  className?: string;
  style?: CSSProperties;
  label: string;
}

quietKnownThreeWarnings();

/** Reports lost contexts and shader errors to the boundary, from inside the Canvas. */
function RendererHealth() {
  const gl = useThree((s) => s.gl);
  const report = useSceneHealth();
  useEffect(() => watchRenderer(gl, report), [gl, report]);
  return null;
}

/** Plays the Theatre ranges: the entrance once, then the event range on every variance. */
function Choreography({ animate }: { animate: boolean }) {
  const events = useScene((s) => s.events);
  const useTheatre = siteConfig.graphics.theatre && animate;
  useEffect(() => {
    if (!useTheatre) {
      void holdRest();
      return;
    }
    void initStudio();
    void playRange(RANGES.entrance);
  }, [useTheatre]);
  useEffect(() => {
    if (!useTheatre || events === 0) return;
    void playRange(RANGES.event);
  }, [useTheatre, events]);
  return null;
}

/**
 * The temporal chamber: artifact, orbitals, dust, camera rig, on a deep green
 * ground. Renders on demand at the quality's frame rate while `active`;
 * reads the shared signals (pointer, scroll, branch, events) inside the
 * render loop, never through React state.
 */
export function TemporalScene({ quality, active, className, style, label }: TemporalSceneProps) {
  const { values } = getChamber();
  const palette = readPalette();
  return (
    <div className={className} style={style} role="img" aria-label={label}>
      <Canvas
        frameloop="demand"
        dpr={quality.dpr}
        flat
        gl={{ antialias: quality.antialias, alpha: false, powerPreference: "high-performance", stencil: false }}
        camera={{ fov: values.camera.fov, near: 0.1, far: 40, position: [values.camera.x, values.camera.y, values.camera.z] }}
        onCreated={({ gl }) => gl.setClearColor(palette.green, 1)}
        style={{ position: "absolute", inset: 0 }}
      >
        <RendererHealth />
        <Ticker fps={quality.animate ? quality.fps : 6} active={active} />
        <Choreography animate={quality.animate} />
        <fog attach="fog" args={[palette.green, 7, 15]} />
        <CameraRig values={values} parallax={quality.animate} />
        <TemporalArtifact values={values} quality={quality} />
        <Orbitals values={values} />
        <Particles count={quality.particles} values={values} />
      </Canvas>
      <span className="sr-only">{scene.get().events > 0 ? "A variance was registered in the chamber." : ""}</span>
    </div>
  );
}
