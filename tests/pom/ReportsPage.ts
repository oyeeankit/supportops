import { type Page } from "@playwright/test";

export class ReportsPage {
  readonly modalHeading = this.page.locator("h2:has-text('Employee Performance Details')");
  readonly supportInput = this.page.locator("input#support_adjustment");
  readonly testingInput = this.page.locator("input#testing_adjustment");
  readonly remarksTextarea = this.page.locator("textarea#manager_remarks");
  readonly saveAdjustmentsButton = this.page.locator("button:has-text('Save Adjustments')");
  readonly csvExportButton = this.page.locator("button:has-text('Export CSV')");
  readonly scoreValue = this.page.locator("p:has-text('/ 5')");

  constructor(private page: Page) {}

  async goto() {
    await this.page.goto("/reports");
  }

  async openEmployeeModal(employeeName: string) {
    const row = this.page.locator(`tr:has-text('${employeeName}')`);
    await row.locator("button:has-text('View')").first().click();
  }

  async fillAdjustments(support: number, testing: number, remarks: string) {
    await this.supportInput.fill(String(support));
    await this.testingInput.fill(String(testing));
    await this.remarksTextarea.fill(remarks);
    await this.saveAdjustmentsButton.click();
  }

  async triggerCSVExport() {
    await this.csvExportButton.click();
  }
}
