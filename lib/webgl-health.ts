import type { WebGLRenderer } from "three";

export type RendererFault = "shader" | "context-lost";

/**
 * Watches a renderer for the two faults a page can survive gracefully: a
 * shader that fails to compile (three.js logs it and draws nothing) and a
 * lost context (the GPU was taken away). Returns the cleanup. Kept out of
 * the components so React's immutability lint sees no hook value mutated.
 */
export function watchRenderer(gl: WebGLRenderer, report: (fault: RendererFault) => void): () => void {
  const canvas = gl.domElement;
  const lost = (event: Event) => {
    event.preventDefault();
    report("context-lost");
  };
  canvas.addEventListener("webglcontextlost", lost);
  gl.debug.onShaderError = () => report("shader");
  return () => {
    canvas.removeEventListener("webglcontextlost", lost);
    gl.debug.onShaderError = null;
  };
}
