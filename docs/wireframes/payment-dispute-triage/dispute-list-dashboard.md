# Wireframe: Dispute List Dashboard

**Route:** `/`  
**Requirements:** REQ-001, REQ-002

## Desktop Layout (≥1024px)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  HEADER (Primary Blue #0033A1)                                              │
│  Payment Dispute Triage          [Disputes]  [New Dispute]                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Disputes                                            [ + Create Dispute ]   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ CUSTOMER NAME │ PAYMENT TYPE │ ISSUE CATEGORY │ PRIORITY │ DATE    │ STATUS │
│  ├───────────────┼──────────────┼────────────────┼──────────┼─────────┼────────┤
│  │ {name}        │ {type}       │ {category}     │ (badge)  │ {date}  │ {status}│
│  │ {name}        │ {type}       │ {category}     │ (badge)  │ {date}  │ {status}│
│  │ {name}        │ {type}       │ {category}     │ (badge)  │ {date}  │ {status}│
│  │ ...           │              │                │          │         │        │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Mobile Layout (<768px)

```
┌──────────────────────────────────┐
│  HEADER (compact)         [≡]    │
│  Payment Dispute Triage          │
├──────────────────────────────────┤
│                                  │
│  Disputes    [ + Create Dispute ]│
│                                  │
│  ┌────────────────────────────┐  │
│  │ {Customer Name}            │  │
│  │ {Payment Type} · {Category}│  │
│  │ (priority badge)   {date}  │  │
│  │ Status: {status}           │  │
│  └────────────────────────────┘  │
│                                  │
│  ┌────────────────────────────┐  │
│  │ {Customer Name}            │  │
│  │ {Payment Type} · {Category}│  │
│  │ (priority badge)   {date}  │  │
│  │ Status: {status}           │  │
│  └────────────────────────────┘  │
│                                  │
└──────────────────────────────────┘
```

## Component Inventory

| Component | Data Displayed | Interactions | States |
|-----------|---------------|--------------|--------|
| Header/Nav Bar | App title, nav links | Click title → `/`, click nav links | Static |
| Create Dispute Button | Label "Create Dispute" | Click → navigate to `/disputes/new` | Default, Hover |
| Dispute Table (desktop) | customer.name, paymentType, issueCategory, priorityLevel, createdAt, status | Click row → navigate to `/disputes/:id` | Loading, Populated, Empty, Error |
| Dispute Card List (mobile) | Same fields as table | Click card → navigate to `/disputes/:id` | Loading, Populated, Empty, Error |
| Priority Badge | priorityLevel text | None (display only) | High (red), Medium (amber), Low (green) |

## States

### Loading
```
┌─────────────────────────────────────────────────────────┐
│ ░░░░░░░░░░░░░░ │ ░░░░░░░░ │ ░░░░░░░░░░ │ ░░░░ │ ░░░░░ │
│ ░░░░░░░░░░░░░░ │ ░░░░░░░░ │ ░░░░░░░░░░ │ ░░░░ │ ░░░░░ │
│ ░░░░░░░░░░░░░░ │ ░░░░░░░░ │ ░░░░░░░░░░ │ ░░░░ │ ░░░░░ │
└─────────────────────────────────────────────────────────┘
```
Skeleton/shimmer rows indicate loading.

### Empty
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│   No disputes found.                                    │
│   Create your first dispute to get started.             │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Error
```
┌─────────────────────────────────────────────────────────┐
│  (!) Unable to load disputes. Please try again.         │
└─────────────────────────────────────────────────────────┘
```

## Requirement Traceability

| Element | Requirement |
|---------|-------------|
| Dispute table with columns (name, type, category, priority, date, status) | REQ-001 |
| Sorted by creation date descending | REQ-001 |
| Row click navigates to detail view | REQ-002 |
