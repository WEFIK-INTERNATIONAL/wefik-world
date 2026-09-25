'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Copy,
  Check,
  Download,
  KeyRound,
  ShieldCheck,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

interface OrderSuccessItem {
  id: string;
  product_id: string;
  title: string;
  license_type: string;
  price_inr: number;
  license_key?: string;
}

interface OrderSuccessViewProps {
  order: {
    id: string;
    amount_inr: number;
    created_at: string;
    items: OrderSuccessItem[];
  };
}

export function OrderSuccessView({ order }: OrderSuccessViewProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const supabase = createClient();

  const handleCopy = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    toast.success('License key copied to clipboard!');
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleDownload = async (productId: string, title: string) => {
    setDownloadingId(productId);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        toast.error('Session expired. Please sign in again.');
        return;
      }

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co';
      const res = await fetch(`${supabaseUrl}/functions/v1/download-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ product_id: productId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate download URL');
      }

      toast.success(`Download starting for ${title}`);
      window.location.href = data.download_url;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Download failed';
      toast.error(msg);
    } finally {
      setDownloadingId(null);
    }
  };

  const formattedTotal = (order.amount_inr / 100).toLocaleString('en-IN');

  return (
    <div className="max-w-3xl mx-auto space-y-10">
      {/* Header Badge & Title */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-lime/20 text-deep-green flex items-center justify-center mx-auto border border-lime/40">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <span className="text-xs font-bold uppercase tracking-wider text-deep-green">
          Payment Confirmed
        </span>
        <h1 className="text-3xl font-extrabold text-ink tracking-tight">
          Thank you for your purchase!
        </h1>
        <p className="text-xs sm:text-sm text-slate max-w-md mx-auto">
          Your order has been verified. Your commercial license keys and private download files are available below.
        </p>
      </div>

      {/* Order Meta Card */}
      <div className="bg-soft p-6 rounded-2xl border border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
        <div>
          <span className="text-slate uppercase block font-semibold text-[10px]">Order ID</span>
          <span className="font-mono text-ink font-bold">{order.id}</span>
        </div>
        <div>
          <span className="text-slate uppercase block font-semibold text-[10px]">Date</span>
          <span className="font-medium text-ink">
            {new Date(order.created_at).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </span>
        </div>
        <div>
          <span className="text-slate uppercase block font-semibold text-[10px]">Amount Paid</span>
          <span className="text-base font-black text-deep-green">₹{formattedTotal}</span>
        </div>
      </div>

      {/* Purchased Items & License Keys */}
      <div className="bg-[var(--surface)] p-6 sm:p-8 rounded-3xl border border-border shadow-xs space-y-6">
        <h2 className="text-base font-bold text-ink pb-3 border-b border-border flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-deep-green" />
          <span>Your Products & License Keys</span>
        </h2>

        <div className="space-y-6 divide-y divide-border/80">
          {order.items.map((item) => (
            <div key={item.id} className="pt-6 first:pt-0 space-y-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <h3 className="text-sm font-bold text-ink">{item.title}</h3>
                  <span className="text-[11px] font-semibold text-slate uppercase">
                    {item.license_type === 'unlimited' ? 'Unlimited Sites License' : 'Single Site License'}
                  </span>
                </div>

                <Button
                  onClick={() => handleDownload(item.product_id, item.title)}
                  disabled={downloadingId === item.product_id}
                  size="sm"
                  className="bg-ink hover:bg-black text-white text-xs h-9 px-4 rounded-xl font-semibold flex items-center gap-1.5"
                >
                  {downloadingId === item.product_id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  <span>Download Files</span>
                </Button>
              </div>

              {/* License Key Box */}
              {item.license_key && (
                <div className="bg-soft p-3 rounded-xl border border-border flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase font-bold text-slate block leading-tight">
                      License Key
                    </span>
                    <span className="font-mono text-xs font-bold text-ink truncate block">
                      {item.license_key}
                    </span>
                  </div>

                  <button
                    onClick={() => handleCopy(item.license_key!)}
                    className="p-1.5 rounded-lg bg-[var(--surface)] border border-border text-slate hover:text-ink hover:border-slate transition-colors flex-shrink-0"
                    aria-label="Copy license key"
                  >
                    {copiedKey === item.license_key ? (
                      <Check className="w-4 h-4 text-deep-green" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <Button asChild className="w-full sm:w-auto h-11 px-6 rounded-xl bg-deep-green hover:bg-deep-green/90 text-white font-semibold text-xs">
          <Link href="/dashboard" className="flex items-center gap-1.5">
            <span>Go to Customer Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
        <Button asChild variant="outline" className="w-full sm:w-auto h-11 px-6 rounded-xl border-border text-slate hover:text-ink text-xs font-semibold">
          <Link href="/marketplace">Continue Shopping</Link>
        </Button>
      </div>

      <div className="flex items-center justify-center gap-1.5 text-xs text-slate">
        <ShieldCheck className="w-4 h-4 text-deep-green" />
        <span>A purchase receipt with license credentials has also been sent to your email.</span>
      </div>
    </div>
  );
}
