# Screen Specifications

---

## Screen: Dispute List Dashboard

**Purpose:** Operations_User views all payment disputes at a glance, identifies cases by priority and status, and navigates to individual disputes or creates new ones.

**Route:** `/`

**Layout:**
- Header — application title "Payment Dispute Triage", navigation link to create new dispute
- Action bar — "Create Dispute" button (primary action, top-right)
- Dispute table — sortable list of all disputes with summary columns

**Data displayed:**
- Customer name (string, from customer.name)
- Payment type (string, one of "Card Payment", "EFT", "Internal Transfer")
- Issue category (string, e.g. "Duplicate Debit", "Unauthorized Transaction")
- Priority level (badge, colour-coded: High=red, Medium=amber, Low=green)
- Creation date (formatted date, from dispute.createdAt)
- Status (string, one of "Open", "In Progress", "Resolved")

**Interactions:**
- Click "Create Dispute" button → navigates to `/disputes/new`
- Click a dispute row → navigates to `/disputes/:id` detail view
- Table is pre-sorted by creation date descending (most recent first)

**States:**
- Empty: "No disputes found. Create your first dispute to get started."
- Loading: skeleton/shimmer rows in the table area
- Error: "Unable to load disputes. Please try again."

**Requirements:** REQ-001, REQ-002, REQ-003, REQ-023

---

## Screen: Create Dispute

**Purpose:** Operations_User captures a new payment dispute by filling in the required fields, with cascading dropdowns for payment type and issue category.

**Route:** `/disputes/new`

**Layout:**
- Header — page title "Create New Dispute", back link to dashboard
- Form card — single-column form with the following fields in order:
  - Customer select dropdown
  - Payment type select dropdown
  - Issue category select dropdown (filtered by selected payment type)
  - Transaction amount input (numeric)
  - Transaction date input (date picker)
  - Transaction status select dropdown
- Submit button — "Submit Dispute" (primary, bottom of form)
- Validation error area — field-level inline error messages below each field

**Data displayed:**
- Customer options (fetched from GET /api/customers): id, name, accountNumber
- Payment type options: "Card Payment", "EFT", "Internal Transfer"
- Issue category options (filtered by payment type, fetched from GET /api/payment-types)
- Transaction status options: "Completed", "Failed", "Pending"

**Interactions:**
- Select a payment type → issue category dropdown resets and repopulates with only valid categories for that type
- Change payment type after issue category selected → issue category clears and repopulates
- Submit with all valid fields → POST /api/disputes, then navigate to `/disputes/:id` for the newly created dispute
- Submit with missing/invalid fields → display inline validation errors below each invalid field (from API 400 response details)
- Click back link → navigate to dashboard `/`

**States:**
- Initial: all fields empty, submit button disabled until at least one field is populated
- Loading (submit): submit button shows spinner, form fields disabled during submission
- Validation error: field-level red text below each invalid field with specific message (e.g. "Payment type is required", "Issue category is not valid for the selected payment type")
- Error (server): toast or inline banner "Failed to create dispute. Please try again."

**Requirements:** REQ-004, REQ-005, REQ-006, REQ-007

---

## Screen: Dispute Detail

**Purpose:** Operations_User views the full details of a dispute and its triage recommendation, understanding what action to take and why the system reached that conclusion.

**Route:** `/disputes/:id`

**Layout:**
- Header — page title "Dispute #[id]", back link to dashboard
- Dispute info card — displays all dispute and transaction fields
  - Customer name
  - Payment type
  - Issue category
  - Transaction amount (formatted as currency)
  - Transaction date (formatted date)
  - Transaction status
  - Dispute creation date (formatted date)
- Triage recommendation card — prominent display of the routing decision
  - Routing action badge (colour-coded, prominent label)
  - Priority level indicator (colour-coded: High=red, Medium=amber, Low=green)
  - Reasoning list — expandable list of fired rules with descriptions and triggering attribute values

**Data displayed:**
- customer.name (string)
- paymentType (string)
- issueCategory (string)
- transaction.amount (number, formatted as currency)
- transaction.date (formatted date)
- transaction.status (string)
- createdAt (formatted date)
- triageRecommendation.routingAction (string, as prominent badge)
- triageRecommendation.priorityLevel (string, as colour indicator)
- triageRecommendation.reasoning (array of FiredRule objects):
  - ruleName (string, bold)
  - description (string)
  - triggeredBy (key-value pairs showing attribute values)

**Interactions:**
- Click back link → navigate to dashboard `/`
- Reasoning list entries are visible by default (no collapse needed for prototype)

**States:**
- Loading: skeleton/shimmer placeholders for both cards
- Not found: "Dispute not found. It may have been deleted." with link back to dashboard
- Error: "Unable to load dispute details. Please try again."

**Requirements:** REQ-021, REQ-022, REQ-023, REQ-024

---

## Shared Components

### Priority Level Badge

**Purpose:** Visually communicates dispute urgency using colour coding.

**Variants:**
- High — red background, white text, label "High"
- Medium — amber/orange background, dark text, label "Medium"
- Low — green background, white text, label "Low"

**Requirements:** REQ-023

---

### Routing Action Badge

**Purpose:** Visually distinguishes the four routing actions so users can identify the recommended action at a glance.

**Variants:**
- Escalate — red/dark red styling, icon (e.g. alert triangle)
- Investigate Further — amber/orange styling, icon (e.g. magnifying glass)
- Resolve Immediately — green styling, icon (e.g. checkmark)
- Refer to Another Team — blue/neutral styling, icon (e.g. arrow right)

**Requirements:** REQ-024

---

### Layout / Navigation

**Purpose:** Provides consistent navigation across all screens.

**Elements:**
- App title "Payment Dispute Triage" (links to dashboard)
- Navigation link: "Disputes" (links to `/`)
- Navigation link: "New Dispute" (links to `/disputes/new`)

**Requirements:** REQ-003

---

## Colour System

| Element | Colour | Usage |
|---------|--------|-------|
| Priority High | Red (#EF4444 / red-500) | Priority badge background |
| Priority Medium | Amber (#F59E0B / amber-500) | Priority badge background |
| Priority Low | Green (#10B981 / green-500) | Priority badge background |
| Escalate action | Red (#DC2626 / red-600) | Routing action badge |
| Investigate action | Amber (#D97706 / amber-600) | Routing action badge |
| Resolve action | Green (#059669 / green-600) | Routing action badge |
| Refer action | Blue (#2563EB / blue-600) | Routing action badge |
| Error text | Red (#DC2626) | Validation messages |

---

## Responsive Behaviour

- Desktop (≥1024px): full table layout on dashboard, side-by-side cards on detail view
- Tablet (768–1023px): table remains with horizontal scroll if needed, cards stack vertically
- Mobile (<768px): dispute list becomes card-based layout, form fields stack full-width
