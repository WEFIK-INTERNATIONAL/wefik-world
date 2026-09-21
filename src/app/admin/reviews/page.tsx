import React from 'react';
import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { ReviewAndLicenseModeration } from '@/components/admin/review-and-license-moderation';
import { MessageSquare } from 'lucide-react';

export const metadata = {
  title: 'Review Moderation & License Revocation — Admin',
};

export default async function AdminReviewsPage() {
  await requireAdmin();
  const supabase = await createClient();

  const { data: reviews } = await supabase
    .from('reviews')
    .select(`
      id,
      rating,
      title,
      comment,
      created_at,
      product:products(title),
      user:profiles(email)
    `)
    .order('created_at', { ascending: false });

  const formattedReviews = (reviews || []).map((r: any) => ({
    id: r.id,
    rating: r.rating,
    title: r.title || 'Review',
    comment: r.comment,
    created_at: r.created_at,
    product_title: r.product?.title || 'Product',
    user_email: r.user?.email || 'Anonymous Buyer',
  }));

  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-border shadow-xs space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div>
          <h1 className="text-xl font-black text-ink tracking-tight flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-deep-green" />
            <span>Reviews Moderation & License Revocation</span>
          </h1>
          <p className="text-xs text-slate mt-1">
            Moderate public customer feedback and revoke compromised or refunded license credentials.
          </p>
        </div>
      </div>

      <ReviewAndLicenseModeration initialReviews={formattedReviews} />
    </div>
  );
}
