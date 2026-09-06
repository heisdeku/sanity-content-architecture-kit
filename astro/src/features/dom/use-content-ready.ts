import { useEffect, useState } from 'react';

/**
 * Resolves once web fonts are loaded and every <img> inside `root` (or the
 * document) has finished loading. Use it to gate entrance animations.
 */
export function useContentReady(root?: HTMLElement | null): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const scope = root ?? document;
    const images = Array.from(scope.querySelectorAll('img')).filter((img) => !img.complete);
    const imagePromises = images.map(
      (img) =>
        new Promise<void>((resolve) => {
          img.addEventListener('load', () => resolve(), { once: true });
          img.addEventListener('error', () => resolve(), { once: true });
        }),
    );
    const fonts = 'fonts' in document ? document.fonts.ready : Promise.resolve();
    Promise.all([fonts, ...imagePromises]).then(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [root]);

  return ready;
}
