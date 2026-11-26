<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->


# Project Engineering Rules

- **Design Tokens:** Use existing CSS variables in `src/app/globals.css` (`--bg`, `--surface`, `--text-primary`, `--brand`, etc.). Never add inline hex literals.
- **Motion Tokens:** Use `MOTION_DURATION` and `MOTION_EASE` from `src/lib/motion.ts`. Animate `transform` and `opacity` only, and respect `prefers-reduced-motion`.
- **Shared Components:** Use `ProductCard` (`src/components/marketplace/product-card.tsx`) for all product cards and `SafeImage` for images.
- **SSR & Hydration:** Server HTML and first client render must match. Never branch on `window`, `navigator`, or `localStorage` during render.
- **No Fake Content:** Never invent products, prices, ratings, download counts, testimonials, or stock/Unsplash placeholder images.
- **Safety:** Never commit secrets, never apply migrations or write to live Supabase/Redis/Storage without explicit owner approval, and keep `scripts/check-secrets.mjs` passing.
