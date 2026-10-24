import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/cn";

/*
 * Form primitives. Every control has a real <label>, an optional hint and
 * an error that is announced through aria-describedby. The look is the
 * site's administrative mono; the behaviour is plain HTML.
 */

interface ShellProps {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  /** Printed after the label in mono, e.g. "optional" or a counter. */
  corner?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** The hint is not rendered while an error shows, so only the id that exists is referenced. */
function describedBy(id: string, hint?: string, error?: string) {
  if (error) return `${id}-error`;
  return hint ? `${id}-hint` : undefined;
}

function FieldShell({ id, label, hint, error, corner, children, className }: ShellProps) {
  return (
    <div className={cn("grid content-start gap-2", className)}>
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="meta-label text-fg-muted">
          {label}
        </label>
        {corner && <span className="font-mono text-micro text-fg-subtle">{corner}</span>}
      </div>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-small text-fg-subtle">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="flex gap-2 text-small text-accent-text">
          <span aria-hidden="true">▲</span>
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}

const CONTROL =
  "w-full rounded-xs bg-surface-2 px-3 font-mono text-mono text-fg ring-1 ring-inset ring-line-input placeholder:text-fg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-focus aria-[invalid=true]:ring-danger";

type Common = { label: string; hint?: string; error?: string; corner?: ReactNode; id: string };

export function TextInput({ label, hint, error, corner, id, className, ...props }: Common & ComponentPropsWithoutRef<"input">) {
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} corner={corner} className={className}>
      <input id={id} aria-invalid={error ? true : undefined} aria-describedby={describedBy(id, hint, error)} className={cn(CONTROL, "h-11")} {...props} />
    </FieldShell>
  );
}

export function TextArea({ label, hint, error, corner, id, className, ...props }: Common & ComponentPropsWithoutRef<"textarea">) {
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} corner={corner} className={className}>
      <textarea id={id} aria-invalid={error ? true : undefined} aria-describedby={describedBy(id, hint, error)} className={cn(CONTROL, "min-h-32 resize-y py-3 leading-relaxed")} {...props} />
    </FieldShell>
  );
}

interface SelectProps extends Common, Omit<ComponentPropsWithoutRef<"select">, "id"> {
  options: ReadonlyArray<{ value: string; label: string }>;
  placeholder?: string;
}

export function SelectInput({ label, hint, error, corner, id, className, options, placeholder, ...props }: SelectProps) {
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} corner={corner} className={className}>
      <div className="relative">
        <select id={id} aria-invalid={error ? true : undefined} aria-describedby={describedBy(id, hint, error)} className={cn(CONTROL, "h-11 appearance-none pr-10")} {...props}>
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-mono text-fg-subtle" aria-hidden="true">
          ▾
        </span>
      </div>
    </FieldShell>
  );
}

interface RadioGroupProps {
  name: string;
  legend: string;
  value: string;
  onChange: (value: string) => void;
  options: ReadonlyArray<{ value: string; label: string; description?: string }>;
  error?: string;
  className?: string;
}

export function RadioGroup({ name, legend, value, onChange, options, error, className }: RadioGroupProps) {
  const errorId = `${name}-error`;
  return (
    <fieldset className={cn("grid gap-2", className)} aria-describedby={error ? errorId : undefined} aria-invalid={error ? true : undefined}>
      <legend className="meta-label mb-2 text-fg-muted">{legend}</legend>
      <div className="grid gap-px overflow-hidden rounded-xs bg-line-strong ring-1 ring-inset ring-line-strong sm:grid-cols-3">
        {options.map((o) => {
          const checked = o.value === value;
          return (
            <label
              key={o.value}
              className={cn(
                "flex cursor-pointer gap-3 px-4 py-3 transition-colors duration-[var(--dur-fast)]",
                checked ? "bg-fg text-bg" : "bg-surface-2 text-fg hover:bg-surface-3",
              )}
            >
              <input type="radio" name={name} value={o.value} checked={checked} onChange={() => onChange(o.value)} className="peer sr-only" />
              <span
                aria-hidden="true"
                className={cn(
                  "mt-1 h-3 w-3 shrink-0 rounded-full ring-1 ring-inset peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus",
                  checked ? "bg-accent ring-bg" : "ring-fg-subtle",
                )}
              />
              <span className="grid content-start gap-0.5">
                <span className="font-mono text-mono font-medium">{o.label}</span>
                {o.description && <span className={cn("text-small", checked ? "text-bg/70" : "text-fg-subtle")}>{o.description}</span>}
              </span>
            </label>
          );
        })}
      </div>
      {error && (
        <p id={errorId} className="flex gap-2 text-small text-accent-text">
          <span aria-hidden="true">▲</span>
          <span>{error}</span>
        </p>
      )}
    </fieldset>
  );
}

interface CheckboxProps extends Omit<ComponentPropsWithoutRef<"input">, "type" | "id"> {
  id: string;
  label: ReactNode;
  error?: string;
}

export function Checkbox({ id, label, error, className, ...props }: CheckboxProps) {
  return (
    <div className={cn("grid gap-2", className)}>
      <label htmlFor={id} className="flex cursor-pointer items-start gap-3 text-small text-fg">
        <input id={id} type="checkbox" aria-invalid={error ? true : undefined} aria-describedby={error ? `${id}-error` : undefined} className="peer sr-only" {...props} />
        <span
          aria-hidden="true"
          className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-xs ring-1 ring-inset ring-line-input peer-checked:bg-accent peer-checked:ring-accent peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus [&>span]:opacity-0 peer-checked:[&>span]:opacity-100"
        >
          <span className="text-[10px] font-medium text-on-accent">✓</span>
        </span>
        <span>{label}</span>
      </label>
      {error && (
        <p id={`${id}-error`} className="flex gap-2 text-small text-accent-text">
          <span aria-hidden="true">▲</span>
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
