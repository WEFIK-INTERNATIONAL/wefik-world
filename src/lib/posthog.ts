import posthog from 'posthog-js';

const POSTHOG_KEY =
  process.env.NEXT_PUBLIC_POSTHOG_KEY || 'phc_BRibATTSAbDhKWhhEqjs4FdHeNgTfp3EbEuUWP5F2VuC';
const POSTHOG_HOST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';

let posthogInitialized = false;

export function initPostHog() {
  if (typeof window !== 'undefined' && !posthogInitialized && POSTHOG_KEY) {
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      person_profiles: 'identified_only',
      capture_pageview: false, // captured manually in provider with Next.js pathname
      capture_pageleave: true,
      defaults: '2026-05-30',
    });
    posthogInitialized = true;
  }
  return posthog;
}

// Funnel tracking helpers
export const analytics = {
  trackProductView: (product: { id: string; title: string; price_inr: number; slug: string }) => {
    if (typeof window !== 'undefined') {
      posthog.capture('product_viewed', {
        product_id: product.id,
        product_name: product.title,
        price_inr: product.price_inr,
        slug: product.slug,
      });
    }
  },

  trackAddToCart: (product: { id: string; title: string; price_inr: number; license_type?: string }) => {
    if (typeof window !== 'undefined') {
      posthog.capture('add_to_cart', {
        product_id: product.id,
        product_name: product.title,
        price_inr: product.price_inr,
        license_type: product.license_type || 'standard',
      });
    }
  },

  trackCheckoutInitiated: (data: { items_count: number; total_amount: number; currency: string }) => {
    if (typeof window !== 'undefined') {
      posthog.capture('checkout_initiated', {
        items_count: data.items_count,
        total_amount: data.total_amount,
        currency: data.currency,
      });
    }
  },

  // Section 11: Track organic content landing with attribution
  trackContentLanding: (data: { path: string; referrer?: string }) => {
    if (typeof window !== 'undefined') {
      const ref = data.referrer || document.referrer || '';
      const isOrganic = /google|bing|yahoo|duckduckgo|ecosia|yandex|baidu/i.test(ref);
      
      // Store in session storage for order attribution
      if (!sessionStorage.getItem('wfk_first_touch_path')) {
        sessionStorage.setItem('wfk_first_touch_path', data.path);
        sessionStorage.setItem('wfk_first_touch_referrer', ref);
        sessionStorage.setItem('wfk_is_organic', isOrganic ? 'true' : 'false');
      }

      posthog.capture('content_landed', {
        landing_path: data.path,
        referrer: ref,
        is_organic: isOrganic,
      });
    }
  },

  trackOrderPaid: (data: { order_id: string; total_amount: number; currency: string; items_count: number }) => {
    if (typeof window !== 'undefined') {
      const attributedPath = sessionStorage.getItem('wfk_first_touch_path') || 'direct';
      const attributedRef = sessionStorage.getItem('wfk_first_touch_referrer') || '';
      const isOrganic = sessionStorage.getItem('wfk_is_organic') === 'true';

      posthog.capture('order_paid', {
        order_id: data.order_id,
        total_amount: data.total_amount,
        currency: data.currency,
        items_count: data.items_count,
        attributed_landing_path: attributedPath,
        attributed_referrer: attributedRef,
        attributed_is_organic: isOrganic,
      });
    }
  },

  identifyUser: (userId: string, email?: string) => {
    if (typeof window !== 'undefined') {
      posthog.identify(userId, email ? { email } : undefined);
    }
  },

  resetUser: () => {
    if (typeof window !== 'undefined') {
      posthog.reset();
    }
  },
};

export default posthog;
