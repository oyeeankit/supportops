import { test, expect } from "../fixtures/testFixture";

test.describe("Monthly Performance Reports & Calculations", () => {
  test.use({ storageState: "tests/.auth/manager.json" });

  test.beforeEach(async ({ reportsPage }) => {
    await reportsPage.goto();
  });

  test("should load performance metrics table and open details modal", async ({ reportsPage, page }) => {
    await reportsPage.openEmployeeModal("Lalit");

    // Assert details panel structure exists
    await expect(reportsPage.modalHeading).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(reportsPage.modalHeading).not.toBeVisible();
  });

  test("should allow downloading CSV report file", async ({ reportsPage, page }) => {
    const downloadPromise = page.waitForEvent("download");
    await reportsPage.triggerCSVExport();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toContain("monthly-report");
  });

  test("should assert role-based score column visibility matches expected rules", async ({ page }) => {
    // Lalit is a Support Engineer -> Support and Testing columns both display metrics (not "-")
    const supportRow = page.locator("tr:has-text('Lalit')");
    await expect(supportRow.locator("td").nth(3)).not.toContainText("-"); // Support Days has value
    await expect(supportRow.locator("td").nth(4)).not.toContainText("-"); // Testing Days has value
    await expect(supportRow.locator("td").nth(9)).not.toContainText("-"); // Support Score has badge value
    await expect(supportRow.locator("td").nth(10)).not.toContainText("-"); // Testing Score has badge value

    // Shivam is a QA Engineer -> Support columns display "-", Testing columns display metrics
    const qaRow = page.locator("tr:has-text('Shivam')");
    await expect(qaRow.locator("td").nth(3)).toContainText("-");    // Support Days is "-"
    await expect(qaRow.locator("td").nth(4)).not.toContainText("-"); // Testing Days has value
    await expect(qaRow.locator("td").nth(9)).toContainText("-");    // Support Score is "-"
    await expect(qaRow.locator("td").nth(10)).not.toContainText("-"); // Testing Score has badge value
  });
});
