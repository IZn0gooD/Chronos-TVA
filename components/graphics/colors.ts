import { Vector3 } from "three";
import type { Palette } from "@/config/palette";

/**
 * A hex colour as a raw sRGB vec3 uniform. Our shaders write gl_FragColor
 * directly, with no colour-space conversion, so handing them sRGB values
 * (not three.js's linear Color) makes the GPU match the CSS exactly.
 */
export function srgbVec3(hex: string): Vector3 {
  const n = parseInt(hex.replace("#", ""), 16);
  return new Vector3(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}

/** The uniform colours of the temporal field, from the page's palette. */
export function fieldColors(p: Palette) {
  return {
    uColorBg: { value: srgbVec3(p.green) },
    uColorDeep: { value: srgbVec3(p.teal) },
    uColorMid: { value: srgbVec3(p.sage) },
    uColorHot: { value: srgbVec3(p.orange) },
    uColorCore: { value: srgbVec3(p.paper) },
  };
}

/** The uniform colours of the artifact, from the page's palette. */
export function artifactColors(p: Palette) {
  return {
    uColorBase: { value: srgbVec3(p.green) },
    uColorInk: { value: srgbVec3(p.obsidian) },
    uColorRim: { value: srgbVec3(p.sage) },
    uColorHot: { value: srgbVec3(p.orange) },
  };
}
