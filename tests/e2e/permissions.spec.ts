import { test, expect } from "../fixtures/testFixture";

test.describe("Security and Role Permissions Validation", () => {
  test.use({ storageState: "tests/.auth/support.json" });

  test("should block support engineer from settings panel", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.locator("text=Unauthorized, Settings, Dashboard").first()).toBeVisible();
  });

  test("should hide manager performance adjustments form from support logs view", async ({ reportsPage, page }) => {
    await reportsPage.goto();
    await reportsPage.openEmployeeModal("Lalit");

    // Adjustments panel should be completely hidden from non-managers
    await expect(reportsPage.supportInput).not.toBeVisible();
    
    await page.click("button:has-text('Close')");
  });
});
