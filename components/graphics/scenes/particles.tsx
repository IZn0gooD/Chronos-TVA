"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { BufferAttribute, BufferGeometry, type Points, type PointsMaterial } from "three";
import { readPalette } from "@/config/palette";
import type { ChamberValues } from "../theatre/project";

/** Deterministic pseudo-random, so the dust is the same on every visit. */
function mulberry(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Dust in the chamber: one Points object, positions in a shell around the
 * artifact, built once for the given count. The whole cloud turns slowly;
 * the variance pulse makes it flicker. No per-frame allocation.
 */
export function Particles({ count, values }: { count: number; values: ChamberValues }) {
  const points = useRef<Points>(null);
  const palette = useMemo(() => readPalette(), []);
  const geometry = useMemo(() => {
    const rnd = mulberry(1962);
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 2.4 + rnd() * 2.6;
      const theta = rnd() * Math.PI * 2;
      const phi = Math.acos(2 * rnd() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.7;
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(positions, 3));
    return g;
  }, [count]);

  useFrame((state, delta) => {
    const p = points.current;
    if (!p) return;
    p.rotation.y += Math.min(delta, 0.1) * 0.025;
    const mat = p.material as PointsMaterial;
    const pulse = values.artifact.pulse;
    mat.opacity = 0.42 + pulse * 0.4 * (0.5 + 0.5 * Math.sin(state.clock.elapsedTime * 40));
  });

  return (
    <points ref={points} geometry={geometry}>
      <pointsMaterial color={palette.sage} size={0.028} sizeAttenuation transparent opacity={0.42} depthWrite={false} />
    </points>
  );
}
