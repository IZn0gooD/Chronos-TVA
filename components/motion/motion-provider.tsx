"use client";

import { domMax, LazyMotion, MotionConfig } from "motion/react";
import type { ReactNode } from "react";

/**
 * Motion (for React) owns the component-level interactions GSAP does not
 * choreograph: menus, cards, selection indicators (layout animations),
 * dialog entrances, panel swaps, filtered lists. LazyMotion loads the
 * feature set once (domMax, for layout and gestures); `reducedMotion="user"`
 * drops transforms for readers who asked for less movement.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domMax} strict>
      <MotionConfig reducedMotion="user" transition={{ type: "spring", bounce: 0, duration: 0.4 }}>
        {children}
      </MotionConfig>
    </LazyMotion>
  );
}
