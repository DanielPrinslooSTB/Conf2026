# Run Tests on Change

## Purpose
Runs the Vitest test suite when TypeScript files are edited to catch regressions immediately.

## Configuration

| Property | Value |
|----------|-------|
| **Event** | `fileEdited` |
| **File Patterns** | `**/*.ts`, `**/*.tsx` |
| **Action** | `runCommand` |
| **Command** | `npx vitest --run` |

## Behaviour
- Triggers every time a `.ts` or `.tsx` file is saved
- Runs the full Vitest suite in single-run mode (no watch)
- Catches regressions early by validating all tests pass after each change

## Prerequisites
- Vitest installed and configured in the project
- Test files following the project's naming conventions (e.g., `*.test.ts`)
- Node modules installed (`npm install`)
