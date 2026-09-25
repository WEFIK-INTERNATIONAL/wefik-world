'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Code2, Check, Copy, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface FreebieMagnetKitProps {
  productTitle?: string;
  productSlug?: string;
}

export function FreebieMagnetKit({ productTitle, productSlug }: FreebieMagnetKitProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedBadge, setCopiedBadge] = useState(false);

  const title = productTitle || 'Free WordPress Themes & Plugins';
  const url = productSlug
    ? `https://wefik.world/products/${productSlug}`
    : 'https://wefik.world/freebies';

  const badgeHtml = `<a href="${url}?ref=badge" target="_blank" rel="noopener"><img src="https://wefik.world/badges/free-from-wefik.svg" alt="Free from Wefik.world" width="160" height="38" /></a>`;

  const copyUrl = () => {
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const copyBadgeSnippet = () => {
    navigator.clipboard.writeText(badgeHtml);
    setCopiedBadge(true);
    toast.success('Embed badge HTML copied!');
    setTimeout(() => setCopiedBadge(false), 2000);
  };

  const shareTwitter = () => {
    const text = encodeURIComponent(`Check out "${title}" — 100% free with genuine commercial license on @wefikworld!`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`, '_blank');
  };

  const shareLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(`Hey, check out this free digital product from Wefik World: ${title} → ${url}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="bg-soft/70 border border-border rounded-3xl p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-deep-green">
            Freebie Magnet & Sharing
          </span>
          <h3 className="text-base font-bold text-ink">Share or Embed on Your Site</h3>
          <p className="text-xs text-slate mt-0.5">
            Sharing helps support free, open-access tools for creators and agencies.
          </p>
        </div>

        {/* Social Share Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            onClick={shareTwitter}
            className="h-8 px-3 rounded-xl text-xs gap-1.5 border-border bg-[var(--surface)] hover:bg-soft"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            <span>X / Twitter</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={shareLinkedIn}
            className="h-8 px-3 rounded-xl text-xs gap-1.5 border-border bg-[var(--surface)] hover:bg-soft"
          >
            <svg className="w-3.5 h-3.5 fill-[#0A66C2]" viewBox="0 0 24 24">
              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.68 1.68 0 1 0-.02-3.36 1.68 1.68 0 0 0 .02 3.36M5.07 18.5h2.78v-8.37H5.07v8.37Z" />
            </svg>
            <span>LinkedIn</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={shareWhatsApp}
            className="h-8 px-3 rounded-xl text-xs gap-1.5 border-border bg-[var(--surface)] hover:bg-soft"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>WhatsApp</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={copyUrl}
            className="h-8 px-3 rounded-xl text-xs gap-1.5 border-border bg-[var(--surface)] hover:bg-soft font-semibold text-ink"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-deep-green" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
          </Button>
        </div>
      </div>

      {/* Embed Badge Box per Section 10 */}
      <div className="pt-4 border-t border-border/80 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-ink flex items-center gap-1.5">
            <Code2 className="w-3.5 h-3.5 text-deep-green" />
            Embed &quot;Free from wefik.world&quot; Badge on Your Blog or Site
          </span>
          <Button
            size="sm"
            onClick={copyBadgeSnippet}
            className="h-7 px-2.5 rounded-lg text-[11px] bg-ink hover:bg-black text-white font-semibold gap-1"
          >
            {copiedBadge ? <Check className="w-3 h-3 text-lime" /> : <Copy className="w-3 h-3" />}
            <span>{copiedBadge ? 'Copied HTML' : 'Copy Embed Code'}</span>
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 bg-[var(--surface)] p-3.5 rounded-2xl border border-[var(--border)]">
          {/* Badge Preview */}
          <div className="flex-shrink-0">
            <Image
              src="/badges/free-from-wefik.svg"
              alt="Free from Wefik.world preview badge"
              width={160}
              height={38}
              className="rounded-lg shadow-sm"
            />
          </div>

          <pre className="text-[11px] font-mono text-slate bg-soft p-2.5 rounded-xl overflow-x-auto w-full border border-border/60">
            {badgeHtml}
          </pre>
        </div>
      </div>
    </div>
  );
}
