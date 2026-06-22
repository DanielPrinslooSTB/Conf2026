# Architecture Document

## Components

- Frontend (React + Vite + Tailwind) — dispute management UI with dashboard, creation form, and detail views
- API Layer (Express) — REST endpoints for disputes, customers, and payment type reference data; request validation and error handling
- Triage Engine (pure TypeScript module) — deterministic rules engine that evaluates dispute attributes and produces routing recommendations with reasoning transparency
- Database (SQLite + Prisma) — persistence for customers, transactions, disputes, and triage recommendations
- Seed Script — populates the database with representative mock data covering all triage paths

## Data Model

- Customer — id, name, email (unique), accountNumber (unique), createdAt — has many Disputes
- Transaction — id, amount, date, status, type, reference (unique), createdAt — has many Disputes
- Dispute — id, customerId, transactionId, paymentType, issueCategory, status, createdAt, updatedAt — belongs to Customer, belongs to Transaction, has one TriageRecommendation
- TriageRecommendation — id, disputeId (unique), routingAction, priorityLevel, reasoning (JSON string), createdAt — belongs to Dispute

## Integrations

- Payment types reference data — static configuration (no external service); defined as in-memory constant mapping
- Triage evaluation — internal pure function; no external service calls; deterministic rule evaluation
- Database — local SQLite file via Prisma ORM; zero-infrastructure setup

## Key Decisions

- SQLite chosen for zero-infrastructure prototype setup — no database server required
- Triage Engine implemented as a pure function with no side effects — independently testable without mocks
- TriageRecommendation stored as separate model (1:1 with Dispute) — allows re-running triage without mutating dispute records
- Reasoning stored as JSON string — SQLite lacks native JSON column; serialized array of fired rules with trigger attributes
- Transaction stored separately from Dispute — one transaction can have multiple disputes over time
- Payment type → issue category mapping is static config, not in database — eliminates unnecessary joins for reference data
- Vite dev server proxies /api to Express — single origin during development, no CORS configuration needed
- npm workspaces used to manage client and server as a monorepo — shared tooling and unified dependency management

## Technology Stack

| Layer | Choice |
|---------|---------|
| Language | TypeScript (strict mode) |
| Frontend | React 18 + Vite |
| Backend | Node.js 20+ + Express |
| Database | SQLite via Prisma |
| Styling | Tailwind CSS |
| Testing | Vitest (unit + property-based with fast-check) |
| Package Manager | npm |
| Structure | npm workspaces (client + server) |
| Routing | React Router v6 |

## Infrastructure Options

| Path | When to Use | Requirements |
|--------|-------------|--------------|
| Local development | Machine allows Node.js + npm + local servers | Node.js 20+, npm, unrestricted localhost |

## Project Structure

```
project-root/
├── package.json              # Root workspace config
├── client/                   # Frontend workspace
│   ├── package.json
│   ├── vite.config.ts        # Dev server + API proxy config
│   ├── index.html
│   └── src/
│       ├── main.tsx          # App entry + router setup
│       ├── components/       # Reusable UI components
│       │   ├── Layout.tsx
│       │   ├── DisputeTable.tsx
│       │   ├── DisputeForm.tsx
│       │   ├── TriageCard.tsx
│       │   ├── PriorityIndicator.tsx
│       │   └── RoutingActionBadge.tsx
│       ├── pages/            # Route-level page components
│       │   ├── DisputeListPage.tsx
│       │   ├── CreateDisputePage.tsx
│       │   └── DisputeDetailPage.tsx
│       ├── services/         # API client functions
│       │   └── api.ts
│       └── types/            # Shared TypeScript interfaces
│           └── index.ts
├── server/                   # Backend workspace
│   ├── package.json
│   ├── prisma/
│   │   ├── schema.prisma     # Data models
│   │   └── seed.ts           # Mock data seeder
│   └── src/
│       ├── index.ts          # Express app entry
│       ├── routes/           # Route handlers
│       │   ├── api.ts        # Router registry
│       │   ├── disputes.ts   # Dispute CRUD + triage
│       │   ├── paymentTypes.ts
│       │   └── customers.ts
│       ├── services/         # Business logic
│       │   ├── triageEngine.ts   # Pure triage function
│       │   └── paymentTypes.ts   # Static reference data
│       ├── validators/       # Input validation
│       │   └── disputeValidator.ts
│       ├── middleware/       # Cross-cutting concerns
│       │   ├── errorHandler.ts
│       │   └── ApiError.ts
│       └── types/            # Shared server types
│           └── dispute.ts
```

## Request Flow

```
Browser → React UI → fetch(/api/...) → Vite proxy → Express Router
                                                        │
                                          ┌─────────────┼─────────────┐
                                          ▼             ▼             ▼
                                    Validator    Prisma Query    Triage Engine
                                          │             │             │
                                          ▼             ▼             ▼
                                    400 Error      Database      TriageResult
                                                        │             │
                                                        └──────┬──────┘
                                                               ▼
                                                     JSON Response → Browser
```

## Triage Engine Flow

```
Input (amount, status, issueCategory, disputeCreatedAt)
    │
    ├─→ Step 1: determineBasePriority(amount)
    │       >10000 → High | 1000–10000 → Medium | <1000 → Low
    │
    ├─→ Step 2: applyAgeEscalation(basePriority, createdAt)
    │       age > 7 days → escalate one tier (cap at High)
    │
    ├─→ Step 3: determineRoutingAction(input) — first match wins:
    │       1. Unauthorized Transaction → Escalate
    │       2. Failed status (non-Unauthorized) → Investigate Further
    │       3. amount<500 + Duplicate Debit + status≠Failed → Resolve Immediately
    │       4. Default → Refer to Another Team
    │
    └─→ Output: { routingAction, priorityLevel, reasoning[] }
```

## Development Workflow

1. `npm install` — install all workspace dependencies from root
2. `npx prisma migrate dev` — create/apply database migrations (in server/)
3. `npx prisma db seed` — populate mock data (in server/)
4. `npm run dev` (server) — start Express on port 3001
5. `npm run dev` (client) — start Vite on port 5173 with /api proxy to :3001
6. `npm run test` — run Vitest (unit + property-based tests)
