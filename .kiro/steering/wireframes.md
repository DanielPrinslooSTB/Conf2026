---
inclusion: manual
---

# Wireframe Generation Guide

## Purpose

Before generating UI component code from `.kiro/specs/`, produce text-based wireframes for every screen referenced in the spec's requirements. Wireframes serve as a visual contract between requirements and implementation, ensuring layout, component hierarchy, and user flow are agreed upon before code is written.

## When to Generate Wireframes

- Before implementing any UI task from a spec's `tasks.md`
- When requirements reference a new screen or significantly modify an existing one
- When the UI spec (`docs/ui_spec.md`) is updated with new screens or layout changes

## Input Sources

1. `.kiro/specs/{feature}/requirements.md` — functional requirements driving the UI
2. `docs/ui_spec.md` — detailed screen specifications, layouts, states, and interactions
3. `docs/api_spec.md` — API response shapes that inform data displayed on screen

## Output Location

- Store wireframes in `docs/wireframes/{feature-name}/`
- One file per screen: `{screen-name}.md`
- One file for user journeys: `journeys.md`

## Wireframe Format

Each screen wireframe file must include:

### 1. ASCII Layout

Use box-drawing characters to represent the spatial layout:

```
┌─────────────────────────────────────────────────────┐
│  HEADER: App Title              [Nav Link] [Nav Link]│
├─────────────────────────────────────────────────────┤
│                                                     │
│  [ Page Title ]                    [ Action Button ] │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │ Component / Card / Table                     │   │
│  │                                             │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 2. Component Inventory

List each UI component shown in the wireframe:
- Component name
- Data it displays (mapped to API response fields)
- Interactions it supports
- States (loading, empty, error, populated)

### 3. Requirement Traceability

Map each visual element back to a requirement ID (e.g., REQ-001).

### 4. User Journey (in journeys.md)

Document the flow between screens using a step-by-step format:

```
Journey: [Name]
1. User is on [Screen A]
2. User performs [Action]
3. System responds with [Behaviour]
4. User sees [Screen B] with [Data]
```

## Style Notes

- Use consistent box-drawing characters: `┌ ┐ └ ┘ ─ │ ├ ┤ ┬ ┴ ┼`
- Indicate interactive elements with `[ brackets ]`
- Indicate data placeholders with `{ curly braces }`
- Mark colour-coded elements with annotations: `(red)`, `(amber)`, `(green)`
- Show responsive breakpoints as separate layouts when the wireframe differs significantly

## Validation Checklist

Before marking wireframes complete, verify:
- [ ] Every requirement's UI element appears in at least one wireframe
- [ ] All API data fields are mapped to visual elements
- [ ] All interaction states (loading, error, empty, success) are represented
- [ ] User journeys cover the happy path and at least one error path
- [ ] Wireframes match the layout described in `docs/ui_spec.md`
