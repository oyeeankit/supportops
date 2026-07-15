import { test, expect } from "../fixtures/testFixture";

test.describe("Daily Support & Testing Logs Logging", () => {
  test.use({ storageState: "tests/.auth/manager.json" });

  test.beforeEach(async ({ dailyOperationsPage }) => {
    await dailyOperationsPage.goto();
  });

  test("should open modal and populate support elements", async ({ dailyOperationsPage, page }) => {
    await dailyOperationsPage.openLogModal("Lalit");

    // Assert modal header is visible
    await expect(dailyOperationsPage.modalHeading).toBeVisible();

    await dailyOperationsPage.fillSupportSummary({
      attendanceStatus: "wfh",
      tickets: 15,
      chats: 10,
      notes: "WFH log verified from E2E test suite.",
    });

    await page.click("button:has-text('Cancel')");
    await expect(dailyOperationsPage.modalHeading).not.toBeVisible();
  });
});
