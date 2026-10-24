"use client";

import { useRef, type ComponentPropsWithoutRef, type ElementType } from "react";
import { gsap, MOTION_CONDITIONS, motionAllowed, SplitText, useGSAP } from "@/lib/gsap";

type AnimatedTextProps<T extends ElementType> = {
  as?: T;
  /** `lines` rises each line out of a mask; `words` staggers words; `chars` types characters in. */
  split?: "lines" | "words" | "chars";
  /** `scroll` plays when the element enters the viewport; `mount` plays as soon as it mounts. */
  trigger?: "scroll" | "mount";
  delay?: number;
  /** Seconds between each line, word or character. */
  stagger?: number;
  /** Called once the reveal has finished (or at once without motion). */
  onComplete?: () => void;
} & Omit<ComponentPropsWithoutRef<T>, "as">;

/**
 * Typographic reveal with GSAP SplitText (masked lines, staggered words or
 * typed characters). SplitText keeps the original text readable by
 * assistive technology (aria handling is built in) and re-splits on
 * resize. Without motion the text is simply there.
 */
export function AnimatedText<T extends ElementType = "p">({
  as,
  split = "lines",
  trigger = "scroll",
  delay = 0,
  stagger,
  onComplete,
  ...props
}: AnimatedTextProps<T>) {
  const Tag = (as ?? "p") as ElementType;
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!ref.current) {
        onComplete?.();
        return;
      }
      const el = ref.current;
      const mm = gsap.matchMedia();
      mm.add(MOTION_CONDITIONS.motionOK, () => {
        if (!motionAllowed()) {
          onComplete?.();
          return;
        }
        const instance = SplitText.create(el, {
          type: split === "lines" ? "lines" : split === "words" ? "lines,words" : "chars,words",
          mask: split === "lines" ? "lines" : undefined,
          autoSplit: split === "lines",
          onSplit(self) {
            const targets = split === "lines" ? self.lines : split === "words" ? self.words : self.chars;
            const vars: gsap.TweenVars =
              split === "chars"
                ? { autoAlpha: 0, duration: 0.02, ease: "none", stagger: stagger ?? 0.028 }
                : split === "words"
                  ? { autoAlpha: 0, y: "0.4em", duration: 0.7, ease: "power3.out", stagger: stagger ?? 0.05 }
                  : { yPercent: 110, duration: 1, ease: "power4.out", stagger: stagger ?? 0.1 };
            return gsap.from(targets, {
              ...vars,
              delay,
              onComplete,
              scrollTrigger: trigger === "scroll" ? { trigger: el, start: "top 85%", once: true } : undefined,
            });
          },
        });
        return () => instance.revert();
      });
      // Reduced motion: no split, the text is already visible.
      mm.add(MOTION_CONDITIONS.reduced, () => onComplete?.());
      return () => mm.revert();
    },
    { scope: ref },
  );

  return <Tag ref={ref} {...props} />;
}
