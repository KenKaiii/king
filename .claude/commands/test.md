---
name: test
description: Run tests, then spawn parallel agents to fix all failures
---

## Step 1: Run Tests

```bash
npm test 2>&1
```

## Step 2: Analyze Results

If all tests pass, report success and stop.

If tests fail, group failures by test project:
- **main**: `tests/main/**` — Electron main process services
- **renderer**: `tests/renderer/**` — React stores, hooks, utilities

## Step 3: Fix Failures in Parallel

Spawn one Task agent per failing project in a SINGLE response:

- Each agent receives the list of failing tests and error messages
- Each agent reads the source files and test files, fixes the issues
- Each agent re-runs only their tests to verify: `npx vitest run --project <name>`

## Step 4: Verify

Run the full suite again:

```bash
npm test 2>&1
```

All tests must pass before completing.
