import { type Page } from "@playwright/test";

export class DailyOperationsPage {
  readonly workspaceHeading = this.page.locator("h1:has-text('Daily Operations'), h2:has-text('Daily Operations')");
  readonly metricPresent = this.page.getByTestId("metric-present");
  readonly metricWfh = this.page.getByTestId("metric-wfh");
  readonly metricLeave = this.page.getByTestId("metric-leave");
  readonly metricCompletedLogs = this.page.getByTestId("metric-completed-logs");
  readonly metricPendingLogs = this.page.getByTestId("metric-pending-logs");
  readonly metricTickets = this.page.getByTestId("metric-tickets");
  readonly metricChats = this.page.getByTestId("metric-chats");
  readonly metricTesting = this.page.getByTestId("metric-testing");
  readonly metricBugs = this.page.getByTestId("metric-bugs");
  
  readonly progressBar = this.page.getByTestId("daily-progress-bar");
  readonly todayBadge = this.page.getByTestId("today-badge");
  readonly prevDayBtn = this.page.getByTestId("prev-day-btn");
  readonly nextDayBtn = this.page.getByTestId("next-day-btn");
  readonly todayBtn = this.page.getByTestId("today-btn");
  readonly datePickerInput = this.page.getByTestId("date-picker-input");
  
  readonly searchInput = this.page.getByTestId("search-employee-input");
  readonly filterStatusSelect = this.page.getByTestId("filter-status-select");
  readonly filterRoleSelect = this.page.getByTestId("filter-role-select");
  readonly sortBySelect = this.page.getByTestId("sort-by-select");
  readonly stickySummaryBar = this.page.getByTestId("sticky-summary-bar");
  
  readonly bulkActionTrigger = this.page.getByTestId("bulk-action-trigger");
  readonly selectAllCheckbox = this.page.getByTestId("select-all-checkbox");
  
  readonly modalHeading = this.page.locator("h2:has-text('Daily Operations'), h2:has-text('Edit Daily Operations')");
  readonly attendanceSelect = this.page.getByTestId("attendance-status-select");
  readonly ticketsInput = this.page.locator("input[name='tickets_handled']");
  readonly chatsInput = this.page.locator("input[name='chats_handled']");
  readonly notesTextarea = this.page.locator("textarea[name='notes'], textarea[name='testing_notes']");
  readonly saveButton = this.page.locator("button[type='submit']:has-text('Save'), button:has-text('Save Operations')");
  readonly saveAndNextButton = this.page.locator("button:has-text('Save & Next Employee')");
  
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto("/operations");
  }

  async openLogModal(employeeName: string) {
    const card = this.page.locator(`div[data-testid^='employee-card']:has-text('${employeeName}')`);
    await card.locator("[data-testid='continue-log-btn'], button:has-text('Add Log'), button:has-text('Continue Log')").first().click();
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

  async saveAndNext() {
    await this.saveAndNextButton.click();
  }

  async filterByStatus(status: string) {
    await this.filterStatusSelect.selectOption(status);
  }

  async searchEmployee(query: string) {
    await this.searchInput.fill(query);
  }
}
