"use client";

let started = false;

/**
 * Theatre.js Studio: the visual keyframe editor, development only. It opens
 * when the dev server runs with `?studio=1` in the URL. Export the project
 * from its UI ("CHRONOS" → Export) and save the JSON over
 * data/theatre/chamber.json, or edit scripts/theatre-state.mjs and regenerate.
 * The import sits behind a NODE_ENV check so production bundles never
 * contain it (its licence, AGPL-3.0, is the other reason). Idempotent: the
 * layout and the scene may both ask for it.
 */
export async function initStudio(): Promise<boolean> {
  if (process.env.NODE_ENV !== "development") return false;
  if (typeof window === "undefined" || !new URLSearchParams(window.location.search).has("studio")) return false;
  if (started) return true;
  started = true;
  const studio = (await import("@theatre/studio")).default;
  studio.initialize();
  return true;
}
