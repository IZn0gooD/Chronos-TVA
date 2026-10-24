"use client";

import { useEffect, useId, useMemo, useRef, useState, type FormEvent } from "react";
import { AsciiScene } from "@/components/ascii/ascii-scene";
import { typedLine } from "@/components/ascii/pieces/typed-line";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox, RadioGroup, SelectInput, TextArea, TextInput } from "@/components/ui/form";
import { Metadata } from "@/components/ui/metadata";
import { Stamp } from "@/components/ui/stamp";
import { cn } from "@/lib/cn";
import {
  caseNumber,
  EVENT_CATEGORIES,
  LIMITS,
  validateNexusReport,
  type NexusReport,
  type NexusReportErrors,
  type NexusReportInput,
} from "@/lib/validation";

interface NexusReportFormProps {
  branches: ReadonlyArray<{ id: string; label: string }>;
  categoryLabels: Record<(typeof EVENT_CATEGORIES)[number], string>;
}

const SEVERITY_OPTIONS = [
  { value: "minor", label: "Minor", description: "A tick or two. Log it." },
  { value: "moderate", label: "Moderate", description: "Repeats, or spreads. Desk review." },
  { value: "critical", label: "Critical", description: "A branch is forming. Now." },
] as const;

const EMPTY: NexusReportInput = {
  callsign: "",
  branchId: "",
  category: "",
  severity: "",
  description: "",
  acknowledged: false,
};

/** The receipt typed on the carbon copy: two lines, then the cursor holds. */
function receiptPiece(ref: string) {
  return typedLine([`REF ${ref}`, "FILED · COPY 2 OF 2 · NOT TRANSMITTED"], { speed: 36, delay: 0.3 });
}

/**
 * Report a Nexus Event: form NX-7, printed on a sheet of Archive Paper
 * with its carbon copy behind. Real client-side validation, accessible
 * errors, and a confirmation that says plainly it is a demonstration:
 * there is no backend, so nothing is sent or stored. On success the sheet
 * is stamped and the carbon copy types the receipt. docs/ARCHITECTURE.md
 * explains how to connect a service.
 */
