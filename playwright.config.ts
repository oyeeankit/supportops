import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright E2E configuration file.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  // Run all specs in parallel
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // Retries on CI to handle local dev server startup lag
  retries: process.env.CI ? 2 : 0,
  timeout: 60000,
  workers: 2,
  reporter: [["html", { open: "never" }]],
  
  // StorageState setup hook
  globalSetup: require.resolve("./tests/global-setup"),

  use: {
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || "http://localhost:3000",
    navigationTimeout: 30000,
    actionTimeout: 15000,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  projects: [
    {
      name: "desktop-chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 5"] },
    },
  ],
});
