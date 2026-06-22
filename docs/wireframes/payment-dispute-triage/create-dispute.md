# Wireframe: Create Dispute

**Route:** `/disputes/new`  
**Requirements:** REQ-003, REQ-004, REQ-005, REQ-006

## Desktop Layout (≥1024px)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  HEADER (Primary Blue #0033A1)                                              │
│  Payment Dispute Triage          [Disputes]  [New Dispute]                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  [← Back to Disputes]                                                       │
│                                                                             │
│  Create New Dispute                                                         │
│                                                                             │
│         ┌───────────────────────────────────────────────┐                   │
│         │                                               │                   │
│         │  Customer *                                   │                   │
│         │  ┌─────────────────────────────────────┐      │                   │
│         │  │ Select a customer...            [▼] │      │                   │
│         │  └─────────────────────────────────────┘      │                   │
│         │                                               │                   │
│         │  Payment Type *                               │                   │
│         │  ┌─────────────────────────────────────┐      │                   │
│         │  │ Select payment type...          [▼] │      │                   │
│         │  └─────────────────────────────────────┘      │                   │
│         │                                               │                   │
│         │  Issue Category *                             │                   │
│         │  ┌─────────────────────────────────────┐      │                   │
│         │  │ Select issue category...        [▼] │      │                   │
│         │  └─────────────────────────────────────┘      │                   │
│         │  (Options filtered by selected Payment Type)  │                   │
│         │                                               │                   │
│         │  Transaction Amount *                         │                   │
│         │  ┌─────────────────────────────────────┐      │                   │
│         │  │ 0.00                                │      │                   │
│         │  └─────────────────────────────────────┘      │                   │
│         │                                               │                   │
│         │  Transaction Date *                           │                   │
│         │  ┌─────────────────────────────────────┐      │                   │
│         │  │ dd/mm/yyyy                      [📅]│      │                   │
│         │  └─────────────────────────────────────┘      │                   │
│         │                                               │                   │
│         │  Transaction Status *                         │                   │
│         │  ┌─────────────────────────────────────┐      │                   │
│         │  │ Select status...                [▼] │      │                   │
│         │  └─────────────────────────────────────┘      │                   │
│         │                                               │                   │
│         │              [ Submit Dispute ]                │                   │
│         │                                               │                   │
│         └───────────────────────────────────────────────┘                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Validation Error State

```
│         │  Payment Type *                               │
│         │  ┌─────────────────────────────────────┐      │
│         │  │ Select payment type...          [▼] │      │  ← (red border)
│         │  └─────────────────────────────────────┘      │
│         │  (!) Payment type is required          (red)  │
│         │                                               │
│         │  Issue Category *                             │
│         │  ┌─────────────────────────────────────┐      │
│         │  │ Select issue category...        [▼] │      │  ← (red border)
│         │  └─────────────────────────────────────┘      │
│         │  (!) Issue category is not valid for the      │
│         │      selected payment type             (red)  │
```

## Loading State (Submitting)

```
│         │              [ ⟳ Submitting... ]               │
│         │  (form fields disabled, button shows spinner) │
```

## Cascading Dropdown Behaviour

```
Step 1: User selects Payment Type = "Card Payment"
        ↓
Step 2: Issue Category dropdown repopulates with:
        - Duplicate Debit
        - Unauthorized Transaction
        - Failed Transaction
        - Incorrect Amount

Step 3: If user changes Payment Type to "EFT"
        ↓
Step 4: Issue Category clears and repopulates with:
        - Failed Transfer
        - Duplicate Debit
        - Missing Payment
```

## Component Inventory

| Component | Data Displayed | Interactions | States |
|-----------|---------------|--------------|--------|
| Back Link | "← Back to Disputes" | Click → navigate to `/` | Default, Hover |
| Customer Dropdown | customer.name list from GET /api/customers | Select customer | Default, Open, Selected |
| Payment Type Dropdown | "Card Payment", "EFT", "Internal Transfer" | Select → filters Issue Category | Default, Open, Selected, Error |
| Issue Category Dropdown | Filtered categories from GET /api/payment-types | Select category | Default, Open, Selected, Disabled (no type selected), Error |
| Amount Input | Numeric value | Type number | Default, Focused, Error |
| Date Input | Date value | Pick date | Default, Focused, Error |
| Status Dropdown | "Completed", "Failed", "Pending" | Select status | Default, Open, Selected, Error |
| Submit Button | "Submit Dispute" | Click → POST /api/disputes | Default, Hover, Loading (spinner), Disabled |
| Validation Messages | Error text per field | None (display only) | Hidden, Visible (red text) |

## States Summary

| State | Behaviour |
|-------|-----------|
| Initial | All fields empty, submit button enabled |
| Valid | All fields populated with valid data, submit button active |
| Validation Error | Red borders on invalid fields, error messages below each |
| Submitting | Spinner on button, all fields disabled |
| Server Error | Toast/banner: "Failed to create dispute. Please try again." |
| Success | Navigate to `/disputes/:id` |

## Requirement Traceability

| Element | Requirement |
|---------|-------------|
| Form fields: customer, payment type, issue category, amount, date, status | REQ-003 |
| Issue Category filtered by Payment Type | REQ-004 |
| Submit persists record and triggers triage | REQ-005 |
| Field-level validation messages on missing fields | REQ-006 |
