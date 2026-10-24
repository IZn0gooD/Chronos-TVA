/** First focusable element on the page: jumps past the chrome to the content. */
export function SkipLink({ target = "#main" }: { target?: string }) {
  return (
    <a
      href={target}
      className="meta-label fixed left-[var(--gutter)] top-3 z-[var(--z-skip)] -translate-y-24 rounded-xs bg-accent-fill px-3 py-2 text-on-accent transition-transform focus:translate-y-0"
    >
      Skip to content
    </a>
  );
}
