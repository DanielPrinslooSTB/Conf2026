# Screen Specifications
## Screen: [Screen Name]
**Purpose:** [What the user accomplishes here]
**Layout:**
- [Component] — [description]
- [Component] — [description]
**Data displayed:**
- [field]: [format/source]
**Interactions:**
- [User action] → [system response]
**States:**
- Empty: [what shows when no data]
- Loading: [what shows while fetching]
- Error: [what shows on failure]
---
## Example
## Screen: Merchant Dashboard
**Purpose:** Merchant views all payment requests and their statuses.
**Layout:**
- Header: business name, logout button
- Action bar: "New Request" button (primary action, top-right)
- Request list/table showing all requests
**Data displayed:**
- Customer phone, amount (ZAR), reason, status badge, created date
**Interactions:**
- Click "New Request" → opens create request form
- Click a request row → shows request detail
- Status badges update in real-time when payment is received (no page refresh)
**States:**
- Empty: "No payment requests yet. Create your first one."
- Loading: skeleton/shimmer on the request list
- Error: "Unable to load requests. Try again."