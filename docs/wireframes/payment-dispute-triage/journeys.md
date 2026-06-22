# User Journeys: Payment Dispute Triage

## Journey 1: View Disputes (Happy Path)

**Actor:** Operations_User  
**Requirements:** REQ-001, REQ-002

```
1. User navigates to the application root `/`
2. System fetches GET /api/disputes
3. System displays Dispute List Dashboard with all disputes
   - Table sorted by creation date descending
   - Each row shows: customer name, payment type, issue category, priority (badge), date, status
4. User scans the list and identifies a dispute of interest
5. User clicks on a dispute row
6. System navigates to `/disputes/:id` (Dispute Detail view)
```

### Error Path: API Failure

```
1. User navigates to the application root `/`
2. System fetches GET /api/disputes
3. API returns 500 error
4. System displays error message: "Unable to load disputes. Please try again."
5. User retries by refreshing the page
```

### Edge Case: No Disputes Exist

```
1. User navigates to the application root `/`
2. System fetches GET /api/disputes
3. API returns empty array []
4. System displays: "No disputes found. Create your first dispute to get started."
5. User clicks "Create Dispute" button
6. System navigates to `/disputes/new`
```

---

## Journey 2: Create a New Dispute (Happy Path)

**Actor:** Operations_User  
**Requirements:** REQ-003, REQ-004, REQ-005, REQ-006

```
1. User is on the Dashboard (`/`)
2. User clicks "Create Dispute" button
3. System navigates to `/disputes/new`
4. System displays the Create Dispute form with all fields empty
5. User selects a customer from the dropdown (populated via GET /api/customers)
6. User selects Payment Type = "Card Payment"
7. System filters Issue Category dropdown to show:
   - Duplicate Debit
   - Unauthorized Transaction
   - Failed Transaction
   - Incorrect Amount
8. User selects Issue Category = "Unauthorized Transaction"
9. User enters Transaction Amount = 15000
10. User selects Transaction Date = 2026-06-10
11. User selects Transaction Status = "Completed"
12. User clicks "Submit Dispute"
13. System shows loading state (spinner on button, fields disabled)
14. System sends POST /api/disputes with form data
15. API persists the dispute, runs Triage_Engine, returns created dispute with recommendation
16. System navigates to `/disputes/:id` showing the new dispute detail
17. User sees Routing Action = "Escalate" (because Unauthorized Transaction → always Escalate)
18. User sees Priority = "High" (because amount > 10000)
19. User sees reasoning: "Rule: Unauthorized Transaction → Escalate, triggered by issueCategory: Unauthorized Transaction"
```

### Error Path: Validation Failure

```
1. User is on Create Dispute form (`/disputes/new`)
2. User leaves Payment Type empty
3. User leaves Issue Category empty
4. User enters Transaction Amount = (empty)
5. User clicks "Submit Dispute"
6. System sends POST /api/disputes
7. API returns HTTP 400 with field-level errors
8. System displays inline validation messages:
   - Payment Type: "Payment type is required" (red text below field, red border)
   - Issue Category: "Issue category is required" (red text below field, red border)
   - Amount: "Transaction amount is required" (red text below field, red border)
9. User corrects the fields
10. User clicks "Submit Dispute" again
11. Submission succeeds → navigates to detail view
```

### Error Path: Server Failure on Submit

```
1. User fills in all fields correctly
2. User clicks "Submit Dispute"
3. System shows loading state
4. API returns HTTP 500
5. System displays error banner: "Failed to create dispute. Please try again."
6. Form fields remain populated (user does not lose data)
7. User clicks "Submit Dispute" again to retry
```

---

## Journey 3: View Dispute Detail with Triage Recommendation

**Actor:** Operations_User  
**Requirements:** REQ-015

```
1. User is on the Dashboard (`/`)
2. User clicks on a dispute row (e.g., Dispute #7)
3. System navigates to `/disputes/7`
4. System fetches GET /api/disputes/7
5. System displays:
   - Dispute Info Card:
     - Customer: "Jane Smith"
     - Payment Type: "EFT"
     - Issue Category: "Failed Transfer"
     - Amount: R2,500.00
     - Transaction Date: 2026-06-01
     - Transaction Status: "Failed"
     - Created: 2026-06-15
   - Triage Recommendation Card:
     - Routing Action: "Investigate Further" (amber badge with 🔍 icon)
     - Priority: "Medium" (amber badge)
     - Reasoning:
       ● Failed Transaction Rule
         "Failed status triggers investigation"
         Triggered by: status=Failed, issueCategory=Failed Transfer
       ● Amount Priority Rule
         "Amount between 1000-10000 assigns Medium priority"
         Triggered by: amount=R2,500.00
6. User reads the recommendation and reasoning
7. User clicks "← Back to Disputes"
8. System navigates to `/`
```

### Error Path: Dispute Not Found

```
1. User navigates directly to `/disputes/999` (invalid ID)
2. System fetches GET /api/disputes/999
3. API returns HTTP 404
4. System displays: "Dispute not found. It may have been deleted."
5. System shows link: "← Back to Disputes"
6. User clicks back link → navigates to `/`
```

---

## Journey 4: Cascading Payment Type Change

**Actor:** Operations_User  
**Requirements:** REQ-004

```
1. User is on Create Dispute form
2. User selects Payment Type = "Card Payment"
3. Issue Category shows: Duplicate Debit, Unauthorized Transaction, Failed Transaction, Incorrect Amount
4. User selects Issue Category = "Duplicate Debit"
5. User changes Payment Type to "EFT"
6. System clears the Issue Category selection
7. Issue Category dropdown repopulates with: Failed Transfer, Duplicate Debit, Missing Payment
8. User must re-select an Issue Category
```

---

## Journey 5: Priority Escalation by Age

**Actor:** Operations_User  
**Requirements:** REQ-008, REQ-009

```
1. User creates a dispute with:
   - Amount: R500 (normally Low priority)
   - Transaction Date: 10 days ago (dispute age > 7 days)
2. System runs Triage_Engine:
   - Base priority from amount (R500 < R1000) → Low
   - Age escalation (10 days > 7) → Low becomes Medium
3. Final Priority = "Medium"
4. Reasoning includes:
   ● Amount Priority Rule: "Amount below 1000 assigns Low priority"
     Triggered by: amount=R500
   ● Age Escalation Rule: "Dispute age > 7 days escalates priority by one tier"
     Triggered by: disputeAge=10 days
```

---

## Screen Flow Diagram

```
┌──────────────────┐     click row      ┌──────────────────┐
│                  │ ──────────────────→ │                  │
│  Dispute List    │                     │  Dispute Detail  │
│  Dashboard (/)   │ ←────────────────── │  (/disputes/:id) │
│                  │     back link       │                  │
└──────────────────┘                     └──────────────────┘
        │                                        ↑
        │ click "Create Dispute"                 │ on success (redirect)
        ↓                                        │
┌──────────────────┐                             │
│                  │ ────────────────────────────→┘
│  Create Dispute  │       submit → API → redirect
│  (/disputes/new) │
│                  │
└──────────────────┘
        │
        │ back link
        ↓
┌──────────────────┐
│  Dashboard (/)   │
└──────────────────┘
```
