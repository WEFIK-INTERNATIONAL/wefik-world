'use client';

import React from 'react';

interface Icon3DProps {
  className?: string;
  size?: number;
}

/**
 * Performant Hand-Crafted 3D-Style SVG Icon Set
 * Consistent isometric lighting (top-left 45deg light source, soft drop shadow, dual-tone brand shading)
 * Zero WebGL / Three.js runtime overhead, pure static vector art.
 */

export function Icon3DWordPress({ className = '', size = 48 }: Icon3DProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="wp-sphere-light" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#8FCE3F" />
          <stop offset="40%" stopColor="#4F741B" />
          <stop offset="100%" stopColor="#253A0D" />
        </radialGradient>
        <linearGradient id="wp-bevel" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D9F99D" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#141714" stopOpacity="0.6" />
        </linearGradient>
        <filter id="wp-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="4" floodColor="#0A0F0A" floodOpacity="0.4" />
        </filter>
      </defs>
      <circle cx="32" cy="32" r="26" fill="url(#wp-sphere-light)" filter="url(#wp-shadow)" />
      <circle cx="32" cy="32" r="25.5" stroke="url(#wp-bevel)" strokeWidth="1" />
      <path
        d="M21 23L27.5 41L31 31L27 23H21ZM34.5 31L38 41L44.5 23H39L35 31L34.5 31ZM28.5 23L32 34L35.5 23H28.5Z"
        fill="#FFFFFF"
        fillOpacity="0.95"
      />
    </svg>
  );
}

export function Icon3DPlugin({ className = '', size = 48 }: Icon3DProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="plug-top" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#A3E635" />
          <stop offset="100%" stopColor="#65A30D" />
        </linearGradient>
        <linearGradient id="plug-left" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4F741B" />
          <stop offset="100%" stopColor="#304810" />
        </linearGradient>
        <linearGradient id="plug-right" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3D5A15" />
          <stop offset="100%" stopColor="#1E2E0A" />
        </linearGradient>
        <filter id="plug-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="8" stdDeviation="5" floodColor="#0A0F0A" floodOpacity="0.4" />
        </filter>
      </defs>
      <g filter="url(#plug-shadow)">
        {/* Isometric Cube Top Face */}
        <path d="M32 12L48 21L32 30L16 21L32 12Z" fill="url(#plug-top)" />
        {/* Left Face */}
        <path d="M16 21L32 30V48L16 39V21Z" fill="url(#plug-left)" />
        {/* Right Face */}
        <path d="M32 30L48 21V39L32 48V30Z" fill="url(#plug-right)" />
        {/* Prongs */}
        <path d="M24 16V8M40 16V8" stroke="#D9F99D" strokeWidth="3" strokeLinecap="round" />
        {/* Center Lightning Glow */}
        <path d="M33 24L29 32H33L31 38L37 30H33L35 24H33Z" fill="#FFFFFF" />
      </g>
    </svg>
  );
}

export function Icon3DTemplate({ className = '', size = 48 }: Icon3DProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="tpl-front" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#1E40AF" />
        </linearGradient>
        <linearGradient id="tpl-edge" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
        <filter id="tpl-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="2" dy="8" stdDeviation="4" floodColor="#0A0F0A" floodOpacity="0.4" />
        </filter>
      </defs>
      <g filter="url(#tpl-shadow)">
        {/* Back Plate */}
        <rect x="18" y="10" width="34" height="42" rx="6" fill="#1E293B" />
        {/* Middle Plate */}
        <rect x="14" y="14" width="34" height="42" rx="6" fill="url(#tpl-edge)" />
        {/* Front Plate */}
        <rect x="10" y="18" width="34" height="42" rx="6" fill="url(#tpl-front)" />
        <rect x="14" y="24" width="16" height="3" rx="1.5" fill="#93C5FD" />
        <rect x="14" y="30" width="26" height="2" rx="1" fill="#BFDBFE" fillOpacity="0.7" />
        <rect x="14" y="35" width="22" height="2" rx="1" fill="#BFDBFE" fillOpacity="0.7" />
        <rect x="14" y="44" width="10" height="10" rx="3" fill="#A3E635" />
      </g>
    </svg>
  );
}

export function Icon3DBundle({ className = '', size = 48 }: Icon3DProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="box-top" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#A3E635" />
          <stop offset="100%" stopColor="#84CC16" />
        </linearGradient>
        <linearGradient id="box-left" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4F741B" />
          <stop offset="100%" stopColor="#365314" />
        </linearGradient>
        <linearGradient id="box-right" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3F6212" />
          <stop offset="100%" stopColor="#1A2E05" />
        </linearGradient>
        <filter id="box-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#0A0F0A" floodOpacity="0.4" />
        </filter>
      </defs>
      <g filter="url(#box-shadow)">
        {/* Isometric Box */}
        <path d="M32 10L50 20L32 30L14 20L32 10Z" fill="url(#box-top)" />
        <path d="M14 20L32 30V50L14 40V20Z" fill="url(#box-left)" />
        <path d="M32 30L50 20V40L32 50V30Z" fill="url(#box-right)" />
        {/* Ribbon Stripe */}
        <path d="M29 12L47 22L44 24L26 14L29 12Z" fill="#FFFFFF" fillOpacity="0.8" />
        <path d="M26 14L32 17V37L26 34V14Z" fill="#FFFFFF" fillOpacity="0.6" />
      </g>
    </svg>
  );
}

export function Icon3DSpeed({ className = '', size = 48 }: Icon3DProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="speed-radial" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#FACC15" />
          <stop offset="60%" stopColor="#EAB308" />
          <stop offset="100%" stopColor="#CA8A04" />
        </radialGradient>
        <filter id="speed-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="5" floodColor="#CA8A04" floodOpacity="0.3" />
        </filter>
      </defs>
      <g filter="url(#speed-shadow)">
        <circle cx="32" cy="32" r="24" fill="#1C211C" stroke="#262B26" strokeWidth="2" />
        <path
          d="M18 38 A18 18 0 1 1 46 38"
          stroke="#4F741B"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M18 38 A18 18 0 0 1 42 20"
          stroke="#A3E635"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
        {/* Needle */}
        <line x1="32" y1="32" x2="42" y2="22" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="32" cy="32" r="4" fill="url(#speed-radial)" />
      </g>
    </svg>
  );
}

export function Icon3DEmptyBox({ className = '', size = 64 }: Icon3DProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="empty-top" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3F473F" />
          <stop offset="100%" stopColor="#242B24" />
        </linearGradient>
        <linearGradient id="empty-left" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#242B24" />
          <stop offset="100%" stopColor="#141714" />
        </linearGradient>
        <linearGradient id="empty-right" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1C211C" />
          <stop offset="100%" stopColor="#0B0D0B" />
        </linearGradient>
      </defs>
      {/* Box open top */}
      <path d="M40 18L64 30L40 42L16 30L40 18Z" fill="url(#empty-top)" />
      <path d="M16 30L40 42V66L16 54V30Z" fill="url(#empty-left)" />
      <path d="M40 42L64 30V54L40 66V42Z" fill="url(#empty-right)" />
      {/* Flaps */}
      <path d="M16 30L8 20L32 10L40 18L16 30Z" fill="#242B24" fillOpacity="0.8" />
      <path d="M64 30L72 20L48 10L40 18L64 30Z" fill="#1C211C" fillOpacity="0.8" />
    </svg>
  );
}
