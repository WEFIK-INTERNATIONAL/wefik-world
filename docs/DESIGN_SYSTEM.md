# wefik.world Design System & Motion Specification

> **Version**: 2.0  
> **Status**: Production Reference  
> **Engine**: GSAP 3 + ScrollTrigger + Lenis + React Three Fiber  
> **Target Audience**: Humans and Autonomous AI Agents contributing to wefik.world  

---

## 1. Brand Tokens & Color Palette

wefik.world balances **60–70% clean white**, **20–30% deep ink**, and **5–10% energetic lime**. Purple and blue generic gradients are strictly banned.

### Colors
| Token | Hex | Role | Usage |
| :--- | :--- | :--- | :--- |
| `--color-lime` | `#A3E635` | Signature Accent | Badges, active states, tape stripes, glowing borders |
| `--color-lime-light` | `#D9F99D` | Light Accent Tint | Subtle highlight rings, badge backgrounds |
| `--color-lime-dark` | `#65A30D` | Dark Accent | High-contrast links, hover underlines |
| `--color-deep-green` | `#4F741B` | Secondary Brand | Text accents, category headers, trusted checkmarks |
| `--color-ink` | `#202124` | Primary Dark | Headlines, dark panels, primary buttons, preloader box |
| `--color-slate` | `#5F6368` | Body & Muted Text | Secondary copy, metadata, captions, inactive links |
| `--color-surface` | `#F8F9FA` | Light Background | Section alternates, card fills, input backgrounds |
| `--color-border` | `#E8EAED` | Crisp Dividing Lines | 1px clean card and header borders |
| `--color-white` | `#FFFFFF` | Canvas | Core page backgrounds, card popups |

### Typography
- **Primary Typeface**: `Inter` via `next/font/google` (`--font-sans`).
- **Headings**: Extra-bold (`font-extrabold`), tracking-tight (`tracking-tight`), `leading-[1.1]` for display hero text.
- **Monospace**: Clean tabular numerals for paise pricing and licenses (`font-mono`).
- **Discipline**: No ad-hoc fonts or arbitrary font sizes. Use standard Tailwind scales (`text-xs`, `text-sm`, `text-base`, `text-lg`, `text-2xl`, `text-4xl`, `text-6xl`, `text-7xl`).

### Border Radius & Elevation
- **Cards**: `rounded-2xl` (16px) or `rounded-xl` (12px).
- **Buttons**: `rounded-xl` (12px) or `rounded-2xl` (16px) for hero buttons. Height scale: 40px (`h-10`) or 48px (`h-12`).
- **Badges / Tags**: `rounded-full` (9999px).
- **Shadows**: Soft, high-diffusion shadows (`shadow-xs`, `shadow-md`, `shadow-xl`). Glows use colored opacity: `hover:shadow-lime/20 hover:shadow-lg`.

---

## 2. Motion Architecture (Locked Decisions)

### Animation Engines
1. **GSAP + ScrollTrigger** (`gsap`, `@gsap/react`): Single JS animation runtime. All transforms and timeline orchestrations use GSAP. Framer Motion is banned to prevent bundle bloat and transform contention.
2. **Lenis**: Smooth scrolling with `lenis.on('scroll', ScrollTrigger.update)` driven by `gsap.ticker`. Lenis is paused on fullscreen menu or modal dialogs.
3. **Three.js** (`@react-three/fiber`, `@react-three/drei`): Confined exclusively to the Hero section with dynamic import (`ssr: false`) and strict performance gates.

### Easing Language
- **Entrances / Reveals**: `expo.out` or `power3.out`.
- **Exits / Dismissals**: `expo.in` or `power3.in`.
- **Playful Settles**: `back.out(1.4)`.
- **Scroll-Linked**: `power2.out`.
- **Durations**:
  - Micro-interactions: `150ms – 300ms`
  - Section reveals: `600ms – 900ms`
  - Page transitions: `700ms – 1100ms`
  - Preloader hard cap: `≤ 3.2s`

### Reduced Motion is Law
Every component must respect `prefers-reduced-motion: reduce`:
- When active, Lenis smooth scrolling is disabled and native browser scrolling takes over.
- Page transitions cut immediately without panel wipes.
- Three.js canvas unmounts in favor of `HeroPoster`.
- Preloader skips multi-step cinematic and renders a static branded logo pulse.
- CSS media query in `globals.css` collapses animation durations to `0.001ms`.

---

## 3. Signature Micro-Interactions

1. **Magnetic Buttons** (`<MagneticButton>`): Desktop-only interactive pull toward cursor using GSAP `quickTo`.
2. **Product Card Lift**: `y: -6px`, image zoom `1.06x`, lime glow sweep on hover.
3. **Link Underline Sweeps** (`.link-sweep`): Pure CSS background-size expansion on hover.
4. **Infinite Marquee** (`<InfiniteMarquee>`): Continuous category ribbon pausing on user hover.
5. **Scroll Counters** (`<StatCounter>`): Numbers count up upon reaching 85% viewport visibility.
6. **Hide-on-Scroll Header**: Collapses on downward scroll, returns on upward scroll with backdrop blur.
7. **Branded Toasts** (Sonner): Ink background (`#202124`), lime border (`rgba(163,230,53,0.3)`), white text.
8. **Skeleton Shimmer** (`.animate-shimmer`): Moving gradient across placeholder blocks, zero layout shifts.

---

## 4. UI Chrome & Iconography Rules
- **No Emojis as Icons**: Lucide icons only.
- **No Placeholder Images**: Real WebP / SVG / Cloudinary assets only.
- **All Interactive Elements Accessible**: Minimum touch target of 44×44px, lime focus-visible rings (`focus-visible:ring-lime`), semantic HTML.
