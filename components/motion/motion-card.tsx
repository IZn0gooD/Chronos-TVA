"use client";

import { m, type HTMLMotionProps } from "motion/react";
import { spring } from "@/lib/motion-tokens";

/**
 * A card that answers the pointer: a 3 px lift on hover, a 1 % press on
 * tap, both on a critically damped spring so they never bounce. Wrap any
 * surface (Card, Frame) in it; the surface keeps its own styles. With
 * reduced motion, MotionConfig drops the transforms.
 */
export function MotionCard({ children, ...props }: HTMLMotionProps<"div">) {
  return (
    <m.div whileHover={{ y: -3 }} whileTap={{ scale: 0.99 }} transition={spring.lift} {...props}>
      {children}
    </m.div>
  );
}
