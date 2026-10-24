import type { Branch, BranchState } from "@/types/content";

/**
 * Timeline Explorer data. The first entry is the sacred timeline itself;
 * the others leave it at `origin` (0..1 along its length) and end `drift`
 * units above (negative) or below it. Every figure is fictional.
 */
export const branches: readonly Branch[] = [
  {
    id: "SL-0",
    label: "Sacred Timeline",
    state: "sacred",
    origin: 0,
    drift: 0,
    divergence: "0.00",
    summary: "The baseline against which every variance is measured. It does not branch; everything else does.",
    events: [
      { at: "T+0", note: "Reference established. All clocks issued from this point." },
      { at: "Continuous", note: "Monitored at every desk, in every sector, without interruption." },
    ],
  },
  {
    id: "BR-1962-A",
    label: "Sector 12 divergence",
    state: "nexus",
    origin: 0.22,
    drift: -22,
    divergence: "0.31",
    summary: "Opened by the Clockmaker file. Repairs keep arriving one tick early; the branch widens by one tick a month.",
    events: [
      { at: "T+0", note: "First early repair logged by the shop." },
      { at: "T+41 d", note: "Variance crosses the reporting threshold. Desk 07 assigned." },
      { at: "T+1 yr", note: "Branch stable at 0.31. Observation continues." },
    ],
  },
  {
    id: "BR-1960-L",
    label: "Lighthouse branch",
    state: "pruned",
    origin: 0.38,
    drift: 30,
    divergence: "0.74",
    summary: "A beacon ran half a second ahead of its lamp for three winters. The lamp was replaced and the branch folded back.",
    events: [
      { at: "T+0", note: "Lead of 0.5 s measured from the shore station." },
      { at: "T+2 yr", note: "Ships are found to be navigating by the early light." },
      { at: "T+3 yr", note: "Lamp recalibrated. Branch pruned without incident." },
    ],
  },
  {
    id: "BR-1961-T",
    label: "Twin Ledger",
    state: "contained",
    origin: 0.55,
    drift: -16,
    divergence: "0.52",
    summary: "Two ledgers that balance only together. Contained in a sealed office; the second ledger is still growing.",
    events: [
      { at: "T+0", note: "Deficit noticed in ledger one." },
      { at: "T+9 d", note: "Ledger two found. Columns close to zero side by side." },
      { at: "T+120 d", note: "A third column appears in ledger two. File escalated, branch contained." },
    ],
  },
  {
    id: "BR-1963-R",
    label: "Reactor loop",
    state: "nexus",
    origin: 0.71,
    drift: 22,
    divergence: "0.88",
    summary: "An engine drawing power from the second after it is switched off. The loop tightens each time it is cycled.",
    events: [
      { at: "T+0", note: "Output recorded after shutdown, for one second." },
      { at: "T+16 d", note: "Operators begin cycling the unit on purpose." },
      { at: "T+30 d", note: "Branch widening. Nexus status declared." },
    ],
  },
  {
    id: "BR-1963-E",
    label: "Echo Garden",
    state: "contained",
    origin: 0.86,
    drift: -28,
    divergence: "0.19",
    summary: "A greenhouse that flowers in the order of next week's bouquets. Harmless so far; contained for study.",
    events: [
      { at: "T+0", note: "Bloom order matches the written plan for the first time." },
      { at: "T+7 d", note: "Control bed planted. Flowers at random." },
      { at: "T+60 d", note: "Weekly visits scheduled. Branch contained." },
    ],
  },
];

export const BRANCH_STATE_LABELS: Record<BranchState, string> = {
  sacred: "Sacred",
  nexus: "Nexus event",
  pruned: "Pruned",
  contained: "Contained",
};
