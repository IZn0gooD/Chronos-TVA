"use client";

import dynamic from "next/dynamic";

/*
 * The interactive islands below the fold, each in its own chunk. They are
 * still rendered on the server (no `ssr: false`): only their JavaScript
 * waits. Declared in a client module rather than in the page so the
 * server page holds plain client references, which Next's development
 * validation of the instant prerender can resolve.
 */
export const VariantRegistry = dynamic(() => import("./variant-registry/variant-registry").then((m) => m.VariantRegistry));
export const TimelineExplorer = dynamic(() => import("./timeline-explorer/timeline-explorer").then((m) => m.TimelineExplorer));
export const NexusReportForm = dynamic(() => import("./nexus-report").then((m) => m.NexusReportForm));
