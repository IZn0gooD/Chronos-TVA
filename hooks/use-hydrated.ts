"use client";

import { useSyncExternalStore } from "react";

const noop = () => () => {};

/**
 * False on the server and during hydration, true afterwards. Lets a
 * component render its static fallback first and swap in a live piece
 * without a state write inside an effect.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}
