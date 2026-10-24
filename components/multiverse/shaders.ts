/*
 * GLSL for the multiverse lab. Written for three.js ShaderMaterial on
 * WebGL 2 (three compiles ShaderMaterial as GLSL ES 3.00 and maps
 * `attribute`/`varying`/`gl_FragColor` for us), which is what allows
 * texelFetch on the state texture.
 *
 * The state texture holds four RGBA float texels per timeline slot:
 *   row 0  birthTime, growth (s), length (world units), depth
 *   row 1  energy, stability, seed (0..1), kind (0 fabric, 1 branch, 2 weave, 3 sacred line)
 *   row 2  pulse A start, pulse A energy, pulse B start, pulse B energy
 *   row 3  collapseAt (1e9 = never), rank (density LOD), hue (-1..1), highlight (0/1)
 * Everything that changes over time (growth, pulses, collapse) is computed
 * here from uSimTime, so the CPU only writes when an event happens.
 */

export const SEGMENT_COUNT = 48;

const STATE = /* glsl */ `
uniform sampler2D uState;
vec4 stateRow(float slot, int row) {
  return texelFetch(uState, ivec2(int(slot + 0.5), row), 0);
}
`;

/**
 * Filaments: one camera-facing ribbon per timeline, four vertices per
 * segment. Width is in screen pixels (a hairline far away, a few pixels
 * near), so the network stays crisp at any distance; the fragment shader
 * draws a sharp core and a soft halo across the ribbon, which bloom then
 * extends. A segment the timeline has not grown into yet collapses to a
 * point outside the clip volume; the segment holding the growing head is
 * cut exactly in the fragment shader.
 */
export const FILAMENT_VERTEX = /* glsl */ `
#define SEGMENTS ${SEGMENT_COUNT.toFixed(1)}
attribute vec3 aTangent;
attribute float aCode;
attribute float aSlot;
${STATE}
uniform float uSimTime;
uniform float uTime;
uniform vec2 uResolution;
uniform float uPixelRatio;
uniform float uDensity;
uniform float uInstability;
uniform float uWidth;
varying float vAlong;
varying float vSide;
varying float vProgress;
varying float vLength;
varying float vKind;
varying float vEye;
varying float vDepth;
varying vec4 vB;
varying vec4 vC;
varying vec4 vD;

void main() {
  vec4 a = stateRow(aSlot, 0);
  vec4 b = stateRow(aSlot, 1);
  vec4 c = stateRow(aSlot, 2);
  vec4 d = stateRow(aSlot, 3);
  float seg = floor(aCode / 4.0 + 0.01);
  float corner = aCode - seg * 4.0;
  float along = (seg + (corner > 1.5 ? 1.0 : 0.0)) / SEGMENTS;
  float side = mod(corner, 2.0) < 0.5 ? -1.0 : 1.0;
  float progress = clamp((uSimTime - a.x) / max(a.y, 1e-3), 0.0, 1.0);
  float phase = uSimTime - d.x;
  if (progress <= 0.0 || seg / SEGMENTS > progress || d.y > uDensity || phase > 3.1) {
    gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
    return;
  }

  // Instability: the whole network trembles a little with uInstability (the
  // unstable timelines most); a collapsing one shakes hard before it goes.
  float unstable = phase > 0.0 ? clamp(phase / 1.2, 0.0, 1.0) : 0.0;
  float jitter = uInstability * (1.0 - b.y) * 0.7 + unstable * 0.9;
  vec3 pos = position;
  if (jitter > 0.0) {
    vec3 n1 = normalize(cross(aTangent, vec3(0.0, 1.0, 0.0)) + vec3(1e-4, 0.0, 0.0));
    vec3 n2 = cross(aTangent, n1);
    float w = along * a.z;
    float k1 = sin(w * 2.1 + uTime * 9.0 + b.z * 40.0) * 0.6 + sin(w * 5.3 - uTime * 13.0) * 0.4;
    float k2 = sin(w * 1.7 - uTime * 7.0 + b.z * 13.0);
    pos += (n1 * k1 + n2 * k2) * jitter * 0.35;
  }

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  vec4 clip = projectionMatrix * mv;
  vec4 ahead = projectionMatrix * modelViewMatrix * vec4(pos + aTangent * 0.25, 1.0);
  vec2 dir = (ahead.xy / ahead.w - clip.xy / clip.w) * uResolution;
  float dl = length(dir);
  dir = dl > 1e-5 ? dir / dl : vec2(1.0, 0.0);
  vec2 normal = vec2(-dir.y, dir.x);

  float kind = b.w;
  float basePx = kind > 2.5 ? 5.5 : kind < 0.5 ? 2.6 : kind > 1.5 ? 3.4 : mix(4.0, 1.7, clamp((a.w - 1.0) / 5.0, 0.0, 1.0));
  float nearness = clamp(30.0 / max(-mv.z, 0.1), 0.55, 1.8);
  float halfWidth = basePx * nearness * uPixelRatio * uWidth * (0.75 + 0.45 * b.x) * (1.0 + unstable * 0.9) * (1.0 + d.w * 0.6);
  clip.xy += normal * side * halfWidth * 2.0 / uResolution * clip.w;
  gl_Position = clip;

  vAlong = along;
  vSide = side;
  vProgress = progress;
  vLength = a.z;
  vKind = kind;
  vEye = -mv.z;
  vDepth = a.w;
  vB = b;
  vC = c;
  vD = d;
}
`;

