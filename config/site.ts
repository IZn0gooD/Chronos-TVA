/**
 * Site configuration: everything a new project changes first.
 * Visual tokens live in styles/tokens.css (mirrored for the GPU in
 * config/palette.ts); editorial content in data/. No real contact details,
 * social accounts or domains are declared here: add them only when they exist.
 */
export const siteConfig = {
  /** Working name of the product. Shown in the header, footer and <title>. */
  name: "CHRONOS",
  /** Secondary designation printed next to the name in administrative chrome. */
  designation: "TVA TERMINAL",
  title: "CHRONOS — Time Variance Authority Terminal",
  description:
    "An experimental administrative terminal inspired by the Time Variance Authority: a retro-futurist archive of timelines, variants and directives, with a live temporal chamber. Fictional data, real interface.",
  locale: "en",
  /** Semantic version printed in the footer. Bump it with the project. */
  version: "0.2.0",
  /** Fictional system identifier shown in the chrome. */
  systemId: "TVA-CHR-0001",
  /** Sections in the folder, for folio numbering ("03/08"). */
  folios: 8,
  /**
   * Primary navigation. Every href is an anchor on the home route (so it also
   * works from the 404 page); an entry tied to a feature disappears with it
   * (see `enabledNav`).
   */
  nav: [
    { label: "Timeline", href: "/#sacred-timeline" },
    { label: "Anomaly", href: "/#temporal-anomaly", feature: "temporalAnomaly" },
    { label: "Registry", href: "/#variant-registry", feature: "variantRegistry" },
    { label: "Explorer", href: "/#timeline-explorer", feature: "timelineExplorer" },
    { label: "Directives", href: "/#directives", feature: "directives" },
    { label: "Report", href: "/#report-nexus-event", feature: "nexusReport" },
  ],
  /** Feature switches. A new project turns off what it does not ship. */
  features: {
    bootSequence: true,
    temporalAnomaly: true,
    variantRegistry: true,
    timelineExplorer: true,
    directives: true,
    nexusReport: true,
    /** The WebGL chamber in the hero. Off, the hero keeps its SVG and ASCII instruments only. */
    scene3d: true,
    /** Shader thumbnails in the registry. Off, those files fall back to their SVG plates. */
    shaderFigures: true,
  },
  /** Global animation options, read by the motion components. */
  animation: {
    /** Set to false to ship the site without any GSAP choreography. */
    enabled: true,
    /** Milliseconds the boot overlay may hold the screen before it dismisses itself. */
    bootMaxDuration: 2600,
  },
  /** Graphics engine options, read by components/graphics. */
  graphics: {
    /**
     * "auto" follows the device and the reader's preferences (reduced motion,
     * save-data, small screens); "full" and "reduced" force a preset; "off"
     * ships the SVG and ASCII fallbacks only, never a canvas.
     */
    effects: "auto" as "auto" | "full" | "reduced" | "off",
    /** Theatre.js sequences in the chamber (entrance, variance). False holds the resting pose. */
    theatre: true,
    /** Upper bound on the device pixel ratio the renderers may use. */
    maxDpr: 1.75,
  },
  footer: {
    statusLabel: "All timelines nominal",
    folio: "08/08 · Colophon",
    colophon:
      "Set in Space Grotesk, IBM Plex Mono and Inter. Built with Next.js, React Three Fiber, GSAP, Motion, Theatre.js and ascii.rest. A fictional interface. No data is collected, stored or transmitted.",
    disclaimer:
      "An independent experiment inspired by the Time Variance Authority of the Loki series. Not affiliated with Marvel Studios or Disney. Every file, branch and figure is a fictional specimen.",
    endMark: "End of record",
    signOff: "Everything is under control.",
  },
} as const;

export type SiteConfig = typeof siteConfig;
export type FeatureKey = keyof SiteConfig["features"];
export type NavLink = SiteConfig["nav"][number];

/** The navigation entries whose section is actually rendered. */
export function enabledNav(): readonly NavLink[] {
  return siteConfig.nav.filter((item) => !("feature" in item) || siteConfig.features[item.feature as FeatureKey]);
}

/** "03/08": a section's place in the folder. */
export function folio(n: number): string {
  return `${String(n).padStart(2, "0")}/${String(siteConfig.folios).padStart(2, "0")}`;
}
