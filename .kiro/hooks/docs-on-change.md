# Auto-update Docs on Code Change

## Purpose
Keeps project documentation in sync with code by reviewing changes and updating relevant docs automatically.

## Configuration

| Property | Value |
|----------|-------|
| **Event** | `fileEdited` |
| **File Patterns** | `**/*.ts`, `**/*.tsx` |
| **Action** | `askAgent` |

## Behaviour
- Triggers every time a `.ts` or `.tsx` source file is saved
- The agent reviews the change and checks if any documentation needs updating
- Targets documentation in `docs/` (api_spec.md, architecture.md, requirements.md, test_cases.md, ui_spec.md) and `README.md`
- Only updates docs when the change has user-facing or API impact
- Skips purely internal changes (refactoring, comments, formatting)

## Scope of Updates
The agent will consider updating:
- **API spec** — if routes, request/response schemas, or status codes changed
- **Architecture docs** — if new modules, services, or patterns were introduced
- **Requirements** — if behaviour covered by a requirement was modified
- **Test cases** — if testable behaviour changed
- **UI spec** — if component interfaces or page behaviour changed
- **README** — if setup steps, commands, or project overview changed

## Prerequisites
- Documentation files exist in the `docs/` folder
- Code changes are meaningful (the agent filters out noise)
