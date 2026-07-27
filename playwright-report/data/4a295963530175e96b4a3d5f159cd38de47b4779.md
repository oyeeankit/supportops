# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: settings.spec.ts >> Settings & Profile Management >> should render settings page and toggle theme
- Location: tests\e2e\settings.spec.ts:10:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Tearing down "context" exceeded the test timeout of 30000ms.
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
          - heading "Settings" [level=1] [ref=e58]
          - paragraph [ref=e59]: Manager-only configuration for roles, permissions, scoring rules, and app preferences.
        - generic [ref=e60]:
          - generic [ref=e61]:
            - heading "Module planned" [level=3] [ref=e62]
            - paragraph [ref=e63]: This screen is part of the approved navigation foundation. Business functionality will be implemented module by module after approval.
          - list [ref=e65]:
            - listitem [ref=e66]: Role management
            - listitem [ref=e67]: Permission matrix
            - listitem [ref=e68]: Scoring settings
            - listitem [ref=e69]: App preferences
  - button "Open Next.js Dev Tools" [ref=e75] [cursor=pointer]:
    - generic [ref=e78]:
      - text: Compiling
      - generic [ref=e79]:
        - generic [ref=e80]: .
        - generic [ref=e81]: .
        - generic [ref=e82]: .
  - alert [ref=e83]
```