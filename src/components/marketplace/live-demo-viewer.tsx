'use client';

import React, { useState } from 'react';
import { ProductData } from '@/lib/data/products';
import {
  Monitor,
  Tablet,
  Smartphone,
  ExternalLink,
  ShoppingBag,
  RotateCcw,
  X,
  Maximize2,
  Minimize2,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/lib/cart-context';
import { toast } from 'sonner';

type DeviceMode = 'desktop' | 'tablet' | 'mobile';

interface LiveDemoViewerProps {
  product: ProductData;
  isOpen: boolean;
  onClose: () => void;
}

export function LiveDemoViewer({ product, isOpen, onClose }: LiveDemoViewerProps) {
  const [device, setDevice] = useState<DeviceMode>('desktop');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const { addItem } = useCart();

  if (!isOpen) return null;

  const demoUrl =
    product.demo_url ||
    `https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1400`;

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      title: product.title,
      slug: product.slug,
      thumbnailUrl: product.thumbnail_url,
      licenseType: 'single',
      singlePricePaise: product.price_inr,
      unlimitedPricePaise: Math.round((product.price_inr * 2.5) / 100) * 100,
      isFree: product.is_free,
    });
    toast.success(`Added ${product.title} to cart`);
  };

  const handleReload = () => {
    setIframeKey((prev) => prev + 1);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${product.title} Live Demo Preview`}
      className="fixed inset-0 z-[100] flex flex-col bg-[#111315] text-white animate-in fade-in duration-200"
    >
      {/* Top Demo Header Bar */}
      <header className="h-16 px-4 bg-[#181a1d] border-b border-[#282b30] flex items-center justify-between gap-3 shrink-0">
        {/* Left: Product Info & Category */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onClose}
            aria-label="Exit live preview"
            className="w-9 h-9 rounded-xl bg-[#22252a] hover:bg-[#2e3238] border border-[#343840] flex items-center justify-center text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="truncate">
            <div className="flex items-center gap-2">
              <h2 className="text-xs sm:text-sm font-bold text-white truncate">
                {product.title}
              </h2>
              {product.category && (
                <Badge className="bg-[#282b30] text-slate-300 border-0 text-[10px] hidden sm:inline-flex">
                  {product.category.name}
                </Badge>
              )}
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">
              Interactive Live Demo Sandbox
            </p>
          </div>
        </div>

        {/* Center: Device Frame Switcher & URL Bar */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#111315] p-1 rounded-xl border border-[#282b30]">
            <button
              onClick={() => setDevice('desktop')}
              aria-label="Desktop preview mode"
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                device === 'desktop'
                  ? 'bg-lime text-black font-bold shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Desktop</span>
            </button>

            <button
              onClick={() => setDevice('tablet')}
              aria-label="Tablet preview mode"
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                device === 'tablet'
                  ? 'bg-lime text-black font-bold shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Tablet className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Tablet</span>
            </button>

            <button
              onClick={() => setDevice('mobile')}
              aria-label="Mobile phone preview mode"
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                device === 'mobile'
                  ? 'bg-lime text-black font-bold shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Mobile</span>
            </button>
          </div>

          {/* Simulated URL pill */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#111315] border border-[#282b30] text-[11px] text-slate-400 font-mono">
            <Lock className="w-3 h-3 text-lime" />
            <span className="text-slate-300">demo.wefik.world</span>
            <span>/{product.slug}</span>
          </div>

          <button
            onClick={handleReload}
            aria-label="Reload preview"
            className="w-8 h-8 rounded-lg bg-[#22252a] hover:bg-[#2e3238] flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {product.demo_url && (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="h-9 px-3 rounded-xl border-[#343840] text-slate-200 hover:bg-[#282b30] text-xs hidden sm:inline-flex"
            >
              <a href={product.demo_url} target="_blank" rel="noreferrer">
                <span>Open New Tab</span>
                <ExternalLink className="w-3 h-3 ml-1.5" />
              </a>
            </Button>
          )}

          <button
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            className="w-9 h-9 rounded-xl bg-[#22252a] hover:bg-[#2e3238] border border-[#343840] hidden sm:flex items-center justify-center text-slate-300 hover:text-white transition-colors"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <Button
            size="sm"
            onClick={handleAddToCart}
            className="h-9 px-4 rounded-xl bg-lime hover:bg-lime/90 text-black font-extrabold text-xs flex items-center gap-1.5 shadow-md"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>
              {product.is_free
                ? 'Claim Free'
                : `Buy — ₹${(product.price_inr / 100).toLocaleString('en-IN')}`}
            </span>
          </Button>
        </div>
      </header>

      {/* Main Preview Canvas Area */}
      <main className="flex-1 overflow-auto bg-[#0a0b0d] p-2 sm:p-6 flex items-center justify-center">
        {device === 'desktop' && (
          <div className="w-full h-full max-w-[1400px] bg-[var(--surface)] rounded-2xl overflow-hidden shadow-2xl border border-[#282b30] flex flex-col">
            <div className="h-7 bg-[#1c1e22] px-3 flex items-center gap-2 border-b border-[#282b30]">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
              <span className="text-[10px] text-slate-400 font-mono ml-2">Desktop Viewport — 100%</span>
            </div>
            <iframe
              key={`desktop-${iframeKey}`}
              src={demoUrl}
              title={`${product.title} Desktop Live Demo`}
              className="w-full flex-1 border-0 bg-[var(--surface)]"
              sandbox="allow-scripts allow-same-origin allow-forms"
            />
          </div>
        )}

        {device === 'tablet' && (
          <div className="w-[768px] h-[92%] bg-[#1a1c20] rounded-[36px] p-4 shadow-2xl border-4 border-[#32363e] flex flex-col">
            <div className="w-12 h-1 bg-[#32363e] rounded-full mx-auto mb-3" />
            <div className="w-full flex-1 rounded-[24px] overflow-hidden bg-[var(--surface)]">
              <iframe
                key={`tablet-${iframeKey}`}
                src={demoUrl}
                title={`${product.title} Tablet Live Demo`}
                className="w-full h-full border-0 bg-[var(--surface)]"
                sandbox="allow-scripts allow-same-origin allow-forms"
              />
            </div>
            <div className="w-8 h-8 rounded-full border border-[#32363e] mx-auto mt-2" />
          </div>
        )}

        {device === 'mobile' && (
          <div className="w-[375px] h-[95%] max-h-[812px] bg-[#1a1c20] rounded-[48px] p-3.5 shadow-2xl border-4 border-[#32363e] flex flex-col relative">
            {/* Speaker & Camera notch */}
            <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-5 bg-[#0e0f12] rounded-full z-20 flex items-center justify-center gap-2">
              <div className="w-8 h-1 bg-[#282b30] rounded-full" />
              <div className="w-2 h-2 rounded-full bg-[#1c1e22]" />
            </div>

            <div className="w-full flex-1 rounded-[36px] overflow-hidden bg-[var(--surface)] mt-1">
              <iframe
                key={`mobile-${iframeKey}`}
                src={demoUrl}
                title={`${product.title} Mobile Live Demo`}
                className="w-full h-full border-0 bg-[var(--surface)]"
                sandbox="allow-scripts allow-same-origin allow-forms"
              />
            </div>

            {/* Home indicator bar */}
            <div className="w-28 h-1 bg-[#4a505b] rounded-full mx-auto mt-2.5" />
          </div>
        )}
      </main>
    </div>
  );
}
