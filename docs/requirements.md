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

- REQ-001: When the Operations_User navigates to the dashboard, the system shall display a list of all Disputes showing customer name, Payment_Type, Issue_Category, Priority_Level, dispute creation date, and current status.
- REQ-002: The system shall sort the dispute list by creation date in descending order with the most recent disputes appearing first.
- REQ-003: When the Operations_User selects a Dispute from the list, the system shall navigate to the detail view for that Dispute.

## Create New Dispute

- REQ-004: When the Operations_User initiates dispute creation, the system shall present a form with fields for customer selection, Payment_Type selection, Issue_Category selection, transaction amount, transaction date, and transaction status.
- REQ-005: When the Operations_User selects a Payment_Type, the system shall display only the Issue_Category options valid for that Payment_Type.
- REQ-006: When the Operations_User submits a complete dispute form, the system shall persist the Dispute record to the database and trigger triage evaluation by the Triage_Engine.
- REQ-007: If the Operations_User submits the form with one or more missing required fields, then the system shall display field-level validation messages identifying each incomplete field.

## Triage Rules Engine — Priority Assignment

- REQ-008: When the Triage_Engine evaluates a Dispute, the system shall produce a Triage_Recommendation containing exactly one Routing_Action, one Priority_Level, and a non-empty reasoning explanation.
- REQ-009: When the transaction amount is above 10000, the system shall assign a Priority_Level of High.
- REQ-010: When the transaction amount is between 1000 and 10000 (inclusive), the system shall assign a Priority_Level of Medium.
- REQ-011: When the transaction amount is below 1000, the system shall assign a Priority_Level of Low.
- REQ-012: When the dispute age exceeds 7 days and the base Priority_Level is Low, the system shall escalate the Priority_Level to Medium.
- REQ-013: When the dispute age exceeds 7 days and the base Priority_Level is Medium, the system shall escalate the Priority_Level to High.
- REQ-014: When the dispute age exceeds 7 days and the base Priority_Level is High, the system shall retain the Priority_Level as High.

## Triage Rules Engine — Routing Action

- REQ-015: When the Issue_Category is "Unauthorized Transaction", the system shall assign a Routing_Action of "Escalate" regardless of transaction amount, status, or dispute age.
- REQ-016: When the transaction status is "Failed" and the Issue_Category is not "Unauthorized Transaction", the system shall assign a Routing_Action of "Investigate Further".
- REQ-017: When the transaction amount is below 500 and the Issue_Category is "Duplicate Debit" and the transaction status is not "Failed", the system shall assign a Routing_Action of "Resolve Immediately".
- REQ-018: When no specific routing rule (REQ-015, REQ-016, REQ-017) matches the dispute attributes, the system shall assign a Routing_Action of "Refer to Another Team".

## Triage Rules Engine — Reasoning

- REQ-019: The system shall include in the reasoning explanation the name of each rule that fired during evaluation.
- REQ-020: The system shall include in the reasoning explanation the specific attribute values (transaction amount, transaction status, issue category, dispute age) that triggered each fired rule.

## Dispute Detail View

- REQ-021: When the Operations_User views a Dispute detail, the system shall display: customer name, Payment_Type, Issue_Category, transaction amount, transaction date, transaction status, and dispute creation date.
- REQ-022: When the Operations_User views a Dispute detail, the system shall display the Triage_Recommendation showing the Routing_Action as a prominent label, the Priority_Level as a colour-coded indicator, and the reasoning explanation listing fired rules.
- REQ-023: The system shall display Priority_Level "High" in red, "Medium" in amber, and "Low" in green.
- REQ-024: The system shall visually distinguish each Routing_Action value so that the Operations_User can identify the recommended action at a glance.

## Mock Data and Seeding

- REQ-025: The system shall provide a database seed script that populates at least 10 customer records, 20 transaction records, and 15 dispute records.
- REQ-026: The system shall include seed data covering all three Payment_Type values and all Issue_Category values.
- REQ-027: The system shall include seed disputes that produce each of the four Routing_Action outcomes ("Resolve Immediately", "Investigate Further", "Escalate", "Refer to Another Team") when evaluated by the Triage_Engine.
- REQ-028: The system shall include seed disputes with varying ages (some ≤ 7 days, some > 7 days) and amounts (some < 1000, some 1000–10000, some > 10000) to demonstrate all three Priority_Level values.

## REST API — Disputes

- REQ-029: The system shall expose a GET /api/disputes endpoint that returns all Disputes with their associated Triage_Recommendation.
- REQ-030: The system shall expose a GET /api/disputes/:id endpoint that returns a single Dispute with full details and its Triage_Recommendation.
- REQ-031: When a POST /api/disputes request contains valid dispute details, the system shall persist the record, run the Triage_Engine, and return the created Dispute with its Triage_Recommendation.
- REQ-032: If a GET /api/disputes/:id request references a non-existent Dispute ID, then the system shall return an HTTP 404 response with a descriptive error message.
- REQ-033: If a POST /api/disputes request contains invalid or incomplete data, then the system shall return an HTTP 400 response with field-level error details.

## REST API — Payment Types

- REQ-034: The system shall expose a GET /api/payment-types endpoint that returns all supported Payment_Type values with their associated Issue_Category options.
- REQ-035: The system shall support exactly three Payment_Type values: "Card Payment", "EFT", and "Internal Transfer".
- REQ-036: The system shall associate "Card Payment" with Issue_Category values: "Duplicate Debit", "Unauthorized Transaction", "Failed Transaction", and "Incorrect Amount".
- REQ-037: The system shall associate "EFT" with Issue_Category values: "Failed Transfer", "Duplicate Debit", and "Missing Payment".
- REQ-038: The system shall associate "Internal Transfer" with Issue_Category values: "Failed Transfer", "Duplicate Debit", "Missing Payment", and "Unauthorized Transaction".
