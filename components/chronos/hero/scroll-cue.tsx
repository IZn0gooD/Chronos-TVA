/** "The page continues": a ticking rule and a line of mono, linking to the next section. */
export function ScrollCue({ href, label = "Scroll · the record continues" }: { href: string; label?: string }) {
  return (
    <a href={href} className="group inline-flex items-center gap-3 rounded-xs font-mono text-micro uppercase tracking-[0.08em] text-fg-subtle transition-colors hover:text-fg">
      <span className="relative block h-7 w-px overflow-hidden bg-line-strong" aria-hidden="true">
        <span className="scroll-cue-tick absolute inset-x-0 top-0 h-full origin-top bg-temporal" />
      </span>
      {label}
    </a>
  );
}
