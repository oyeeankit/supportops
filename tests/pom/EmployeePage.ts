import { type Page } from "@playwright/test";

export class EmployeePage {
  readonly addEmployeeButton = this.page.locator("button:has-text('Add Employee')");
  readonly fullNameInput = this.page.locator("input[name='fullName']");
  readonly emailInput = this.page.locator("input[name='email']");
  readonly roleSelect = this.page.locator("select[name='roleId']");
  readonly shiftSelect = this.page.locator("select[name='shift']");
  readonly passwordInput = this.page.locator("input[name='password']");
  readonly submitButton = this.page.locator("button[type='submit']");
  readonly searchInput = this.page.locator("input[placeholder*='Search']");
  readonly employeeRow = (fullName: string) => this.page.locator(`tr:has-text('${fullName}')`);

  constructor(private page: Page) {}

  async goto() {
    await this.page.goto("/employees");
  }

  async createEmployee(employee: {
    fullName: string;
    email: string;
    role: string;
    shift: string;
    password?: string;
  }) {
    await this.addEmployeeButton.click();
    await this.fullNameInput.fill(employee.fullName);
    await this.emailInput.fill(employee.email);
    await this.roleSelect.selectOption({ label: this.getRoleLabel(employee.role) });
    await this.shiftSelect.selectOption({ label: this.getShiftLabel(employee.shift) });
    if (employee.password) {
      await this.passwordInput.fill(employee.password);
    }
    await this.submitButton.click();
  }

  async searchEmployee(query: string) {
    await this.searchInput.fill(query);
    await this.page.waitForTimeout(500); // Wait for input debounce
  }

  private getRoleLabel(role: string): string {
    if (role === "manager") return "Manager";
    if (role === "support_engineer") return "Support Engineer";
    return "QA Engineer";
  }

  private getShiftLabel(shift: string): string {
    if (shift === "morning") return "Morning Shift";
    if (shift === "day") return "Day Shift";
    return "Evening Shift";
  }
}
