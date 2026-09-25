'use client';

import React, { useState, useRef, useCallback } from 'react';
import { SafeImage } from '@/components/ui/safe-image';
import { MoveHorizontal } from 'lucide-react';
import { DEFAULT_BLUR_DATA_URL } from '@/lib/image-placeholder';

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  aspectRatio?: string;
}

export function BeforeAfterSlider({
  beforeImage,
  afterImage,
  beforeLabel = 'Default Theme',
  afterLabel = 'AgencyPro FSE',
  aspectRatio = 'aspect-[16/10]',
}: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50); // percentage
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min((x / rect.width) * 100, 100));
    setSliderPosition(percent);
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging) return;
      handleMove(e.touches[0].clientX);
    },
    [isDragging, handleMove]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      handleMove(e.clientX);
    },
    [isDragging, handleMove]
  );

  return (
    <div className="space-y-2">
      <div
        ref={containerRef}
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        onMouseMove={handleMouseMove}
        onTouchStart={() => setIsDragging(true)}
        onTouchEnd={() => setIsDragging(false)}
        onTouchMove={handleTouchMove}
        className={`relative w-full ${aspectRatio} rounded-2xl overflow-hidden select-none cursor-ew-resize border border-[var(--border)] bg-[var(--surface-2)] shadow-md`}
      >
        {/* After Image (Full width background) */}
        <SafeImage
          src={afterImage}
          alt={afterLabel}
          fill
          placeholder="blur"
          blurDataURL={DEFAULT_BLUR_DATA_URL}
          sizes="(max-width: 1024px) 100vw, 800px"
          className="object-cover pointer-events-none"
        />

        {/* After Label Badge */}
        <div className="absolute top-3 right-3 z-10 px-2.5 py-1 rounded-lg bg-[var(--surface)]/90 backdrop-blur-md border border-[var(--border)] text-[10px] font-bold text-[var(--accent)] pointer-events-none">
          {afterLabel}
        </div>

        {/* Before Image (Clipped overlay) */}
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        >
          <SafeImage
            src={beforeImage}
            alt={beforeLabel}
            fill
            placeholder="blur"
            blurDataURL={DEFAULT_BLUR_DATA_URL}
            sizes="(max-width: 1024px) 100vw, 800px"
            className="object-cover"
          />
        </div>

        {/* Before Label Badge */}
        <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-lg bg-[var(--surface)]/90 backdrop-blur-md border border-[var(--border)] text-[10px] font-bold text-[var(--muted)] pointer-events-none">
          {beforeLabel}
        </div>

        {/* Divider Handle */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-lime shadow-xl z-20 pointer-events-none flex items-center justify-center -translate-x-1/2"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="w-8 h-8 rounded-full bg-[var(--surface)] text-[var(--text)] shadow-lg flex items-center justify-center border-2 border-lime">
            <MoveHorizontal className="w-4 h-4 text-lime" />
          </div>
        </div>
      </div>

      {/* Accessible range input for screen readers and keyboard navigation */}
      <div className="flex items-center justify-between text-[11px] text-[var(--muted)]">
        <span>Slide or use arrow keys to compare layout transformation</span>
        <input
          type="range"
          min="0"
          max="100"
          value={sliderPosition}
          onChange={(e) => setSliderPosition(Number(e.target.value))}
          aria-label="Before and after comparison slider"
          className="w-32 accent-lime cursor-pointer"
        />
      </div>
    </div>
  );
}
