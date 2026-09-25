'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ProductData } from '@/lib/data/products';
import { toast } from 'sonner';

interface CompareContextType {
  compareItems: ProductData[];
  addToCompare: (product: ProductData) => void;
  removeFromCompare: (productId: string) => void;
  toggleCompare: (product: ProductData) => void;
  clearCompare: () => void;
  isInCompare: (productId: string) => boolean;
  isCompareModalOpen: boolean;
  setIsCompareModalOpen: (open: boolean) => void;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

const COMPARE_STORAGE_KEY = 'wefik_compare_items_v1';
const MAX_COMPARE_ITEMS = 3;

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [compareItems, setCompareItems] = useState<ProductData[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(COMPARE_STORAGE_KEY);
      if (stored) {
        setCompareItems(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  const saveItems = (items: ProductData[]) => {
    setCompareItems(items);
    try {
      localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore
    }
  };

  const addToCompare = (product: ProductData) => {
    if (compareItems.some((item) => item.id === product.id)) {
      toast.info(`${product.title} is already in comparison`);
      return;
    }

    if (compareItems.length >= MAX_COMPARE_ITEMS) {
      toast.warning(`You can compare up to ${MAX_COMPARE_ITEMS} products at once`, {
        description: 'Remove an item from comparison first to add this one.',
      });
      return;
    }

    const updated = [...compareItems, product];
    saveItems(updated);
    toast.success(`Added ${product.title} to comparison`, {
      action: {
        label: 'View Compare',
        onClick: () => setIsCompareModalOpen(true),
      },
    });
  };

  const removeFromCompare = (productId: string) => {
    const updated = compareItems.filter((item) => item.id !== productId);
    saveItems(updated);
  };

  const toggleCompare = (product: ProductData) => {
    if (isInCompare(product.id)) {
      removeFromCompare(product.id);
      toast.info(`Removed ${product.title} from comparison`);
    } else {
      addToCompare(product);
    }
  };

  const clearCompare = () => {
    saveItems([]);
  };

  const isInCompare = (productId: string) => {
    return compareItems.some((item) => item.id === productId);
  };

  return (
    <CompareContext.Provider
      value={{
        compareItems,
        addToCompare,
        removeFromCompare,
        toggleCompare,
        clearCompare,
        isInCompare,
        isCompareModalOpen,
        setIsCompareModalOpen,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
}
