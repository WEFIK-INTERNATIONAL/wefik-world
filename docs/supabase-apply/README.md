# Supabase Apply Pack (`wefik.world`)

Ordered SQL scripts and manual dashboard steps to bring the live Supabase project in sync with the application.

> **IMPORTANT:** Do **NOT** run `01` through `05` until `00-diagnose-READONLY.sql` has been run and its output reviewed!

## Exact Order of Operations

1. **Back up the database** (see [MANUAL-CHECKLIST.md](./MANUAL-CHECKLIST.md#1-backups-do-before-any-changes)).
2. **Run diagnostics (read-only):**
   - Open Supabase SQL Editor -> run [`00-diagnose-READONLY.sql`](./00-diagnose-READONLY.sql).
   - Export/copy each result grid (without any personal data) and share it for review before applying any fix script.
3. **Apply fix scripts in order** (run the `VERIFICATION QUERY` in each file header after running the script):
   1. [`01-schema-alignment.sql`](./01-schema-alignment.sql) — aligns tables/columns & `products_public` view.
   2. [`02-auth-profiles-and-rls.sql`](./02-auth-profiles-and-rls.sql) — fixes `handle_new_user`, backfills missing profiles, prevents `role` self-escalation, enforces least-privilege RLS.
   3. [`03-storage-buckets-and-policies.sql`](./03-storage-buckets-and-policies.sql) — creates/updates `product-images`, `avatars`, and private `product-files` buckets + policies.
   4. [`04-cleanup-and-seed-products.sql`](./04-cleanup-and-seed-products.sql) — archives/deletes demo products and seeds real products as `draft`.
   5. [`05-extras-indexes-and-cron.sql`](./05-extras-indexes-and-cron.sql) — extensions, `search_path`-hardened helpers, indexes, and optional `pg_cron` reminder job.
   - *(Local scratch only)* [`99-rls-verification-test.sql`](./99-rls-verification-test.sql) — local-only rolled-back test proving RLS rules. **Do NOT run in production.**
4. **Complete the manual dashboard steps** in [`MANUAL-CHECKLIST.md`](./MANUAL-CHECKLIST.md) (Auth URLs, SMTP, OAuth, Edge Functions, Razorpay, Vercel, Advisors).
5. **Run the end-to-end smoke test** (Section 10 of `MANUAL-CHECKLIST.md`).

## Stop & Ask Conditions
Stop immediately and share the exact error/output (with any secrets redacted) if:
- `00-diagnose-READONLY.sql` shows unexpected tables or columns with live data not listed in [`INTENDED-STATE.md`](./INTENDED-STATE.md).
- Any `PRECONDITIONS` check fails.
- `04-cleanup-and-seed-products.sql` shows live `order_items` or `licenses` attached to a demo product and you are unsure whether to keep it archived.
- Any verification query returns a count other than the expected value.
- An Edge Function deploy or smoke-test step returns `401`, `403`, or `500`.
