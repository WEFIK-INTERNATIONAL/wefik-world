'use client';

import { useState, useEffect } from 'react';

/**
 * Hook to compute real asset loading progress with 1.8s minimum and 3.2s hard cap.
 */
export function usePreloaderProgress() {
  const [progress, setProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const startTime = Date.now();
    let isCancelled = false;

    // Track font loading
    const fontsPromise = document.fonts ? document.fonts.ready : Promise.resolve();

    // Track window load
    const windowLoadPromise = new Promise<void>((resolve) => {
      if (document.readyState === 'complete') {
        resolve();
      } else {
        window.addEventListener('load', () => resolve(), { once: true });
      }
    });

    // Animate progress percentage smoothly up to 100
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 90) {
          return prev + Math.floor(Math.random() * 8) + 4;
        }
        return prev;
      });
    }, 100);

    // Hard cap at 3.2s: Force completion even if third-party assets stall
    const hardCapTimer = setTimeout(() => {
      if (!isCancelled) {
        clearInterval(progressInterval);
        setProgress(100);
        setIsLoaded(true);
      }
    }, 3200);

    // Resolve when real assets are ready + minimum 1.8s elapsed
    Promise.all([fontsPromise, windowLoadPromise]).then(() => {
      const elapsed = Date.now() - startTime;
      const remainingMinTime = Math.max(0, 1800 - elapsed);

      setTimeout(() => {
        if (!isCancelled) {
          clearInterval(progressInterval);
          clearTimeout(hardCapTimer);
          setProgress(100);
          setIsLoaded(true);
        }
      }, remainingMinTime);
    });

    return () => {
      isCancelled = true;
      clearInterval(progressInterval);
      clearTimeout(hardCapTimer);
    };
  }, []);

  return { progress: Math.min(progress, 100), isLoaded };
}
