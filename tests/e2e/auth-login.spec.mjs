import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const MAPPED_ERRORS = [
  { code: 'cancelled', expectedTitle: 'Sign-in cancelled' },
  { code: 'disallowed_useragent', expectedTitle: 'Open in your browser' },
  { code: 'session_lost', expectedTitle: 'Sign-in session was lost' },
  { code: 'link_expired', expectedTitle: 'Login link expired' },
  { code: 'provider_conflict', expectedTitle: 'Account uses another sign-in method' },
  { code: 'provider_error', expectedTitle: 'Google sign-in unavailable' },
  { code: 'database_error', expectedTitle: 'Temporary account setup error' },
  { code: 'temporary_error', expectedTitle: 'Temporary sign-in error' },
];

test.describe('Auth Login Error Mapping & Accessibility', () => {
  for (const { code, expectedTitle } of MAPPED_ERRORS) {
    test(`renders mapped error "${code}" with Try again, Request ID, and zero hydration/axe issues`, async ({
      page,
    }) => {
      const consoleErrors = [];
      const pageErrors = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error' || msg.text().toLowerCase().includes('hydration')) {
          consoleErrors.push(msg.text());
        }
      });
      page.on('pageerror', (err) => pageErrors.push(err.message));

      await page.goto(`/login?error=${code}&cid=req12345`, { waitUntil: 'domcontentloaded' });

      const alert = page.locator('[role="alert"]');
      await expect(alert).toBeVisible();
      await expect(alert).toContainText(expectedTitle);
      await expect(alert).toContainText('Request ID: req12345');

      const tryAgainBtn = alert.getByRole('button', { name: /try again/i });
      await expect(tryAgainBtn).toBeVisible();
      await tryAgainBtn.click();
      await expect(alert).toBeHidden();

      expect(pageErrors).toEqual([]);
      expect(consoleErrors.filter((e) => e.toLowerCase().includes('hydration'))).toEqual([]);

      const axeResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();
      expect(axeResults.violations).toEqual([]);
    });
  }
});
