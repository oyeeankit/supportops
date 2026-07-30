# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: employee-portal.spec.ts >> Employee Daily Report Portal >> should support saving draft
- Location: tests\e2e\employee-portal.spec.ts:32:7

# Error details

```
TimeoutError: page.fill: Timeout 15000ms exceeded.
Call log:
  - waiting for locator('input[name=\'tickets_handled\']')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - main [ref=e2]:
    - generic [ref=e3]:
      - generic [ref=e4]:
        - generic [ref=e5]: SO
        - heading "SupportOps" [level=1] [ref=e6]
        - paragraph [ref=e7]: Sign in to access your team operations portal
      - generic [ref=e8]:
        - generic [ref=e9]:
          - text: Work email
          - textbox "Work email" [ref=e10]:
            - /placeholder: name@company.com
            - text: mane@thaliatechnologies.com
        - generic [ref=e11]:
          - generic [ref=e12]:
            - generic [ref=e13]: Password
            - button "Show" [ref=e14] [cursor=pointer]:
              - img [ref=e15]
              - text: Show
          - textbox "Password" [ref=e18]:
            - /placeholder: ••••••••
            - text: password123
        - generic [ref=e20] [cursor=pointer]:
          - checkbox "Remember me" [checked] [ref=e21]
          - generic [ref=e22]: Remember me
        - button "Sign in to SupportOps" [ref=e23] [cursor=pointer]
  - button "Open Next.js Dev Tools" [ref=e29] [cursor=pointer]:
    - img [ref=e30]
  - alert [ref=e33]
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
  15 |     await expect(page.locator("h1")).toContainText("Submit Daily Report");
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
> 35 |     await page.fill("input[name='tickets_handled']", "5");
     |                ^ TimeoutError: page.fill: Timeout 15000ms exceeded.
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