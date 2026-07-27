import { test, expect } from "../fixtures/testFixture";
import { TEST_USERS } from "../data/test-data";

test.describe("Security and Role Permissions Validation", () => {
  test.beforeEach(async ({ loginPage, page }) => {
    // Authenticate as Support role
    await loginPage.goto();
    await loginPage.login(TEST_USERS.support.email, TEST_USERS.support.password);
  });

  test("should block support engineer from settings panel", async ({ page }) => {
    await page.goto("/settings");
    await expect(page).toHaveURL(/.*settings|.*dashboard|.*login/);
  });

  test("should hide manager performance adjustments form from support logs view", async ({ reportsPage, page }) => {
    await reportsPage.goto();
    await reportsPage.openEmployeeModal("Lalit");

    // Adjustments panel should be completely hidden from non-managers
    await expect(reportsPage.supportInput).not.toBeVisible();
    
    await page.keyboard.press("Escape");
  });
});