export const FILAMENT_FRAGMENT = /* glsl */ `
uniform float uSimTime;
uniform float uTime;
uniform float uEnergy;
uniform float uFabric;
uniform float uDim;
uniform float uPulseSpeed;
uniform float uFogNear;
uniform float uFogFar;
uniform vec3 uAmber;
uniform vec3 uGold;
uniform vec3 uCopper;
uniform vec3 uWarm;
uniform vec3 uWeave;
uniform vec3 uEmber;
varying float vAlong;
varying float vSide;
varying float vProgress;
varying float vLength;
varying float vKind;
varying float vEye;
varying float vDepth;
varying vec4 vB;
varying vec4 vC;
varying vec4 vD;

float hash11(float n) { return fract(sin(n) * 43758.5453123); }

void main() {
  if (vAlong > vProgress) discard;
  float x = vSide;
  // Across the ribbon: a sharp core (the thread) and a soft envelope (its light).
  float core = exp(-x * x * 40.0);
  float halo = exp(-x * x * 3.2);
  float energy = vB.x;
  float seed = vB.z;
  float world = vAlong * vLength;

  vec3 base;
  if (vKind > 2.5) base = mix(uGold, uWarm, 0.35);
  else if (vKind < 0.5) base = uCopper;
  else if (vKind > 1.5) base = uWeave;
  else base = mix(uAmber, uGold, clamp(0.5 + vD.z * 0.5, 0.0, 1.0) * 0.7 + energy * 0.3);
  // Hierarchy: the sacred line and the first generations carry the light; deep generations are finer and dimmer,
  // so a thousand of them read as texture instead of adding up to a white blur.
  float generation = vKind > 0.5 && vKind < 1.5 ? mix(1.0, 0.42, clamp((vDepth - 1.0) / 5.0, 0.0, 1.0)) : 1.0;
  float lum = energy * uEnergy * generation * (vKind < 0.5 ? uFabric * 0.8 : 1.0);
  float haloWeight = vKind > 2.5 ? 0.26 : mix(0.16, 0.07, clamp((vDepth - 1.0) / 5.0, 0.0, 1.0));
  float flicker = 0.86 + 0.14 * sin(uTime * 2.3 + seed * 61.0 + world * 0.9);

  // The growing head glows as it advances.
  float behind = (vProgress - vAlong) * vLength;
  float head = vProgress < 0.999 ? exp(-behind * behind * 0.9) : 0.0;

  // Two pulses: a sharp front, a long fading wake behind it.
  float d1 = world - (uSimTime - vC.x) * uPulseSpeed;
  float d2 = world - (uSimTime - vC.z) * uPulseSpeed;
  float pulse = vC.y * (d1 > 0.0 ? exp(-d1 * d1 * 0.6) : exp(-d1 * d1 * 0.035))
              + vC.w * (d2 > 0.0 ? exp(-d2 * d2 * 0.6) : exp(-d2 * d2 * 0.035));

  // Collapse: unstable and ember-hot for 1.2 s, then the thread breaks into fragments that go out.
  float phase = uSimTime - vD.x;
  float unstable = phase > 0.0 ? smoothstep(0.0, 1.2, phase) : 0.0;
  float dissolve = phase > 0.0 ? smoothstep(1.2, 2.9, phase) : 0.0;
  if (dissolve > 0.0 && hash11(floor(world * 2.5) + seed * 97.0) < dissolve) discard;

  vec3 col = base * (core * 1.5 + halo * haloWeight) * lum * flicker;
  col += uWarm * core * (pulse * 2.6 + head * 3.0);
  col += base * halo * (pulse * 0.6 + head * 0.8);
  col = mix(col, uEmber * (core * 2.6 + halo * 0.6) * max(lum, 0.6), unstable * 0.85);
  col *= 1.0 - dissolve * 0.6;
  col *= mix(uDim, 1.6, vD.w);
  col *= mix(0.12, 1.0, 1.0 - smoothstep(uFogNear, uFogFar, vEye));
  gl_FragColor = vec4(col, 1.0);
}
`;

