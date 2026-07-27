import { test, expect } from "../fixtures/testFixture";

test.describe("Dashboard Navigation & Shell UI", () => {
  test.use({ storageState: "tests/.auth/manager.json" });

  test.beforeEach(async ({ dashboardPage }) => {
    await dashboardPage.goto();
  });

  test("should display manager dashboard header", async ({ dashboardPage, page }) => {
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(dashboardPage.heading).toBeVisible();
  });

  test("should support dark mode / light mode theme toggle", async ({ dashboardPage, page }) => {
    const htmlElement = page.locator("html");
    const initClass = await htmlElement.getAttribute("class");

    await dashboardPage.toggleTheme();
    const updatedClass = await htmlElement.getAttribute("class");

    expect(initClass).not.toBe(updatedClass);
  });

  test("should contain key operations metric sections", async ({ dashboardPage }) => {
    await expect(dashboardPage.kpiCard("Present")).toBeVisible();
    await expect(dashboardPage.kpiCard("WFH")).toBeVisible();
    await expect(dashboardPage.kpiCard("On Leave")).toBeVisible();
  });
});
