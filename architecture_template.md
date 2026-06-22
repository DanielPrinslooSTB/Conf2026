# Architecture Document
## Components
- [Component name] — [responsibility]
## Data Model
- [Entity] — [key fields] — [relationships]
## Integrations
- [External system] — [how we connect] — [simulated/real]
## Key Decisions
- [Decision] — [rationale]
---
## Example
## Components
- Frontend (React + Vite) — merchant and customer UIs
- API Layer (Express) — REST endpoints, validation, business logic
- Database (SQLite + Prisma) — persistence
- Notification Service — sends payment request to customer (simulated)
## Data Model
- Merchant — id, name, phone, email
- PaymentRequest — id, merchantId, amount, reason, customerPhone, status, expiresAt
- Transaction — id, requestId, paymentMethod, amount, status, completedAt
## Integrations
- Payment rail — simulated (mock service returns success after 2s delay)
- SMS notifications — simulated (logged to console)
## Key Decisions
- SQLite chosen for zero-infrastructure setup
- Real-time updates via polling (simpler than WebSockets for a prototype)
- All payment processing is simulated — no real money moves

## Technology Stack

| Layer | Choice |
|---------|---------|
| Language | TypeScript (strict mode) |
| Frontend | React + Vite |
| Backend | Node.js + Express |
| Database | SQLite via Prisma |
| Styling | Tailwind CSS |
| Testing | Vitest (unit) + Playwright (E2E) |
| Package Manager | npm |
| Structure | npm workspaces (frontend + backend) |

## Infrastructure Options

Infrastructure depends on what your environment permits. All paths are equally valid for judging.

| Path | When to Use | Requirements |
|--------|-------------|--------------|
| Local development | Machine allows Node.js + npm + local servers | Node.js 20+, npm, unrestricted localhost |