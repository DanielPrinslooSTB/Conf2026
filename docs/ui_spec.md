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

**Requirements:** REQ-001, REQ-002

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

**Requirements:** REQ-003, REQ-004, REQ-005, REQ-006

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
  - Transaction amount (formatted as ZAR currency, e.g. R1,500.00)
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
- transaction.amount (number, formatted as ZAR currency, e.g. R1,500.00)
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

**Requirements:** REQ-015

---

## Shared Components

### Priority Level Badge

**Purpose:** Visually communicates dispute urgency using colour coding.

**Variants:**
- High — red background, white text, label "High"
- Medium — amber/orange background, dark text, label "Medium"
- Low — green background, white text, label "Low"

**Requirements:** REQ-015

---

### Routing Action Badge

**Purpose:** Visually distinguishes the four routing actions so users can identify the recommended action at a glance.

**Variants:**
- Escalate — red/dark red styling, icon (e.g. alert triangle)
- Investigate Further — amber/orange styling, icon (e.g. magnifying glass)
- Resolve Immediately — green styling, icon (e.g. checkmark)
- Refer to Another Team — blue/neutral styling, icon (e.g. arrow right)

**Requirements:** REQ-015

---

### Layout / Navigation

**Purpose:** Provides consistent navigation across all screens.

**Elements:**
- App title "Payment Dispute Triage" (links to dashboard)
- Navigation link: "Disputes" (links to `/`)
- Navigation link: "New Dispute" (links to `/disputes/new`)

**Requirements:** REQ-002

---

## Style Guidelines (Standard Bank-inspired)

