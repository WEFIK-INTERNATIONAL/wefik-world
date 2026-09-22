# wefik.world Design System & Motion Specification (v2.0)

> **Version**: 2.0 (Motion/UX v2 Production Reference)  
> **Engines**: GSAP 3.12 + ScrollTrigger + Lenis (No Three.js / No Framer Motion)  
> **Fonts**: Space Grotesk (Display) + Inter (Body) + JetBrains Mono (Monospace)  
> **Theming**: Class-based Dual Themes (Light & Dark) via `next-themes`  
> **Target Audience**: Humans and Autonomous AI Agents contributing to wefik.world  

---

## 1. Brand Tokens & Color Palette

wefik.world balances **clean canvases**, **deep ink structure**, and **electric lime accents**. Generic purple, violet, and electric-blue AI-slop gradients are strictly banned.

### CSS Theme Tokens (Dual Theme Matrix)

| Token | Light Theme | Dark Theme (`.dark`) | Purpose & Semantic Role |
| :--- | :--- | :--- | :--- |
| `--bg` | `#FFFFFF` | `#0B0D0B` | Root application background |
| `--surface` | `#F8F9FA` | `#141714` | Primary card background, alternate sections |
| `--surface-2` | `#EFF1EE` | `#1C211C` | Secondary card fills, subtle tag backgrounds |
| `--text` | `#202124` | `#EDEFEA` | Primary typography and display headers |
| `--muted` | `#5F6368` | `#9AA39A` | Secondary copy, metadata, timestamps |
| `--border` | `#E8EAED` | `#262B26` | Card dividers, input borders, nav outlines |
| `--border-subtle`| `#F1F3F4` | `#1C201C` | Micro-dividers and subtle list item borders |
| `--primary` | `#A3E635` | `#A3E635` | Brand electric lime accent |
| `--on-primary` | `#202124` | `#131603` | High-contrast text on primary lime badges |
| `--accent` | `#4F741B` | `#8FCE3F` | Secondary green accent and trusted highlights |
| `--ink` | `#202124` | `#EDEFEA` | Structured dark headers and solid dark buttons |

### Brand Palette Swatches
- **Lime Accent** (`#A3E635`): Active states, glowing borders, badges, hover underlines, button highlights.
- **Deep Green** (`#4F741B`): Secondary brand identity, verified checkmarks, trusted metrics.
- **Deep Ink** (`#202124`): Structural foundations, primary buttons, preloader shipping box.
- **Surface Soft** (`#F8F9FA`): Section alternations, soft inputs, light card fills.
- **Pure White** (`#FFFFFF`): Light mode crisp canvas.

---

## 2. Typography System

Typography is loaded via `next/font/google` with `display: 'swap'` and display font preloading. External Google Fonts `<link>` tags are banned.

### Type Scale & Hierarchy
| Level | Font Family | Tailwind Class | Weight | Line Height | Tracking | Text Wrap |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Hero Display** | Space Grotesk | `text-4xl sm:text-6xl lg:text-7xl` | 700 (`font-bold`) | `leading-[1.08]` | `tracking-tight` | `text-balance` |
| **Section H2** | Space Grotesk | `text-2xl sm:text-4xl` | 700 (`font-bold`) | `leading-[1.15]` | `tracking-tight` | `text-balance` |
| **Card H3** | Space Grotesk | `text-lg sm:text-xl` | 600 (`font-semibold`)| `leading-[1.25]` | `tracking-normal`| `text-pretty` |
| **Body Large** | Inter | `text-base sm:text-lg` | 400 (`font-normal`) | `leading-relaxed`| `tracking-normal`| `text-pretty` |
| **Body Regular**| Inter | `text-sm sm:text-base` | 400 / 500 | `leading-normal` | `tracking-normal`| `text-pretty` |
| **Caption/Tag** | Inter | `text-xs sm:text-sm` | 500 / 600 | `leading-normal` | `tracking-wide` | `text-nowrap` |
| **Prices & Code**| JetBrains Mono | `text-sm sm:text-base font-mono`| 500 (`font-medium`)| `leading-none` | `tabular-nums` | `text-nowrap` |

### Strict Typography Rules
1. **Headlines**: Always apply `text-balance` to prevent orphan words.
2. **Body Text**: Always apply `text-pretty` for clean editorial line wraps.
3. **Prices & Financial Numbers**: Mandatory `font-mono tabular-nums` to eliminate jitter during updates or currency formatting.

---

## 3. Brand Logo: Single Source of Truth

The vector SVG mark is defined in `src/components/brand/logo.tsx` as the `<Logo />` component. Approximating the logo with plain unstyled text or generic icons is strictly banned.

### Usage
```tsx
import { Logo } from '@/components/brand/logo';

// In Header / Fullscreen Menu
<Logo size="md" />

// Icon mark only (e.g. mobile drawer or preloader box)
<Logo markOnly size="sm" />

// Footer / Hero display
<Logo size="lg" showWordmark />
```

