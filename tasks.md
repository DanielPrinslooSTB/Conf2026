# Implementation Plan: Payment Dispute Triage

## Overview

Implement a payment dispute triage prototype within the existing Node.js monorepo. The implementation follows a dependency-driven order: data layer (Prisma schema + migrations), then the pure triage engine, then REST API routes with validation, then React UI pages, and finally seed data. TypeScript is used throughout with Vitest for testing.

## Tasks

- [ ] 1. Data layer setup
  - [ ] 1.1 Define Prisma schema for dispute models
    - Replace the existing `User` model in `server/prisma/schema.prisma` with the `Customer`, `Transaction`, `Dispute`, and `TriageRecommendation` models as defined in the design document
    - Add all relations, unique constraints, and default values
    - Run `prisma migrate dev` to generate and apply the migration
    - Run `prisma generate` to update the Prisma client
    - _Requirements: 5.1, 6.3_

  - [ ] 1.2 Create shared TypeScript types
    - Create `server/src/types/dispute.ts` with interfaces: `CreateDisputeRequest`, `DisputeWithTriage`, `FiredRule`, `PaymentTypeEntry`, `TriageInput`, `TriageResult`
    - These types are used by the triage engine, validators, and route handlers
    - _Requirements: 3.1, 6.1, 6.2, 6.3_

- [ ] 2. Triage Rules Engine
  - [ ] 2.1 Implement the triage engine pure function
    - Create `server/src/services/triageEngine.ts`
    - Implement `evaluateDispute(input: TriageInput): TriageResult` as a pure function with no database or side-effect dependencies
    - Implement `determineBasePriority(amount)`: >10000 → High, >=1000 → Medium, <1000 → Low
    - Implement `applyAgeEscalation(basePriority, createdAt)`: if age > 7 days, escalate one tier (Low→Medium, Medium→High, High→High)
    - Implement `determineRoutingAction(input)` with rule priority order: (1) Unauthorized Transaction → Escalate, (2) Failed status (non-Unauthorized) → Investigate Further, (3) amount<500 + Duplicate Debit + status≠Failed → Resolve Immediately, (4) Default → Refer to Another Team
    - Populate reasoning array with rule names, descriptions, and triggering attribute values for each fired rule
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_

  - [ ]* 2.2 Write property tests for priority assignment (Property 6)
    - **Property 6: Amount-based priority assignment**
    - Generate random transaction amounts and verify: >10000 → High, >=1000 and <=10000 → Medium, <1000 → Low
    - **Validates: Requirements 3.2**

  - [ ]* 2.3 Write property tests for age escalation (Property 7)
    - **Property 7: Age-based priority escalation**
    - Generate random disputes with age > 7 days and verify priority escalates one tier (Low→Medium, Medium→High, High→High)
    - Generate random disputes with age <= 7 days and verify priority remains unchanged
    - **Validates: Requirements 3.3**

  - [ ]* 2.4 Write property tests for routing action rules (Properties 8, 9, 10, 11)
    - **Property 8: Unauthorized transaction always escalates** — For any input with issueCategory "Unauthorized Transaction", routingAction must be "Escalate"
    - **Property 9: Failed status routes to investigation** — For any input with status "Failed" and issueCategory ≠ "Unauthorized Transaction", routingAction must be "Investigate Further"
    - **Property 10: Low-value duplicate resolves immediately** — For any input with amount < 500, issueCategory "Duplicate Debit", status ≠ "Failed", routingAction must be "Resolve Immediately"
    - **Property 11: Default routing fallback** — For any input not matching rules 8/9/10, routingAction must be "Refer to Another Team"
    - **Validates: Requirements 3.4, 3.5, 3.6, 3.7**

  - [ ]* 2.5 Write property test for triage output completeness (Property 5)
    - **Property 5: Triage output structural completeness**
    - For any valid TriageInput, verify the output contains exactly one valid RoutingAction, exactly one valid PriorityLevel, and a non-empty reasoning array
    - **Validates: Requirements 3.1**

  - [ ]* 2.6 Write property test for reasoning transparency (Property 12)
    - **Property 12: Reasoning transparency**
    - For any valid TriageInput, verify the reasoning array includes at least one entry with a non-empty ruleName and triggeredBy object containing the relevant attribute values
    - **Validates: Requirements 3.8**

