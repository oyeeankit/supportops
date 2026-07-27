# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> Authentication & Session Flows >> should assert validation errors for empty fields
- Location: tests\e2e\auth.spec.ts:9:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Tearing down "context" exceeded the test timeout of 30000ms.
```

# Page snapshot

```yaml
- generic [ref=e1]:
  - main [ref=e2]:
    - generic [ref=e3]:
      - generic [ref=e6]:
        - generic [ref=e7]:
          - generic [ref=e8]: SO
          - generic [ref=e9]: SupportOps
        - generic [ref=e11]:
          - img [ref=e12]
          - text: Interactive Security Experience
      - generic [ref=e17]:
        - generic [ref=e18]:
          - generic [ref=e19]:
            - generic "Click me for a surprise flip!" [ref=e20] [cursor=pointer]:
              - img [ref=e23]
            - generic [ref=e44]:
              - img [ref=e45]
              - generic [ref=e47]: Scanning work credentials...
          - heading "SupportOps Portal" [level=3] [ref=e48]
          - paragraph [ref=e49]: Sign in to manage daily support and QA operations.
        - generic [ref=e51]:
          - generic [ref=e52]:
            - text: Work email
            - textbox "Work email" [active] [ref=e53]:
              - /placeholder: name@company.com
          - generic [ref=e54]:
            - generic [ref=e55]:
              - generic [ref=e56]: Password
              - button "Show" [ref=e57]:
                - img [ref=e58]
                - generic [ref=e61]: Show
            - textbox "Password" [ref=e63]:
              - /placeholder: ••••••••
          - button "Sign in to SupportOps" [ref=e64]
  - button "Open Next.js Dev Tools" [ref=e70] [cursor=pointer]:
    - img [ref=e71]
  - alert [ref=e74]
```