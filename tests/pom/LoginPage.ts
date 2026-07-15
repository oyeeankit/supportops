import { type Page } from "@playwright/test";

export class LoginPage {
  readonly emailInput = this.page.locator("input[name='email']");
  readonly passwordInput = this.page.locator("input[name='password']");
  readonly submitButton = this.page.locator("button[type='submit']");
  readonly errorMessage = (msg: string) => this.page.locator(`text=${msg}`);

  constructor(private page: Page) {}

  async goto() {
    await this.page.goto("/login");
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}
