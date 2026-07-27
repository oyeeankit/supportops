import { test as baseTest } from "@playwright/test";
import { LoginPage } from "../pom/LoginPage";
import { DashboardPage } from "../pom/DashboardPage";
import { EmployeePage } from "../pom/EmployeePage";
import { DailyOperationsPage } from "../pom/DailyOperationsPage";
import { ReportsPage } from "../pom/ReportsPage";
import { SettingsPage } from "../pom/SettingsPage";

// Define the custom types for base page objects
type PlaywrightFixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  employeePage: EmployeePage;
  dailyOperationsPage: DailyOperationsPage;
  reportsPage: ReportsPage;
  settingsPage: SettingsPage;
};

// Extend the core test object to auto-instantiate POM classes
export const test = baseTest.extend<PlaywrightFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
  employeePage: async ({ page }, use) => {
    await use(new EmployeePage(page));
  },
  dailyOperationsPage: async ({ page }, use) => {
    await use(new DailyOperationsPage(page));
  },
  reportsPage: async ({ page }, use) => {
    await use(new ReportsPage(page));
  },
  settingsPage: async ({ page }, use) => {
    await use(new SettingsPage(page));
  },
});

export { expect } from "@playwright/test";
