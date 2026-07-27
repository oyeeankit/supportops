# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: settings.spec.ts >> Settings & Profile Management >> should render settings page and toggle theme
- Location: tests\e2e\settings.spec.ts:10:7

# Error details

```
Test timeout of 30000ms exceeded while running "beforeEach" hook.
```

```
Tearing down "context" exceeded the test timeout of 30000ms.
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
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
        - generic [ref=e21]:
          - heading "Settings" [level=1] [ref=e22]
          - paragraph [ref=e23]: Manager-only configuration for roles, permissions, scoring rules, and app preferences.
        - generic [ref=e24]:
          - generic [ref=e25]:
            - heading "Module planned" [level=3] [ref=e26]
            - paragraph [ref=e27]: This screen is part of the approved navigation foundation. Business functionality will be implemented module by module after approval.
          - list [ref=e29]:
            - listitem [ref=e30]: Role management
            - listitem [ref=e31]: Permission matrix
            - listitem [ref=e32]: Scoring settings
            - listitem [ref=e33]: App preferences
    - navigation [ref=e34]:
      - link "Home" [ref=e35] [cursor=pointer]:
        - /url: /dashboard
        - img [ref=e36]
        - text: Home
      - link "Team" [ref=e39] [cursor=pointer]:
        - /url: /team
        - img [ref=e40]
        - text: Team
      - link "Daily Log" [ref=e45] [cursor=pointer]:
        - /url: /operations
        - img [ref=e46]
        - text: Daily Log
      - link "Reports" [ref=e49] [cursor=pointer]:
        - /url: /reports
        - img [ref=e50]
        - text: Reports
  - button "Open Next.js Dev Tools" [ref=e58] [cursor=pointer]:
    - img [ref=e59]
```