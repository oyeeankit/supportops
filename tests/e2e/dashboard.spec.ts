import { test, expect } from "../fixtures/testFixture";

test.describe("MVP Manager Dashboard", () => {
  test.use({ storageState: "tests/.auth/manager.json" });

  test.beforeEach(async ({ dashboardPage }) => {
    await dashboardPage.goto();
  });

  test("should display manager dashboard greeting header and URL", async ({ dashboardPage, page }) => {
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(dashboardPage.heading).toBeVisible();
  });

  test("should support theme toggle", async ({ dashboardPage, page }) => {
    const htmlElement = page.locator("html");
    const initClass = await htmlElement.getAttribute("class");

    await dashboardPage.toggleTheme();
    const updatedClass = await htmlElement.getAttribute("class");

    expect(initClass).not.toBe(updatedClass);
  });

  test("should render 4 MVP summary KPI cards and Today's Daily Reports table", async ({ page }) => {
    await expect(page.locator("text=Present Employees")).toBeVisible();
    await expect(page.locator("text=Reports Submitted")).toBeVisible();
    await expect(page.locator("text=Pending Reports")).toBeVisible();
    await expect(page.locator("text=Late Reports")).toBeVisible();
    await expect(page.locator("text=Today's Daily Reports")).toBeVisible();
  });
});
