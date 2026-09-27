import { defineConfig, devices } from '@playwright/test';

const PORT = 3100;
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'list',
  timeout: 60_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    // Starts the local dev server (which seeds stations from AEMET via
    // instrumentation.ts on boot). Reuses an already-running server if present.
    command: `pnpm dev --port ${PORT}`,
    url: baseURL,
    reuseExistingServer: true,
    timeout: 180_000,
  },
});
