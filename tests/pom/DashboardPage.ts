import { type Page } from "@playwright/test";

export class DashboardPage {
  readonly heading = this.page.locator("h1");
  readonly themeToggle = this.page.locator("button[aria-label='Toggle theme']");
  readonly logoutButton = this.page.locator("button:has-text('Sign Out'), button:has-text('Log out'), a:has-text('Sign Out')");
  readonly kpiValue = (label: string) => this.page.locator(`div:has-text('${label}')`).locator(".text-2xl, .text-3xl");

  constructor(private page: Page) {}

  async goto() {
    await this.page.goto("/dashboard");
  }

  async toggleTheme() {
    await this.themeToggle.click();
  }

  async signOut() {
    await this.logoutButton.first().click();
    await this.page.waitForURL("**/login");
  }
}
