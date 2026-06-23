# Wireframe: Dispute Detail

**Route:** `/disputes/:id`  
**Requirements:** REQ-015

## Desktop Layout (≥1024px) — Two-Column

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  HEADER (Primary Blue #0033A1)                                              │
│  Payment Dispute Triage          [Disputes]  [New Dispute]                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  [← Back to Disputes]                                                       │
│                                                                             │
│  Dispute #{id}                                                              │
│                                                                             │
│  ┌────────────────────────────────┐  ┌────────────────────────────────────┐│
│  │ DISPUTE INFORMATION            │  │ TRIAGE RECOMMENDATION              ││
│  │                                │  │                                    ││
│  │ Customer:       {name}         │  │  ┌──────────────────────────────┐  ││
│  │ Payment Type:   {type}         │  │  │   {Routing Action}           │  ││
│  │ Issue Category: {category}     │  │  │   (colour-coded badge)       │  ││
│  │ Amount:         {R amount}      │  │  └──────────────────────────────┘  ││
│  │ Transaction Date: {date}       │  │                                    ││
│  │ Transaction Status: {status}   │  │  Priority: (badge) {level}         ││
│  │ Created:        {createdAt}    │  │  (High=red, Medium=amber, Low=green)│
│  │                                │  │                                    ││
│  │                                │  │  REASONING                         ││
│  │                                │  │  ─────────                         ││
│  │                                │  │  ● {Rule Name}                     ││
│  │                                │  │    {description}                   ││
│  │                                │  │    Triggered by:                   ││
│  │                                │  │      amount: {value}               ││
│  │                                │  │      status: {value}               ││
│  │                                │  │                                    ││
│  │                                │  │  ● {Rule Name}                     ││
│  │                                │  │    {description}                   ││
│  │                                │  │    Triggered by:                   ││
│  │                                │  │      issueCategory: {value}        ││
│  │                                │  │      disputeAge: {value} days      ││
│  │                                │  │                                    ││
│  └────────────────────────────────┘  └────────────────────────────────────┘│
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Mobile Layout (<768px) — Stacked

```
┌──────────────────────────────────┐
│  HEADER (compact)         [≡]    │
├──────────────────────────────────┤
│                                  │
│  [← Back]                        │
│  Dispute #{id}                   │
│                                  │
│  ┌────────────────────────────┐  │
│  │ DISPUTE INFORMATION        │  │
│  │                            │  │
│  │ Customer:       {name}     │  │
│  │ Payment Type:   {type}     │  │
│  │ Issue Category: {category} │  │
│  │ Amount:         {R amount}  │  │
│  │ Txn Date:       {date}     │  │
│  │ Txn Status:     {status}   │  │
│  │ Created:        {date}     │  │
│  └────────────────────────────┘  │
│                                  │
│  ┌────────────────────────────┐  │
│  │ TRIAGE RECOMMENDATION      │  │
│  │                            │  │
│  │  ┌──────────────────────┐  │  │
│  │  │ {Routing Action}     │  │  │
│  │  └──────────────────────┘  │  │
│  │                            │  │
│  │  Priority: (badge) {level} │  │
│  │                            │  │
│  │  REASONING                 │  │
│  │  ● {Rule Name}            │  │
│  │    {description}           │  │
│  │    Triggered by:           │  │
│  │      {key}: {value}        │  │
│  │                            │  │
│  └────────────────────────────┘  │
│                                  │
└──────────────────────────────────┘
```

## Routing Action Badge Variants

```
┌─────────────────────────────────────────┐
│  ⚠ Escalate              (red-800 bg)   │
│  🔍 Investigate Further  (amber-800 bg) │
│  ✓ Resolve Immediately   (green-800 bg) │
│  → Refer to Another Team (blue-800 bg)  │
└─────────────────────────────────────────┘
```

## Priority Badge Variants

```
  (●) High    — red-600 bg, white text
  (●) Medium  — amber-600 bg, dark text
  (●) Low     — green-600 bg, white text
```

## Component Inventory

| Component | Data Displayed | Interactions | States |
|-----------|---------------|--------------|--------|
| Back Link | "← Back to Disputes" | Click → navigate to `/` | Default, Hover |
| Dispute Info Card | customer.name, paymentType, issueCategory, transaction.amount, transaction.date, transaction.status, createdAt | None (read-only display) | Loading (skeleton), Populated |
| Triage Recommendation Card | routingAction, priorityLevel, reasoning[] | None (read-only display) | Loading (skeleton), Populated |
| Routing Action Badge | routingAction text + icon | None (display only) | Escalate, Investigate, Resolve, Refer |
| Priority Badge | priorityLevel text | None (display only) | High (red), Medium (amber), Low (green) |
| Reasoning List | Array of { ruleName, description, triggeredBy } | None (read-only, always expanded) | Empty (no rules), Populated |

## States

### Loading
```
┌────────────────────────────────┐  ┌────────────────────────────────────┐
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │  │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│ ░░░░░░░░░  ░░░░░░░░░░░░░░░░░  │  │ ░░░░░░░░░░░░░░░░░                 │
│ ░░░░░░░░░  ░░░░░░░░░░░░░░░░░  │  │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│ ░░░░░░░░░  ░░░░░░░░░░░░░░░░░  │  │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
└────────────────────────────────┘  └────────────────────────────────────┘
```

### Not Found
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│   Dispute not found.                                    │
│   It may have been deleted.                             │
│   [← Back to Disputes]                                  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Error
```
┌─────────────────────────────────────────────────────────┐
│  (!) Unable to load dispute details. Please try again.  │
└─────────────────────────────────────────────────────────┘
```

## Requirement Traceability

| Element | Requirement |
|---------|-------------|
| All dispute fields displayed | REQ-015 |
| Routing Action as prominent label | REQ-015 |
| Priority Level as colour-coded indicator | REQ-015 |
| Reasoning explanation with rule names and trigger values | REQ-015 |
