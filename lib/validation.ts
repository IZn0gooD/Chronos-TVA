/**
 * Validation for the Nexus Event report. Pure functions, no DOM: the form
 * calls them, the tests call them, a future server action could call them.
 * The report collects no personal data: a callsign, not a name or an email.
 */

export const SEVERITIES = ["minor", "moderate", "critical"] as const;
export type Severity = (typeof SEVERITIES)[number];

import { VARIANT_CATEGORIES, type VariantCategory } from "@/types/content";

export const EVENT_CATEGORIES = VARIANT_CATEGORIES;
export type EventCategory = VariantCategory;

export interface NexusReportInput {
  /** Analyst callsign: 3 to 24 characters, letters, digits, dashes. */
  callsign: string;
  /** Branch identifier the event was observed on. Must be one of `branchIds`. */
  branchId: string;
  category: string;
  severity: string;
  /** Free text, 20 to 600 characters. */
  description: string;
  /** The reader confirmed this is a demonstration. */
  acknowledged: boolean;
}

export type NexusReportErrors = Partial<Record<keyof NexusReportInput, string>>;

export interface NexusReport {
  callsign: string;
  branchId: string;
  category: EventCategory;
  severity: Severity;
  description: string;
}

const CALLSIGN = /^[a-z0-9][a-z0-9-]{1,22}[a-z0-9]$/i;

export const LIMITS = { callsignMin: 3, callsignMax: 24, descriptionMin: 20, descriptionMax: 600 } as const;

/**
 * Checks a report. Returns the errors keyed by field (empty when valid) and,
 * when valid, the typed report. Messages are written for the reader, not
 * the developer.
 */
export function validateNexusReport(
  input: NexusReportInput,
  branchIds: ReadonlyArray<string>,
): { errors: NexusReportErrors; report: NexusReport | null } {
  const errors: NexusReportErrors = {};
  const callsign = input.callsign.trim();
  const description = input.description.trim();

  if (!callsign) errors.callsign = "Enter your analyst callsign.";
  else if (callsign.length < LIMITS.callsignMin || callsign.length > LIMITS.callsignMax)
    errors.callsign = `A callsign is ${LIMITS.callsignMin} to ${LIMITS.callsignMax} characters.`;
  else if (!CALLSIGN.test(callsign)) errors.callsign = "Use letters, digits and dashes only.";

  if (!input.branchId) errors.branchId = "Choose the branch where the event was observed.";
  else if (!branchIds.includes(input.branchId)) errors.branchId = "That branch is not on file.";

  if (!EVENT_CATEGORIES.includes(input.category as EventCategory)) errors.category = "Choose an event category.";
  if (!SEVERITIES.includes(input.severity as Severity)) errors.severity = "Rate the severity.";

  if (!description) errors.description = "Describe what you observed.";
  else if (description.length < LIMITS.descriptionMin)
    errors.description = `Give at least ${LIMITS.descriptionMin} characters, so the desk can act on it.`;
  else if (description.length > LIMITS.descriptionMax)
    errors.description = `Keep it under ${LIMITS.descriptionMax} characters.`;

  if (!input.acknowledged) errors.acknowledged = "Confirm you understand this is a demonstration.";

  if (Object.keys(errors).length > 0) return { errors, report: null };
  return {
    errors,
    report: {
      callsign,
      branchId: input.branchId,
      category: input.category as EventCategory,
      severity: input.severity as Severity,
      description,
    },
  };
}

/** A fictional case number derived from the report, so the confirmation can quote one. Not random: the same report gives the same number. */
export function caseNumber(report: NexusReport): string {
  let h = 0;
  for (const ch of `${report.callsign}|${report.branchId}|${report.description}`) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return `NX-${report.branchId.replace(/[^A-Z0-9]/gi, "").slice(0, 4).toUpperCase()}-${(h % 9000) + 1000}`;
}
