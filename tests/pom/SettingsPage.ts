import { type Page } from "@playwright/test";

export class SettingsPage {
  readonly heading = this.page.locator("h1:has-text('Settings'), h2:has-text('Settings')");
  readonly themeToggle = this.page.locator("button[aria-label='Toggle theme']");
  readonly saveSettingsButton = this.page.locator("button:has-text('Save Settings'), button:has-text('Save')");
  readonly resetButton = this.page.locator("button:has-text('Reset'), button:has-text('Cancel')");

  constructor(private page: Page) {}

  async goto() {
    await this.page.goto("/settings");
  }

  async saveSettings() {
    if (await this.saveSettingsButton.isVisible()) {
      await this.saveSettingsButton.click();
    }
  }
}
