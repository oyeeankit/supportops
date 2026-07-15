# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\verify-adjustments.spec.ts >> Verify Monthly Performance Adjustments
- Location: tests\verify-adjustments.spec.ts:3:5

# Error details

```
Error: locator.innerText: Error: strict mode violation: locator('p:has-text(\'/ 5\')') resolved to 2 elements:
    1) <p class="text-2xl font-bold">3.89 / 5</p> aka getByText('/ 5').first()
    2) <p class="text-2xl font-bold">3.89 / 5</p> aka getByText('/ 5').nth(1)

Call log:
  - waiting for locator('p:has-text(\'/ 5\')')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - complementary [ref=e4]:
      - link "SupportOps Team Operations" [ref=e5] [cursor=pointer]:
        - /url: /dashboard
        - img [ref=e7]
        - generic [ref=e10]:
          - paragraph [ref=e11]: SupportOps
          - paragraph [ref=e12]: Team Operations
      - navigation [ref=e13]:
        - link "Dashboard" [ref=e14] [cursor=pointer]:
          - /url: /dashboard
          - img [ref=e15]
          - text: Dashboard
        - link "Team" [ref=e18] [cursor=pointer]:
          - /url: /team
          - img [ref=e19]
          - text: Team
        - link "Daily Log" [ref=e24] [cursor=pointer]:
          - /url: /operations
          - img [ref=e25]
          - text: Daily Log
        - link "Reports" [ref=e28] [cursor=pointer]:
          - /url: /reports
          - img [ref=e29]
          - text: Reports
        - link "Settings" [ref=e32] [cursor=pointer]:
          - /url: /settings
          - img [ref=e33]
          - text: Settings
    - generic [ref=e36]:
      - banner [ref=e37]:
        - generic [ref=e38]:
          - generic [ref=e39]:
            - img [ref=e40]
            - text: Search people, reports, activity...
          - generic [ref=e43]:
            - generic [ref=e44]:
              - paragraph [ref=e45]: Ankit Mane
              - generic [ref=e46]: Manager
            - button "Toggle theme" [ref=e47]:
              - img [ref=e48]
            - button "Sign out" [ref=e55]
      - main [ref=e56]:
        - generic [ref=e57]:
          - generic [ref=e58]:
            - heading "Monthly Performance Report" [level=1] [ref=e59]
            - paragraph [ref=e60]: Review monthly support and testing performance, score employees, and export the manager report.
          - generic [ref=e61]:
            - generic [ref=e62]:
              - generic [ref=e63]:
                - generic [ref=e64]:
                  - text: Month
                  - combobox "Month" [ref=e65]:
                    - option "January"
                    - option "February"
                    - option "March"
                    - option "April"
                    - option "May"
                    - option "June"
                    - option "July" [selected]
                    - option "August"
                    - option "September"
                    - option "October"
                    - option "November"
                    - option "December"
                - generic [ref=e66]:
                  - text: Year
                  - combobox "Year" [ref=e67]:
                    - option "2022"
                    - option "2023"
                    - option "2024"
                    - option "2025"
                    - option "2026" [selected]
                    - option "2027"
                - button "Generate" [ref=e68]
              - generic [ref=e69]:
                - button "CSV" [ref=e70]:
                  - img [ref=e71]
                  - text: CSV
                - button "PDF" [ref=e74]:
                  - img [ref=e75]
                  - text: PDF
            - generic [ref=e79]:
              - generic [ref=e81]:
                - paragraph [ref=e82]: Month
                - paragraph [ref=e83]: July 2026
              - generic [ref=e85]:
                - paragraph [ref=e86]: Team tickets
                - paragraph [ref=e87]: "127"
              - generic [ref=e89]:
                - paragraph [ref=e90]: Team chats
                - paragraph [ref=e91]: "514"
              - generic [ref=e93]:
                - paragraph [ref=e94]: Testing entries
                - paragraph [ref=e95]: "8"
              - generic [ref=e97]:
                - paragraph [ref=e98]: Apps tested
                - paragraph [ref=e99]: "4"
              - generic [ref=e101]:
                - paragraph [ref=e102]: Bugs found
                - paragraph [ref=e103]: "4008"
              - generic [ref=e105]:
                - paragraph [ref=e106]: Critical bugs
                - paragraph [ref=e107]: "5004"
              - generic [ref=e109]:
                - paragraph [ref=e110]: Avg support (/5)
                - paragraph [ref=e111]: "3.00"
              - generic [ref=e113]:
                - paragraph [ref=e114]: Avg testing (/5)
                - paragraph [ref=e115]: "4.50"
              - generic [ref=e117]:
                - paragraph [ref=e118]: Avg daily score (/5)
                - paragraph [ref=e119]: "3.40"
              - generic [ref=e121]:
                - paragraph [ref=e122]: Avg final score (/5)
                - paragraph [ref=e123]: "3.50"
              - generic [ref=e125]:
                - paragraph [ref=e126]: Best support
                - paragraph [ref=e127]: Gaurav
              - generic [ref=e129]:
                - paragraph [ref=e130]: Best testing
                - paragraph [ref=e131]: Lalit
              - generic [ref=e133]:
                - paragraph [ref=e134]: Overall best
                - paragraph [ref=e135]: Lalit
            - generic [ref=e136]:
              - generic [ref=e137]:
                - searchbox "Search employee" [ref=e139]
                - generic [ref=e140]:
                  - button "Sort by Final" [ref=e141]
                  - button "Sort by Avg Daily" [ref=e142]
              - table [ref=e145]:
                - rowgroup [ref=e146]:
                  - row "Employee Role Support Days Testing Days Support Score Testing Score Avg Daily Score Final Score (/5) Rating" [ref=e147]:
                    - columnheader "Employee" [ref=e148]
                    - columnheader "Role" [ref=e149]
                    - columnheader "Support Days" [ref=e150]
                    - columnheader "Testing Days" [ref=e151]
                    - columnheader "Support Score" [ref=e152]
                    - columnheader "Testing Score" [ref=e153]
                    - columnheader "Avg Daily Score" [ref=e154]
                    - columnheader "Final Score (/5)" [ref=e155]
                    - columnheader "Rating" [ref=e156]
                    - columnheader [ref=e157]
                - rowgroup [ref=e158]:
                  - row "Lalit Support Engineer 2 2 3.00 4.60 3.64 3.89 ★★★★ Good View" [ref=e159]:
                    - cell "Lalit" [ref=e160]
                    - cell "Support Engineer" [ref=e161]
                    - cell "2" [ref=e162]
                    - cell "2" [ref=e163]
                    - cell "3.00" [ref=e164]:
                      - generic [ref=e165]: "3.00"
                    - cell "4.60" [ref=e166]:
                      - generic [ref=e167]: "4.60"
                    - cell "3.64" [ref=e168]:
                      - generic [ref=e169]: "3.64"
                    - cell "3.89 ★★★★" [ref=e170]:
                      - generic "Good" [ref=e171]: 3.89 ★★★★
                    - cell "Good" [ref=e172]
                    - cell "View" [ref=e173]:
                      - button "View" [ref=e174]
                  - row "Gaurav Support Engineer 6 5 3.00 4.40 3.47 3.47 ★★★ Average View" [ref=e175]:
                    - cell "Gaurav" [ref=e176]
                    - cell "Support Engineer" [ref=e177]
                    - cell "6" [ref=e178]
                    - cell "5" [ref=e179]
                    - cell "3.00" [ref=e180]:
                      - generic [ref=e181]: "3.00"
                    - cell "4.40" [ref=e182]:
                      - generic [ref=e183]: "4.40"
                    - cell "3.47" [ref=e184]:
                      - generic [ref=e185]: "3.47"
                    - cell "3.47 ★★★" [ref=e186]:
                      - generic "Average" [ref=e187]: 3.47 ★★★
                    - cell "Average" [ref=e188]
                    - cell "View" [ref=e189]:
                      - button "View" [ref=e190]
                  - row "Shivam QA Engineer 1 0 3.00 N/A 3.00 3.00 ★★★ Average View" [ref=e191]:
                    - cell "Shivam" [ref=e192]
                    - cell "QA Engineer" [ref=e193]
                    - cell "1" [ref=e194]
                    - cell "0" [ref=e195]
                    - cell "3.00" [ref=e196]:
                      - generic [ref=e197]: "3.00"
                    - cell "N/A" [ref=e198]:
                      - generic [ref=e199]: N/A
                    - cell "3.00" [ref=e200]:
                      - generic [ref=e201]: "3.00"
                    - cell "3.00 ★★★" [ref=e202]:
                      - generic "Average" [ref=e203]: 3.00 ★★★
                    - cell "Average" [ref=e204]
                    - cell "View" [ref=e205]:
                      - button "View" [ref=e206]
                  - row "Prathmesh Support Engineer 0 0 N/A N/A 0.00 1.00 ★★ Needs Improvement View" [ref=e207]:
                    - cell "Prathmesh" [ref=e208]
                    - cell "Support Engineer" [ref=e209]
                    - cell "0" [ref=e210]
                    - cell "0" [ref=e211]
                    - cell "N/A" [ref=e212]:
                      - generic [ref=e213]: N/A
                    - cell "N/A" [ref=e214]:
                      - generic [ref=e215]: N/A
                    - cell "0.00" [ref=e216]:
                      - generic [ref=e217]: "0.00"
                    - cell "1.00 ★★" [ref=e218]:
                      - generic "Needs Improvement" [ref=e219]: 1.00 ★★
                    - cell "Needs Improvement" [ref=e220]
                    - cell "View" [ref=e221]:
                      - button "View" [ref=e222]
                  - row "Rupali Support Engineer 0 0 N/A N/A 0.00 1.00 ★★ Needs Improvement View" [ref=e223]:
                    - cell "Rupali" [ref=e224]
                    - cell "Support Engineer" [ref=e225]
                    - cell "0" [ref=e226]
                    - cell "0" [ref=e227]
                    - cell "N/A" [ref=e228]:
                      - generic [ref=e229]: N/A
                    - cell "N/A" [ref=e230]:
                      - generic [ref=e231]: N/A
                    - cell "0.00" [ref=e232]:
                      - generic [ref=e233]: "0.00"
                    - cell "1.00 ★★" [ref=e234]:
                      - generic "Needs Improvement" [ref=e235]: 1.00 ★★
                    - cell "Needs Improvement" [ref=e236]
                    - cell "View" [ref=e237]:
                      - button "View" [ref=e238]
            - generic [ref=e240]:
              - generic [ref=e241]:
                - generic [ref=e242]:
                  - heading "Employee Performance Details" [level=2] [ref=e243]
                  - generic [ref=e244]:
                    - generic [ref=e245]: Lalit
                    - generic [ref=e246]: Support Engineer
                    - generic [ref=e247]: July 2026
                - generic [ref=e248]:
                  - generic [ref=e249]:
                    - paragraph [ref=e250]: 3.89 / 5
                    - paragraph [ref=e251]: ★★★★
                    - paragraph [ref=e252]: Good
                  - button [ref=e253]:
                    - img [ref=e254]
              - generic [ref=e257]:
                - generic [ref=e258]:
                  - generic [ref=e259]:
                    - generic [ref=e260]:
                      - heading "Lalit" [level=2] [ref=e261]
                      - paragraph [ref=e262]: Support Engineer monthly performance summary
                    - generic [ref=e263]:
                      - paragraph [ref=e264]: 3.89 / 5
                      - paragraph [ref=e265]: ★★★★
                      - paragraph [ref=e266]: Good
                  - generic [ref=e267]:
                    - generic [ref=e268]:
                      - paragraph [ref=e269]: Support Days
                      - paragraph [ref=e270]: "2"
                    - generic [ref=e271]:
                      - paragraph [ref=e272]: Testing Days
                      - paragraph [ref=e273]: "2"
                    - generic [ref=e274]:
                      - paragraph [ref=e275]: Total Tickets
                      - paragraph [ref=e276]: "102"
                    - generic [ref=e277]:
                      - paragraph [ref=e278]: Total Chats
                      - paragraph [ref=e279]: "501"
                    - generic [ref=e280]:
                      - paragraph [ref=e281]: Testing Entries
                      - paragraph [ref=e282]: "2"
                    - generic [ref=e283]:
                      - paragraph [ref=e284]: Apps Tested
                      - paragraph [ref=e285]: "1"
                    - generic [ref=e286]:
                      - paragraph [ref=e287]: Bugs Found
                      - paragraph [ref=e288]: "4003"
                    - generic [ref=e289]:
                      - paragraph [ref=e290]: Critical Bugs
                      - paragraph [ref=e291]: "5004"
                  - generic [ref=e292]:
                    - generic [ref=e293]:
                      - paragraph [ref=e294]: Support Score (/5)
                      - generic [ref=e295]: "3.00"
                    - generic [ref=e296]:
                      - paragraph [ref=e297]: Testing Score (/5)
                      - generic [ref=e298]: "4.60"
                    - generic [ref=e299]:
                      - paragraph [ref=e300]: Avg Daily Score (/5)
                      - generic [ref=e301]: "3.64"
                    - generic [ref=e302]:
                      - paragraph [ref=e303]: Final Score (/5)
                      - generic [ref=e304]: "3.89"
                - generic [ref=e305]:
                  - heading "Manager Performance Adjustments" [level=3] [ref=e306]
                  - generic [ref=e307]:
                    - generic [ref=e308]:
                      - generic [ref=e309]:
                        - text: Support Adjustment (-10 to +10)
                        - spinbutton "Support Adjustment (-10 to +10)" [ref=e310]: "10"
                      - generic [ref=e311]:
                        - text: Testing Adjustment (-10 to +10)
                        - spinbutton "Testing Adjustment (-10 to +10)" [ref=e312]: "0"
                    - generic [ref=e313]:
                      - text: Manager Remarks / Feedback Notes
                      - textbox "Manager Remarks / Feedback Notes" [ref=e314]:
                        - /placeholder: Enter performance feedback notes for this month...
                        - text: E2E Automated verification of performance adjustments.
                    - paragraph [ref=e315]: Adjustments saved successfully.
                    - button "Save Adjustments" [ref=e317]
              - generic [ref=e318]:
                - button "Export PDF" [disabled]
                - button "Close" [ref=e319]
  - button "Open Next.js Dev Tools" [ref=e325] [cursor=pointer]:
    - img [ref=e326]
  - alert [ref=e329]
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | 
  3  | test("Verify Monthly Performance Adjustments", async ({ page }) => {
  4  |   // 1. Navigate to the login page
  5  |   console.log("Navigating to login page...");
  6  |   await page.goto("http://localhost:3000/login");
  7  |   
  8  |   // 2. Input manager credentials
  9  |   await page.fill("input[name='email']", "mane@thaliatechnologies.com");
  10 |   await page.fill("input[name='password']", "password123");
  11 |   await page.click("button[type='submit']");
  12 | 
  13 |   // 3. Wait for dashboard redirect
  14 |   await page.waitForURL("**/dashboard");
  15 |   console.log("SUCCESS: Logged in and redirected to dashboard.");
  16 | 
  17 |   // 4. Navigate directly to the Monthly Reports page
  18 |   await page.goto("http://localhost:3000/reports");
  19 |   console.log("SUCCESS: Navigated to Monthly Reports page.");
  20 | 
  21 |   // 5. Open the details modal for Lalit
  22 |   console.log("Searching for employee 'Lalit' in the report table...");
  23 |   const row = page.locator("tr:has-text('Lalit')");
  24 |   const viewButton = row.locator("button:has-text('View')");
  25 |   await viewButton.first().click();
  26 |   console.log("SUCCESS: Clicked on View button to open employee detail modal.");
  27 | 
  28 |   // 6. Verify detail modal contains the header
  29 |   await page.waitForSelector("text=Employee Performance Details");
  30 |   const modalText = page.locator("h2:has-text('Employee Performance Details')");
  31 |   await expect(modalText).toBeVisible();
  32 | 
  33 |   // 7. Verify the manager adjustments form exists
  34 |   const supportInput = page.locator("input#support_adjustment");
  35 |   const testingInput = page.locator("input#testing_adjustment");
  36 |   const remarksTextarea = page.locator("textarea#manager_remarks");
  37 | 
  38 |   await expect(supportInput).toBeVisible();
  39 |   await expect(testingInput).toBeVisible();
  40 |   await expect(remarksTextarea).toBeVisible();
  41 |   console.log("SUCCESS: Performance adjustment form components are visible to Manager.");
  42 | 
  43 |   // Note down initial value
  44 |   const initSupport = await supportInput.inputValue();
  45 |   console.log(`Initial Support Adjustment value: ${initSupport}`);
  46 | 
  47 |   // 8. Submit an adjustment (+10)
  48 |   console.log("Modifying Support Adjustment to +10 and adding remarks...");
  49 |   await supportInput.fill("10");
  50 |   await testingInput.fill("0");
  51 |   await remarksTextarea.fill("E2E Automated verification of performance adjustments.");
  52 |   
  53 |   // Submit form
  54 |   await page.click("button:has-text('Save Adjustments')");
  55 | 
  56 |   // 9. Verify success toast/message
  57 |   console.log("Waiting for success confirmation message...");
  58 |   await page.waitForSelector("text=Adjustments saved successfully.");
  59 |   console.log("SUCCESS: Success alert validated.");
  60 | 
  61 |   // 10. Check if the score updates dynamically
  62 |   const scoreLocator = page.locator("p:has-text('/ 5')");
> 63 |   const scoreText = await scoreLocator.innerText();
     |                                        ^ Error: locator.innerText: Error: strict mode violation: locator('p:has-text(\'/ 5\')') resolved to 2 elements:
  64 |   console.log(`Recalculated Score displayed in modal: ${scoreText}`);
  65 | 
  66 |   // 11. Close Modal
  67 |   await page.click("button:has-text('Close')");
  68 |   console.log("SUCCESS: Modal closed successfully.");
  69 | });
  70 | 
```