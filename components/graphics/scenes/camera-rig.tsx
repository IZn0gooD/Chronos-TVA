"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { PerspectiveCamera } from "three";
import { damp, frame } from "@/lib/signals";
import type { ChamberValues } from "../theatre/project";

/**
 * The camera. Theatre owns its base position and field of view (`values`);
 * this rig adds two offsets of its own: a pointer parallax (damped, a few
 * tenths of a unit) and a scroll dolly (the camera backs away as the hero
 * leaves the viewport). It always looks at the artifact.
 */
export function CameraRig({ values, parallax }: { values: ChamberValues; parallax: boolean }) {
  const offset = useRef({ x: 0, y: 0 });
  useFrame((state, delta) => {
    const camera = state.camera as PerspectiveCamera;
    const dt = Math.min(delta, 0.1);
    const target = parallax ? frame.pointer : { x: 0, y: 0 };
    offset.current.x = damp(offset.current.x, target.x * 0.45, 4, dt);
    offset.current.y = damp(offset.current.y, target.y * 0.25, 4, dt);
    const c = values.camera;
    camera.position.set(c.x + offset.current.x, c.y + offset.current.y, c.z + frame.hero * 2.2);
    if (Math.abs(camera.fov - c.fov) > 0.01) {
      camera.fov = c.fov;
      camera.updateProjectionMatrix();
    }
    camera.lookAt(0, 0, 0);
  });
  return null;
}
