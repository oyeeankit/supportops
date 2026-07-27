# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: comprehensive-flow.spec.ts >> Comprehensive Daily Operations & Performance Reporting Flow >> should fill all fields, save operation, and verify in monthly reports
- Location: tests\e2e\comprehensive-flow.spec.ts:6:7

# Error details

```
Test timeout of 30000ms exceeded.
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
      - status "Loading daily operations..." [ref=e21]:
        - paragraph [ref=e23]: Loading daily operations...
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