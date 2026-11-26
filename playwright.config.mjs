import { defineConfig } from '@playwright/test';
import fs from 'node:fs';

const chromePath = '/usr/bin/google-chrome';
const useSystemChrome = fs.existsSync(chromePath);

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: 'http://127.0.0.1:3005',
    headless: true,
    launchOptions: useSystemChrome ? { executablePath: chromePath } : undefined,
  },
  webServer: {
    command: 'npx next start -p 3005 -H 127.0.0.1',
    url: 'http://127.0.0.1:3005/api/health',
    reuseExistingServer: false,
    timeout: 60000,
  },
});
