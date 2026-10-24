"use client";

import { useSyncExternalStore } from "react";

/**
 * The reader's own motion switch (WCAG 2.2.2): pauses the looping pieces
 * and the continuous CSS animations, and skips the entrance choreography.
 * Persisted per browser; applied before first paint by the inline script
 * in app/layout.tsx so nothing flashes.
 */
const KEY = "chronos:motion";
const listeners = new Set<() => void>();

export function readMotionPaused(): boolean {
  try {
    return localStorage.getItem(KEY) === "paused";
  } catch {
    return false;
  }
}

export function setMotionPaused(paused: boolean) {
  try {
    if (paused) localStorage.setItem(KEY, "paused");
    else localStorage.removeItem(KEY);
  } catch {
    /* storage unavailable: the switch still applies to this page */
  }
  document.documentElement.dataset.motion = paused ? "paused" : "auto";
  listeners.forEach((l) => l());
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

/** True when the reader paused motion on this site. False on the server. */
export function useMotionPaused(): boolean {
  return useSyncExternalStore(subscribe, readMotionPaused, () => false);
}
