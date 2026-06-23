# Design Document

## Architecture Overview

The Payment Dispute Triage system follows a layered architecture within the existing monorepo structure:

```
client/ (React + Vite + Tailwind)
├── src/
│   ├── components/       # Reusable UI components
│   ├── pages/            # Route-level page components
│   ├── services/         # API client functions
│   └── types/            # Shared TypeScript interfaces

server/ (Express + Prisma + SQLite)
├── src/
│   ├── routes/           # Express route handlers
│   ├── services/         # Business logic (triage engine)
│   ├── validators/       # Input validation
│   └── middleware/       # Error handling (existing)
├── prisma/
│   ├── schema.prisma     # Data models
│   └── seed.ts           # Mock data seeder
```

The server exposes a REST API consumed by the React client. The Triage Engine is a pure function module with no external dependencies, making it independently testable. All data persists in SQLite via Prisma.

## Data Models

### Prisma Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model Customer {
  id        Int       @id @default(autoincrement())
  name      String
  email     String    @unique
  accountNumber String @unique
  createdAt DateTime  @default(now())
  disputes  Dispute[]
}

model Transaction {
  id        Int       @id @default(autoincrement())
  amount    Float
  date      DateTime
  status    String    // "Completed", "Failed", "Pending"
  type      String    // "Card Payment", "EFT", "Internal Transfer"
  reference String    @unique
  createdAt DateTime  @default(now())
  disputes  Dispute[]
}

model Dispute {
  id              Int       @id @default(autoincrement())
  customerId      Int
  transactionId   Int
  paymentType     String    // "Card Payment", "EFT", "Internal Transfer"
  issueCategory   String    // e.g., "Duplicate Debit", "Unauthorized Transaction"
  status          String    @default("Open") // "Open", "In Progress", "Resolved"
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  customer        Customer  @relation(fields: [customerId], references: [id])
  transaction     Transaction @relation(fields: [transactionId], references: [id])
  triageRecommendation TriageRecommendation?
}

model TriageRecommendation {
  id            Int     @id @default(autoincrement())
  disputeId     Int     @unique
  routingAction String  // "Resolve Immediately", "Investigate Further", "Escalate", "Refer to Another Team"
  priorityLevel String  // "High", "Medium", "Low"
  reasoning     String  // JSON string containing rule names and attribute values
  createdAt     DateTime @default(now())

  dispute       Dispute @relation(fields: [disputeId], references: [id])
}
```

### Key Design Decisions

- **Transaction stored separately from Dispute**: A single transaction can have multiple disputes over time. The Dispute references both Customer and Transaction.
- **TriageRecommendation as separate model**: Allows re-running triage without mutating the dispute record. One-to-one relationship via `disputeId @unique`.
- **Reasoning as JSON string**: SQLite lacks native JSON column type. The reasoning field stores a serialized array of fired rules with their trigger attributes.
- **Status field on Dispute**: Allows future workflow progression beyond the initial triage.

## REST API Design

### Endpoints

| Method | Path | Description | Response |
|--------|------|-------------|----------|
| GET | `/api/payment-types` | Return payment types with valid issue categories | `PaymentTypeMap[]` |
| GET | `/api/disputes` | List all disputes with triage recommendations | `DisputeWithTriage[]` |
| GET | `/api/disputes/:id` | Get single dispute with full details and triage | `DisputeWithTriage` |
| POST | `/api/disputes` | Create dispute, run triage, return result | `DisputeWithTriage` |
| GET | `/api/customers` | List customers for form dropdown | `Customer[]` |

### Request/Response Types

```typescript
// POST /api/disputes request body
interface CreateDisputeRequest {
  customerId: number;
  paymentType: "Card Payment" | "EFT" | "Internal Transfer";
  issueCategory: string;
  transactionAmount: number;
  transactionDate: string; // ISO date
  transactionStatus: "Completed" | "Failed" | "Pending";
}

// Response shape for dispute endpoints
interface DisputeWithTriage {
  id: number;
  customer: { id: number; name: string; accountNumber: string };
  paymentType: string;
  issueCategory: string;
  transaction: {
    amount: number;
    date: string;
    status: string;
    reference: string;
  };
  status: string;
  createdAt: string;
  triageRecommendation: {
    routingAction: string;
    priorityLevel: string;
    reasoning: FiredRule[];
  };
}

