/**
 * High-performance lightweight base64 shimmer blur placeholder for Next.js <Image />.
 * Renders instantly (<150 bytes) to prevent layout shifts (CLS ≈ 0) and empty white flashes.
 */

// 16:10 aspect ratio SVG placeholder (dark/neutral tone matching wefik surface)
export const DEFAULT_BLUR_DATA_URL =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNiAxMCI+PHJlY3Qgd2lkdGg9IjE2IiBoZWlnaHQ9IjEwIiBmaWxsPSIjMWMyMTFjIi8+PHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjE2IiBoZWlnaHQ9IjEwIiBmaWxsPSJ1cmwoI2cpIi8+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJnIiB4MT0iMCIgeTI9IjEiPjxzdG9wIHN0b3AtY29sb3I9IiMxNDE3MTQiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiMxYzIxMWMiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48L3N2Zz4=';
