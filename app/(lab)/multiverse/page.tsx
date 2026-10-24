import type { Metadata } from "next";
import { MultiverseLab } from "@/components/multiverse/multiverse-lab";
import { MultiversePlate } from "@/components/multiverse/plate";

export const metadata: Metadata = {
  title: "Multiverse lab",
  description:
    "A test bench on the CHRONOS stack: a living, expanding multiverse of branching timelines, rendered with React Three Fiber and GLSL and choreographed with Theatre.js.",
};

/** A separate route with no site chrome: the lab owns the whole viewport. */
export default function MultiversePage() {
  return <MultiverseLab plate={<MultiversePlate />} />;
}
