# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: dashboard.spec.ts >> MVP Manager Dashboard >> should display manager dashboard greeting header and URL
- Location: tests\e2e\dashboard.spec.ts:10:7

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /.*dashboard/
Received string:  "http://localhost:3000/login"
Timeout: 5000ms

Call log:
  - Expect "toHaveURL" with timeout 5000ms
    13 × unexpected value "http://localhost:3000/login"

```

```yaml
- main:
  - text: SO
  - heading "SupportOps" [level=1]
  - paragraph: Sign in to access your team operations portal
  - text: Work email
  - textbox "Work email":
    - /placeholder: name@company.com
    - text: mane@thaliatechnologies.com
  - text: Password
  - button "Show"
  - textbox "Password":
    - /placeholder: ••••••••
    - text: password123
  - checkbox "Remember me" [checked]
  - text: Remember me
  - button "Sign in to SupportOps"
- alert
```

# Test source

```ts
  1  | import { test, expect } from "../fixtures/testFixture";
  2  | 
  3  | test.describe("MVP Manager Dashboard", () => {
  4  |   test.use({ storageState: "tests/.auth/manager.json" });
  5  | 
  6  |   test.beforeEach(async ({ dashboardPage }) => {
  7  |     await dashboardPage.goto();
  8  |   });
  9  | 
  10 |   test("should display manager dashboard greeting header and URL", async ({ dashboardPage, page }) => {
> 11 |     await expect(page).toHaveURL(/.*dashboard/);
     |                        ^ Error: expect(page).toHaveURL(expected) failed
  12 |     await expect(dashboardPage.heading).toBeVisible();
  13 |   });
  14 | 
  15 |   test("should support theme toggle", async ({ dashboardPage, page }) => {
  16 |     const htmlElement = page.locator("html");
  17 |     const initClass = await htmlElement.getAttribute("class");
  18 | 
  19 |     await dashboardPage.toggleTheme();
  20 |     const updatedClass = await htmlElement.getAttribute("class");
  21 | 
  22 |     expect(initClass).not.toBe(updatedClass);
  23 |   });
  24 | 
  25 |   test("should render 4 MVP summary KPI cards and Today's Daily Reports table", async ({ page }) => {
  26 |     await expect(page.locator("text=Present Employees")).toBeVisible();
  27 |     await expect(page.locator("text=Reports Submitted")).toBeVisible();
  28 |     await expect(page.locator("text=Pending Reports")).toBeVisible();
  29 |     await expect(page.locator("text=Late Reports")).toBeVisible();
  30 |     await expect(page.locator("text=Today's Daily Reports")).toBeVisible();
  31 |   });
  32 | });
  33 | 
```