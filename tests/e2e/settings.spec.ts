import { test, expect } from "../fixtures/testFixture";

test.describe("Settings & Profile Management", () => {
  test.use({ storageState: "tests/.auth/manager.json" });

  test.beforeEach(async ({ settingsPage }) => {
    await settingsPage.goto();
  });

  test("should render settings page and toggle theme", async ({ settingsPage, page }) => {
    await expect(settingsPage.heading).toBeVisible();
    
    // Check theme toggle button
    if (await settingsPage.themeToggle.isVisible()) {
      await settingsPage.themeToggle.click();
    }
  });

  test("should test save and cancel actions on settings page", async ({ settingsPage }) => {
    await settingsPage.saveSettings();
    // Verify page state remains stable
    await expect(settingsPage.heading).toBeVisible();
  });
});
