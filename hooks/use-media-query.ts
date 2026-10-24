"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Subscribes to a media query. Returns `fallback` on the server and during
 * hydration so the first client render matches the HTML.
 */
export function useMediaQuery(query: string, fallback = false): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const media = window.matchMedia(query);
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => fallback,
  );
}