- [ ] 3. Payment type reference data and validation
  - [ ] 3.1 Create payment types reference module
    - Create `server/src/services/paymentTypes.ts` with the `PAYMENT_TYPE_CATEGORIES` constant mapping each Payment_Type to its valid Issue_Category array
    - Export a helper `getValidIssueCategories(paymentType: string): string[] | undefined`
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [ ] 3.2 Implement dispute creation validator
    - Create `server/src/validators/disputeValidator.ts`
    - Implement `validateCreateDispute(body: unknown): ValidationResult` that checks: customerId (required, positive integer), paymentType (required, one of three valid types), issueCategory (required, valid for selected paymentType), transactionAmount (required, positive number), transactionDate (required, valid ISO date), transactionStatus (required, one of "Completed"/"Failed"/"Pending")
    - Return field-level error messages for each invalid/missing field
    - _Requirements: 2.4, 6.5_

  - [ ]* 3.3 Write property test for payment type constraint (Property 2)
    - **Property 2: Payment type constrains issue categories**
    - For each payment type, verify the returned issue categories exactly match the specification
    - **Validates: Requirements 2.2, 7.1, 7.3, 7.4, 7.5**

  - [ ]* 3.4 Write property test for validation rejection (Property 4)
    - **Property 4: Validation rejects incomplete input**
    - Generate random dispute creation requests with one or more required fields removed, verify the validator returns errors identifying the missing fields
    - **Validates: Requirements 2.4, 6.5**

- [ ] 4. Checkpoint - Data layer and engine complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. REST API routes
  - [ ] 5.1 Create API error class
    - Create `server/src/middleware/ApiError.ts` with the `ApiError` class (status, code, message, details) and update `errorHandler.ts` to detect and format ApiError instances
    - _Requirements: 6.4, 6.5_

  - [ ] 5.2 Implement dispute routes
    - Create `server/src/routes/disputes.ts` with Express router
    - `GET /api/disputes` — query all disputes with customer, transaction, and triageRecommendation relations included, sorted by createdAt descending; map to `DisputeWithTriage[]` response shape
    - `GET /api/disputes/:id` — query single dispute with relations; return 404 ApiError if not found
    - `POST /api/disputes` — validate body with `validateCreateDispute`, create Transaction record, create Dispute record, run `evaluateDispute`, persist TriageRecommendation, return full `DisputeWithTriage` response
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [ ] 5.3 Implement payment-types and customers routes
    - Add `GET /api/payment-types` endpoint returning the payment type → issue category mapping as `PaymentTypeEntry[]`
    - Add `GET /api/customers` endpoint returning all customer records (id, name, accountNumber)
    - Register all new routers in `server/src/routes/api.ts`
    - _Requirements: 7.1, 2.1_

  - [ ]* 5.4 Write property test for dispute list ordering (Property 1)
    - **Property 1: Dispute list ordering**
    - After seeding multiple disputes with varying creation dates, verify the GET /api/disputes response is sorted by createdAt descending
    - **Validates: Requirements 1.2**

  - [ ]* 5.5 Write property test for non-existent dispute 404 (Property 13)
    - **Property 13: Non-existent dispute returns 404**
    - For any dispute ID not in the database, verify GET /api/disputes/:id returns HTTP 404
    - **Validates: Requirements 6.4**

- [ ] 6. Checkpoint - API layer complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. React UI - Setup and shared components
  - [ ] 7.1 Install React Router and set up routing
    - Install `react-router-dom` in the client workspace
    - Update `client/src/main.tsx` to use `BrowserRouter` with routes: `/` (DisputeListPage), `/disputes/new` (CreateDisputePage), `/disputes/:id` (DisputeDetailPage)
    - Create a `Layout` component with header navigation (link to list, link to create)
    - _Requirements: 1.3_

  - [ ] 7.2 Create client API service and types
    - Create `client/src/types/index.ts` with shared interfaces matching the server response shapes
    - Create `client/src/services/api.ts` with functions: `fetchDisputes()`, `fetchDispute(id)`, `createDispute(data)`, `fetchPaymentTypes()`, `fetchCustomers()`
    - Configure Vite proxy or use env var for API base URL
    - _Requirements: 6.1, 6.2, 6.3, 7.1_

