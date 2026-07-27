# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: employees.spec.ts >> Team Management (Employee CRUD) >> should display employee search options
- Location: tests\e2e\employees.spec.ts:10:7

# Error details

```
Test timeout of 30000ms exceeded while running "beforeEach" hook.
```

```
Tearing down "context" exceeded the test timeout of 30000ms.
```

# Page snapshot

```yaml
- generic [ref=e2]:
  - generic [ref=e4]:
    - banner [ref=e5]:
      - generic [ref=e7]:
        - generic [ref=e8]:
          - paragraph [ref=e9]: Ankit Mane
          - generic [ref=e10]: Manager
        - button "Toggle theme" [ref=e11]:
          - img [ref=e12]
        - button "Sign out" [ref=e19]
    - main [ref=e20]:
      - status "Loading team management..." [ref=e21]:
        - paragraph [ref=e23]: Loading team management...
  - navigation [ref=e24]:
    - link "Home" [ref=e25] [cursor=pointer]:
      - /url: /dashboard
      - img [ref=e26]
      - text: Home
    - link "Team" [ref=e29] [cursor=pointer]:
      - /url: /team
      - img [ref=e30]
      - text: Team
    - link "Daily Log" [ref=e35] [cursor=pointer]:
      - /url: /operations
      - img [ref=e36]
      - text: Daily Log
    - link "Reports" [ref=e39] [cursor=pointer]:
      - /url: /reports
      - img [ref=e40]
      - text: Reports
```