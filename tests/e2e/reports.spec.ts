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

    await page.click("button:has-text('Close')");
    await expect(reportsPage.modalHeading).not.toBeVisible();
  });

  test("should allow downloading CSV report file", async ({ reportsPage, page }) => {
    const downloadPromise = page.waitForEvent("download");
    await reportsPage.triggerCSVExport();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toContain("monthly-report");
  });
});
