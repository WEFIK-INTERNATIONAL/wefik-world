'use client';

import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { useLenis } from '@/components/providers/smooth-scroll-provider';

export function BackToTop() {
  const [visible, setVisible] = useState(false);
  const { scrollTo } = useLenis();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleScroll = () => {
      setVisible(window.scrollY > 600);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => scrollTo(0)}
      aria-label="Scroll back to top of page"
      className="fixed bottom-6 right-6 z-40 w-11 h-11 rounded-2xl bg-[#202124] hover:bg-black text-white border border-white/15 shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 group focus-visible:ring-2 focus-visible:ring-lime"
    >
      <ArrowUp className="w-4 h-4 text-lime group-hover:-translate-y-0.5 transition-transform" />
    </button>
  );
}
