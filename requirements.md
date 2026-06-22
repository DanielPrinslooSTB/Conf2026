# Requirements Document

## Introduction

Payment Dispute Triage is an internal prototype that helps banking operations users capture customer payment disputes and receive a recommended triage action. The system applies deterministic business rules based on transaction amount, dispute age, transaction status, and issue type to produce a routing recommendation with priority and reasoning transparency. The prototype uses mock data stored in SQLite via Prisma and provides a React-based UI for dispute management.

## Glossary

- **Dispute_System**: The full-stack application comprising the React client and Express server that manages payment disputes and produces triage recommendations.
- **Triage_Engine**: The server-side rules engine that evaluates dispute attributes and produces a routing action, priority level, and reasoning explanation.
- **Operations_User**: A banking staff member who captures and reviews payment disputes using the Dispute_System.
- **Dispute**: A record representing a customer's complaint about a specific payment transaction, including payment type, issue category, and associated transaction details.
- **Payment_Type**: One of three supported transaction categories: Card Payment, EFT (Electronic Funds Transfer), or Internal Transfer.
- **Issue_Category**: A classification of the dispute problem. Card Payments support: Duplicate Debit, Unauthorized Transaction, Failed Transaction, Incorrect Amount. EFTs support: Failed Transfer, Duplicate Debit, Missing Payment. Internal Transfers support: Failed Transfer, Duplicate Debit, Missing Payment, Unauthorized Transaction.
- **Routing_Action**: One of four fixed triage outcomes: Resolve Immediately, Investigate Further, Escalate, or Refer to Another Team.
- **Priority_Level**: A classification of dispute urgency: High, Medium, or Low.
- **Triage_Recommendation**: The combined output of the Triage_Engine consisting of a Routing_Action, Priority_Level, and a reasoning explanation listing which rules fired.

## Requirements

### Requirement 1: Dispute List Dashboard

**User Story:** As an Operations_User, I want to see all payment disputes in a list view, so that I can quickly identify cases that need attention and navigate to individual disputes.

#### Acceptance Criteria

1. WHEN the Operations_User navigates to the dashboard, THE Dispute_System SHALL display a list of all Disputes with each entry showing the customer name, Payment_Type, Issue_Category, Priority_Level, dispute creation date, and current status.
2. THE Dispute_System SHALL sort the dispute list by creation date in descending order with the most recent disputes appearing first.
3. WHEN the Operations_User selects a Dispute from the list, THE Dispute_System SHALL navigate to the detail view for that Dispute.

### Requirement 2: Create New Dispute

**User Story:** As an Operations_User, I want to capture a new payment dispute with the relevant details, so that the system can triage the case and recommend a next action.

#### Acceptance Criteria

1. WHEN the Operations_User initiates dispute creation, THE Dispute_System SHALL present a form requiring: customer selection, Payment_Type selection, Issue_Category selection, transaction amount, transaction date, and transaction status.
2. WHEN the Operations_User selects a Payment_Type, THE Dispute_System SHALL display only the Issue_Category options valid for that Payment_Type.
3. WHEN the Operations_User submits a complete dispute form, THE Dispute_System SHALL persist the Dispute record to the database and trigger triage evaluation by the Triage_Engine.
4. IF the Operations_User submits the form with missing required fields, THEN THE Dispute_System SHALL display field-level validation messages indicating which fields are incomplete.

### Requirement 3: Triage Rules Engine

**User Story:** As an Operations_User, I want disputes to be automatically evaluated against business rules, so that I receive a consistent recommended next action without manual interpretation.

#### Acceptance Criteria

1. WHEN the Triage_Engine evaluates a Dispute, THE Triage_Engine SHALL produce a Triage_Recommendation containing exactly one Routing_Action, one Priority_Level, and a reasoning explanation.
2. THE Triage_Engine SHALL determine Priority_Level using the following rules: transaction amount above 10000 assigns High priority; transaction amount between 1000 and 10000 assigns Medium priority; transaction amount below 1000 assigns Low priority.
3. THE Triage_Engine SHALL increase Priority_Level by one tier when the dispute age exceeds 7 days (Low becomes Medium, Medium becomes High, High remains High).
4. WHEN the Issue_Category is Unauthorized Transaction, THE Triage_Engine SHALL assign a Routing_Action of Escalate regardless of other attributes.
5. WHEN the transaction status is Failed and the Issue_Category is not Unauthorized Transaction, THE Triage_Engine SHALL assign a Routing_Action of Investigate Further.
6. WHEN the transaction amount is below 500 and the Issue_Category is Duplicate Debit and the transaction status is not Failed, THE Triage_Engine SHALL assign a Routing_Action of Resolve Immediately.
7. WHEN no specific rule applies to the combination of attributes, THE Triage_Engine SHALL assign a Routing_Action of Refer to Another Team.
8. THE Triage_Engine SHALL include in the reasoning explanation the name of each rule that fired during evaluation and the attribute values that triggered the rule.

