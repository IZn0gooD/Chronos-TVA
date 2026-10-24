"use client";

import { useRef, type ComponentPropsWithoutRef, type ElementType } from "react";
import { gsap, MOTION_CONDITIONS, motionAllowed, useGSAP } from "@/lib/gsap";

type RevealProps<T extends ElementType> = {
  as?: T;
  /**
   * `rise` lifts and fades in; `fade` only fades; `wipe` reveals from the
   * left behind a mask; `stagger` reveals the direct children one after another.
   */
  effect?: "rise" | "fade" | "wipe" | "stagger";
  /** Seconds added before the reveal starts, for choreography between siblings. */
  delay?: number;
  /** Scroll position that triggers it, as a ScrollTrigger `start`. */
  start?: string;
  /**
   * A scroll-linked drift for one descendant: it travels from +distance to
   * -distance pixels while the element crosses the viewport (scrubbed, no
   * easing), the small parallax posters and plates are allowed.
   */
  drift?: { selector: string; distance: number };
} & Omit<ComponentPropsWithoutRef<T>, "as">;

/**
 * Scroll-triggered reveal. The content is always in the HTML and fully
 * visible without JavaScript or with reduced motion: GSAP only adds the
 * entrance when motion is allowed, and reverts everything on unmount.
 * It fades opacity, never visibility, so links and fields inside stay in
 * the tab order; and a focus landing inside finishes the reveal at once.
 */
export function Reveal<T extends ElementType = "div">({
  as,
  effect = "rise",
  delay = 0,
  start = "top 85%",
  drift,
  ...props
}: RevealProps<T>) {
  const Tag = (as ?? "div") as ElementType;
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!ref.current) return;
      const el = ref.current;
      const mm = gsap.matchMedia();
      mm.add(MOTION_CONDITIONS.motionOK, () => {
        if (!motionAllowed()) return;
        const targets = effect === "stagger" ? Array.from(el.children) : [el];
        const from: gsap.TweenVars =
          effect === "fade" ? { opacity: 0 } : effect === "wipe" ? { clipPath: "inset(0 100% 0 0)" } : { opacity: 0, y: 28 };
        const to: gsap.TweenVars =
          effect === "wipe"
            ? { clipPath: "inset(0 0% 0 0)", duration: 1.1, ease: "power3.inOut" }
            : { opacity: 1, y: 0, duration: 0.9, ease: "power3.out" };
        const tween = gsap.fromTo(targets, from, {
          ...to,
          delay,
          stagger: effect === "stagger" ? 0.08 : 0,
          scrollTrigger: { trigger: el, start, once: true },
        });
        if (drift) {
          const parts = el.querySelectorAll(drift.selector);
          if (parts.length) {
            gsap.fromTo(
              parts,
              { y: drift.distance },
              { y: -drift.distance, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 0.6 } },
            );
          }
        }
        const finish = () => tween.progress(1);
        el.addEventListener("focusin", finish);
        return () => el.removeEventListener("focusin", finish);
      });
      return () => mm.revert();
    },
    { scope: ref, dependencies: [effect, delay, start, drift?.selector, drift?.distance] },
  );

  return <Tag ref={ref} {...props} />;
}
