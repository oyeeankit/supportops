import { type Page } from "@playwright/test";

export class ReportsPage {
  readonly modalHeading = this.page.locator("h2:has-text('Employee Performance Details')");
  readonly supportInput = this.page.locator("input#support_adjustment_view");
  readonly remarksTextarea = this.page.locator("textarea#remarks_view");
  readonly saveAdjustmentsButton = this.page.locator("button:has-text('Save Evaluation')");
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

  async fillAdjustments(points: number, remarks: string) {
    await this.supportInput.fill(String(points));
    await this.remarksTextarea.fill(remarks);
    await this.saveAdjustmentsButton.click();
  }

  async triggerCSVExport() {
    await this.csvExportButton.click();
  }
}