// Reasoning structure
interface FiredRule {
  ruleName: string;
  description: string;
  triggeredBy: Record<string, string | number>;
}

// GET /api/payment-types response
interface PaymentTypeEntry {
  type: string;
  issueCategories: string[];
}
```

### Error Responses

All error responses follow the existing `errorHandler` pattern:

```typescript
// 400 - Validation Error
{
  error: {
    code: "VALIDATION_ERROR",
    message: "Invalid request data",
    status: 400,
    details: { fieldName: "Error description" }
  }
}

// 404 - Not Found
{
  error: {
    code: "NOT_FOUND",
    message: "Dispute with id 999 not found",
    status: 404
  }
}
```

## Triage Rules Engine

### Architecture

The Triage Engine is a pure function module that takes dispute attributes as input and returns a `TriageRecommendation`. It has no database dependencies and no side effects, making it fully unit-testable.

```typescript
// server/src/services/triageEngine.ts

interface TriageInput {
  transactionAmount: number;
  transactionStatus: "Completed" | "Failed" | "Pending";
  issueCategory: string;
  disputeCreatedAt: Date;
}

interface TriageResult {
  routingAction: "Resolve Immediately" | "Investigate Further" | "Escalate" | "Refer to Another Team";
  priorityLevel: "High" | "Medium" | "Low";
  reasoning: FiredRule[];
}

function evaluateDispute(input: TriageInput): TriageResult {
  const reasoning: FiredRule[] = [];
  
  // Step 1: Determine base priority from amount
  const basePriority = determineBasePriority(input.transactionAmount);
  
  // Step 2: Apply age escalation
  const finalPriority = applyAgeEscalation(basePriority, input.disputeCreatedAt);
  
  // Step 3: Determine routing action (rules evaluated in priority order)
  const routingAction = determineRoutingAction(input);
  
  return { routingAction, priorityLevel: finalPriority, reasoning };
}
```

### Rule Evaluation Order

Rules are evaluated in strict priority order. The first matching rule determines the Routing Action:

1. **Unauthorized Transaction Rule** (highest priority): If `issueCategory === "Unauthorized Transaction"` → **Escalate**
2. **Failed Transaction Rule**: If `transactionStatus === "Failed"` AND issue is not Unauthorized → **Investigate Further**
3. **Low-Value Duplicate Rule**: If `transactionAmount < 500` AND `issueCategory === "Duplicate Debit"` AND `transactionStatus !== "Failed"` → **Resolve Immediately**
4. **Default Rule** (fallback): No other rule matched → **Refer to Another Team**

### Priority Calculation

```typescript
function determineBasePriority(amount: number): "High" | "Medium" | "Low" {
  if (amount > 10000) return "High";
  if (amount >= 1000) return "Medium";
  return "Low";
}

