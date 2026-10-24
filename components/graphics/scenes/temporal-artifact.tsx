"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type { IUniform, Mesh, ShaderMaterial } from "three";
import { readPalette } from "@/config/palette";
import type { Quality } from "@/lib/graphics-quality";
import { damp, scene } from "@/lib/signals";
import { artifactColors } from "../colors";
import { ARTIFACT_DEFAULTS, ARTIFACT_FRAGMENT, ARTIFACT_VERTEX } from "../shaders/artifact";
import type { ChamberValues } from "../theatre/project";

type ArtifactUniforms = Record<keyof typeof ARTIFACT_DEFAULTS, IUniform>;

/**
 * The central object: a displaced sphere under the artifact shader. Theatre
 * owns scale, distortion, pulse, hue and spin (`values.artifact`); the
 * explorer's branch state adds heat to the rim (a nexus branch burns
 * orange), damped here so a click never snaps the colour.
 */
export function TemporalArtifact({ values, quality }: { values: ChamberValues; quality: Quality }) {
  const mesh = useRef<Mesh>(null);
  const material = useRef<ShaderMaterial>(null);
  const heat = useRef(0);
  const uniforms = useMemo<ArtifactUniforms>(() => {
    const u = {} as ArtifactUniforms;
    for (const [key, value] of Object.entries(ARTIFACT_DEFAULTS)) u[key as keyof ArtifactUniforms] = { value };
    return { ...u, ...artifactColors(readPalette()) } as ArtifactUniforms;
  }, []);
  const detail = quality.particles > 600 ? 40 : 24;

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1);
    const m = mesh.current;
    const mat = material.current;
    if (!m || !mat) return;
    const a = values.artifact;
    const u = mat.uniforms as ArtifactUniforms;
    u.uTime.value += dt;
    u.uDistortion.value = a.distortion;
    u.uPulse.value = a.pulse;
    u.uLight.value = values.light.intensity;
    u.uOctaves.value = quality.octaves;
    const state = scene.get().branchState;
    heat.current = damp(heat.current, state === "nexus" ? 1 : state === "pruned" ? 0.35 : 0, 3, dt);
    u.uHue.value = Math.max(a.hue, heat.current);
    m.rotation.y += dt * a.spin;
    m.rotation.x = Math.sin(u.uTime.value * 0.11) * 0.12;
    m.scale.setScalar(a.scale);
  });

  return (
    <mesh ref={mesh}>
      <icosahedronGeometry args={[1.15, detail]} />
      <shaderMaterial ref={material} uniforms={uniforms} vertexShader={ARTIFACT_VERTEX} fragmentShader={ARTIFACT_FRAGMENT} />
    </mesh>
  );
}
