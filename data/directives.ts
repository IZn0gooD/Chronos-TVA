import type { Directive } from "@/types/content";

/**
 * The Directives: six institutional statements, each with a geometric
 * plate. In another project this section presents principles, values or a
 * method; only this file and the plates change.
 */
export const directives: readonly Directive[] = [
  {
    article: "01",
    title: "Everything is under control.",
    statement: "What is under observation is under control. What is under control stays under observation.",
    plate: "eye",
  },
  {
    article: "02",
    title: "One timeline. One record.",
    statement: "An event happens once and is filed once. A second filing is not a copy; it is an anomaly.",
    plate: "bars",
  },
  {
    article: "03",
    title: "Report before you understand.",
    statement: "Understanding arrives later and is welcome. The report must arrive first.",
    plate: "hourglass",
  },
  {
    article: "04",
    title: "A pruned branch is not a loss.",
    statement: "It is a correction, performed with care and recorded in full, including the care.",
    plate: "branch",
  },
  {
    article: "05",
    title: "The form is the law.",
    statement: "Where the form has no box, the event did not occur. Request a new form.",
    plate: "grid",
  },
  {
    article: "06",
    title: "Time is not yours to keep.",
    statement: "Clocks are issued, calibrated and returned. Keep the receipt.",
    plate: "circle",
  },
];