function applyAgeEscalation(
  basePriority: "High" | "Medium" | "Low",
  createdAt: Date
): "High" | "Medium" | "Low" {
  const ageInDays = Math.floor(
    (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  if (ageInDays <= 7) return basePriority;
  
  // Escalate one tier
  if (basePriority === "Low") return "Medium";
  if (basePriority === "Medium") return "High";
  return "High"; // High remains High
}
```

### Reasoning Output

Each rule that fires appends an entry to the reasoning array:

```typescript
// Example reasoning output
[
  {
    ruleName: "Amount Priority Rule",
    description: "Transaction amount determines base priority",
    triggeredBy: { amount: 15000, result: "High" }
  },
  {
    ruleName: "Age Escalation Rule",
    description: "Dispute older than 7 days escalates priority by one tier",
    triggeredBy: { ageInDays: 12, basePriority: "Medium", escalatedTo: "High" }
  },
  {
    ruleName: "Unauthorized Transaction Rule",
    description: "Unauthorized transactions are always escalated",
    triggeredBy: { issueCategory: "Unauthorized Transaction" }
  }
]
```

## Payment Type and Issue Category Reference Data

This is static configuration data, not stored in the database:

```typescript
// server/src/services/paymentTypes.ts

export const PAYMENT_TYPE_CATEGORIES: Record<string, string[]> = {
  "Card Payment": [
    "Duplicate Debit",
    "Unauthorized Transaction",
    "Failed Transaction",
    "Incorrect Amount"
  ],
  "EFT": [
    "Failed Transfer",
    "Duplicate Debit",
    "Missing Payment"
  ],
  "Internal Transfer": [
    "Failed Transfer",
    "Duplicate Debit",
    "Missing Payment",
    "Unauthorized Transaction"
  ]
};
```

## Input Validation

```typescript
// server/src/validators/disputeValidator.ts

interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

function validateCreateDispute(body: unknown): ValidationResult {
  // Validates:
  // - customerId: required, must be positive integer
  // - paymentType: required, must be one of the three valid types
  // - issueCategory: required, must be valid for the selected paymentType
  // - transactionAmount: required, must be positive number
  // - transactionDate: required, must be valid ISO date string
  // - transactionStatus: required, must be "Completed", "Failed", or "Pending"
}
```

## React Component Hierarchy

```
App
├── Layout (common header/navigation)
│   ├── DisputeListPage          → route: /
│   │   ├── DisputeTable
│   │   │   └── DisputeRow (clickable, shows summary)
│   │   └── CreateDisputeButton
│   │
│   ├── CreateDisputePage        → route: /disputes/new
│   │   ├── DisputeForm
│   │   │   ├── CustomerSelect
│   │   │   ├── PaymentTypeSelect
│   │   │   ├── IssueCategorySelect (filtered by payment type)
│   │   │   ├── AmountInput
│   │   │   ├── DateInput
│   │   │   └── StatusSelect
│   │   └── ValidationErrors
│   │
│   └── DisputeDetailPage        → route: /disputes/:id
│       ├── DisputeInfo (customer, transaction, dates)
│       └── TriageCard
│           ├── RoutingActionBadge (colour-coded)
│           ├── PriorityIndicator (red/amber/green)
│           └── ReasoningList (fired rules)
```

### Routing Configuration

```typescript
// client/src/main.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

<BrowserRouter>
  <Routes>
    <Route path="/" element={<Layout />}>
      <Route index element={<DisputeListPage />} />
      <Route path="disputes/new" element={<CreateDisputePage />} />
      <Route path="disputes/:id" element={<DisputeDetailPage />} />
    </Route>
  </Routes>
</BrowserRouter>
```

### Client API Service

```typescript
// client/src/services/api.ts
const API_BASE = '/api';

export async function fetchDisputes(): Promise<DisputeWithTriage[]> { ... }
export async function fetchDispute(id: number): Promise<DisputeWithTriage> { ... }
export async function createDispute(data: CreateDisputeRequest): Promise<DisputeWithTriage> { ... }
export async function fetchPaymentTypes(): Promise<PaymentTypeEntry[]> { ... }
export async function fetchCustomers(): Promise<Customer[]> { ... }
```

## Seed Data Strategy

The seed script (`server/prisma/seed.ts`) creates:

1. **10+ Customers**: Mix of names, emails, account numbers
2. **20+ Transactions**: Varying amounts (50–25000), dates (1–30 days ago), statuses (Completed/Failed/Pending), and types across all three Payment_Type values
3. **15+ Disputes**: Designed to trigger all triage paths:
   - At least 2 Unauthorized Transaction disputes → Escalate
   - At least 2 Failed status disputes (non-Unauthorized) → Investigate Further
   - At least 2 low-value Duplicate Debit disputes → Resolve Immediately
   - At least 2 disputes matching no specific rule → Refer to Another Team
   - Mix of ages: some < 7 days, some > 7 days (for priority escalation)
   - Mix of amounts: some < 500, some 1000–10000, some > 10000

The seed script runs the Triage Engine on each dispute after creation, persisting the `TriageRecommendation` record.

```typescript
// server/prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import { evaluateDispute } from '../src/services/triageEngine.js';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.triageRecommendation.deleteMany();
  await prisma.dispute.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.customer.deleteMany();

  // Create customers, transactions, disputes
  // Run triage on each dispute and persist recommendation
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
```

Add to `server/package.json`:
```json
{
  "prisma": {
    "seed": "node --import tsx prisma/seed.ts"
  }
}
```

## Error Handling

The system leverages the existing `errorHandler` middleware pattern:

- **Validation errors** (400): Thrown by validators with field-level detail
- **Not found errors** (404): Thrown when dispute ID doesn't exist
- **Server errors** (500): Caught by the global error handler

```typescript
// Custom error class extending existing AppError pattern
export class ApiError extends Error {
  status: number;
  code: string;
  details?: Record<string, string>;

  constructor(status: number, code: string, message: string, details?: Record<string, string>) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Dispute list ordering

For any set of disputes returned by the list endpoint, the disputes SHALL appear sorted by creation date in descending order—each dispute's creation date is greater than or equal to the next dispute's creation date in the list.

**Validates: REQ-001**

### Property 2: Payment type constrains issue categories

For any Payment_Type value, the set of valid Issue_Category options returned by the system SHALL exactly match the defined mapping: Card Payment → {Duplicate Debit, Unauthorized Transaction, Failed Transaction, Incorrect Amount}, EFT → {Failed Transfer, Duplicate Debit, Missing Payment}, Internal Transfer → {Failed Transfer, Duplicate Debit, Missing Payment, Unauthorized Transaction}.

**Validates: REQ-004, REQ-021**

### Property 3: Dispute creation round-trip

For any valid dispute creation input, after submitting through the POST endpoint, the created dispute SHALL be retrievable by its returned ID with all submitted field values preserved and a non-null TriageRecommendation attached.

**Validates: REQ-005, REQ-019**

### Property 4: Validation rejects incomplete input

For any dispute creation request missing at least one required field (customerId, paymentType, issueCategory, transactionAmount, transactionDate, transactionStatus), the system SHALL return an HTTP 400 response with error details identifying the missing fields.

**Validates: REQ-006, REQ-020**

### Property 5: Triage output structural completeness

For any valid dispute input evaluated by the Triage Engine, the output SHALL contain exactly one Routing_Action from {Resolve Immediately, Investigate Further, Escalate, Refer to Another Team}, exactly one Priority_Level from {High, Medium, Low}, and a non-empty reasoning array.

**Validates: REQ-007**

### Property 6: Amount-based priority assignment

For any dispute, the base Priority_Level SHALL be High when transaction amount > 10000, Medium when 1000 ≤ amount ≤ 10000, and Low when amount < 1000.

**Validates: REQ-008**

### Property 7: Age-based priority escalation

For any dispute whose age exceeds 7 days, the final Priority_Level SHALL be one tier above the base amount-derived priority (Low → Medium, Medium → High), and High SHALL remain High.

**Validates: REQ-009**

### Property 8: Unauthorized transaction always escalates

For any dispute where Issue_Category is "Unauthorized Transaction", regardless of transaction amount, status, or dispute age, the Routing_Action SHALL be "Escalate".

**Validates: REQ-010**

### Property 9: Failed status routes to investigation

For any dispute where transaction status is "Failed" and Issue_Category is not "Unauthorized Transaction", the Routing_Action SHALL be "Investigate Further".

**Validates: REQ-011**

### Property 10: Low-value duplicate resolves immediately

For any dispute where transaction amount < 500 and Issue_Category is "Duplicate Debit" and transaction status is not "Failed", the Routing_Action SHALL be "Resolve Immediately".

**Validates: REQ-012**

### Property 11: Default routing fallback

For any dispute that does not match the Unauthorized Transaction rule, the Failed status rule, or the Low-value Duplicate rule, the Routing_Action SHALL be "Refer to Another Team".

**Validates: REQ-013**

### Property 12: Reasoning transparency

For any triage evaluation, the reasoning explanation SHALL include the name of each rule that fired and the specific attribute values (amount, status, issue category, age) that triggered that rule.

**Validates: REQ-014**

### Property 13: Non-existent dispute returns 404

For any dispute ID that does not exist in the database, the GET /api/disputes/:id endpoint SHALL return an HTTP 404 response.

**Validates: REQ-020**