### Requirement 4: Dispute Detail View with Triage Recommendation

**User Story:** As an Operations_User, I want to see the full details of a dispute along with its triage recommendation, so that I understand what action to take and why the system reached that conclusion.

#### Acceptance Criteria

1. WHEN the Operations_User views a Dispute detail, THE Dispute_System SHALL display the Dispute record fields: customer name, Payment_Type, Issue_Category, transaction amount, transaction date, transaction status, and dispute creation date.
2. WHEN the Operations_User views a Dispute detail, THE Dispute_System SHALL display the Triage_Recommendation showing the Routing_Action as a prominent label, the Priority_Level as a visual indicator, and the reasoning explanation listing which rules fired.
3. THE Dispute_System SHALL visually distinguish Priority_Level values using colour coding: High displayed in red, Medium displayed in amber, and Low displayed in green.
4. THE Dispute_System SHALL visually distinguish Routing_Action values so that the Operations_User can identify the recommended action at a glance.

### Requirement 5: Mock Data and Seeding

**User Story:** As an Operations_User, I want the system pre-populated with realistic dispute, customer, and transaction data, so that I can evaluate the prototype with representative scenarios.

#### Acceptance Criteria

1. THE Dispute_System SHALL provide a database seed script that populates at least 10 customer records, 20 transaction records, and 15 dispute records covering all three Payment_Type values and all Issue_Category values.
2. THE Dispute_System SHALL include seed disputes that produce each of the four Routing_Action outcomes when evaluated by the Triage_Engine.
3. THE Dispute_System SHALL include seed disputes with varying ages and amounts to demonstrate all three Priority_Level values.

### Requirement 6: REST API for Disputes

**User Story:** As a frontend client, I want a RESTful API to manage disputes, so that the React application can create, retrieve, and list disputes with their triage results.

#### Acceptance Criteria

1. THE Dispute_System SHALL expose a GET /api/disputes endpoint that returns all Disputes with their associated Triage_Recommendation.
2. THE Dispute_System SHALL expose a GET /api/disputes/:id endpoint that returns a single Dispute with full details and its Triage_Recommendation.
3. THE Dispute_System SHALL expose a POST /api/disputes endpoint that accepts dispute details, persists the record, runs the Triage_Engine, and returns the created Dispute with its Triage_Recommendation.
4. IF a GET /api/disputes/:id request references a non-existent Dispute, THEN THE Dispute_System SHALL return an HTTP 404 response with a descriptive error message.
5. IF a POST /api/disputes request contains invalid or incomplete data, THEN THE Dispute_System SHALL return an HTTP 400 response with field-level error details.

### Requirement 7: Payment Type and Issue Category Reference Data

**User Story:** As a frontend client, I want to retrieve the valid payment types and their associated issue categories, so that the dispute creation form displays the correct options.

#### Acceptance Criteria

1. THE Dispute_System SHALL expose a GET /api/payment-types endpoint that returns all supported Payment_Type values with their associated Issue_Category options.
2. THE Dispute_System SHALL support exactly three Payment_Type values: Card Payment, EFT, and Internal Transfer.
3. THE Dispute_System SHALL associate Card Payment with Issue_Category values: Duplicate Debit, Unauthorized Transaction, Failed Transaction, and Incorrect Amount.
4. THE Dispute_System SHALL associate EFT with Issue_Category values: Failed Transfer, Duplicate Debit, and Missing Payment.
5. THE Dispute_System SHALL associate Internal Transfer with Issue_Category values: Failed Transfer, Duplicate Debit, Missing Payment, and Unauthorized Transaction.
