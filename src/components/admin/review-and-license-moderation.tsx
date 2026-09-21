'use client';

import React, { useState } from 'react';
import { Star, Trash2, ShieldAlert, Check, Loader2, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

interface ReviewItem {
  id: string;
  rating: number;
  title: string;
  comment: string;
  created_at: string;
  product_title: string;
  user_email: string;
}

export function ReviewAndLicenseModeration({ initialReviews }: { initialReviews: ReviewItem[] }) {
  const [reviews, setReviews] = useState(initialReviews);
  const [revokeKey, setRevokeKey] = useState('');
  const [revoking, setRevoking] = useState(false);

  const supabase = createClient();

  const handleDeleteReview = async (id: string) => {
    try {
      const { error } = await supabase.from('reviews').delete().eq('id', id);
      if (error) throw error;

      setReviews((prev) => prev.filter((r) => r.id !== id));
      toast.success('Review deleted from public catalog');
    } catch {
      toast.error('Failed to delete review');
    }
  };

  const handleRevokeLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    const key = revokeKey.trim().toUpperCase();
    if (!key) return;

    setRevoking(true);
    try {
      const { data, error } = await (supabase as any)
        .from('licenses')
        .update({ status: 'revoked' })
        .eq('license_key', key)
        .select('*');

      if (error || !data || data.length === 0) {
        toast.error('License key not found.');
      } else {
        toast.success(`License key ${key} has been revoked successfully.`);
        setRevokeKey('');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to revoke';
      toast.error(msg);
    } finally {
      setRevoking(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* License Revocation Box */}
      <div className="bg-soft p-6 sm:p-8 rounded-3xl border border-border space-y-4">
        <div className="flex items-center gap-2 text-ink">
          <ShieldAlert className="w-5 h-5 text-error" />
          <h3 className="text-sm font-bold">Emergency License Revocation</h3>
        </div>
        <p className="text-xs text-slate max-w-lg">
          Revoking a license key immediately blocks all future download URL generation and rejects plugin update validation queries.
        </p>

        <form onSubmit={handleRevokeLicense} className="flex gap-2 max-w-md">
          <Input
            type="text"
            placeholder="WFK-XXXX-XXXX-XXXX"
            value={revokeKey}
            onChange={(e) => setRevokeKey(e.target.value)}
            required
            className="h-10 text-xs uppercase font-mono rounded-xl bg-white"
          />
          <Button
            type="submit"
            disabled={revoking}
            className="h-10 px-4 bg-error hover:bg-error/90 text-white text-xs font-bold rounded-xl flex-shrink-0"
          >
            {revoking ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : null}
            Revoke Key
          </Button>
        </form>
      </div>

      {/* Reviews Moderation Table */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-ink">Published Customer Reviews ({reviews.length})</h3>

        {reviews.length === 0 ? (
          <p className="text-xs text-slate py-4">No reviews awaiting moderation.</p>
        ) : (
          <div className="space-y-3 divide-y divide-border">
            {reviews.map((r) => (
              <div key={r.id} className="pt-3 first:pt-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-ink">{r.product_title}</span>
                    <div className="flex text-amber-400">
                      {[...Array(r.rating)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-slate font-medium">{r.title}: &quot;{r.comment}&quot;</p>
                  <span className="text-[11px] text-slate/70">Author: {r.user_email}</span>
                </div>

                <Button
                  onClick={() => handleDeleteReview(r.id)}
                  size="sm"
                  variant="outline"
                  className="text-error border-error/20 hover:bg-error/10 text-xs h-8 rounded-lg"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  Remove
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
