/**
 * Timeline curves, as plain numbers (no three.js): every timeline is a
 * cubic Bézier from its departure point to its end, plus an undulation
 *
 *   C(t) = Bézier(P0, P0 + h0·D0, P1 − h1·D1, P1)(t) + sin(πt) · A · w(t)
 *
 * where D0 is the direction it inherits from its parent (so it leaves the
 * parent smoothly), D1 the direction it settles into, A the undulation
 * amplitude, and w(t) either one axis times sin(ωt + φ) or, for a braided
 * thread, a helix cos(ωt + φ)·a1 + sin(ωt + φ)·a2. The sin(πt) envelope is
 * zero at both ends: a branch is attached exactly where it leaves.
 *
 * Each curve is sampled once, at birth, into POINTS positions and unit
 * tangents; the GPU buffers and the particles read those samples.
 */

export const SEGMENTS = 48;
export const POINTS = SEGMENTS + 1;

export type Vec3 = [number, number, number];

export interface CurveSpec {
  start: Vec3;
  /** Unit direction at the start (inherited from the parent). */
  startDir: Vec3;
  end: Vec3;
  /** Unit direction at the end. */
  endDir: Vec3;
  /** Handle lengths as fractions of the start–end distance. */
  startHandle?: number;
  endHandle?: number;
  /** Undulation amplitude (world units), angular frequency over t ∈ [0, 1], phase. */
  wobble: number;
  frequency: number;
  phase: number;
  /** Undulation axis; with `axis2`, the undulation is a helix around the curve. */
  axis: Vec3;
  axis2?: Vec3;
}

export const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const scale = (a: Vec3, s: number): Vec3 => [a[0] * s, a[1] * s, a[2] * s];
export const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross = (a: Vec3, b: Vec3): Vec3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const length = (a: Vec3) => Math.hypot(a[0], a[1], a[2]);
export function normalize(a: Vec3): Vec3 {
  const l = length(a);
  return l > 1e-9 ? [a[0] / l, a[1] / l, a[2] / l] : [1, 0, 0];
}

/** A unit vector perpendicular to `v`, rotated by `angle` around it. */
export function perpendicular(v: Vec3, angle: number): Vec3 {
  const n = normalize(v);
  const helper: Vec3 = Math.abs(n[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
  const u = normalize(cross(n, helper));
  const w = cross(n, u);
  return normalize(add(scale(u, Math.cos(angle)), scale(w, Math.sin(angle))));
}

/**
 * Samples a curve into `points` and `tangents` (POINTS × 3 floats each) and
 * returns its arc length. Pure: the same spec always gives the same floats.
 */
export function buildCurve(spec: CurveSpec, points: Float32Array, tangents: Float32Array): number {
  const { start, end, startDir, endDir, wobble, frequency, phase, axis, axis2 } = spec;
  const span = length(sub(end, start));
  const b1 = add(start, scale(startDir, span * (spec.startHandle ?? 0.33)));
  const b2 = sub(end, scale(endDir, span * (spec.endHandle ?? 0.33)));
  for (let i = 0; i < POINTS; i++) {
    const t = i / SEGMENTS;
    const mt = 1 - t;
    const c0 = mt * mt * mt;
    const c1 = 3 * mt * mt * t;
    const c2 = 3 * mt * t * t;
    const c3 = t * t * t;
    const env = Math.sin(Math.PI * t) * wobble;
    const a = frequency * t + phase;
    const k1 = axis2 ? Math.cos(a) * env : Math.sin(a) * env;
    const k2 = axis2 ? Math.sin(a) * env : 0;
    for (let j = 0; j < 3; j++) {
      points[i * 3 + j] =
        c0 * start[j] + c1 * b1[j] + c2 * b2[j] + c3 * end[j] + axis[j] * k1 + (axis2 ? axis2[j] * k2 : 0);
    }
  }
  let total = 0;
  for (let i = 0; i < POINTS; i++) {
    const a = Math.max(0, i - 1);
    const b = Math.min(SEGMENTS, i + 1);
    const dx = points[b * 3] - points[a * 3];
    const dy = points[b * 3 + 1] - points[a * 3 + 1];
    const dz = points[b * 3 + 2] - points[a * 3 + 2];
    const l = Math.hypot(dx, dy, dz) || 1;
    tangents[i * 3] = dx / l;
    tangents[i * 3 + 1] = dy / l;
    tangents[i * 3 + 2] = dz / l;
    if (i > 0) {
      total += Math.hypot(
        points[i * 3] - points[(i - 1) * 3],
        points[i * 3 + 1] - points[(i - 1) * 3 + 1],
        points[i * 3 + 2] - points[(i - 1) * 3 + 2],
      );
    }
  }
  return total;
}

/** The point at u ∈ [0, 1] along sampled points (linear between samples), written into `out` at `offset`. */
export function sampleInto(points: Float32Array, u: number, out: Float32Array | number[], offset = 0): void {
  const x = Math.min(Math.max(u, 0), 1) * SEGMENTS;
  const i = Math.min(Math.floor(x), SEGMENTS - 1);
  const f = x - i;
  for (let j = 0; j < 3; j++) out[offset + j] = points[i * 3 + j] * (1 - f) + points[(i + 1) * 3 + j] * f;
}

export function sample(points: Float32Array, u: number): Vec3 {
  const out: Vec3 = [0, 0, 0];
  sampleInto(points, u, out);
  return out;
}
