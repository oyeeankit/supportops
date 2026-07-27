import { test, expect } from "../fixtures/testFixture";

test.describe("Daily Operations Manager Workspace Console", () => {
  test.use({ storageState: "tests/.auth/manager.json" });

  test.beforeEach(async ({ dailyOperationsPage }) => {
    await dailyOperationsPage.goto();
  });

  test("should render top summary KPIs and progress bar section", async ({ dailyOperationsPage, page }) => {
    // Assert 10 KPI summary cards are present
    await expect(dailyOperationsPage.metricPresent).toBeVisible();
    await expect(dailyOperationsPage.metricWfh).toBeVisible();
    await expect(dailyOperationsPage.metricLeave).toBeVisible();
    await expect(dailyOperationsPage.metricCompletedLogs).toBeVisible();
    await expect(dailyOperationsPage.metricPendingLogs).toBeVisible();
    await expect(dailyOperationsPage.metricTickets).toBeVisible();
    await expect(dailyOperationsPage.metricChats).toBeVisible();
    await expect(dailyOperationsPage.metricTesting).toBeVisible();
    await expect(dailyOperationsPage.metricBugs).toBeVisible();

    // Assert progress bar section is visible
    await expect(dailyOperationsPage.progressBar).toBeVisible();
  });

  test("should verify log date section and Today badge", async ({ dailyOperationsPage }) => {
    await expect(dailyOperationsPage.todayBadge).toBeVisible();
    await expect(dailyOperationsPage.prevDayBtn).toBeEnabled();
    await expect(dailyOperationsPage.nextDayBtn).toBeDisabled(); // Disabled for today

    // Click Previous Day button
    await dailyOperationsPage.prevDayBtn.click();
    await expect(dailyOperationsPage.todayBadge).not.toBeVisible();

    // Click Today button
    await dailyOperationsPage.todayBtn.click();
    await expect(dailyOperationsPage.todayBadge).toBeVisible();
  });

  test("should filter employee cards by status and search query", async ({ dailyOperationsPage, page }) => {
    // Test search filter
    await dailyOperationsPage.searchEmployee("Lalit");
    const cards = page.locator("div[data-testid^='employee-card']");
    await expect(cards.first()).toContainText("Lalit");

    // Clear search
    await dailyOperationsPage.searchEmployee("");

    // Test status filter
    await dailyOperationsPage.filterByStatus("pending");
    await expect(dailyOperationsPage.filterStatusSelect).toHaveValue("pending");
  });

  test("should open daily operations modal and verify quick statistics", async ({ dailyOperationsPage, page }) => {
    // Open log modal for an employee
    const firstCard = page.locator("div[data-testid^='employee-card']").first();
    await expect(firstCard).toBeVisible();

    await firstCard.locator("[data-testid='continue-log-btn']").click();
    await expect(dailyOperationsPage.modalHeading).toBeVisible();

    // Fill support summary
    await dailyOperationsPage.fillSupportSummary({
      attendanceStatus: "wfh",
      tickets: 12,
      chats: 8,
      notes: "E2E automated log entry verification.",
    });

    // Close modal
    await page.click("button:has-text('Cancel')");
    await expect(dailyOperationsPage.modalHeading).not.toBeVisible();
  });

  test("should toggle between Workspace Console and Calendar view", async ({ page }) => {
    await page.click("[data-testid='calendar-view-btn']");
    await expect(page.locator("[data-testid='calendar-prev-month']")).toBeVisible();

    await page.click("[data-testid='workspace-view-btn']");
    await expect(page.getByTestId("metric-present")).toBeVisible();
  });
});
