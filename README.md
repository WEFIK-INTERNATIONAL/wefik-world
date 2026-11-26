# wefik.world

Digital products marketplace built with Next.js App Router, Supabase (Postgres, Auth, Storage, Deno Edge Functions), Razorpay, Upstash Redis, and Sanity CMS.

## Local Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env.local` and fill in your environment values.
3. Start the development server:
   ```bash
   npm run dev
   ```

## Environment Variables (Names Only)

### Public (`NEXT_PUBLIC_*`)
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_RAZORPAY_KEY_ID`
- `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_VAPID_KEY`
- `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_GSC_VERIFICATION`, `NEXT_PUBLIC_BING_VERIFICATION`

### Server & Edge Functions
- `SUPABASE_SERVICE_ROLE_KEY`
- `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `RAZORPAY_MONTHLY_PLAN_ID`
- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `REDIS_URL`
- `RESEND_API_KEY`, `REVALIDATION_SECRET`, `CRON_SECRET`
- `SANITY_API_TOKEN`, `SANITY_WEBHOOK_SECRET`
- `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `CLOUDINARY_URL`
- `FCM_SERVICE_ACCOUNT_JSON`, `SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN`
- `POSTHOG_PROJECT_ID`, `GEMINI_API_KEY`, `GROQ_API_KEY`

## Scripts

- `npm run dev` — start Next.js development server
- `npm run build` — production build
- `npm run typecheck` — TypeScript check (`tsc --noEmit`)
- `npm run lint` — ESLint (`--max-warnings=0`)
- `npm test` — run all test suites in `tests/`
- `npm run check:secrets` — scan repository for leaked secrets
- `npm run lint:theme` — verify CSS token usage

## Deployment

- **Web app:** Deployed on Vercel (`next build`). Set all required `NEXT_PUBLIC_*` and server environment variables in Vercel before deploying.
- **Database & Edge Functions:** Hosted on Supabase. Review and apply SQL files in `supabase/migrations/` in numeric order via Supabase SQL Editor (see `docs/audit/18-apply-checklist.md` for pending cleanup/seed migrations).
