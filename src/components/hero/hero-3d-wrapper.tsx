'use client';

import React, { Suspense, useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { HeroPoster } from './hero-poster';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

// Lazy-load Three.js scene strictly without SSR per Section 5
const LazyHero3DScene = dynamic(() => import('./hero-3d-scene'), {
  ssr: false,
  loading: () => <HeroPoster />,
});

export function Hero3DWrapper() {
  const prefersReducedMotion = useReducedMotion();
  const [canRender3D, setCanRender3D] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Gate 1: Reduced motion disabled
    if (prefersReducedMotion) {
      setCanRender3D(false);
      return;
    }

    // Gate 2: Disabled on mobile screens (<768px)
    if (window.innerWidth < 768) {
      setCanRender3D(false);
      return;
    }

    // Gate 3: Disabled when CPU cores <= 4 for performance preservation
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) {
      setCanRender3D(false);
      return;
    }

    // Gate 4: Disabled when browser Data Saver (saveData) is turned on
    const connection = (navigator as any).connection;
    if (connection && connection.saveData) {
      setCanRender3D(false);
      return;
    }

    setCanRender3D(true);
  }, [prefersReducedMotion]);

  if (!canRender3D) {
    return <HeroPoster />;
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <Suspense fallback={<HeroPoster />}>
        <LazyHero3DScene />
      </Suspense>
    </div>
  );
}
