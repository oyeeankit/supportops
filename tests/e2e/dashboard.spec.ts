import { test, expect } from "../fixtures/testFixture";

test.describe("Dashboard Enterprise Manager Console", () => {
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

  test("should render Requires Attention alert box and Today's Operations metrics", async ({ page }) => {
    await expect(page.locator("text=Requires Attention")).toBeVisible();
    await expect(page.locator("text=Today's Operational Output")).toBeVisible();
    await expect(page.locator("text=Tickets Closed")).toBeVisible();
    await expect(page.locator("text=Chats Handled")).toBeVisible();
    await expect(page.locator("text=Testing Entries")).toBeVisible();
  });

  test("should render Team Activity Feed and Active Testing Overview", async ({ page }) => {
    await expect(page.locator("text=Team Activity Feed")).toBeVisible();
    await expect(page.locator("text=Active Testing Overview")).toBeVisible();
  });
});