export function NexusReportForm({ branches, categoryLabels }: NexusReportFormProps) {
  const id = useId();
  const [values, setValues] = useState<NexusReportInput>(EMPTY);
  const [errors, setErrors] = useState<NexusReportErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [filed, setFiled] = useState<NexusReport | null>(null);
  const [status, setStatus] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const receiptRef = useRef<HTMLHeadingElement>(null);
  const refocus = useRef(false);

  const branchIds = branches.map((b) => b.id);
  const ref = filed ? caseNumber(filed) : null;
  const receipt = useMemo(() => (ref ? receiptPiece(ref) : null), [ref]);

  // Once the receipt renders, move focus to its heading so the outcome is announced. When the reader
  // asks for another declaration, the receipt and its button unmount: focus moves to the first field.
  useEffect(() => {
    if (filed) {
      receiptRef.current?.focus();
    } else if (refocus.current) {
      refocus.current = false;
      formRef.current?.querySelector<HTMLElement>("input, select, textarea")?.focus();
    }
  }, [filed]);

  const update = <K extends keyof NexusReportInput>(key: K, value: NexusReportInput[K]) => {
    const next = { ...values, [key]: value };
    setValues(next);
    // After the first attempt, re-validate as the reader corrects a field.
    if (submitted) setErrors(validateNexusReport(next, branchIds).errors);
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    const { errors: found, report } = validateNexusReport(values, branchIds);
    setErrors(found);
    if (report) {
      setFiled(report);
      setStatus("Report accepted for demonstration. Nothing was transmitted.");
      return;
    }
    const count = Object.keys(found).length;
    setStatus(`${count} ${count === 1 ? "field needs" : "fields need"} attention.`);
    // Focus the first field in error, in form order. The error state renders on the next frame;
    // the controls themselves already exist.
    const order: Array<[keyof NexusReportErrors, string]> = [
      ["callsign", `#${CSS.escape(`${id}-callsign`)}`],
      ["branchId", `#${CSS.escape(`${id}-branch`)}`],
      ["category", `#${CSS.escape(`${id}-category`)}`],
      ["severity", `input[name="${CSS.escape(`${id}-severity`)}"]`],
      ["description", `#${CSS.escape(`${id}-description`)}`],
      ["acknowledged", `#${CSS.escape(`${id}-ack`)}`],
    ];
    const first = order.find(([key]) => found[key]);
    if (first) formRef.current?.querySelector<HTMLElement>(first[1])?.focus();
  };

  const reset = () => {
    refocus.current = true;
    setValues(EMPTY);
    setErrors({});
    setSubmitted(false);
    setFiled(null);
    setStatus("");
  };

  const branch = filed ? branches.find((b) => b.id === filed.branchId) : undefined;

  return (
    <div className="relative">
      {/* The carbon copy: an olive sheet behind the paper. It slides out when the receipt is typed. */}
      <div
        aria-hidden="true"
        className={cn(
          "absolute inset-0 bg-olive transition-transform duration-[var(--dur-slow)] ease-[var(--ease-settle)]",
          filed ? "translate-x-4 translate-y-4 sm:translate-x-6 sm:translate-y-6" : "translate-x-2 translate-y-2 sm:translate-x-3 sm:translate-y-3",
        )}
      />

      <div className="surface-paper relative bg-bg p-6 text-fg sm:p-10">
        <header className="border-y-[3px] border-double border-line-strong py-3">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
            <p className="meta-label text-fg-muted">Form NX-7 — Declaration of variance</p>
            <Badge tone="neutral">Demonstration only</Badge>
          </div>
        </header>

        {filed && ref ? (
          <div className="relative pt-8">
            <div className="absolute right-0 top-6 sm:right-4">
              <Stamp lines={["Received", "Demonstration", "Not transmitted"]} />
            </div>
            <p role="status" aria-live="polite" className="meta-label max-w-[60%] text-fg-muted">
              {status}
            </p>
            <h3 ref={receiptRef} tabIndex={-1} className="mt-24 font-display text-heading font-medium tracking-tight text-fg outline-none sm:mt-20 sm:max-w-[60%]">
              Nexus event logged, locally, for your eyes only.
            </h3>
            <p className="mt-4 max-w-prose text-body text-fg-muted">
              This terminal has no backend. Your declaration was validated in the browser and is shown back to you here; it was
              not sent, stored or shared. Reloading the page clears it.
            </p>
            <Metadata
              className="mt-8 grid-cols-2 border-t border-line pt-6 sm:grid-cols-4"
              items={[
                { term: "Case", value: ref },
                { term: "Callsign", value: filed.callsign },
                { term: "Branch", value: branch ? `${branch.id} · ${branch.label}` : filed.branchId },
                { term: "Severity", value: SEVERITY_OPTIONS.find((o) => o.value === filed.severity)?.label ?? filed.severity },
              ]}
            />
            <blockquote className="mt-6 border-l-2 border-line-strong pl-4 text-small text-fg">{filed.description}</blockquote>
            <div className="mt-8">
              <Button variant="secondary" onClick={reset} index="↺">
                File another declaration
              </Button>
            </div>
          </div>
        ) : (
          <form ref={formRef} onSubmit={onSubmit} noValidate className="grid gap-8 pt-8" aria-describedby={`${id}-demo`}>
            <p id={`${id}-demo`} className="text-small text-fg-muted">
              All six fields are required. Validated in your browser: nothing is sent or stored, and no personal data is asked for.
            </p>

            <div className="grid gap-6 md:grid-cols-2 md:items-start">
              <TextInput
                id={`${id}-callsign`}
                label="01 · Analyst callsign"
                hint="Not your name. 3 to 24 letters, digits or dashes."
                autoComplete="off"
                spellCheck={false}
                aria-required
                value={values.callsign}
                onChange={(e) => update("callsign", e.target.value)}
                error={errors.callsign}
              />
              <SelectInput
                id={`${id}-branch`}
                label="02 · Observed on branch"
                placeholder="Choose a branch"
                aria-required
                value={values.branchId}
                onChange={(e) => update("branchId", e.target.value)}
                options={branches.map((b) => ({ value: b.id, label: `${b.id} — ${b.label}` }))}
                error={errors.branchId}
              />
              <SelectInput
                id={`${id}-category`}
                label="03 · Event category"
                placeholder="Choose a category"
                aria-required
                value={values.category}
                onChange={(e) => update("category", e.target.value)}
                options={EVENT_CATEGORIES.map((c) => ({ value: c, label: categoryLabels[c] }))}
                error={errors.category}
              />
            </div>

            <RadioGroup
              name={`${id}-severity`}
              legend="04 · Severity"
              value={values.severity}
              onChange={(v) => update("severity", v)}
              options={SEVERITY_OPTIONS}
              error={errors.severity}
            />

            <TextArea
              id={`${id}-description`}
              label="05 · What did you observe?"
              hint="Where, when, how often. The desk reads this first."
              corner={`${values.description.trim().length} / ${LIMITS.descriptionMax}`}
              value={values.description}
              onChange={(e) => update("description", e.target.value)}
              error={errors.description}
              rows={5}
              aria-required
            />

            <Checkbox
              id={`${id}-ack`}
              checked={values.acknowledged}
              aria-required
              onChange={(e) => update("acknowledged", e.target.checked)}
              error={errors.acknowledged}
              label="06 · I understand this is a demonstration: the declaration stays in my browser."
            />

            <div className="flex flex-wrap items-center gap-4 border-t border-line pt-6">
              <Button type="submit" size="lg" index="→">
                File the declaration
              </Button>
              <p role="status" aria-live="polite" className="font-mono text-mono text-fg-muted">
                {status}
              </p>
            </div>
          </form>
        )}
      </div>

      {/* The carbon copy's visible face: the receipt, typed in paper ink on olive, after filing. */}
      {receipt && (
        <div className="relative mt-8 bg-olive p-6 text-on-olive sm:ml-6 sm:p-8">
          <p className="meta-label text-on-olive">Carbon · copy 2 of 2</p>
          <div className="mt-4 overflow-hidden">
            <AsciiScene piece={receipt} mono label={`Receipt: reference ${ref}, filed, copy 2 of 2, not transmitted.`} size="clamp(10px, 1.1vw, 13px)" />
          </div>
        </div>
      )}
    </div>
  );
}
