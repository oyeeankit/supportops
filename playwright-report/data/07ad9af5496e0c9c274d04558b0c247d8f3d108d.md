# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> Authentication & Session Flows >> should authenticate successfully with valid manager credentials and persist session
- Location: tests\e2e\auth.spec.ts:20:7

# Error details

```
Test timeout of 30000ms exceeded while running "beforeEach" hook.
```

```
Tearing down "context" exceeded the test timeout of 30000ms.
```

# Page snapshot

```yaml
- main [ref=e2]:
  - generic [ref=e4]:
    - img [ref=e6]
    - generic [ref=e8]:
      - heading "Initializing 3D Human Avatar" [level=3] [ref=e9]
      - paragraph [ref=e10]: Loading SupportOps portal environment...
```