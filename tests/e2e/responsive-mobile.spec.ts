import { test, expect } from "../fixtures/testFixture";

test.describe("Responsive Mobile Viewport Tests", () => {
  // Use cached manager authentication state
  test.use({ storageState: "tests/.auth/manager.json" });

  test("should toggle mobile sidebar navigation drawer", async ({ page }) => {
    await page.goto("/dashboard");

    // Get window viewport width
    const viewport = page.viewportSize();
    if (viewport && viewport.width < 768) {
      console.log("Running in Mobile Viewport context...");
      // In mobile mode, the desktop sidebar should be hidden
      const desktopSidebar = page.locator("aside").first();
      await expect(desktopSidebar).not.toBeVisible();

      // Locate the mobile trigger button (hamburger menu)
      const menuTrigger = page.locator("button[aria-label='Toggle menu'], button:has(.lucide-menu)");
      await expect(menuTrigger).toBeVisible();

      // Click to open sidebar drawer
      await menuTrigger.click();
      
      // Mobile drawer links should appear
      const mobileNavLinks = page.locator("nav a");
      await expect(mobileNavLinks.first()).toBeVisible();
    } else {
      console.log("Running in Desktop Viewport context. Skipping mobile nav toggling checks.");
      const desktopSidebar = page.locator("aside").first();
      await expect(desktopSidebar).toBeVisible();
    }
  });
});
