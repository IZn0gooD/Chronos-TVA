// Generates data/theatre/chamber.json, the Theatre.js project state for the
// temporal chamber, from the compact keyframe spec below. Theatre.js Studio
// (development only, `?studio=1`) can refine these curves visually and export
// the same file format; this script keeps a readable, reviewable source of
// truth so the sequence never depends on a browser session.
//
// Two ranges live on one sheet: ENTRANCE plays once when the chamber mounts;
// EVENT plays on every variance. Both start and end on the resting pose, so
// they can follow each other without a jump.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const SHEET = "Temporal chamber";
export const RANGES = { entrance: [0, 4], event: [4.5, 8] };

/** [position, value, handles?]. Handles are Theatre's bezier [x1, y1, x2, y2]; omitted = ease in-out. */
const SPEC = {
  camera: {
    x: [[0, 0.8], [4, 0], [4.5, 0], [6, 0.35], [8, 0]],
    y: [[0, 1.8], [4, 0.55], [4.5, 0.55], [6, 0.3], [8, 0.55]],
    z: [[0, 12], [4, 7.6], [4.5, 7.6], [5.6, 6.2, [0.2, 0.9, 0.4, 1]], [8, 7.6]],
    fov: [[0, 28], [4, 34], [4.5, 34], [8, 34]],
  },
  artifact: {
    scale: [[0, 0.55], [4, 1], [4.5, 1], [5.4, 1.08], [8, 1]],
    distortion: [[0, 0.95], [4, 0.32], [4.5, 0.32], [5.3, 1, [0.1, 1, 0.5, 0]], [8, 0.32]],
    pulse: [[4.5, 0], [5.1, 1, [0.1, 1, 0.4, 0]], [8, 0]],
    hue: [[4.5, 0], [5.3, 1], [7.4, 0]],
    spin: [[0, 0.25], [4, 0.08], [4.5, 0.08], [5.4, 0.55], [8, 0.08]],
  },
  orbitals: {
    tilt: [[0, 1.1], [4, 0.38], [4.5, 0.38], [5.8, 0.7], [8, 0.38]],
    spread: [[0, 0], [4, 1], [4.5, 1], [8, 1]],
  },
  light: {
    intensity: [[0, 0.35], [4, 1], [4.5, 1], [5.2, 1.9, [0.1, 1, 0.5, 0]], [8, 1]],
  },
};

/** Resting pose: every prop's value at the end of the entrance, for the objects' defaults. */
export function restingPose() {
  const pose = {};
  for (const [obj, props] of Object.entries(SPEC)) {
    pose[obj] = {};
    for (const [prop, keys] of Object.entries(props)) {
      const at4 = keys.find(([p]) => p === 4) ?? keys[0];
      pose[obj][prop] = at4[1];
    }
  }
  return pose;
}

export function buildState() {
  return stateFrom({ sheet: SHEET, spec: SPEC, length: 8, revision: "chronos-theatre-state-1" });
}

/**
 * Theatre.js project state from a compact spec: { object: { prop: [[position, value, handles?], ...] } }.
 * Shared with scripts/theatre-multiverse.mjs.
 */
export function stateFrom({ sheet, spec, length, revision }) {
  const tracksByObject = {};
  for (const [obj, props] of Object.entries(spec)) {
    const trackData = {};
    const trackIdByPropPath = {};
    for (const [prop, keys] of Object.entries(props)) {
      const id = `${obj}_${prop}`;
      trackData[id] = {
        type: "BasicKeyframedTrack",
        __debugName: `${obj}:["${prop}"]`,
        keyframes: keys.map(([position, value, handles], i) => ({
          id: `${id}_${i}`,
          position,
          connectedRight: true,
          handles: handles ?? [0.5, 1, 0.5, 0],
          type: "bezier",
          value,
        })),
      };
      trackIdByPropPath[JSON.stringify([prop])] = id;
    }
    tracksByObject[obj] = { trackData, trackIdByPropPath };
  }
  return {
    sheetsById: {
      [sheet]: {
        staticOverrides: { byObject: {} },
        sequence: { subUnitsPerUnit: 30, length, type: "PositionalSequence", tracksByObject },
      },
    },
    definitionVersion: "0.4.0",
    revisionHistory: [revision],
  };
}

/** Every prop's value at `position` (the keyframe there, or the last one before it): default values for the objects. */
export function poseAt(spec, position) {
  const pose = {};
  for (const [obj, props] of Object.entries(spec)) {
    pose[obj] = {};
    for (const [prop, keys] of Object.entries(props)) {
      const before = keys.filter(([p]) => p <= position);
      pose[obj][prop] = (before.at(-1) ?? keys[0])[1];
    }
  }
  return pose;
}

const here = path.dirname(fileURLToPath(import.meta.url));
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const out = path.join(here, "..", "data", "theatre", "chamber.json");
  fs.writeFileSync(out, JSON.stringify(buildState(), null, 2) + "\n");
  fs.writeFileSync(path.join(here, "..", "data", "theatre", "resting-pose.json"), JSON.stringify(restingPose(), null, 2) + "\n");
  console.log("wrote", path.relative(process.cwd(), out));
}
