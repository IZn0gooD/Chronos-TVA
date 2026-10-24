/**
 * The motion grammar for the JavaScript engines, mirroring styles/tokens.css.
 * CSS transitions read the custom properties; GSAP, Motion and the render
 * loops read these. One vocabulary, named by intent.
 */
export const duration = {
  instant: 0.09,
  fast: 0.16,
  base: 0.26,
  slow: 0.52,
  narrative: 1.1,
} as const;

/** Cubic-bezier control points; GSAP takes them through CustomEase-free strings, Motion as arrays. */
export const ease = {
  swift: [0.22, 1, 0.36, 1],
  settle: [0.65, 0, 0.35, 1],
  draw: [0.3, 0, 0.2, 1],
} as const satisfies Record<string, readonly [number, number, number, number]>;

/** Springs after Apple's damping/response model: critically damped by default, bounce only after momentum. */
export const spring = {
  settle: { type: "spring", bounce: 0, duration: 0.4 },
  lift: { type: "spring", bounce: 0, duration: 0.3 },
  thrown: { type: "spring", bounce: 0.2, duration: 0.45 },
} as const;
