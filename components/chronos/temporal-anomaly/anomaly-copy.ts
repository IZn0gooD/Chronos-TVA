/** The three phases of the field plate, read against the scroll. */
export const PHASES = [
  {
    index: "01",
    title: "Interference",
    text: "Two ring systems at nearby frequencies beat against each other. The pattern is stable; it is not still.",
  },
  {
    index: "02",
    title: "Displacement",
    text: "Noise warps the radius. Rings that were circles become organs. The desk logs the distortion, not the shape.",
  },
  {
    index: "03",
    title: "Nexus",
    text: "Where the field peaks it burns orange: a branch is forming. Past this line the directives apply.",
  },
] as const;
