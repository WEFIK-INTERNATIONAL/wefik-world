'use client';

import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useMotionGates } from '@/hooks/use-reduced-motion';
import { MOTION_DURATION, MOTION_EASE } from '@/lib/motion';

interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  strength?: number; // Distance multiplier (default: 0.3)
  className?: string;
  onClick?: () => void;
}

export function MagneticButton({
  children,
  strength = 0.3,
  className = '',
  onClick,
  ...props
}: MagneticButtonProps) {
  const buttonRef = useRef<HTMLDivElement | null>(null);
  const { disableHeavyMotion } = useMotionGates();

  useEffect(() => {
    const el = buttonRef.current;
    if (!el || disableHeavyMotion || typeof window === 'undefined') return;

    // Only enable magnetic pull on desktop devices with hover support
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const xTo = gsap.quickTo(el, 'x', { duration: MOTION_DURATION.base, ease: MOTION_EASE.out });
    const yTo = gsap.quickTo(el, 'y', { duration: MOTION_DURATION.base, ease: MOTION_EASE.out });

    let cachedRect: DOMRect | null = null;
    const handleMouseEnter = () => {
      cachedRect = el.getBoundingClientRect();
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = cachedRect || el.getBoundingClientRect();
      cachedRect = rect;
      const x = (e.clientX - (rect.left + rect.width / 2)) * strength;
      const y = (e.clientY - (rect.top + rect.height / 2)) * strength;

      xTo(x);
      yTo(y);
    };

    const handleMouseLeave = () => {
      cachedRect = null;
      xTo(0);
      yTo(0);
    };

    el.addEventListener('mouseenter', handleMouseEnter);
    el.addEventListener('mousemove', handleMouseMove);
    el.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      el.removeEventListener('mouseenter', handleMouseEnter);
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('mouseleave', handleMouseLeave);
      gsap.killTweensOf(el);
    };
  }, [strength, disableHeavyMotion]);

  return (
    <div
      ref={buttonRef}
      onClick={onClick}
      className={`inline-block will-change-transform ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
