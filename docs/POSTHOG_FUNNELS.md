# PostHog Organic Landing → Purchase Funnel Documentation

*Configured Project ID:* `621174` (US Cloud)  
*PostHog Public Key:* `phc_BRibATTSAbDhKWhhEqjs4FdHeNgTfp3EbEuUWP5F2VuC`  
*Target Spec:* Section 11 — Organic Landing → Product View → Add to Cart → Purchase Attribution

---

## 1. Funnel Architecture

The conversion funnel tracks how organic search traffic converts into completed transactions:

```
[ Step 1: Content Landed ]
   Event: `content_landed` (or `$pageview`)
   Properties: `landing_path`, `referrer`, `is_organic: true`
          │
          ▼
[ Step 2: Product Viewed ]
   Event: `product_viewed`
   Properties: `product_id`, `product_name`, `price_inr`, `slug`
          │
          ▼
[ Step 3: Added to Cart ]
   Event: `add_to_cart`
   Properties: `product_id`, `product_name`, `price_inr`, `license_type`
          │
          ▼
[ Step 4: Checkout Initiated ]
   Event: `checkout_initiated`
   Properties: `items_count`, `total_amount`, `currency`
          │
          ▼
[ Step 5: Order Paid (Revenue Attribution) ]
   Event: `order_paid`
   Properties: `order_id`, `total_amount`, `attributed_landing_path`, `attributed_is_organic`
```

---

## 2. PostHog Insights Configuration

In the PostHog Dashboard (`https://us.i.posthog.com`):

1. Go to **Insights > New Insight > Funnels**.
2. Add the 5 steps:
   * Step 1: `content_landed`
   * Step 2: `product_viewed`
   * Step 3: `add_to_cart`
   * Step 4: `checkout_initiated`
   * Step 5: `order_paid`
3. Breakdown by: `attributed_landing_path`.
4. Result: Directly reveals which programmatic pages (`/alternatives/elementor/`, `/wordpress-themes/for-agencies/`, `/themeforest-alternative`) drive actual revenue and conversions.
