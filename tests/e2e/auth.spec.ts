import { test, expect } from "../fixtures/testFixture";
import { TEST_USERS } from "../data/test-data";

test.describe("Authentication & Session Flows", () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test("should assert validation errors for empty fields", async ({ loginPage }) => {
    await loginPage.login("", "");
    const validationMessage = await loginPage.emailInput.evaluate((el: HTMLInputElement) => el.validationMessage);
    expect(validationMessage).not.toBe("");
  });

  test("should reject login for invalid credentials", async ({ loginPage }) => {
    await loginPage.login("wrong_user@thaliatechnologies.com", "wrong_password_hash");
    await expect(loginPage.errorMessage("Invalid login credentials")).toBeVisible();
  });

  test("should authenticate successfully with valid manager credentials and persist session", async ({ loginPage, page }) => {
    await loginPage.login(TEST_USERS.manager.email, TEST_USERS.manager.password);
    await page.waitForURL("**/dashboard");
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test("should protect private routes when unauthorized", async ({ page }) => {
    // Clear cookies / storage to simulate unauthenticated user
    await page.context().clearCookies();
    await page.goto("/operations");
    await expect(page).toHaveURL(/.*login/);
  });
});
