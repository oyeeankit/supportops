import { test, expect } from "../fixtures/testFixture";

test.describe("Responsive Mobile Viewport Tests", () => {
  // Use cached manager authentication state
  test.use({ storageState: "tests/.auth/manager.json" });

  test("should display mobile navigation bar in small viewports", async ({ page }) => {
    await page.goto("/dashboard");

    const viewport = page.viewportSize();
    if (viewport && viewport.width < 768) {
      console.log("Running in Mobile Viewport context...");
      // Mobile bottom navigation should be visible
      const mobileNavLinks = page.locator("nav a");
      await expect(mobileNavLinks.first()).toBeVisible();
    } else {
      console.log("Running in Desktop Viewport context.");
      const desktopSidebar = page.locator("aside").first();
      await expect(desktopSidebar).toBeVisible();
    }
  });
});
