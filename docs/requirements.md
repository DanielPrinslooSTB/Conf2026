# Requirements (EARS Format)

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

## Dispute List Dashboard

- REQ-001: When the Operations_User navigates to the dashboard, the system shall display a list of all Disputes sorted by creation date descending, showing customer name, Payment_Type, Issue_Category, Priority_Level, dispute creation date, and current status.
- REQ-002: When the Operations_User selects a Dispute from the list, the system shall navigate to the detail view for that Dispute.

## Create New Dispute

- REQ-003: When the Operations_User initiates dispute creation, the system shall present a form with fields for customer selection, Payment_Type selection, Issue_Category selection, transaction amount, transaction date, and transaction status.
- REQ-004: When the Operations_User selects a Payment_Type, the system shall display only the Issue_Category options valid for that Payment_Type.
- REQ-005: When the Operations_User submits a complete dispute form, the system shall persist the Dispute record to the database and trigger triage evaluation by the Triage_Engine.
- REQ-006: If the Operations_User submits the form with one or more missing required fields, then the system shall display field-level validation messages identifying each incomplete field.

## Triage Rules Engine — Priority Assignment

- REQ-007: When the Triage_Engine evaluates a Dispute, the system shall produce a Triage_Recommendation containing exactly one Routing_Action, one Priority_Level, and a non-empty reasoning explanation.
- REQ-008: The system shall assign Priority_Level based on transaction amount: above 10000 assigns High; between 1000 and 10000 (inclusive) assigns Medium; below 1000 assigns Low.
- REQ-009: When the dispute age exceeds 7 days, the system shall escalate the Priority_Level by one tier (Low becomes Medium, Medium becomes High, High remains High).

## Triage Rules Engine — Routing Action

- REQ-010: When the Issue_Category is "Unauthorized Transaction", the system shall assign a Routing_Action of "Escalate" regardless of transaction amount, status, or dispute age.
- REQ-011: When the transaction status is "Failed" and the Issue_Category is not "Unauthorized Transaction", the system shall assign a Routing_Action of "Investigate Further".
- REQ-012: When the transaction amount is below 500 and the Issue_Category is "Duplicate Debit" and the transaction status is not "Failed", the system shall assign a Routing_Action of "Resolve Immediately".
- REQ-013: When no specific routing rule (REQ-010, REQ-011, REQ-012) matches the dispute attributes, the system shall assign a Routing_Action of "Refer to Another Team".

## Triage Rules Engine — Reasoning

- REQ-014: The system shall include in the reasoning explanation the name of each rule that fired and the specific attribute values (transaction amount, transaction status, issue category, dispute age) that triggered each rule.

## Dispute Detail View

- REQ-015: When the Operations_User views a Dispute detail, the system shall display all dispute fields (customer name, Payment_Type, Issue_Category, transaction amount, transaction date, transaction status, dispute creation date) and the Triage_Recommendation showing Routing_Action as a prominent label, Priority_Level as a colour-coded indicator (High=red, Medium=amber, Low=green), and the reasoning explanation.

## Mock Data and Seeding

- REQ-016: The system shall provide a database seed script that populates at least 10 customers, 20 transactions, and 15 disputes covering all three Payment_Type values, all Issue_Category values, all four Routing_Action outcomes, and all three Priority_Level values with varying ages and amounts.

## REST API

- REQ-017: The system shall expose a GET /api/disputes endpoint that returns all Disputes with their associated Triage_Recommendation.
- REQ-018: The system shall expose a GET /api/disputes/:id endpoint that returns a single Dispute with full details and its Triage_Recommendation.
- REQ-019: When a POST /api/disputes request contains valid dispute details, the system shall persist the record, run the Triage_Engine, and return the created Dispute with its Triage_Recommendation.
- REQ-020: If a POST /api/disputes request contains invalid or incomplete data, then the system shall return an HTTP 400 response with field-level error details. If a GET /api/disputes/:id references a non-existent ID, then the system shall return an HTTP 404 response.
- REQ-021: The system shall expose a GET /api/payment-types endpoint that returns the three supported Payment_Type values ("Card Payment", "EFT", "Internal Transfer") with their valid Issue_Category mappings: Card Payment → {Duplicate Debit, Unauthorized Transaction, Failed Transaction, Incorrect Amount}; EFT → {Failed Transfer, Duplicate Debit, Missing Payment}; Internal Transfer → {Failed Transfer, Duplicate Debit, Missing Payment, Unauthorized Transaction}.
