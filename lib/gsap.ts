"use client";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { readMotionPaused } from "@/lib/motion-store";
import { siteConfig } from "@/config/site";

// Registered once, on the client. Importing this module instead of "gsap"
// directly guarantees every component shares the same registered plugins.
gsap.registerPlugin(useGSAP, ScrollTrigger, DrawSVGPlugin, SplitText);

/** The media conditions every narrative animation is gated on. */
export const MOTION_CONDITIONS = {
  motionOK: "(prefers-reduced-motion: no-preference)",
  reduced: "(prefers-reduced-motion: reduce)",
} as const;

/**
 * True when choreography may play: the site config allows it and the reader
 * has not paused motion with the header switch. Checked at mount by every
 * choreography; reduced-motion itself is handled by gsap.matchMedia.
 */
export const motionAllowed = () => siteConfig.animation.enabled && !readMotionPaused();

export { gsap, useGSAP, ScrollTrigger, DrawSVGPlugin, SplitText };
