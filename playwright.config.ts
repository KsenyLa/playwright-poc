import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  // The E2E suite shares one backend and one database, so tests must not mutate
  // state concurrently unless we add per-worker DB isolation.
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'npm run dev:api',
      url: 'http://localhost:3001/health',
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
      env: {
        NODE_ENV: 'test',
        ALLOW_TEST_RESET: 'true',
        TEST_RESET_TOKEN: 'local-e2e-reset',
      },
    },
    {
      command: 'npm run dev:web',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
      env: {
        VITE_API_URL: 'http://localhost:3001',
      },
    },
  ],
});
