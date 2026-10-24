import { palette } from "@/config/palette";

/**
 * The lab's colours: the TVA palette where it fits (copper is the TVA
 * orange, warm white the paper light, deep green the void), brighter
 * derivatives for light. They feed GLSL as HDR inputs and the static SVG
 * plate; none of them carries text. A plain module so the server-rendered
 * plate and the client engine read the same values.
 */
export const MULTIVERSE_TINTS = {
  amber: "#e8a33d",
  gold: "#f5cf74",
  copper: palette.orange,
  warm: palette.warm,
  weave: "#7fe0c8",
  ember: "#ff5a1f",
  deep: palette.green,
  night: "#07090a",
  haze: "#c98a3c",
} as const;
