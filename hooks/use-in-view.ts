"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

/**
 * Whether an element is near the viewport. Canvases mount their renderer
 * only while this is true, so an offscreen scene costs nothing and a page
 * never holds more WebGL contexts than it shows.
 */
export function useInView<T extends Element>(rootMargin = "25% 0px"): [RefObject<T | null>, boolean] {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin });
    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);
  return [ref, inView];
}
