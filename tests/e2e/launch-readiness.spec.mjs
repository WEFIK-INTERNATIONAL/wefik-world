import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const ROUTES = ['/', '/marketplace', '/login'];

test.describe('Launch-Readiness E2E & Accessibility', () => {
  test('Security headers and /api/health are clean', async ({ request }) => {
    const res = await request.get('/api/health');
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json.status).toBe('ok');
    expect(json).not.toHaveProperty('services');

    const pageRes = await request.get('/');
    const headers = pageRes.headers();
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['x-frame-options']).toBe('DENY');
    expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
    expect(headers['permissions-policy']).toContain('camera=()');
    expect(headers['content-security-policy-report-only']).toContain("default-src 'self'");
  });

  test('404 page renders site design with link home', async ({ page }) => {
    const res = await page.goto('/this-route-does-not-exist-404');
    expect(res?.status()).toBe(404);
    await expect(page.locator('a[href="/"]').first()).toBeVisible();
  });

  test('Marketplace search, filter URL state, cart drawer, and keyboard Escape', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/marketplace', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('h1')).toHaveText('Marketplace');

    const searchInput = page.locator('#marketplace-search');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('checkup');
    await searchInput.press('Enter');
    await expect(page).toHaveURL(/q=checkup/);

    // Escape clears search input
    await searchInput.press('Escape');
    await expect(searchInput).toHaveValue('');

    // Open cart drawer and close with Escape
    const cartBtn = page.getByRole('button', { name: 'Shopping cart' });
    await cartBtn.click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toBeHidden();

    // Account route redirects cleanly to /login when unauthenticated without runtime errors
    await page.goto('/account');
    await expect(page).toHaveURL(/\/login/);

    expect(errors).toEqual([]);
  });

  for (const route of ROUTES) {
    test(`Axe accessibility audit (WCAG 2.0/2.1 AA) passes on ${route}`, async ({ page }) => {
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('main').first()).toBeVisible();

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();

      const seriousOrCritical = results.violations.filter(
        (v) => v.impact === 'serious' || v.impact === 'critical'
      );

      expect(
        seriousOrCritical,
        `Serious/critical axe violations on ${route}: ${JSON.stringify(
          seriousOrCritical.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length })),
          null,
          2
        )}`
      ).toEqual([]);
    });
  }
});

