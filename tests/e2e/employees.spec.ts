import { test, expect } from "../fixtures/testFixture";

test.describe("Team Management (Employee CRUD)", () => {
  test.use({ storageState: "tests/.auth/manager.json" });

  test.beforeEach(async ({ employeePage }) => {
    await employeePage.goto();
  });

  test("should display employee search options", async ({ employeePage }) => {
    await expect(employeePage.searchInput).toBeVisible();
  });

  test("should filter the table correctly by query name", async ({ employeePage }) => {
    await employeePage.searchEmployee("Lalit");
    await expect(employeePage.employeeRow("Lalit")).toBeVisible();
    await expect(employeePage.employeeRow("Shivam")).not.toBeVisible();
  });
});
