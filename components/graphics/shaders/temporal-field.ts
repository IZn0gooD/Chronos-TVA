/*
 * Temporal field: the anomaly shader. A fullscreen fragment program drawn on
 * a 2×2 plane in clip space (no camera), so it fits any canvas.
 *
 * Construction, in order:
 * 1. Aspect-correct coordinates centred on the canvas, nudged toward the pointer.
 * 2. Domain warp: two fbm samples displace the radius, so the rings breathe
 *    organically instead of staying perfect circles (uDistortion scales it).
 * 3. Interference: two ring systems at nearby frequencies multiply, which
 *    produces the beating, moiré-like pattern (uScroll raises the frequency
 *    and zooms, so scrolling tightens the field); a hard shoulder turns the
 *    product into printed bands, its crests into thin bright lines.
 * 4. Radial falloff keeps the field circular; uCollapse pulls it into the core.
 * 5. Spokes: thin angular lines broken by the warp, the "branching" lines.
 * 6. Palette: ground → deep green → sage by field value; orange only where
 *    the field peaks, scaled by intensity and by the temporal event; a paper
 *    core at the energy source; a small chromatic fringe from offset samples.
 *
 * Every parameter is a uniform, so tuning never recompiles the program. The
 * fbm loop has a constant bound (GLSL ES 1.0) and breaks at uOctaves.
 */

export const TEMPORAL_FIELD_VERTEX = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

export const TEMPORAL_FIELD_FRAGMENT = /* glsl */ `
uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uPointer;
uniform float uScroll;
uniform float uIntensity;
uniform float uDistortion;
uniform float uSpeed;
uniform float uEvent;
uniform float uCollapse;
uniform int uOctaves;
uniform vec3 uColorBg;
uniform vec3 uColorDeep;
uniform vec3 uColorMid;
uniform vec3 uColorHot;
uniform vec3 uColorCore;
varying vec2 vUv;

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash21(i), hash21(i + vec2(1.0, 0.0)), u.x),
    mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
  for (int i = 0; i < 5; i++) {
    if (i >= uOctaves) break;
    v += a * vnoise(p);
    p = rot * p * 2.03 + 11.7;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 p = (vUv - 0.5) * vec2(uResolution.x / uResolution.y, 1.0);
  float t = uTime * uSpeed;

  // The reader bends the field a little; nobody drags it.
  vec2 q = p - uPointer * 0.08;
  float r = length(q);
  float ang = atan(q.y, q.x);

  float zoom = 1.0 + uScroll * 0.6;
  vec2 w = vec2(fbm(q * 2.2 * zoom + t * 0.08), fbm(q * 2.2 * zoom - t * 0.06 + 5.2));
  float rr = r + (w.x - 0.5) * 0.35 * uDistortion;

  float k = 26.0 + 10.0 * uScroll;
  float rings = sin(rr * k - t * 1.4) * sin(rr * (k * 0.83) + t * 0.9 + (w.y - 0.5) * 3.0);
  rings = rings * 0.5 + 0.5;
  // Bands with a hard shoulder read as printed rings; the crests become thin bright lines.
  float bands = smoothstep(0.45, 0.9, rings);
  float crests = smoothstep(0.84, 0.97, rings);

  float radius = mix(0.78, 0.22, uCollapse);
  float fall = smoothstep(radius, radius * 0.25, rr);
  float field = bands * fall;

  float spoke = abs(fract((ang / 6.2831853) * 5.0 + w.x * 0.9) - 0.5);
  float lines = (1.0 - smoothstep(0.0, 0.035, spoke)) * smoothstep(0.08, 0.3, rr) * fall;

  float core = exp(-rr * rr * 120.0) * (0.75 + 0.5 * uEvent);

  float shift = 0.004 + 0.012 * uEvent;
  float ringsR = sin((rr + shift) * k - t * 1.4) * 0.5 + 0.5;
  float ringsB = sin((rr - shift) * k - t * 1.4) * 0.5 + 0.5;

  float v = field * uIntensity;
  vec3 col = mix(uColorBg, uColorDeep, smoothstep(0.0, 0.5, v));
  col = mix(col, uColorMid, smoothstep(0.3, 0.85, v) * 0.9);
  col += uColorMid * crests * fall * 0.35 * uIntensity;
  float hot = smoothstep(0.7, 1.0, field) * fall * (0.2 + 0.8 * uEvent) * uIntensity;
  col = mix(col, uColorHot, hot);
  col += uColorMid * lines * 0.35 * uIntensity;
  col = mix(col, uColorCore, core);
  col.r += (ringsR - rings) * 0.08 * fall * uIntensity;
  col.b += (ringsB - rings) * 0.06 * fall * uIntensity;

  float vig = smoothstep(1.15, 0.35, length(p));
  col = mix(uColorBg, col, vig);
  gl_FragColor = vec4(col, 1.0);
}
`;

/** Documented uniforms with their defaults; ShaderCanvas builds the live uniform objects from this list. */
export const TEMPORAL_FIELD_DEFAULTS = {
  /** Seconds since mount, times uSpeed. */
  uTime: 0,
  /** Canvas size in device pixels, for the aspect ratio. */
  uResolution: [1, 1] as [number, number],
  /** Pointer in -1..1 from the canvas centre. */
  uPointer: [0, 0] as [number, number],
  /** 0..1, tightens and zooms the rings. */
  uScroll: 0,
  /** 0..1, how much of the palette the field reaches. */
  uIntensity: 0.65,
  /** 0..1, strength of the organic displacement. */
  uDistortion: 0.55,
  /** Time multiplier. */
  uSpeed: 1,
  /** 0..1, the temporal event envelope: brighter core, orange peaks, wider fringe. */
  uEvent: 0,
  /** 0..1, pulls the field into its core. */
  uCollapse: 0,
  /** 1..5 noise octaves, from the quality preset. */
  uOctaves: 5,
} as const;
