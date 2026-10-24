import { setConsoleFunction } from "three";

/**
 * React Three Fiber 9.8 still creates a THREE.Clock in every canvas store,
 * which three r183+ reports as deprecated on each mount. The warning is
 * about R3F's internals, not this code, and repeats on every scene, so it
 * is the one message filtered out here; everything else from three.js goes
 * to the console unchanged. Remove this when R3F switches to THREE.Timer.
 */
let installed = false;

export function quietKnownThreeWarnings(): void {
  if (installed) return;
  installed = true;
  setConsoleFunction((type, message, ...params) => {
    if (type === "warn" && message.startsWith("THREE.Clock: This module has been deprecated")) return;
    console[type](message, ...params);
  });
}
