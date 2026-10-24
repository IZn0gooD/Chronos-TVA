"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Development only. With `?studio=1`, binds the Theatre.js project of the
 * current route (the chamber on the terminal, the cinematic on the
 * multiverse lab) and opens Studio from the layout, so the sequences can be
 * edited even on a machine whose browser cannot draw the WebGL scene.
 * Renders nothing; in production the branch is dead code and the imports
 * never ship.
 */
export function StudioLoader() {
  const pathname = usePathname();
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    if (!new URLSearchParams(window.location.search).has("studio")) return;
    void (async () => {
      if (pathname.startsWith("/multiverse")) {
        const { getMultiverseTheatre } = await import("@/components/multiverse/theatre");
        getMultiverseTheatre();
      } else {
        const { getChamber } = await import("./project");
        getChamber();
      }
      const { initStudio } = await import("./studio");
      await initStudio();
    })();
  }, [pathname]);
  return null;
}