/** Flow and debris particles: positions come from the CPU (they ride the curves), the look from here. */
export const PARTICLE_VERTEX = /* glsl */ `
attribute float aBright;
attribute float aTint;
attribute float aSize;
uniform float uPixelRatio;
uniform float uScale;
varying float vBright;
varying float vTint;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = aBright > 0.001 ? clamp(aSize * uScale * uPixelRatio / max(-mv.z, 0.5), 1.0, 26.0) : 0.0;
  vBright = aBright;
  vTint = aTint;
}
`;

export const PARTICLE_FRAGMENT = /* glsl */ `
uniform vec3 uGold;
uniform vec3 uWarm;
uniform vec3 uWeave;
uniform vec3 uEmber;
varying float vBright;
varying float vTint;
void main() {
  vec2 p = gl_PointCoord * 2.0 - 1.0;
  float r2 = dot(p, p);
  if (r2 > 1.0) discard;
  float a = exp(-r2 * 4.5);
  // Tint: 0 warm gold (flow), 0.5 weave teal, 1 ember (debris of a collapse).
  vec3 col = vTint < 0.5 ? mix(mix(uWarm, uGold, 0.5), uWeave, vTint * 2.0) : mix(uWeave, uEmber, vTint * 2.0 - 1.0);
  gl_FragColor = vec4(col * a * vBright * 1.7, 1.0);
}
`;

/**
 * Pocket universes: a node at the tip of some grown branches (every one
 * down to depth 2, two in five deeper). Core, ring, halo and a two-armed
 * swirl suggest a whole universe without simulating one.
 */
export const NODE_VERTEX = /* glsl */ `
attribute float aSlot;
${STATE}
uniform float uSimTime;
uniform float uPixelRatio;
uniform float uDensity;
uniform float uNodeScale;
varying float vSeed;
varying float vGlow;
varying float vUnstable;
varying float vHighlight;
void main() {
  vec4 a = stateRow(aSlot, 0);
  vec4 b = stateRow(aSlot, 1);
  vec4 d = stateRow(aSlot, 3);
  float done = uSimTime - (a.x + a.y);
  float pick = fract(b.z * 7.31);
  float phase = uSimTime - d.x;
  bool show = b.w > 0.5 && b.w < 1.5 && a.w >= 1.0 && done > 0.0 && d.y <= uDensity && (pick < 0.4 || a.w <= 2.0) && phase < 2.9;
  if (!show) {
    gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
    gl_PointSize = 0.0;
    return;
  }
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  float pop = smoothstep(0.0, 0.6, done) * (1.0 + 0.35 * exp(-done * 4.0) * sin(done * 14.0));
  float base = max(18.0 - a.w * 1.8, 7.0) * (0.6 + b.x * 0.6);
  float nearness = clamp(40.0 / max(-mv.z, 0.1), 0.35, 3.0);
  gl_PointSize = clamp(base * pop * nearness * uNodeScale * uPixelRatio * (1.0 + d.w * 0.8), 0.0, 120.0);
  vSeed = b.z;
  vGlow = b.x;
  vUnstable = phase > 0.0 ? clamp(phase / 1.2, 0.0, 1.0) : 0.0;
  vHighlight = d.w;
}
`;

export const NODE_FRAGMENT = /* glsl */ `
uniform float uTime;
uniform float uDim;
uniform vec3 uGold;
uniform vec3 uWarm;
uniform vec3 uWeave;
uniform vec3 uEmber;
varying float vSeed;
varying float vGlow;
varying float vUnstable;
varying float vHighlight;
void main() {
  vec2 p = gl_PointCoord * 2.0 - 1.0;
  float r = length(p);
  if (r > 1.0) discard;
  float core = exp(-r * r * 70.0);
  float ring = exp(-pow((r - 0.42) * 16.0, 2.0)) * 0.45;
  float halo = exp(-r * r * 5.0) * 0.22;
  float arms = (0.5 + 0.5 * sin(atan(p.y, p.x) * 2.0 + r * 12.0 - uTime * 0.6 + vSeed * 6.2831)) * exp(-r * r * 14.0) * 0.35;
  vec3 tint = fract(vSeed * 13.7) > 0.8 ? uWeave : uGold;
  vec3 col = uWarm * core * 2.5 + tint * (ring + halo + arms);
  col = mix(col, uEmber * (core * 2.0 + halo), vUnstable);
  col *= mix(uDim, 1.6, vHighlight);
  gl_FragColor = vec4(col * (0.5 + vGlow * 0.7), 1.0);
}
`;

