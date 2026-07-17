import { type Page } from "@playwright/test";

export class DailyOperationsPage {
  readonly modalHeading = this.page.locator("h2:has-text('Daily Operations'), h2:has-text('Edit Daily Operations')");
  readonly attendanceSelect = this.page.locator("select[value]");
  readonly ticketsInput = this.page.locator("input[name='tickets_handled']");
  readonly chatsInput = this.page.locator("input[name='chats_handled']");
  readonly notesTextarea = this.page.locator("textarea[name='notes']");
  readonly saveButton = this.page.locator("button[type='submit']");
  readonly errorMessage = (msg: string) => this.page.locator(`text=${msg}`);

  constructor(private page: Page) {}

  async goto() {
    await this.page.goto("/dashboard");
  }

  async openLogModal(employeeName: string) {
    const card = this.page.locator(`div.card, div.border:has-text('${employeeName}')`);
    await card.locator("button:has-text('Log Operations'), button:has-text('Edit Log')").first().click();
  }

  async fillSupportSummary(log: {
    attendanceStatus: string;
    tickets: number;
    chats: number;
    notes?: string;
  }) {
    await this.attendanceSelect.first().selectOption({ value: log.attendanceStatus });
    await this.ticketsInput.fill(String(log.tickets));
    await this.chatsInput.fill(String(log.chats));
    if (log.notes) {
      await this.notesTextarea.fill(log.notes);
    }
  }

  async saveLogs() {
    await this.saveButton.click();
  }
}
