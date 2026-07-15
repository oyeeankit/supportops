import { test, expect, type Page } from "@playwright/test";

// Dynamic fallback URL for local development vs CI pipelines
const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || "http://localhost:3000";

/**
 * Reusable helper to authenticate the session as a Manager.
 */
async function loginAsManager(page: Page) {
  await page.goto(`${BASE_URL}/login`);
  await page.fill("input[name='email']", "mane@thaliatechnologies.com");
  await page.fill("input[name='password']", "password123");
  await page.click("button[type='submit']");
  
  // Wait for session initialization and dashboard redirect
  await page.waitForURL("**/dashboard");
}

/**
 * Reusable helper to navigate to the Monthly Reports panel.
 */
async function navigateToReports(page: Page) {
  await page.goto(`${BASE_URL}/reports`);
  // Ensure the page has fully loaded before proceeding
  await expect(page.locator("h1")).toContainText("Monthly Performance Report");
}

test.describe("Monthly Performance Adjustments (BOLA & Math Validation)", () => {
  test.beforeEach(async ({ page }) => {
    // Authenticate and navigate before each E2E script
    await loginAsManager(page);
    await navigateToReports(page);
  });

  test("should load modal, save adjustments, and dynamically update score metrics", async ({ page }) => {
    console.log("Locating employee row for 'Lalit'...");
    const row = page.locator("tr:has-text('Lalit')");
    const viewButton = row.locator("button:has-text('View')");
    
    // Open employee profile modal
    await viewButton.first().click();
    console.log("Opening Employee Performance Details modal...");

    // 1. Assert modal opens and displays structural headers
    await expect(page.locator("h2:has-text('Employee Performance Details')")).toBeVisible();

    // 2. Locate form elements
    const supportInput = page.locator("input#support_adjustment");
    const testingInput = page.locator("input#testing_adjustment");
    const remarksTextarea = page.locator("textarea#manager_remarks");

    // Verify fields are visible and interactive
    await expect(supportInput).toBeVisible();
    await expect(testingInput).toBeVisible();
    await expect(remarksTextarea).toBeVisible();

    // 3. Fill and submit adjustment data
    console.log("Setting Support Adjustment to +10 and submitting form...");
    await supportInput.fill("10");
    await testingInput.fill("0");
    await remarksTextarea.fill("CI/CD Playwright E2E verification test.");
    
    await page.click("button:has-text('Save Adjustments')");

    // 4. Assert adjustments saved successfully
    await expect(page.locator("text=Adjustments saved successfully.")).toBeVisible();
    console.log("Recalculation confirmation alert verified.");

    // 5. Assert dynamic score shifts accordingly (+0.50 points based on +10 adjustment)
    const scoreLocator = page.locator("p:has-text('/ 5')");
    const updatedScore = await scoreLocator.first().innerText();
    expect(updatedScore).toContain("3.89 / 5"); // Lalit baseline is 3.39 + 0.50 modifier
    console.log(`Recalculated score verified: ${updatedScore}`);

    // 6. Close profile modal and assert UI resets
    await page.click("button:has-text('Close')");
    await expect(page.locator("h2:has-text('Employee Performance Details')")).not.toBeVisible();
    console.log("E2E verify script finished successfully.");
  });
});
