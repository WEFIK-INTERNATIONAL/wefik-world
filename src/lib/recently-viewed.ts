'use client';

import { useState, useEffect } from 'react';
import { ProductData } from '@/lib/data/products';

const RECENTLY_VIEWED_KEY = 'wefik_recently_viewed_v1';
const MAX_RECENTLY_VIEWED = 8;

export function recordProductView(product: ProductData) {
  if (typeof window === 'undefined' || !product || !product.id) return;
  try {
    const raw = localStorage.getItem(RECENTLY_VIEWED_KEY);
    const existing: ProductData[] = raw ? JSON.parse(raw) : [];
    const filtered = existing.filter((item) => item.id !== product.id);
    const updated = [product, ...filtered].slice(0, MAX_RECENTLY_VIEWED);
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

export function useRecentlyViewed(excludeProductId?: string) {
  const [items, setItems] = useState<ProductData[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENTLY_VIEWED_KEY);
      if (raw) {
        const parsed: ProductData[] = JSON.parse(raw);
        const filtered = excludeProductId
          ? parsed.filter((item) => item.id !== excludeProductId)
          : parsed;
        setItems(filtered);
      }
    } catch {
      // ignore
    }
  }, [excludeProductId]);

  return items;
}
