import type { Branch } from "@/types/content";

/** The diagram's coordinate space. Width/height is also its aspect ratio. */
export const VIEW = { width: 1000, height: 420, left: 40, right: 960, baseline: 210 } as const;

export interface BranchPath {
  id: string;
  /** SVG path data for the branch curve, from the sacred line to its end. */
  d: string;
  /** Where the branch leaves the baseline. */
  from: { x: number; y: number };
  /** Where it ends: the selectable marker. */
  to: { x: number; y: number };
}

/**
 * Lays a branch out: it leaves the baseline at `origin`, runs forward and
 * drifts up or down into a cubic curve. The sacred timeline (drift 0) has
 * no path of its own; its marker sits at the right end of the baseline.
 */
export function branchPath(branch: Branch): BranchPath {
  const span = VIEW.right - VIEW.left;
  if (branch.state === "sacred") {
    const x = VIEW.right;
    return { id: branch.id, d: "", from: { x, y: VIEW.baseline }, to: { x, y: VIEW.baseline } };
  }
  const x0 = VIEW.left + branch.origin * span;
  const y0 = VIEW.baseline;
  const length = 150 + Math.abs(branch.drift) * 1.2;
  const x1 = Math.min(VIEW.right - 20, x0 + length);
  const y1 = y0 + branch.drift * 3.4;
  const d = `M ${x0} ${y0} C ${x0 + length * 0.45} ${y0}, ${x0 + length * 0.4} ${y1}, ${x1} ${y1}`;
  return { id: branch.id, d, from: { x: x0, y: y0 }, to: { x: x1, y: y1 } };
}

/** Percent position of a point in the diagram, for HTML overlays. */
export function percent(point: { x: number; y: number }): { left: string; top: string } {
  return { left: `${(point.x / VIEW.width) * 100}%`, top: `${(point.y / VIEW.height) * 100}%` };
}
