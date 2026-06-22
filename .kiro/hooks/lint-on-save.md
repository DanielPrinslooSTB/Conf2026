# Lint on Save

## Purpose
Runs ESLint on TypeScript files whenever they are saved to enforce code style and catch issues early.

## Configuration

| Property | Value |
|----------|-------|
| **Event** | `fileEdited` |
| **File Patterns** | `**/*.ts`, `**/*.tsx` |
| **Action** | `runCommand` |
| **Command** | `npx eslint --fix ${file}` |

## Behaviour
- Triggers every time a `.ts` or `.tsx` file is saved
- Runs ESLint with `--fix` to auto-correct fixable issues on the changed file
- Enforces consistent code style across the codebase without manual intervention

## Prerequisites
- ESLint installed and configured in the project (`eslint.config.*` or `.eslintrc.*`)
- Node modules installed (`npm install`)