/** The loom: a billboard at the origin of the sacred line, rings turning slowly, throbbing with each pulse it sends. */
export const LOOM_VERTEX = /* glsl */ `
uniform float uSize;
varying vec2 vUv;
void main() {
  vUv = uv * 2.0 - 1.0;
  vec4 mv = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
  mv.xy += position.xy * uSize;
  gl_Position = projectionMatrix * mv;
}
`;

export const LOOM_FRAGMENT = /* glsl */ `
uniform float uTime;
uniform float uBeat;
uniform float uEnergy;
uniform vec3 uGold;
uniform vec3 uWarm;
uniform vec3 uCopper;
varying vec2 vUv;
void main() {
  float r = length(vUv);
  if (r > 1.0) discard;
  float a = atan(vUv.y, vUv.x);
  float core = exp(-r * r * 90.0) * (1.6 + uBeat * 2.0);
  float glow = exp(-r * r * 9.0) * (0.35 + uBeat * 0.3);
  float rings = 0.0;
  for (int i = 0; i < 3; i++) {
    float fi = float(i);
    float radius = 0.22 + fi * 0.17;
    float dash = step(0.35, fract(a / 6.2831 * (6.0 + fi * 4.0) + uTime * (0.05 - fi * 0.03)));
    rings += exp(-pow((r - radius) * 90.0, 2.0)) * dash * (0.45 - fi * 0.12);
  }
  vec3 col = uWarm * core + uGold * glow + uCopper * rings;
  gl_FragColor = vec4(col * uEnergy * (1.0 - smoothstep(0.85, 1.0, r)), 1.0);
}
`;

/** Deep space: a sphere at the far plane, a slow fbm nebula in the deep green, a warm haze towards the loom. */
export const SKY_VERTEX = /* glsl */ `
varying vec3 vDir;
void main() {
  vDir = normalize(position);
  vec4 clip = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  gl_Position = clip.xyww;
}
`;

export const SKY_FRAGMENT = /* glsl */ `
uniform float uTime;
uniform vec3 uNight;
uniform vec3 uDeep;
uniform vec3 uHaze;
uniform vec3 uLoomDir;
varying vec3 vDir;

float hash31(vec3 p) {
  p = fract(p * 0.3183099 + vec3(0.1, 0.2, 0.3));
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}
float noise3(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash31(i), hash31(i + vec3(1, 0, 0)), f.x), mix(hash31(i + vec3(0, 1, 0)), hash31(i + vec3(1, 1, 0)), f.x), f.y),
    mix(mix(hash31(i + vec3(0, 0, 1)), hash31(i + vec3(1, 0, 1)), f.x), mix(hash31(i + vec3(0, 1, 1)), hash31(i + vec3(1, 1, 1)), f.x), f.y),
    f.z);
}
float fbm(vec3 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise3(p);
    p = p * 2.03 + vec3(1.7, 9.2, 3.1);
    a *= 0.5;
  }
  return v;
}
void main() {
  vec3 d = normalize(vDir);
  float n = fbm(d * 2.6 + vec3(uTime * 0.004, 0.0, uTime * 0.002));
  float wisps = smoothstep(0.45, 0.9, fbm(d * 5.5 - vec3(0.0, uTime * 0.003, 0.0)));
  vec3 col = mix(uNight, uDeep * 0.55, smoothstep(0.3, 0.85, n));
  col += uDeep * wisps * 0.22;
  col += uHaze * pow(max(dot(d, uLoomDir), 0.0), 7.0) * 0.12;
  gl_FragColor = vec4(col, 1.0);
}
`;

/** Dust: tiny, dim, slowly drifting specks that give the void its depth. */
export const DUST_VERTEX = /* glsl */ `
attribute float aPhase;
uniform float uTime;
uniform float uPixelRatio;
varying float vAlpha;
void main() {
  vec3 p = position + vec3(sin(uTime * 0.05 + aPhase) * 1.5, cos(uTime * 0.04 + aPhase * 1.3) * 1.2, sin(uTime * 0.03 + aPhase * 0.7) * 1.5);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = clamp(90.0 * uPixelRatio / max(-mv.z, 1.0), 0.8, 3.0);
  vAlpha = 0.35 + 0.35 * sin(uTime * 0.7 + aPhase * 3.0);
}
`;

export const DUST_FRAGMENT = /* glsl */ `
uniform vec3 uColor;
varying float vAlpha;
void main() {
  vec2 p = gl_PointCoord * 2.0 - 1.0;
  float a = exp(-dot(p, p) * 3.0);
  gl_FragColor = vec4(uColor * a * vAlpha * 0.5, 1.0);
}
`;
