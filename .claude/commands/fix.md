---
name: fix
description: Run typechecking and linting, then spawn parallel agents to fix all issues
---

# Project Code Quality Check

Run all linting, formatting, and typechecking tools, collect errors, group by domain, and spawn parallel agents to fix them.

## Step 1: Run Linting and Typechecking

Run these commands and capture all output:

```bash
npm run lint 2>&1
npm run format:check 2>&1
npm run build 2>&1
```

## Step 2: Collect and Parse Errors

Parse the output from Step 1. Group errors by domain:
- **Type errors**: TypeScript errors from `npm run build`
- **Lint errors**: ESLint issues from `npm run lint`
- **Format errors**: Prettier issues from `npm run format:check`

Create a list of all files with issues and the specific problems in each file.

## Step 3: Spawn Parallel Agents

For each domain that has issues, spawn an agent in parallel using the Task tool in a SINGLE response with MULTIPLE Task tool calls:

- Spawn a "type-fixer" agent for type errors
- Spawn a "lint-fixer" agent for lint errors
- Spawn a "format-fixer" agent for formatting errors (run `npm run format` to auto-fix)

Each agent should:
1. Receive the list of files and specific errors in their domain
2. Fix all errors in their domain
3. Run the relevant check command to verify fixes
4. Report completion

## Step 4: Verify All Fixes

After all agents complete, run the full check again:

```bash
npm run lint && npm run format:check && npm run build
```

Ensure all issues are resolved. If not, fix remaining issues directly.
