'use client';

import React from 'react';

interface MarketplaceFilterSelectProps {
  name: string;
  defaultValue: string;
  className?: string;
  children: React.ReactNode;
}

export function MarketplaceFilterSelect({
  name,
  defaultValue,
  className,
  children,
}: MarketplaceFilterSelectProps) {
  return (
    <select
      name={name}
      defaultValue={defaultValue}
      onChange={(e) => (e.target as HTMLSelectElement).form?.submit()}
      className={className}
    >
      {children}
    </select>
  );
}
