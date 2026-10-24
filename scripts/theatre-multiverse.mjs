// Generates data/theatre/multiverse.json (the "CHRONOS · Multiverse" cinematic)
// and data/theatre/multiverse-pose.json (the pose it ends on), from the
// keyframe spec below. Five movements on one 24-second sequence; the
// simulation's own program (lib/multiverse/simulation.ts) is written on the
// same clock, so the camera arrives where the network is happening.
// Refine in Studio (`npm run dev`, /multiverse?studio=1), export, or edit
// here and run `node scripts/theatre-multiverse.mjs`.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { poseAt, stateFrom } from "./theatre-state.mjs";

export const SHEET = "Cinematic";
export const LENGTH = 24;

// [position, value, handles?]; handles default to an ease in-out.
export const SPEC = {
  camera: {
    x: [[0, -52], [2.5, -47], [4, -38], [9, -20], [15, 8], [20, 78], [24, 12]],
    y: [[0, 5], [4, 6], [9, 14], [15, 46], [20, 16], [24, 26]],
    z: [[0, 20], [4, 25], [9, 46], [15, 138], [20, 80], [24, 168]],
    fov: [[0, 40], [9, 44], [15, 47], [20, 44], [24, 44]],
  },
  target: {
    x: [[0, -30], [2.5, -26], [4, -13], [9, 6], [15, 8], [20, 12], [24, -14]],
    y: [[0, 0], [9, 0], [20, 2], [24, 2]],
    z: [[0, 0], [24, 0]],
  },
  world: {
    exposure: [[0, 0], [1.6, 1], [24, 1]],
    filamentEnergy: [[0, 0.75], [4, 0.9], [9, 1.1], [15, 1.2], [20, 1.3], [24, 1.05]],
    particleSpeed: [[0, 0.5], [4, 1], [9, 1.5], [15, 1.2], [20, 1], [24, 0.8]],
    bloomStrength: [[0, 0.6], [4, 0.8], [9, 1], [15, 1.1], [20, 1.2], [24, 0.95]],
    instability: [[0, 0], [9, 0.05], [15, 0.12], [17.5, 0.32], [20, 0.1], [24, 0.04]],
    branchDensity: [[0, 1], [24, 1]],
    fabric: [[0, 0], [2.5, 1], [9, 0.75], [24, 0.6]],
    title: [[0, 0], [20.5, 0], [22.2, 1], [24, 1]],
  },
};

export function buildMultiverseState() {
  return stateFrom({ sheet: SHEET, spec: SPEC, length: LENGTH, revision: "chronos-multiverse-1" });
}

export function finalPose() {
  return poseAt(SPEC, LENGTH);
}

const here = path.dirname(fileURLToPath(import.meta.url));
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const dir = path.join(here, "..", "data", "theatre");
  fs.writeFileSync(path.join(dir, "multiverse.json"), JSON.stringify(buildMultiverseState(), null, 2) + "\n");
  fs.writeFileSync(path.join(dir, "multiverse-pose.json"), JSON.stringify(finalPose(), null, 2) + "\n");
  console.log("wrote data/theatre/multiverse.json and multiverse-pose.json");
}
