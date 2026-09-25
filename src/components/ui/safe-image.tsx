'use client';

import React, { useState, useRef } from 'react';
import Image, { type ImageProps } from 'next/image';
import { ImageOff } from 'lucide-react';

/**
 * P0-2 FIX — SafeImage: drop-in replacement for next/image with:
 *
 * 1. One-shot onError fallback: if the remote image fails (400, 404, etc.),
 *    swap to a branded placeholder. Uses a ref flag to prevent infinite loops
 *    (if the fallback also fails, we render a static CSS placeholder, never
 *    re-triggering onError).
 *
 * 2. Preserves all next/image props (fill, sizes, priority, etc.)
 *
 * Usage: replace `<Image>` with `<SafeImage>` in any component.
 */

interface SafeImageProps extends Omit<ImageProps, 'onError'> {
  /** Optional custom fallback URL. Defaults to branded CSS placeholder. */
  fallbackSrc?: string;
}

export function SafeImage({ fallbackSrc, alt, src, ...props }: SafeImageProps) {
  const [hasErrored, setHasErrored] = useState(false);
  const [usePlaceholder, setUsePlaceholder] = useState(false);
  const errorCountRef = useRef(0);

  const handleError = () => {
    errorCountRef.current += 1;

    // First failure: try fallback src if provided
    if (errorCountRef.current === 1 && fallbackSrc) {
      setHasErrored(true);
      return;
    }

    // Second failure (or no fallback): render CSS placeholder, stop trying
    setUsePlaceholder(true);
  };

  // Static CSS placeholder — no <Image>, no network request, no loop
  if (usePlaceholder) {
    return (
      <div
        className="flex items-center justify-center bg-[var(--surface-2)] border border-[var(--border)] text-[var(--muted)] rounded-xl"
        style={{
          // Inherit size from parent's aspect-ratio or explicit dimensions
          width: '100%',
          height: '100%',
          position: props.fill ? 'absolute' : 'relative',
          inset: props.fill ? 0 : undefined,
        }}
        role="img"
        aria-label={alt || 'Image unavailable'}
      >
        <div className="flex flex-col items-center gap-1.5 p-4 text-center">
          <ImageOff className="w-6 h-6 opacity-40" />
          <span className="text-[10px] font-mono opacity-60">Image unavailable</span>
        </div>
      </div>
    );
  }

  const currentSrc = hasErrored && fallbackSrc ? fallbackSrc : src;

  return (
    <Image
      {...props}
      src={currentSrc}
      alt={alt}
      onError={handleError}
    />
  );
}
