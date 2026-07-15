import { chromium, type FullConfig } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

// Cached storage states folder
const AUTH_DIR = path.join(__dirname, ".auth");

/**
 * Helper to parse .env.local file.
 */
function loadEnvLocal() {
  const envPath = path.resolve(__dirname, "../.env.local");
  if (!fs.existsSync(envPath)) return {};
  const content = fs.readFileSync(envPath, "utf8");
  const env: Record<string, string> = {};
  content.split("\n").forEach((line) => {
    const match = line.match(/^\s*([\w\.\-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      let val = match[2] || "";
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      else if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
      env[match[1]] = val.trim();
    }
  });
  return env;
}

export default async function globalSetup(config: FullConfig) {
  const env = loadEnvLocal();
  const baseURL = config.projects[0].use.baseURL || "http://localhost:3000";

  // Create .auth directory if it does not exist
  if (!fs.existsSync(AUTH_DIR)) {
    fs.mkdirSync(AUTH_DIR, { recursive: true });
  }

  // Load from environment variables first, then fallback to defaults
  const managerEmail = process.env.E2E_MANAGER_EMAIL || env.E2E_MANAGER_EMAIL || "mane@thaliatechnologies.com";
  const managerPassword = process.env.E2E_MANAGER_PASSWORD || env.E2E_MANAGER_PASSWORD || "password123";

  const supportEmail = process.env.E2E_SUPPORT_EMAIL || env.E2E_SUPPORT_EMAIL || "lalit@thaliatechnologies.com";
  const supportPassword = process.env.E2E_SUPPORT_PASSWORD || env.E2E_SUPPORT_PASSWORD || "password123";

  const qaEmail = process.env.E2E_QA_EMAIL || env.E2E_QA_EMAIL || "shivam@thaliatechnologies.com";
  const qaPassword = process.env.E2E_QA_PASSWORD || env.E2E_QA_PASSWORD || "password123";

  const credentials = [
    { name: "manager", email: managerEmail, password: managerPassword },
    { name: "support", email: supportEmail, password: supportPassword },
    { name: "qa", email: qaEmail, password: qaPassword },
  ];

  const browser = await chromium.launch();

  for (const cred of credentials) {
    console.log(`Setting up cached authentication state for role: ${cred.name} (${cred.email})`);
    const page = await browser.newPage();
    await page.goto(`${baseURL}/login`);
    
    // Fill credentials
    await page.fill("input[name='email']", cred.email);
    await page.fill("input[name='password']", cred.password);
    await page.click("button[type='submit']");
    
    // Ensure dashboard loads (confirming successful authentication)
    await page.waitForURL("**/dashboard");
    
    // Cache auth storage state
    await page.context().storageState({ path: path.join(AUTH_DIR, `${cred.name}.json`) });
    await page.close();
  }

  await browser.close();
  console.log("SUCCESS: Global setup completed and all storage states cached.");
}
