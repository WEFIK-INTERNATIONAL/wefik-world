'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type CartLicenseType = 'single' | 'unlimited';

export interface CartItem {
  productId: string;
  title: string;
  slug: string;
  thumbnailUrl: string;
  licenseType: CartLicenseType;
  pricePaise: number;
  singlePricePaise: number;
  unlimitedPricePaise: number;
  isFree?: boolean;
}

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  addItem: (item: Omit<CartItem, 'pricePaise'> & { pricePaise?: number }) => void;
  removeItem: (productId: string) => void;
  updateLicense: (productId: string, licenseType: CartLicenseType) => void;
  clearCart: () => void;
  totalPaise: number;
  totalCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'wefik_cart_v1';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from local storage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load cart from storage', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      } catch (e) {
        console.error('Failed to save cart to storage', e);
      }
    }
  }, [items, isLoaded]);

  const addItem = (item: Omit<CartItem, 'pricePaise'> & { pricePaise?: number }) => {
    setItems((prev) => {
      // If already in cart, don't duplicate; update license if requested
      const existing = prev.find((i) => i.productId === item.productId);
      const price =
        item.pricePaise !== undefined
          ? item.pricePaise
          : item.licenseType === 'unlimited'
          ? item.unlimitedPricePaise
          : item.singlePricePaise;

      if (existing) {
        return prev.map((i) =>
          i.productId === item.productId
            ? {
                ...i,
                licenseType: item.licenseType,
                pricePaise: price,
              }
            : i
        );
      }

      return [
        ...prev,
        {
          ...item,
          pricePaise: price,
        },
      ];
    });
    setIsOpen(true);
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  const updateLicense = (productId: string, licenseType: CartLicenseType) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.productId === productId) {
          const newPrice =
            licenseType === 'unlimited'
              ? item.unlimitedPricePaise
              : item.singlePricePaise;
          return { ...item, licenseType, pricePaise: newPrice };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalPaise = items.reduce((sum, item) => sum + item.pricePaise, 0);
  const totalCount = items.length;

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        setIsOpen,
        addItem,
        removeItem,
        updateLicense,
        clearCart,
        totalPaise,
        totalCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
