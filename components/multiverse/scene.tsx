"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect } from "react";
import type { PerspectiveCamera } from "three";
import { useSceneHealth } from "@/components/graphics/scene-boundary";
import { quietKnownThreeWarnings } from "@/components/graphics/three-console";
import { watchRenderer } from "@/lib/webgl-health";
import type { LabEngine } from "./engine";
import { MULTIVERSE_TINTS } from "./tints";

quietKnownThreeWarnings();

/** Connects the engine to the renderer and runs it: one frame callback (priority 1, so the composer renders instead of R3F). */
function Driver({ engine }: { engine: LabEngine }) {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  const setDpr = useThree((s) => s.setDpr);
  const invalidate = useThree((s) => s.invalidate);
  const width = useThree((s) => s.size.width);
  const height = useThree((s) => s.size.height);
  const dpr = useThree((s) => s.viewport.dpr);
  const report = useSceneHealth();
  useEffect(() => watchRenderer(gl, report), [gl, report]);
  useEffect(() => engine.attach(gl, scene, camera as PerspectiveCamera, { setDpr, invalidate }), [engine, gl, scene, camera, setDpr, invalidate]);
  useEffect(() => engine.resize(width, height, dpr), [engine, width, height, dpr]);
  useFrame((_, delta) => {
    engine.frame(delta, performance.now() / 1000);
    engine.render();
  }, 1);
  return null;
}

/**
 * The multiverse, declared: the sky, the dust, one mesh for every
 * filament, one point cloud for the pocket universes, one for the flow,
 * the loom. Six draw calls before post-processing, whatever the number of
 * timelines. Geometry and materials belong to the engine (it updates them);
 * this tree only places them.
 */
export function MultiverseScene({ engine, frameloop }: { engine: LabEngine; frameloop: "always" | "demand" | "never" }) {
  const rt = engine.runtime;
  return (
    <Canvas
      frameloop={frameloop}
      dpr={[1, engine.budget.dprMax]}
      gl={{ antialias: false, alpha: false, powerPreference: "high-performance", stencil: false }}
      camera={{ fov: 40, near: 0.1, far: 1500, position: [-52, 5, 20] }}
      onCreated={({ gl }) => gl.setClearColor(MULTIVERSE_TINTS.night, 1)}
      style={{ position: "absolute", inset: 0 }}
    >
      <Driver engine={engine} />
      <mesh material={engine.materials.sky} renderOrder={-1} frustumCulled={false}>
        <sphereGeometry args={[600, 48, 24]} />
      </mesh>
      <points geometry={engine.dust} material={engine.materials.dust} frustumCulled={false} />
      <mesh geometry={rt.filaments} material={engine.materials.filament} frustumCulled={false} />
      <points geometry={rt.nodes} material={engine.materials.nodes} frustumCulled={false} />
      <points geometry={rt.flow.geometry} material={engine.materials.particles} frustumCulled={false} />
      <mesh position={engine.loomPosition} material={engine.materials.loom} frustumCulled={false}>
        <planeGeometry args={[2, 2]} />
      </mesh>
    </Canvas>
  );
}
