# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: employee-portal.spec.ts >> Employee Daily Report Portal >> should render employee report form and submit daily log
- Location: tests\e2e\employee-portal.spec.ts:11:7

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('h1')
Expected substring: "Submit Daily Report"
Received string:    "SupportOps"
Timeout: 5000ms

Call log:
  - Expect "toContainText" with timeout 5000ms
  - waiting for locator('h1')
    13 × locator resolved to <h1 class="text-xl font-black tracking-tight text-foreground">SupportOps</h1>
       - unexpected value "SupportOps"

```

```yaml
- heading "SupportOps" [level=1]
```

# Test source

```ts
  1  | import { test, expect } from "../fixtures/testFixture";
  2  | import { TEST_USERS } from "../data/test-data";
  3  | 
  4  | test.describe("Employee Daily Report Portal", () => {
  5  |   test.beforeEach(async ({ loginPage }) => {
  6  |     // Authenticate as Support Engineer (Lalit)
  7  |     await loginPage.goto();
  8  |     await loginPage.login(TEST_USERS.support.email, TEST_USERS.support.password);
  9  |   });
  10 | 
  11 |   test("should render employee report form and submit daily log", async ({ page }) => {
  12 |     await page.goto("/my-reports/new");
  13 | 
  14 |     // 1. Assert form header elements
> 15 |     await expect(page.locator("h1")).toContainText("Submit Daily Report");
     |                                      ^ Error: expect(locator).toContainText(expected) failed
  16 | 
  17 |     // 2. Fill tickets closed and chats handled
  18 |     await page.fill("input[name='tickets_handled']", "14");
  19 |     await page.fill("input[name='chats_handled']", "9");
  20 | 
  21 |     // 3. Fill general notes
  22 |     await page.fill("textarea[name='notes']", "E2E automated employee report submission verification.");
  23 | 
  24 |     // 4. Submit form
  25 |     await page.click("button:has-text('Submit Daily Report')");
  26 | 
  27 |     // 5. Assert redirect to /my-reports history page with success indication
  28 |     await expect(page).toHaveURL(/.*my-reports/);
  29 |     await expect(page.locator("h1")).toContainText("My Daily Reports");
  30 |   });
  31 | 
  32 |   test("should support saving draft", async ({ page }) => {
  33 |     await page.goto("/my-reports/new");
  34 | 
  35 |     await page.fill("input[name='tickets_handled']", "5");
  36 |     await page.click("button:has-text('Save Draft') font, button:has-text('Save Draft')");
  37 | 
  38 |     await expect(page.locator("text=Draft auto-saved, text=Draft saved")).toBeVisible();
  39 |   });
  40 | });
  41 | 
  42 | test.describe("Manager Submissions Dashboard", () => {
  43 |   test.use({ storageState: "tests/.auth/manager.json" });
  44 | 
  45 |   test("should display manager daily report control center", async ({ page }) => {
  46 |     await page.goto("/operations/submissions");
  47 | 
  48 |     await expect(page.locator("h1")).toContainText("Employee Daily Reports Dashboard");
  49 |     await expect(page.locator("text=Submitted Today")).toBeVisible();
  50 |     await expect(page.locator("text=Late Submissions")).toBeVisible();
  51 |   });
  52 | });
  53 | 
```