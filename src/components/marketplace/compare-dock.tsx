'use client';

import React from 'react';
import { useCompare } from '@/lib/compare-context';
import { Scale, X, ArrowRight, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SafeImage } from '@/components/ui/safe-image';

export function CompareDock() {
  const { compareItems, removeFromCompare, clearCompare, setIsCompareModalOpen } = useCompare();

  if (compareItems.length === 0) return null;

  return (
    <aside
      aria-label="Product Comparison Dock"
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-2xl bg-[var(--surface)]/95 backdrop-blur-md border border-[var(--border)] rounded-2xl shadow-2xl p-3 sm:p-4 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div className="flex items-center gap-3 overflow-hidden">
        <div className="w-9 h-9 rounded-xl bg-[var(--surface-2)] flex items-center justify-center text-[var(--accent)] border border-[var(--border)] shrink-0">
          <Scale className="w-4 h-4" />
        </div>

        <div className="hidden sm:block">
          <p className="text-xs font-bold text-[var(--text)]">
            Compare ({compareItems.length}/3)
          </p>
          <p className="text-[10px] text-[var(--muted)]">Side-by-side technical specs</p>
        </div>

        {/* Thumbnail items */}
        <div className="flex items-center gap-2">
          {compareItems.map((item) => (
            <div
              key={item.id}
              className="group relative w-10 h-10 rounded-lg overflow-hidden border border-[var(--border)] bg-[var(--surface-2)] shrink-0"
              title={item.title}
            >
              <SafeImage
                src={item.thumbnail_url}
                alt={item.title}
                fill
                sizes="40px"
                className="object-cover"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFromCompare(item.id);
                }}
                aria-label={`Remove ${item.title} from comparison`}
                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {/* Empty slot placeholder */}
          {Array.from({ length: 3 - compareItems.length }).map((_, idx) => (
            <div
              key={`empty-${idx}`}
              className="w-10 h-10 rounded-lg border border-dashed border-[var(--border)] bg-[var(--surface-2)]/50 hidden md:flex items-center justify-center text-[var(--muted)] text-[10px]"
            >
              +
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={clearCompare}
          className="h-8 px-2 text-xs text-[var(--muted)] hover:text-red-500 hover:bg-transparent"
        >
          <Trash2 className="w-3.5 h-3.5 mr-1" />
          <span className="hidden sm:inline">Clear</span>
        </Button>

        <Button
          size="sm"
          onClick={() => setIsCompareModalOpen(true)}
          className="h-8 px-3 rounded-xl bg-[var(--text)] hover:opacity-90 text-[var(--surface)] text-xs font-semibold flex items-center gap-1.5 shadow-sm"
        >
          <span>Compare Now</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </aside>
  );
}
