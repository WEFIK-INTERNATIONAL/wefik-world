# Motion & Animation Audit (`wefik.world`)

## 1. Preloader Diagnosis (`src/components/preloader/unboxing-preloader.tsx`)

The preloader was intended to represent a 3D shipping/gift box whose lid hinges open from the back top edge, revealing marketplace items. Inspecting the implementation revealed several root causes for the broken lid motion and performance issues:

1. **Wrong `transform-origin` & rotation axis:** `gsap.set(lidRef.current, { transformOrigin: 'top right' })` combined with `rotateZ: -110`, `x: -25`, `y: -15` caused the lid to swing sideways in 2D (like a windshield wiper) and translate away rather than hinging up and away on its back top edge (`rotateX`).
2. **Missing 3D `perspective` & `transform-style: preserve-3d`:** Neither the scene wrapper (`w-80 h-80`) nor `boxRef` set CSS `perspective` or `transform-style: preserve-3d`, so any 3D rotation would flatten onto the 2D plane.
3. **No `backface-visibility` handling:** The lid was a single flat div without separate front/inner faces or `backface-visibility: hidden`.
4. **Non-composited & blocking behavior:**
   - Animated `boxShadow` on `heroCardRef` (triggers paint) and `width` on the progress bar (`style={{ width: '${progress}%' }}`).
   - `usePreloaderProgress()` enforced an artificial **1.8s minimum** and **3.2s hard cap**, plus a **2.8s** GSAP timeline, delaying LCP/first paint.
   - Return visitors in the same session were still blocked for `600ms + 350ms = 950ms` by a pulsing logo overlay instead of skipping immediately.
   - Used mixed easings (`bounce.out`, `power2.out`, `elastic.out`, `back.out`, `sine.inOut`, `power3.out`, `power3.in`) across 4 phases.

---

## 2. Codebase Motion Inventory