Style references derived from [standardbank.co.za](https://www.standardbank.co.za).

### Brand Colour Palette

| Token | Hex | Tailwind Equivalent | Usage |
|-------|-----|---------------------|-------|
| Primary Blue | #0033A1 | blue-800 | Header background, primary buttons, active nav links |
| Primary Blue Light | #1A5FC9 | blue-600 | Button hover states, link text |
| Secondary Blue | #E8F0FE | blue-50 | Card backgrounds, selected row highlight |
| White | #FFFFFF | white | Page background, card surfaces, button text on primary |
| Dark Grey | #1F2937 | gray-800 | Body text, table cell text |
| Medium Grey | #6B7280 | gray-500 | Secondary text, labels, timestamps |
| Light Grey | #F3F4F6 | gray-100 | Table header background, dividers, disabled fields |
| Border Grey | #E5E7EB | gray-200 | Card borders, table row dividers, input borders |

### Status & Priority Colours

| Token | Hex | Usage |
|-------|-----|-------|
| Priority High | #DC2626 (red-600) | High priority badge background |
| Priority Medium | #D97706 (amber-600) | Medium priority badge background |
| Priority Low | #059669 (green-600) | Low priority badge background |
| Escalate | #991B1B (red-800) | Escalate routing badge |
| Investigate | #92400E (amber-800) | Investigate Further routing badge |
| Resolve | #065F46 (green-800) | Resolve Immediately routing badge |
| Refer | #1E40AF (blue-800) | Refer to Another Team routing badge |
| Error | #DC2626 (red-600) | Validation error text, error borders |
| Success | #059669 (green-600) | Success states, confirmations |

### Typography

| Element | Font | Size | Weight | Colour |
|---------|------|------|--------|--------|
| Page title | "Inter", system-ui, sans-serif | 24px (text-2xl) | 700 (bold) | Dark Grey (#1F2937) |
| Section heading | "Inter", system-ui, sans-serif | 18px (text-lg) | 600 (semibold) | Dark Grey (#1F2937) |
| Table header | "Inter", system-ui, sans-serif | 12px (text-xs) | 600 (semibold) | Medium Grey (#6B7280), uppercase |
| Body text | "Inter", system-ui, sans-serif | 14px (text-sm) | 400 (normal) | Dark Grey (#1F2937) |
| Badge text | "Inter", system-ui, sans-serif | 12px (text-xs) | 600 (semibold) | White (#FFFFFF) |
| Input label | "Inter", system-ui, sans-serif | 14px (text-sm) | 500 (medium) | Dark Grey (#1F2937) |
| Validation error | "Inter", system-ui, sans-serif | 12px (text-xs) | 400 (normal) | Error (#DC2626) |
| Navigation link | "Inter", system-ui, sans-serif | 14px (text-sm) | 500 (medium) | White (#FFFFFF) |

Font stack rationale: Inter provides clean readability for data-heavy banking UIs with good numeric tabular figures. Falls back to system-ui for zero-download performance.

### Spacing & Layout

| Token | Value | Usage |
|-------|-------|-------|
| Page padding | 24px (p-6) | Outer page margins |
| Card padding | 20px (p-5) | Internal card spacing |
| Section gap | 24px (gap-6) | Between cards/sections |
| Table row height | 48px (h-12) | Consistent clickable row targets |
| Input height | 40px (h-10) | Form field height |
| Border radius (cards) | 8px (rounded-lg) | Card corners |
| Border radius (badges) | 9999px (rounded-full) | Pill-shaped badges |
| Border radius (inputs) | 6px (rounded-md) | Input field corners |
| Border radius (buttons) | 6px (rounded-md) | Button corners |

### Component Styling

**Header / Navigation Bar:**
- Background: Primary Blue (#0033A1)
- Text: White
- Height: 56px
- Drop shadow: `shadow-md` (0 4px 6px rgba(0,0,0,0.1))
- Logo/title left-aligned, nav links centre or right

**Primary Button (e.g. "Create Dispute", "Submit Dispute"):**
- Background: Primary Blue (#0033A1)
- Text: White, 14px, semibold
- Padding: 10px 20px
- Border radius: 6px
- Hover: Primary Blue Light (#1A5FC9)
- Disabled: Light Grey background (#F3F4F6), Medium Grey text (#6B7280)
- Loading: spinner icon replaces text

**Table:**
- Header row: Light Grey background (#F3F4F6), uppercase labels, no wrap
- Body rows: white background, border-bottom Border Grey (#E5E7EB)
- Hover row: Secondary Blue (#E8F0FE)
- Clickable cursor: pointer on entire row

**Cards:**
- Background: White
- Border: 1px solid Border Grey (#E5E7EB)
- Border radius: 8px
- Shadow: `shadow-sm` (0 1px 2px rgba(0,0,0,0.05))
- Padding: 20px

**Form Inputs:**
- Border: 1px solid Border Grey (#E5E7EB)
- Focus border: Primary Blue (#0033A1)
- Focus ring: 2px Primary Blue Light at 20% opacity
- Error state: 1px solid Error (#DC2626), error text below
- Background: White
- Text: Dark Grey

**Badges (Priority & Routing Action):**
- Pill shape (rounded-full)
- Padding: 4px 12px
- Font: 12px semibold, white text
- Background: corresponding status/priority colour from palette above

### Iconography

- Use [Heroicons](https://heroicons.com/) (outline style, 20px)
- Navigation: `ChevronLeftIcon` for back links
- Escalate badge: `ExclamationTriangleIcon`
- Investigate badge: `MagnifyingGlassIcon`
- Resolve badge: `CheckCircleIcon`
- Refer badge: `ArrowRightCircleIcon`
- Loading: `ArrowPathIcon` (spinning)
- Error state: `ExclamationCircleIcon`

### Accessibility

- All interactive elements must have minimum 44×44px touch target
- Colour contrast: all text/background pairs meet WCAG 2.1 AA (4.5:1 for normal text, 3:1 for large text)
- Priority and routing badges include text labels (not colour-only indicators)
- Form inputs have associated `<label>` elements
- Focus states visible with outline or ring (never hidden)
- Table rows use `role="link"` or are wrapped in accessible clickable elements
- Screen reader: badges include `aria-label` with full priority/action text

---

## Responsive Behaviour

- Desktop (≥1024px): full table layout on dashboard, side-by-side cards on detail view
- Tablet (768–1023px): table remains with horizontal scroll if needed, cards stack vertically
- Mobile (<768px): dispute list becomes card-based layout, form fields stack full-width

### Breakpoint Specifics

| Breakpoint | Header | Dashboard | Detail View | Form |
|-----------|--------|-----------|-------------|------|
| ≥1024px | Full nav bar | Table with all columns | Two-column (info + triage side-by-side) | Single column, max-width 600px centred |
| 768–1023px | Hamburger menu optional | Table, horizontal scroll if needed | Stacked cards | Full width with padding |
| <768px | Compact header, hamburger menu | Card list (one card per dispute) | Stacked cards, full width | Full width, reduced padding |
