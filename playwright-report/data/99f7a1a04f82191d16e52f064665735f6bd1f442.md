# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> Authentication & Session Flows >> should reject login for invalid credentials
- Location: tests\e2e\auth.spec.ts:15:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=Invalid login credentials')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('text=Invalid login credentials')

```

```yaml
- main:
  - text: SO SupportOps Interactive Security Experience
  - img
  - text: Byte Security Buddy ready!
  - heading "SupportOps Portal" [level=3]
  - paragraph: Sign in to manage daily support and QA operations.
  - text: Work email
  - textbox "Work email":
    - /placeholder: name@company.com
    - text: wrong_user@thaliatechnologies.com
  - text: Password
  - button "Show"
  - textbox "Password":
    - /placeholder: ••••••••
    - text: wrong_password_hash
  - button "Signing in..." [disabled]
- alert
```

```
Tearing down "context" exceeded the test timeout of 30000ms.
```