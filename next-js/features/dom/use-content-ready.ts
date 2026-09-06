"use client";

import { useEffect, useState } from "react";

/**
 * Resolves once fonts are loaded and every visible image has decoded.
 * Use it to gate intro animations so they never fire over a half-painted page.
 */
export function useContentReady(root?: ParentNode | null): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const scope = root ?? document;

    async function wait() {
      await document.fonts?.ready;
      const images = Array.from(scope.querySelectorAll("img")).filter((img) => {
        const rect = img.getBoundingClientRect();
        return rect.bottom > 0 && rect.top < window.innerHeight;
      });
      await Promise.all(
        images.map((img) =>
          img.complete
            ? Promise.resolve()
            : img.decode().catch(() => undefined),
        ),
      );
      if (!cancelled) setReady(true);
    }

    wait();
    return () => {
      cancelled = true;
    };
  }, [root]);

  return ready;
}
