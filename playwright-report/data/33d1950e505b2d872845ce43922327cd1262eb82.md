# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: dashboard.spec.ts >> MVP Manager Dashboard >> should support theme toggle
- Location: tests\e2e\dashboard.spec.ts:15:7

# Error details

```
TimeoutError: locator.click: Timeout 15000ms exceeded.
Call log:
  - waiting for locator('button[aria-label=\'Toggle theme\']')

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
  1  | import { type Page } from "@playwright/test";
  2  | 
  3  | export class DashboardPage {
  4  |   readonly heading = this.page.locator("h1");
  5  |   readonly themeToggle = this.page.locator("button[aria-label='Toggle theme']");
  6  |   readonly logoutButton = this.page.locator("button:has-text('Sign Out'), button:has-text('Log out'), a:has-text('Sign Out')");
  7  |   readonly kpiCard = (label: string) => this.page.locator(`div:has-text('${label}')`).first();
  8  | 
  9  |   constructor(private page: Page) {}
  10 | 
  11 |   async goto() {
  12 |     await this.page.goto("/dashboard");
  13 |   }
  14 | 
  15 |   async toggleTheme() {
> 16 |     await this.themeToggle.click();
     |                            ^ TimeoutError: locator.click: Timeout 15000ms exceeded.
  17 |   }
  18 | 
  19 |   async signOut() {
  20 |     await this.logoutButton.first().click();
  21 |     await this.page.waitForURL("**/login");
  22 |   }
  23 | }
  24 | 
```