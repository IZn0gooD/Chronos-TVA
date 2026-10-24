"use client";

import { useSyncExternalStore } from "react";
import { useMotionPaused } from "@/lib/motion-store";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const media = window.matchMedia(QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

const getSnapshot = () => window.matchMedia(QUERY).matches;
// On the server, and during hydration, assume motion is allowed: the CSS
// media query already holds every animation still, so nothing moves before
// the real preference is known.
const getServerSnapshot = () => false;

/** True when the reader asked their system for reduced motion, or paused motion with the site's switch. */
export function useReducedMotion(): boolean {
  const system = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const paused = useMotionPaused();
  return system || paused;
}