| File | Trigger | Library / Mechanism | Duration & Easing | Flags / Notes |
| --- | --- | --- | --- | --- |
| `src/components/preloader/unboxing-preloader.tsx` | Initial mount | GSAP Timeline | ~2.8s (mixed: `bounce.out`, `elastic.out`, `back.out`, `power3.in`) | **FIXED in Step 3**: Blocked LCP, wrong lid hinge (`rotateZ`), animated `boxShadow` & `width`, replayed 950ms overlay for return visitors. |
| `src/components/transitions/transition-provider.tsx` | Route navigation (`TransitionLink`) & `popstate` | GSAP Timeline | 0.65s `expo.inOut` cover + 0.55s `expo.out` wipe + 0.6s `expo.out` content; `popstate`: 0.25s `power2.out` | Replays on every `TransitionLink` click (intentional page transition, respects `disableHeavyMotion`). Uses composited `yPercent`, `y`, `scale`, `opacity`. Top bar uses `animate-pulse` + `transition-all`. |
| `src/components/layout/fullscreen-menu.tsx` | Menu open/close | GSAP Timeline | 0.45s `power3.out` + 0.35s `power2.out` (stagger 0.035s) | Respects `disableHeavyMotion`. Uses composited `yPercent`, `y`, `opacity`. |
| `src/components/hero/hero-lightweight.tsx` | Desktop fine-pointer `mousemove` / mount | GSAP `quickTo` + Tailwind `animate-in` / `animate-pulse` | 0.6s `power2.out` (`rotationX`, `rotationY`, `z`); 500ms `animate-in` | Respects `disableHeavyMotion`. Eyebrow `animate-in` + `animate-pulse` dot on initial paint (lightweight, non-blocking). |
| `src/components/ui/magnetic-button.tsx` | Desktop fine-pointer `mousemove` | GSAP `quickTo` | 0.4s `power3.out` (`x`, `y`) | Respects `disableHeavyMotion`. Uses `will-change-transform`. |
| `src/components/ui/stat-counter.tsx` | Scroll into view (`top 85%`, `once: true`) | GSAP + `ScrollTrigger` | 1.5s `power2.out` | Respects `useReducedMotion`. Animates numeric React state (no layout shift if `font-mono` / `tabular-nums` used). |
| `src/app/not-found.tsx` | Mount (404 page) | GSAP loop + Tailwind `animate-pulse` | 2.4s `sine.inOut` infinite yoyo (`y`, `rotation`) | Respects `disableHeavyMotion`. |
| `src/components/providers/smooth-scroll-provider.tsx` | Mount (root layout) | Lenis + `gsap.ticker` | `lerp: 0.1`, `syncTouch: false` | Respects `useReducedMotion` and `useLowEndDevice`. |
| `src/app/globals.css` (`.link-sweep`) | `:hover` | CSS `transition` | 0.3s `cubic-bezier(0.16, 1, 0.3, 1)` | **Flag (minor):** Animates `background-size` (paint) instead of `transform: scaleX()` on a pseudo-element. |
| `src/app/globals.css` (`.animate-marquee`) | Continuous (pauses on hover) | CSS `@keyframes wfk-marquee` | 40s `linear infinite` (`translateX`) | Composited (`transform` only). Respects `prefers-reduced-motion`. |
| `src/app/globals.css` (`.animate-shimmer`) | Continuous on skeletons | CSS `@keyframes wfk-shimmer` | 2s `linear infinite` (`background-position`) | **Flag (minor):** Animates `background-position` (paint). Respects `prefers-reduced-motion`. |
| `src/app/globals.css` (global reduced-motion) | `@media (prefers-reduced-motion: reduce)` | CSS global override | `0.001ms !important` | Good safety net for all CSS transitions/animations. |
| `src/app/loading.tsx` & UI components (`product-card.tsx`, `live-demo-viewer.tsx`, `compare-dock.tsx`, `cart-drawer.tsx`, `command-palette.tsx`, `cookie-consent.tsx`, `back-to-top.tsx`, `header.tsx`, `footer.tsx`) | Hover / open / mount | Tailwind `transition-all`, `animate-in`, `animate-pulse`, `animate-spin` | 150ms–500ms default Tailwind easings | **Flag:** Widespread `transition-all` can accidentally animate layout properties if dimensions change; prefer `transition-transform`, `transition-opacity`, or `transition-colors`. |

---

## 3. Before & After Summary (Task 4 Fixes)

- **Shared Motion Tokens (`src/lib/motion.ts`):** Created `MOTION_DURATION` (`fast: 0.18`, `base: 0.3`, `slow: 0.55`, `ambient: 2.4`) and `MOTION_EASE` (`out: 'power3.out'`, `inOut: 'expo.inOut'`, `in: 'power3.in'`, `ambient: 'sine.inOut'`, `cssOut: 'cubic-bezier(0.22, 1, 0.36, 1)'`). Wired `UnboxingPreloader`, `TransitionProvider`, `FullscreenMenu`, `MagneticButton`, `HeroLightweight`, `StatCounter`, and `NotFound` to use these shared tokens.
- **Layout Reads in Pointer Loops:** `MagneticButton` and `HeroLightweight` previously called `getBoundingClientRect()` on every `mousemove` event. Both now cache the bounding rect on `mouseenter` and clear on `mouseleave`.
- **Lenis + ScrollTrigger:** Verified `SmoothScrollProvider` uses a single `Lenis` instance driven by `gsap.ticker` with `ScrollTrigger.update` synced, no competing `requestAnimationFrame` loops, and no global CSS `scroll-behavior: smooth`.
- **Preloader:** Rebuilt to use true 3D `perspective` + `preserve-3d` + `rotateX` back-top hinge with `backface-visibility: hidden`, responsive ground shadow, `~1.55s` total duration with `power3.out`, immediate skip for same-session return visitors via pre-paint `data-preloader="skip"`, early exit when page is ready, `prefers-reduced-motion` simple fade, keyboard (`Escape`/`Enter`/`Space`) skip without focus trap, and `transform`/`opacity`-only properties.

