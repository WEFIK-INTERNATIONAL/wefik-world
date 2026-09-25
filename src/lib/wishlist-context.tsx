'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface WishlistContextType {
  wishlistIds: string[];
  isWishlisted: (productId: string) => boolean;
  toggleWishlist: (product: { id: string; title: string }) => Promise<void>;
  count: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const WISHLIST_STORAGE_KEY = 'wefik_wishlist_ids_v1';

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = window.localStorage.getItem(WISHLIST_STORAGE_KEY);
      return stored ? (JSON.parse(stored) as string[]) : [];
    } catch {
      return [];
    }
  });
  const supabase = createClient();

  useEffect(() => {
    // If authenticated, fetch DB wishlist and merge
    const syncWithDb = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const { data: dbWishlists } = await supabase
        .from('wishlists')
        .select('product_id')
        .eq('user_id', session.user.id);

      if (dbWishlists && dbWishlists.length > 0) {
        const dbIds = dbWishlists.map((w: { product_id: string }) => w.product_id);
        setWishlistIds((prev) => {
          const merged = Array.from(new Set([...prev, ...dbIds]));
          try {
            localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(merged));
          } catch {
            // ignore
          }
          return merged;
        });
      }
    };

    syncWithDb();
  }, [supabase]);

  const isWishlisted = (productId: string) => {
    return wishlistIds.includes(productId);
  };

  const toggleWishlist = async (product: { id: string; title: string }) => {
    const currentlySaved = isWishlisted(product.id);
    const newIds = currentlySaved
      ? wishlistIds.filter((id) => id !== product.id)
      : [...wishlistIds, product.id];

    setWishlistIds(newIds);
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(newIds));
    } catch {
      // ignore
    }

    if (currentlySaved) {
      toast.info(`Removed ${product.title} from wishlist`);
    } else {
      toast.success(`Saved ${product.title} to wishlist`, {
        description: 'You will receive price-drop and major version release alerts.',
      });
    }

    // If authenticated, sync with Supabase
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        if (currentlySaved) {
          await supabase
            .from('wishlists')
            .delete()
            .eq('user_id', session.user.id)
            .eq('product_id', product.id);
        } else {
          await supabase
            .from('wishlists')
            .upsert(
              [{ user_id: session.user.id, product_id: product.id }],
              { onConflict: 'user_id,product_id' }
            );
        }
      }
    } catch {
      // Silently fall back to localStorage
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        isWishlisted,
        toggleWishlist,
        count: wishlistIds.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
