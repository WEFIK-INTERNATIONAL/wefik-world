'use client';

import React from 'react';
import Link, { LinkProps } from 'next/link';
import { usePageTransition } from './transition-provider';
import { useLenis } from '@/components/providers/smooth-scroll-provider';

interface TransitionLinkProps extends LinkProps {
  children: React.ReactNode;
  className?: string;
  target?: string;
  rel?: string;
  id?: string;
  title?: string;
  'aria-label'?: string;
}

export function TransitionLink({
  href,
  children,
  className,
  target,
  rel,
  id,
  title,
  'aria-label': ariaLabel,
  ...props
}: TransitionLinkProps) {
  const { navigate } = usePageTransition();
  const { scrollTo } = useLenis();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const hrefStr = href.toString();

    // Guard: External links, new tabs, or modified clicks (meta/ctrl/shift)
    if (
      target === '_blank' ||
      hrefStr.startsWith('http://') ||
      hrefStr.startsWith('https://') ||
      hrefStr.startsWith('mailto:') ||
      hrefStr.startsWith('tel:') ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey
    ) {
      return; // Allow standard browser behavior
    }

    // Guard: Same-page anchor links (use lenis.scrollTo)
    if (hrefStr.startsWith('#')) {
      e.preventDefault();
      scrollTo(hrefStr);
      return;
    }

    // Internal navigation through custom cinematic transition
    e.preventDefault();
    navigate(hrefStr);
  };

  return (
    <Link
      href={href}
      className={className}
      target={target}
      rel={rel}
      id={id}
      title={title}
      aria-label={ariaLabel}
      onClick={handleClick}
      {...props}
    >
      {children}
    </Link>
  );
}
