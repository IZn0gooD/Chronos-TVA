"use client";

import { banner, type BannerOptions } from "ascii.rest/banner";
import { Banner } from "ascii.rest/react";
import { useMemo, type CSSProperties } from "react";
import { useHydrated } from "@/hooks/use-hydrated";
import { cn } from "@/lib/cn";
import { ArtBoundary } from "./art-boundary";

interface AsciiBannerProps extends BannerOptions {
  text: string;
  /** Spoken name; defaults to the text. */
  label?: string;
  /** Font size of a text banner (no colour): the letters scale with it. */
  fontSize?: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * Block-letter typography from ascii.rest, with the site's art styles, a
 * server-rendered first frame (so folios and the footer name are in the
 * HTML, with their height, before any script runs) and a plain-text
 * fallback (the text itself) if the banner cannot draw. Text banners
 * inherit `color`, so they follow the surface they sit on.
 */
export function AsciiBanner({ text, label, fontSize, className, style, ...options }: AsciiBannerProps) {
  const live = useHydrated();
  const artStyle = { ...(fontSize ? { "--art-size": fontSize } : {}), ...style } as CSSProperties;
  const optionsKey = JSON.stringify(options);
  const first = useMemo(() => {
    try {
      const piece = banner(text, JSON.parse(optionsKey) as BannerOptions);
      // A coloured banner draws on a canvas: nothing to print on the server.
      if (piece.meta.palette) return null;
      return piece.default()(piece.motion.from);
    } catch {
      return null;
    }
  }, [text, optionsKey]);

  const plain = (
    <span className={cn("font-display text-heading", className)} style={style}>
      {text}
    </span>
  );

  if (!live) {
    return first ? (
      <pre className={cn("art", className)} style={artStyle} role="img" aria-label={label ?? text}>
        {first}
      </pre>
    ) : (
      plain
    );
  }

  return (
    <ArtBoundary fallback={plain}>
      <Banner text={text} label={label ?? text} className={cn("art", className)} style={artStyle} {...options} />
    </ArtBoundary>
  );
}
