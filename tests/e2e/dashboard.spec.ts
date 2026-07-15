import { test, expect } from "../fixtures/testFixture";

test.describe("Dashboard Navigation & Shell UI", () => {
  test.use({ storageState: "tests/.auth/manager.json" });

  test.beforeEach(async ({ dashboardPage }) => {
    await dashboardPage.goto();
  });

  test("should display manager dashboard header", async ({ dashboardPage }) => {
    await expect(dashboardPage.heading).toContainText("Dashboard");
  });

  test("should support dark mode / light mode theme toggle", async ({ dashboardPage, page }) => {
    const htmlElement = page.locator("html");
    const initClass = await htmlElement.getAttribute("class");

    await dashboardPage.toggleTheme();
    const updatedClass = await htmlElement.getAttribute("class");

    expect(initClass).not.toBe(updatedClass);
  });

  test("should contain key operations metric sections", async ({ dashboardPage }) => {
    await expect(dashboardPage.kpiValue("Present")).toContainText("0");
    await expect(dashboardPage.kpiValue("WFH")).toContainText("0");
    await expect(dashboardPage.kpiValue("On Leave")).toContainText("0");
  });
});
