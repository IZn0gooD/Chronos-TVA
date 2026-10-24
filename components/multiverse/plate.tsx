import pose from "@/data/theatre/multiverse-pose.json";
import { cross, dot, normalize, sample, sub, type Vec3 } from "@/lib/multiverse/curves";
import { CINEMATIC_END, MultiverseSimulation, type Timeline } from "@/lib/multiverse/simulation";
import { MULTIVERSE_TINTS as T } from "./tints";

const W = 1600;
const H = 1000;

/** A pinhole projection matching the camera the cinematic ends on. */
function projector() {
  const eye: Vec3 = [pose.camera.x, pose.camera.y, pose.camera.z];
  const target: Vec3 = [pose.target.x, pose.target.y, pose.target.z];
  const f = normalize(sub(target, eye));
  const r = normalize(cross(f, [0, 1, 0]));
  const u = cross(r, f);
  const focal = H / 2 / Math.tan(((pose.camera.fov / 2) * Math.PI) / 180);
  return (p: Vec3): [number, number] | null => {
    const v = sub(p, eye);
    const z = dot(v, f);
    if (z < 0.5) return null;
    return [W / 2 + (dot(v, r) * focal) / z, H / 2 - (dot(v, u) * focal) / z];
  };
}

function pathOf(tl: Timeline, project: (p: Vec3) => [number, number] | null, steps: number): string {
  const parts: string[] = [];
  for (let k = 0; k <= steps; k++) {
    const q = project(sample(tl.points, k / steps));
    if (!q) continue;
    parts.push(`${parts.length ? "L" : "M"}${q[0].toFixed(1)} ${q[1].toFixed(1)}`);
  }
  return parts.join("");
}

/**
 * The network at the end of the cinematic, drawn in SVG on the server from
 * the same deterministic simulation (seed 1962): the first paint under the
 * canvas, and the whole picture without WebGL. Thinned to the first
 * generations so the HTML stays light.
 */
export function MultiversePlate() {
  const sim = new MultiverseSimulation({ seed: 1962, capacity: 2048 });
  sim.advance(CINEMATIC_END);
  const project = projector();
  const loom = project(sim.get(sim.rootId) ? sample(sim.get(sim.rootId)!.points, 0) : [0, 0, 0]);
  const groups: Record<"fabric" | "root" | "near" | "far" | "weave", string[]> = { fabric: [], root: [], near: [], far: [], weave: [] };
  for (const tl of sim.timelines.values()) {
    if (tl.kind === "fabric") groups.fabric.push(pathOf(tl, project, 12));
    else if (tl.kind === "root") groups.root.push(pathOf(tl, project, 24));
    else if (tl.kind === "weave") groups.weave.push(pathOf(tl, project, 12));
    else if (tl.depth <= 2) groups.near.push(pathOf(tl, project, 10));
    else if (tl.depth === 3 || (tl.depth === 4 && tl.rank < 0.4)) groups.far.push(pathOf(tl, project, 8));
  }
  const tips = [...sim.timelines.values()]
    .filter((tl) => tl.kind === "branch" && tl.depth <= 2)
    .map((tl) => project(sample(tl.points, 1)))
    .filter((p): p is [number, number] => p !== null);
  const stroke = (color: string, width: number, opacity: number) => ({ stroke: color, strokeWidth: width, strokeOpacity: opacity, fill: "none", strokeLinecap: "round" as const });
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="mv-void" cx="45%" cy="50%" r="75%">
          <stop offset="0%" stopColor={T.deep} stopOpacity="0.32" />
          <stop offset="100%" stopColor={T.night} stopOpacity="1" />
        </radialGradient>
        <filter id="mv-glow" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect width={W} height={H} fill={T.night} />
      <rect width={W} height={H} fill="url(#mv-void)" />
      <g filter="url(#mv-glow)">
        <path d={groups.fabric.join("")} {...stroke(T.copper, 1, 0.35)} />
        <path d={groups.far.join("")} {...stroke(T.amber, 0.7, 0.35)} />
        <path d={groups.near.join("")} {...stroke(T.gold, 1.2, 0.7)} />
        <path d={groups.weave.join("")} {...stroke(T.weave, 1.2, 0.8)} />
        <path d={groups.root.join("")} {...stroke(T.warm, 2.4, 0.95)} />
        {tips.map(([x, y], i) => (
          <circle key={i} cx={x.toFixed(1)} cy={y.toFixed(1)} r="2.2" fill={T.warm} fillOpacity="0.8" />
        ))}
        {loom && <circle cx={loom[0].toFixed(1)} cy={loom[1].toFixed(1)} r="7" fill={T.warm} />}
      </g>
    </svg>
  );
}
