"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Color, Group, type Mesh, type MeshBasicMaterial, TorusGeometry } from "three";
import { readPalette } from "@/config/palette";
import { damp, scene } from "@/lib/signals";
import type { ChamberValues } from "../theatre/project";

const RING_COUNT = 3;

/**
 * Three orbital rings around the artifact: the branches on record, as
 * instruments see them. Theatre owns their tilt and spread; the explorer's
 * selected branch lights a ring (branchIndex 1.. cycles through the three;
 * the sacred timeline, 0, lights none). One geometry, three materials.
 */
export function Orbitals({ values }: { values: ChamberValues }) {
  const group = useRef<Group>(null);
  const rings = useRef<(Mesh | null)[]>([]);
  const palette = useMemo(() => readPalette(), []);
  const geometry = useMemo(() => new TorusGeometry(1, 0.011, 6, 180), []);
  const colors = useMemo(
    () => ({ rest: [new Color(palette.teal), new Color(palette.sage), new Color("#4f8275")], hot: new Color(palette.orange) }),
    [palette],
  );
  const heat = useRef([0, 0, 0]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1);
    const g = group.current;
    if (!g) return;
    const { tilt, spread } = values.orbitals;
    const selected = scene.get().branchIndex;
    g.rotation.y += dt * 0.06;
    for (let i = 0; i < RING_COUNT; i++) {
      const mesh = rings.current[i];
      if (!mesh) continue;
      const radius = (1.9 + i * 0.42) * (0.2 + 0.8 * spread);
      mesh.scale.setScalar(radius);
      mesh.rotation.x = Math.PI / 2 + tilt * (i - 1) * 0.9;
      mesh.rotation.z = tilt * 0.3 * i;
      const lit = selected > 0 && (selected - 1) % RING_COUNT === i ? 1 : 0;
      heat.current[i] = damp(heat.current[i], lit, 6, dt);
      const mat = mesh.material as MeshBasicMaterial;
      mat.color.copy(colors.rest[i]).lerp(colors.hot, heat.current[i]);
      mat.opacity = (0.55 + 0.45 * heat.current[i]) * spread;
    }
  });

  return (
    <group ref={group}>
      {Array.from({ length: RING_COUNT }, (_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            rings.current[i] = el;
          }}
          geometry={geometry}
        >
          <meshBasicMaterial color={colors.rest[i]} transparent opacity={0.6} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}