### Logo Sizes & Touch Geometry
| Size Preset | Icon Box | SVG Mark | Wordmark Text Size | Clearspace Zone |
| :--- | :--- | :--- | :--- | :--- |
| `sm` | `w-7 h-7` (28px) | 20 × 20 px | `text-base` | Minimum 12px padding around mark |
| `md` (Default)| `w-9 h-9` (36px) | 22 × 22 px | `text-xl` | Minimum 16px padding around mark |
| `lg` | `w-11 h-11` (44px) | 28 × 28 px | `text-2xl` | Minimum 20px padding around mark |
| `xl` | `w-14 h-14` (56px) | 36 × 36 px | `text-3xl` | Minimum 24px padding around mark |

### Rules & Placement Discipline
- **Vector Fidelity**: SVG path `M4 6L8 18L12 9L16 18L20 6` with `strokeWidth="2.5"` and lime accent dot `circle cx="12" cy="5" r="1.5"`.
- **Theme Awareness**: Adapts automatically with `dark:bg-[#141714]` and `text-[var(--text)]`.
- **Favicon & OG**: Derived directly from `public/logo.svg`. The default Next.js triangle favicon is strictly banned.

---

## 4. Motion Architecture (v2 Performance Reference)

All animations are powered strictly by **GSAP 3.12** and **Lenis**. Three.js and Framer Motion are completely excluded to eliminate runtime overhead and guarantee 60fps on mobile.

### Animation Runtime Configuration
1. **GSAP Ticker Integration**: Lenis smooth scroll updates are hooked into `gsap.ticker.add((time) => lenis.raf(time * 1000))` with `gsap.ticker.lagSmoothing(0)` for zero frame jitter.
2. **Lightweight Hero**: Replaces heavy WebGL canvas with high-performance CSS gradient mesh, SVG micro-grain texture, and GSAP card tilt physics.
3. **ScrollTrigger Discipline**: Reveals use `once: true`, batched triggers, and clean teardown on component unmount. Dev trigger count is monitored to never exceed 40 triggers per page.
4. **Transition Provider**: Barba-free `TransitionProvider` with ink/lime cover-reveal wipe (`expo.inOut`), Lenis scroll reset, and top progress bar for routes taking >400ms.

### Easing Curve & Timing Standards
- **Reveals / Entrances**: `expo.out` or `power3.out` (600ms – 900ms)
- **Dismissals / Exits**: `expo.in` or `power3.in` (300ms – 500ms)
- **Elastic Settles**: `back.out(1.4)` (500ms – 750ms)
- **Micro-Interactions**: `power2.out` (150ms – 250ms)
- **Unboxing Preloader Hard Cap**: `≤ 3.2s` total duration, click-to-skip, once-per-session storage.

### Reduced Motion & Low-End CPU Gate
Accessibility and device capability gates are strictly enforced:
- **`useReducedMotion()` Hook**: Detects `prefers-reduced-motion: reduce` and device low-end hardware (`navigator.hardwareConcurrency <= 4` or memory `<= 4GB`).
- **Global CSS Fallback**: `@media (prefers-reduced-motion: reduce)` sets all animations and transitions to `0.001ms !important`.
- **Instant Cut**: Transitions cut immediately without wipes; preloader renders a quick static brand pulse; magnetic buttons disable cursor pull.

---

## 5. Signature Micro-Interactions & UI Chrome

1. **Magnetic Buttons** (`<MagneticButton>`): Desktop-only interactive cursor pull using GSAP `quickTo`.
2. **Product Card Lift & Glow**: Hover lifts card `-6px`, zooms image `1.04x`, and triggers subtle lime border highlight.
3. **Link Underline Sweeps** (`.link-sweep`): Pure CSS background-size expansion on hover (`0%` → `100%`).
4. **Category Marquee** (`<InfiniteMarquee>`): Continuous GPU ribbon that pauses on hover.
5. **Hide-on-Scroll Header**: Collapses on downward scroll, returns on upward scroll with backdrop blur.
6. **Branded Sonner Toasts**: Ink background, subtle lime border ring, white text, and clear action button.
7. **Zero Layout-Shift Skeletons** (`.animate-shimmer`): Shimmer matching exact layout dimensions to guarantee 0 Cumulative Layout Shift (CLS).

---

## 6. Iconography & UI Chrome Discipline
- **Lucide Icons Exclusively**: Emojis are strictly banned from UI chrome, buttons, tags, or navigation.
- **Real Production Assets**: Placeholder images (`picsum.photos`, `via.placeholder.com`, lorem ipsum) are banned.
- **Touch Target Law**: Minimum 44×44px interactive bounding box on all mobile buttons and links.
- **Focus Indicators**: Visible, high-contrast lime focus ring (`focus-visible:ring-2 focus-visible:ring-lime focus-visible:outline-none`).
