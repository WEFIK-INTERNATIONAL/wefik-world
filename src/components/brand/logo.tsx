'use client';

import React from 'react';

export interface LogoProps {
  size?: number | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showWordmark?: boolean;
  markOnly?: boolean;
}

const SIZE_MAP = {
  sm: { icon: 20, box: 'w-7 h-7 rounded-lg', text: 'text-base' },
  md: { icon: 22, box: 'w-9 h-9 rounded-xl', text: 'text-xl' },
  lg: { icon: 28, box: 'w-11 h-11 rounded-xl', text: 'text-2xl' },
  xl: { icon: 36, box: 'w-14 h-14 rounded-2xl', text: 'text-3xl' },
};

/**
 * Single source of truth for the Wefik logo.
 * Renders theme-aware vector SVG brand mark with optional wordmark.
 */
export function Logo({
  size = 'md',
  className = '',
  showWordmark = true,
  markOnly = false,
}: LogoProps) {
  const isPreset = typeof size === 'string' && size in SIZE_MAP;
  const config = isPreset ? SIZE_MAP[size as keyof typeof SIZE_MAP] : SIZE_MAP.md;
  const iconPixel = typeof size === 'number' ? size : config.icon;

  const svgMark = (
    <svg
      width={iconPixel}
      height={iconPixel}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-lime shrink-0 transition-transform duration-300 group-hover:scale-105"
      aria-label="Wefik Logo Mark"
    >
      <path
        d="M4 6L8 18L12 9L16 18L20 6"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="5" r="1.5" fill="#A3E635" />
    </svg>
  );

  if (markOnly) {
    return <div className={`inline-flex items-center justify-center ${className}`}>{svgMark}</div>;
  }

  return (
    <div className={`inline-flex items-center gap-2.5 group select-none ${className}`}>
      <div
        className={`${config.box} bg-ink dark:bg-[#141714] border border-[var(--border)] flex items-center justify-center shadow-xs group-hover:border-lime/40 transition-all duration-300`}
      >
        {svgMark}
      </div>
      {showWordmark && (
        <span className={`font-display font-bold tracking-tight text-[var(--text)] ${config.text}`}>
          wefik<span className="text-[var(--accent)]">.world</span>
        </span>
      )}
    </div>
  );
}
