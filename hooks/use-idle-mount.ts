"use client";

import { useEffect, useState } from "react";

/**
 * True once the browser has had a quiet moment after load, or after
 * `timeout` ms at the latest. Heavy optional work (a WebGL scene over a
 * plate that is already painted) waits for it, so it never competes with
 * the first paint and the entrance choreography.
 */
export function useIdleMount(timeout = 2000): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let cancelled = false;
    let idle: number | undefined;
    let timer: number | undefined;
    const go = () => {
      if (!cancelled) setReady(true);
    };
    const schedule = () => {
      if (typeof window.requestIdleCallback === "function") idle = window.requestIdleCallback(go, { timeout });
      else timer = window.setTimeout(go, Math.min(timeout, 800));
    };
    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });
    return () => {
      cancelled = true;
      window.removeEventListener("load", schedule);
      if (idle !== undefined && typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(idle);
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [timeout]);
  return ready;
}
