'use client';

import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

interface StatCounterProps {
  end: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
}

export function StatCounter({
  end,
  suffix = '',
  prefix = '',
  duration = 1.5,
  className = '',
}: StatCounterProps) {
  const [value, setValue] = useState(0);
  const elementRef = useRef<HTMLSpanElement | null>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      setValue(end);
      return;
    }

    const el = elementRef.current;
    if (!el || typeof window === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    const obj = { val: 0 };
    const tween = gsap.to(obj, {
      val: end,
      duration,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        once: true,
      },
      onUpdate: () => {
        setValue(Math.round(obj.val));
      },
    });

    return () => {
      tween.kill();
    };
  }, [end, duration, prefersReducedMotion]);

  return (
    <span ref={elementRef} className={`font-mono ${className}`}>
      {prefix}{value}{suffix}
    </span>
  );
}
