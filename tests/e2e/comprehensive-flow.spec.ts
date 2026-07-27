import { test, expect } from "../fixtures/testFixture";

test.describe("Comprehensive Daily Operations & Performance Reporting Flow", () => {
  test.use({ storageState: "tests/.auth/manager.json" });

  test("should fill all fields, save operation, and verify in monthly reports", async ({ page, dailyOperationsPage, reportsPage }) => {
    // 1. Log operations for employee Lalit
    await dailyOperationsPage.goto();
    await dailyOperationsPage.openLogModal("Lalit");

    // Assert modal header is visible
    await expect(dailyOperationsPage.modalHeading).toBeVisible();

    // Fill support fields
    await dailyOperationsPage.fillSupportSummary({
      attendanceStatus: "present",
      tickets: 10,
      chats: 5,
      notes: "E2E comprehensive integration testing notes.",
    });

    // Check all checkboxes (doc update, review, etc.)
    const docCheckbox = page.locator("label:has-text('Documentation Updated') >> xpath=../input[@type='checkbox']");
    if (await docCheckbox.isVisible()) {
      await docCheckbox.check();
    }
    
    const reviewCheckbox = page.locator("label:has-text('Asked for Customer Review') >> xpath=../input[@type='checkbox']");
    if (await reviewCheckbox.isVisible()) {
      await reviewCheckbox.check();
    }

    // Set support and testing qualities to excellent
    const supportQualitySelect = page.locator("select:near(:text('Support Quality'))").first();
    if (await supportQualitySelect.isVisible()) {
      await supportQualitySelect.selectOption("excellent");
    }

    // Add a testing entry
    const addTestingBtn = page.locator("button:has-text('Add Testing Entry')");
    if (await addTestingBtn.isVisible()) {
      await addTestingBtn.click();
      
      // Select testing app Bolt
      await page.click("button:has-text('Select app...')");
      await page.click("span:has-text('Bolt')");
      
      // Select testing type & status
      await page.selectOption("select:near(:text('Testing Type'))", "regression");
      await page.selectOption("select:near(:text('Status'))", "completed");
      
      // Input bugs found
      await page.fill("input:near(:text('Bugs Found'))", "3");
      
      const criticalBugLabel = page.locator("label:has-text('Critical Bug') >> xpath=../input[@type='checkbox']");
      if (await criticalBugLabel.isVisible()) {
        await criticalBugLabel.check();
      }
    }

    // Save Daily Operations
    await page.click("button:has-text('Save Daily Operations'), button:has-text('Save & Close')");
    
    // Assert modal closes
    await expect(dailyOperationsPage.modalHeading).not.toBeVisible();

    // 2. Go to Reports and check updated columns
    await reportsPage.goto();
    
    const lalitRow = page.locator("tr:has-text('Lalit')");
    await expect(lalitRow).toBeVisible();

    // Assert tickets count, chats count, and bug counts are visible in Lalit's report row
    await expect(lalitRow).toContainText("10"); // Tickets
    await expect(lalitRow).toContainText("5");  // Chats
    await expect(lalitRow).toContainText("3");  // Bugs
  });
});
