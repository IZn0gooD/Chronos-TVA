"use client";

import { AnimatePresence, m } from "motion/react";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import type { NavLink } from "@/config/site";
import { spring } from "@/lib/motion-tokens";

/**
 * Small-screen navigation: a disclosure button and a panel that enters and
 * leaves on a spring (Motion owns menus). Escape, a click outside and a
 * chosen link close it; focus returns to the button. The same links sit in
 * the footer index, so nothing is lost before hydration.
 */
export function MobileNav({ items }: { items: ReadonlyArray<NavLink> }) {
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    };
    const onPointer = (e: PointerEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  return (
    <div ref={root} className="relative md:hidden">
      <button
        ref={button}
        type="button"
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        onClick={() => setOpen((o) => !o)}
        className="meta-label flex h-9 items-center gap-2 rounded-xs px-3 text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg"
      >
        <span>{open ? "Close" : "Menu"}</span>
        <span aria-hidden="true" className="font-mono">
          {open ? "✕" : "≡"}
        </span>
      </button>
      <AnimatePresence>
        {open && (
          <m.nav
            id={`${id}-panel`}
            aria-label="Primary"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={spring.settle}
            style={{ transformOrigin: "top right" }}
            className="absolute right-0 top-[calc(100%+0.75rem)] w-64 rounded-sm bg-surface-2 p-2 shadow-dialog ring-1 ring-inset ring-line-strong"
          >
            <ul className="grid">
              {items.map((item, i) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex h-11 items-center gap-3 rounded-xs px-3 font-mono text-mono text-fg hover:bg-surface-3"
                  >
                    <span className="text-micro text-temporal-text">{String(i + 1).padStart(2, "0")}</span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </m.nav>
        )}
      </AnimatePresence>
    </div>
  );
}
