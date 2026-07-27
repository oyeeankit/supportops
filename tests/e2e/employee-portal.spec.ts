import { test, expect } from "../fixtures/testFixture";
import { TEST_USERS } from "../data/test-data";

test.describe("Employee Daily Report Portal", () => {
  test.beforeEach(async ({ loginPage }) => {
    // Authenticate as Support Engineer (Lalit)
    await loginPage.goto();
    await loginPage.login(TEST_USERS.support.email, TEST_USERS.support.password);
  });

  test("should render employee report form and submit daily log", async ({ page }) => {
    await page.goto("/my-reports/new");

    // 1. Assert form header elements
    await expect(page.locator("h1")).toContainText("Submit Daily Report");

    // 2. Fill tickets closed and chats handled
    await page.fill("input[name='tickets_handled']", "14");
    await page.fill("input[name='chats_handled']", "9");

    // 3. Fill general notes
    await page.fill("textarea[name='notes']", "E2E automated employee report submission verification.");

    // 4. Submit form
    await page.click("button:has-text('Submit Daily Report')");

    // 5. Assert redirect to /my-reports history page with success indication
    await expect(page).toHaveURL(/.*my-reports/);
    await expect(page.locator("h1")).toContainText("My Daily Reports");
  });

  test("should support saving draft", async ({ page }) => {
    await page.goto("/my-reports/new");

    await page.fill("input[name='tickets_handled']", "5");
    await page.click("button:has-text('Save Draft') font, button:has-text('Save Draft')");

    await expect(page.locator("text=Draft auto-saved, text=Draft saved")).toBeVisible();
  });
});

test.describe("Manager Submissions Dashboard", () => {
  test.use({ storageState: "tests/.auth/manager.json" });

  test("should display manager daily report control center", async ({ page }) => {
    await page.goto("/operations/submissions");

    await expect(page.locator("h1")).toContainText("Employee Daily Reports Dashboard");
    await expect(page.locator("text=Submitted Today")).toBeVisible();
    await expect(page.locator("text=Late Submissions")).toBeVisible();
  });
});
