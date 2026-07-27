# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: permissions.spec.ts >> Security and Role Permissions Validation >> should block support engineer from settings panel
- Location: tests\e2e\permissions.spec.ts:11:7

# Error details

```
Test timeout of 30000ms exceeded while running "beforeEach" hook.
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
            - generic [ref=e39]:
              - img [ref=e40]
              - generic [ref=e43]: No Peeking! Your password is safe.
          - heading "SupportOps Portal" [level=3] [ref=e44]
          - paragraph [ref=e45]: Sign in to manage daily support and QA operations.
        - generic [ref=e47]:
          - generic [ref=e48]:
            - text: Work email
            - textbox "Work email" [ref=e49]:
              - /placeholder: name@company.com
              - text: lalit@thaliatechnologies.com
          - generic [ref=e50]:
            - generic [ref=e51]:
              - generic [ref=e52]: Password
              - button "Show" [ref=e53]:
                - img [ref=e54]
                - generic [ref=e57]: Show
            - textbox "Password" [active] [ref=e59]:
              - /placeholder: ••••••••
              - text: password123
          - button "Sign in to SupportOps" [ref=e60]
  - button "Open Next.js Dev Tools" [ref=e66] [cursor=pointer]:
    - generic [ref=e69]:
      - text: Compiling
      - generic [ref=e70]:
        - generic [ref=e71]: .
        - generic [ref=e72]: .
        - generic [ref=e73]: .
  - alert [ref=e74]
```