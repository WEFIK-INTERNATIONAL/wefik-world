# 18 — Database & Release Apply Checklist

> Runbook for applying `005_remove_demo_products.sql` and `006_seed_real_products.sql`.
> Do **not** run these until owner questions in [16-owner-questions.md](file:///home/dayshift/Pictures/wefik-world/docs/audit/16-owner-questions.md) are answered.

## 1. Pre-flight Backup
1. Open Supabase Dashboard → Database → Backups and take a manual backup (or run `pg_dump` against the production connection string).
2. Run a read-only check on existing demo product dependencies before making changes:
   ```sql
   select p.slug,
     (select count(*) from public.order_items oi where oi.product_id = p.id) as orders,
     (select count(*) from public.licenses l where l.product_id = p.id) as licenses,
     (select count(*) from public.reviews r where r.product_id = p.id) as reviews
   from public.products p
   where p.slug in (
     'agencypro-theme',
     'superfast-cache-plugin',
     'saaspulse-nextjs-template',
     'minimal-portfolio-free',
     'agency-growth-bundle',
     'wp-licensing-sdk-snippet'
   );
   ```

## 2. Remove / Archive Demo Products
1. Run [005_remove_demo_products.sql](file:///home/dayshift/Pictures/wefik-world/supabase/migrations/005_remove_demo_products.sql) in the Supabase SQL Editor.
2. Verify all 6 demo slugs are either deleted or have `status = 'archived'`:
   ```sql
   select slug, status from public.products where status != 'published';
   ```

## 3. Capture & Upload Real Product Screenshots
1. Once owner provides the repos/URLs for **Site Checkup**, **KuraCode Extension**, and (if applicable) **weclip**:
   - Install and run each product locally.
   - Capture real screenshots (1600×1000 gallery WebP, 1200×630 OG, square thumbnail).
   - Store under `public/products/<slug>/` or upload to Supabase Storage.
2. Update `thumbnail_url` and `gallery_urls` in [006_seed_real_products.sql](file:///home/dayshift/Pictures/wefik-world/supabase/migrations/006_seed_real_products.sql).

## 4. Seed Real Products (Draft First)
1. Confirm pricing (`price_inr`, `is_free`), `status`, and delivery schema (`delivery_type` if adding non-zip products per [13-new-products-plan.md](file:///home/dayshift/Pictures/wefik-world/docs/audit/13-new-products-plan.md)).
2. Run `006_seed_real_products.sql` (inserts as `'draft'`).
3. Verify rows in `/admin` and flip `status = 'published'` only after screenshots, descriptions, and pricing are verified.

## 5. Rollback
If demo products were only archived (when dependencies existed), restore with:
```sql
update public.products set status = 'published' where slug in (...);
```
If deleted and needed back, restore from the pre-flight backup taken in Step 1.

