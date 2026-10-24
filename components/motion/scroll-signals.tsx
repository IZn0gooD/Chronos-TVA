"use client";

import { useEffect } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { gsap, useGSAP } from "@/lib/gsap";
import { frame } from "@/lib/signals";

/**
 * Feeds the high-frequency signals the graphics read in their render loops,
 * without touching React state:
 * - `frame.page`, the document's scroll progress, also drawn as the header's
 *   one-pixel progress rule (#scroll-progress) through a quickSetter;
 * - `frame.hero`, how far the hero has left the viewport (the chamber's
 *   camera dollies out with it, the field tightens);
 * - `frame.pointer`, the pointer in -1..1 from the viewport centre, on
 *   devices with a fine pointer only. Touch leaves it at the centre.
 */
export function ScrollSignals() {
  useGSAP(() => {
    const bar = document.getElementById("scroll-progress");
    const setScale = bar ? gsap.quickSetter(bar, "scaleX") : null;
    const page = ScrollTrigger.create({
      start: 0,
      end: () => ScrollTrigger.maxScroll(window),
      onUpdate: (self) => {
        frame.page = self.progress;
        setScale?.(self.progress);
      },
    });
    const hero = document.getElementById("sacred-timeline");
    const heroTrigger = hero
      ? ScrollTrigger.create({
          trigger: hero,
          start: "top top",
          end: "bottom top",
          onUpdate: (self) => {
            frame.hero = self.progress;
          },
        })
      : null;
    return () => {
      page.kill();
      heroTrigger?.kill();
    };
  });

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const onMove = (e: PointerEvent) => {
      frame.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      frame.pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    const onLeave = () => {
      frame.pointer.x = 0;
      frame.pointer.y = 0;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return null;
}
