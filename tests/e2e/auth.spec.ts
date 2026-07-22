import { test, expect } from "../fixtures/testFixture";
import { TEST_USERS } from "../data/test-data";

test.describe("Authentication Flows", () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test("should assert validation errors for empty fields", async ({ loginPage }) => {
    await loginPage.login("", "");
    // Perform explicit validation check on input validation messages
    const validationMessage = await loginPage.emailInput.evaluate((el: HTMLInputElement) => el.validationMessage);
    expect(validationMessage).not.toBe("");
  });

  test("should reject login for invalid credentials", async ({ loginPage }) => {
    await loginPage.login("wrong_user@thaliatechnologies.com", "wrong_password_hash");
    await expect(loginPage.errorMessage("Invalid login credentials")).toBeVisible();
  });

  test("should authenticate successfully with valid manager credentials", async ({ loginPage, page }) => {
    await loginPage.login(TEST_USERS.manager.email, TEST_USERS.manager.password);
    await page.waitForURL("**/dashboard");
    await expect(page.locator("h1")).toContainText("Dashboard");
  });
});
