/*
 * Temporal artifact: the chamber's central object. A sphere displaced along
 * its normals by animated 3D noise, lit by one fixed direction and a fresnel
 * rim; latitude bands bend over the relief like print on a warped surface.
 *
 * - uDistortion scales the noise displacement; uPulse adds a fast ripple
 *   along the height and pushes the rim toward orange (the variance).
 * - uHue mixes the rim from sage to orange independently of the pulse, for
 *   the nexus branch state.
 * - Lighting is deliberately simple (half-Lambert + fresnel): stylised, cheap,
 *   and in the same sRGB space as the CSS palette, so the colours match the page.
 * The normals are the sphere's own: after displacement they are slightly
 * wrong, which reads as a soft, lacquered relief rather than a hard one.
 */

export const ARTIFACT_VERTEX = /* glsl */ `
uniform float uTime;
uniform float uDistortion;
uniform float uPulse;
uniform int uOctaves;
varying vec3 vNormal;
varying vec3 vWorld;
varying float vDisp;
varying float vHeight;

float hash31(vec3 p) {
  p = fract(p * 0.3183099 + vec3(0.1, 0.2, 0.3));
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

float vnoise3(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash31(i), hash31(i + vec3(1.0, 0.0, 0.0)), f.x), mix(hash31(i + vec3(0.0, 1.0, 0.0)), hash31(i + vec3(1.0, 1.0, 0.0)), f.x), f.y),
    mix(mix(hash31(i + vec3(0.0, 0.0, 1.0)), hash31(i + vec3(1.0, 0.0, 1.0)), f.x), mix(hash31(i + vec3(0.0, 1.0, 1.0)), hash31(i + vec3(1.0, 1.0, 1.0)), f.x), f.y),
    f.z
  );
}

float fbm3(vec3 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    if (i >= uOctaves) break;
    v += a * vnoise3(p);
    p = p * 2.02 + vec3(3.1, 1.7, 2.3);
    a *= 0.5;
  }
  return v;
}

void main() {
  float t = uTime * 0.18;
  float n = fbm3(normalize(position) * 2.4 + vec3(t, -t * 0.7, t * 0.4));
  float disp = (n - 0.5) * (0.35 + 0.9 * uDistortion)
    + 0.06 * sin(uTime * 0.6)
    + uPulse * 0.18 * sin(position.y * 18.0 + uTime * 6.0);
  vec3 displaced = position + normal * disp;
  vDisp = disp;
  vHeight = position.y;
  vNormal = normalize(normalMatrix * normal);
  vec4 world = modelMatrix * vec4(displaced, 1.0);
  vWorld = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}
`;

export const ARTIFACT_FRAGMENT = /* glsl */ `
uniform float uTime;
uniform float uPulse;
uniform float uHue;
uniform float uLight;
uniform vec3 uColorBase;
uniform vec3 uColorInk;
uniform vec3 uColorRim;
uniform vec3 uColorHot;
varying vec3 vNormal;
varying vec3 vWorld;
varying float vDisp;
varying float vHeight;

void main() {
  vec3 n = normalize(vNormal);
  vec3 viewDir = normalize(cameraPosition - vWorld);
  float fres = pow(1.0 - max(dot(n, viewDir), 0.0), 2.4);
  vec3 lightDir = normalize(vec3(0.6, 0.9, 0.5));
  float lambert = max(dot(n, lightDir), 0.0) * 0.6 + 0.4;

  float bands = smoothstep(0.42, 0.5, abs(fract(vHeight * 7.0 + vDisp * 3.0 + uTime * 0.05) - 0.5));
  vec3 col = mix(uColorBase, uColorInk, bands * 0.55);
  col *= lambert * uLight;

  vec3 rim = mix(uColorRim, uColorHot, clamp(uHue + uPulse * 0.6, 0.0, 1.0));
  col = mix(col, rim, fres * 0.9);
  col += uColorRim * smoothstep(0.15, 0.5, vDisp) * 0.25;
  gl_FragColor = vec4(col, 1.0);
}
`;

export const ARTIFACT_DEFAULTS = {
  uTime: 0,
  /** 0..1 noise displacement. */
  uDistortion: 0.32,
  /** 0..1 variance ripple and rim heat. */
  uPulse: 0,
  /** 0..1 rim colour, sage to orange. */
  uHue: 0,
  /** Light multiplier; the Theatre sequence raises it during a variance. */
  uLight: 1,
  uOctaves: 5,
} as const;
