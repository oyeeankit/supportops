# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: reports.spec.ts >> Monthly Performance Reports & Calculations >> should load performance metrics table and open details modal
- Location: tests\e2e\reports.spec.ts:10:7

# Error details

```
Test timeout of 30000ms exceeded while running "beforeEach" hook.
```

```
Tearing down "context" exceeded the test timeout of 30000ms.
```

# Page snapshot

```yaml
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
      - status "Loading reports..." [ref=e57]:
        - paragraph [ref=e59]: Loading reports...
```