- [ ] 8. React UI - Pages
  - [ ] 8.1 Implement DisputeListPage
    - Create `client/src/pages/DisputeListPage.tsx`
    - Fetch and display all disputes in a table showing: customer name, payment type, issue category, priority level (colour-coded), creation date, status
    - Each row is clickable and navigates to `/disputes/:id`
    - Include a "Create Dispute" button linking to `/disputes/new`
    - _Requirements: 1.1, 1.2, 1.3, 4.3_

  - [ ] 8.2 Implement CreateDisputePage
    - Create `client/src/pages/CreateDisputePage.tsx` with a form
    - Fetch customers for dropdown, fetch payment types for cascading selects
    - When payment type changes, filter issue category options to only valid values for that type
    - Include fields: customer select, payment type select, issue category select, transaction amount input, transaction date input, transaction status select
    - On submit, call `createDispute()` and navigate to the new dispute's detail page
    - Display field-level validation errors from the API response
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [ ] 8.3 Implement DisputeDetailPage
    - Create `client/src/pages/DisputeDetailPage.tsx`
    - Fetch single dispute by ID from URL params
    - Display dispute info: customer name, payment type, issue category, transaction amount, transaction date, transaction status, dispute creation date
    - Display triage recommendation card with: routing action as prominent badge, priority level with colour coding (High=red, Medium=amber, Low=green), and a list of fired rules with their descriptions and triggering attributes
    - Handle loading and not-found states
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 9. Seed data
  - [ ] 9.1 Create database seed script
    - Create `server/prisma/seed.ts`
    - Seed 10+ customers with distinct names, emails, account numbers
    - Seed 20+ transactions with varying amounts (50–25000), dates (1–30 days ago), statuses (Completed/Failed/Pending), and types across all three payment types
    - Seed 15+ disputes designed to trigger all four routing actions and all three priority levels
    - Run the triage engine on each dispute and persist the TriageRecommendation
    - Add `"prisma": { "seed": "node --import tsx prisma/seed.ts" }` to `server/package.json`
    - _Requirements: 5.1, 5.2, 5.3_

  - [ ]* 9.2 Write unit tests for seed data coverage
    - Verify seed script creates disputes producing each of the four Routing_Action outcomes
    - Verify seed data includes all three Priority_Level values
    - Verify seed data covers all three Payment_Type values
    - _Requirements: 5.1, 5.2, 5.3_

- [ ] 10. Integration wiring and final verification
  - [ ] 10.1 Configure Vite proxy for API requests
    - Update `client/vite.config.ts` to proxy `/api` requests to the Express server on port 3001
    - Verify end-to-end flow: client fetches disputes from server through the proxy
    - _Requirements: 6.1_

  - [ ]* 10.2 Write property test for dispute creation round-trip (Property 3)
    - **Property 3: Dispute creation round-trip**
    - Generate valid dispute creation inputs, POST them, then GET by returned ID, verify all fields preserved and triageRecommendation is non-null
    - **Validates: Requirements 2.3, 6.3**

- [ ] 11. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- The triage engine is a pure function for independent testability — no mocking required
- Install `fast-check` in `server/devDependencies` for property-based testing
- All API responses follow the existing `errorHandler` middleware pattern

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["2.1", "3.1"] },
    { "id": 2, "tasks": ["2.2", "2.3", "2.4", "2.5", "2.6", "3.2", "3.3"] },
    { "id": 3, "tasks": ["3.4", "5.1"] },
    { "id": 4, "tasks": ["5.2", "5.3"] },
    { "id": 5, "tasks": ["5.4", "5.5", "7.1", "7.2"] },
    { "id": 6, "tasks": ["8.1", "8.2", "8.3", "9.1"] },
    { "id": 7, "tasks": ["9.2", "10.1"] },
    { "id": 8, "tasks": ["10.2"] }
  ]
}
```
