# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: permissions.spec.ts >> Security and Role Permissions Validation >> should hide manager performance adjustments form from support logs view
- Location: tests\e2e\permissions.spec.ts:16:7

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
  - main [ref=e2]:
    - generic [ref=e4]:
      - img [ref=e6]
      - generic [ref=e8]:
        - heading "Initializing 3D Human Avatar" [level=3] [ref=e9]
        - paragraph [ref=e10]: Loading SupportOps portal environment...
  - button "Open Next.js Dev Tools" [ref=e16] [cursor=pointer]:
    - generic [ref=e19]:
      - text: Compiling
      - generic [ref=e20]:
        - generic [ref=e21]: .
        - generic [ref=e22]: .
        - generic [ref=e23]: .
  - alert [ref=e24]
```