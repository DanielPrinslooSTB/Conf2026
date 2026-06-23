# API Specification

Base URL: `/api`

Content-Type: `application/json`

---

## GET /api/disputes

List all disputes with their triage recommendations, sorted by creation date descending.

**Request body:** None

**Query parameters:** None

**Success response (200):**
- Array of DisputeWithTriage objects, each containing:
  - id (number) — unique dispute identifier
  - customer (object) — { id, name, accountNumber }
  - paymentType (string) — "Card Payment", "EFT", or "Internal Transfer"
  - issueCategory (string) — issue classification for this dispute
  - transaction (object) — { amount, date, status, reference }
  - status (string) — "Open", "In Progress", or "Resolved"
  - createdAt (string) — ISO 8601 timestamp
  - triageRecommendation (object) — { routingAction, priorityLevel, reasoning }

**Error responses:**
- 500 — internal server error

**Example:**

Request: `GET /api/disputes`

Response:
```json
[
  {
    "id": 1,
    "customer": { "id": 1, "name": "Jane Smith", "accountNumber": "ACC-001" },
    "paymentType": "Card Payment",
    "issueCategory": "Unauthorized Transaction",
    "transaction": {
      "amount": 15000,
      "date": "2026-06-10T00:00:00.000Z",
      "status": "Completed",
      "reference": "TXN-REF-001"
    },
    "status": "Open",
    "createdAt": "2026-06-12T08:30:00.000Z",
    "triageRecommendation": {
      "routingAction": "Escalate",
      "priorityLevel": "High",
      "reasoning": [
        {
          "ruleName": "Amount Priority Rule",
          "description": "Transaction amount determines base priority",
          "triggeredBy": { "amount": 15000, "result": "High" }
        },
        {
          "ruleName": "Unauthorized Transaction Rule",
          "description": "Unauthorized transactions are always escalated",
          "triggeredBy": { "issueCategory": "Unauthorized Transaction" }
        }
      ]
    }
  }
]
```

**Requirements:** REQ-001, REQ-017

---

## GET /api/disputes/:id

Retrieve a single dispute with full details and its triage recommendation.

**Path parameters:**
- id (number, required) — the dispute ID

**Request body:** None

**Success response (200):**
- id (number) — unique dispute identifier
- customer (object) — { id, name, accountNumber }
- paymentType (string) — "Card Payment", "EFT", or "Internal Transfer"
- issueCategory (string) — issue classification for this dispute
- transaction (object) — { amount, date, status, reference }
- status (string) — "Open", "In Progress", or "Resolved"
- createdAt (string) — ISO 8601 timestamp
- triageRecommendation (object) — { routingAction, priorityLevel, reasoning }

**Error responses:**
- 404 — dispute with the specified ID does not exist

**Example:**

Request: `GET /api/disputes/3`

Response:
```json
{
  "id": 3,
  "customer": { "id": 2, "name": "John Doe", "accountNumber": "ACC-002" },
  "paymentType": "EFT",
  "issueCategory": "Failed Transfer",
  "transaction": {
    "amount": 5000,
    "date": "2026-06-08T00:00:00.000Z",
    "status": "Failed",
    "reference": "TXN-REF-003"
  },
  "status": "Open",
  "createdAt": "2026-06-09T14:00:00.000Z",
  "triageRecommendation": {
    "routingAction": "Investigate Further",
    "priorityLevel": "Medium",
    "reasoning": [
      {
        "ruleName": "Amount Priority Rule",
        "description": "Transaction amount determines base priority",
        "triggeredBy": { "amount": 5000, "result": "Medium" }
      },
      {
        "ruleName": "Failed Transaction Rule",
        "description": "Failed transactions require investigation",
        "triggeredBy": { "transactionStatus": "Failed", "issueCategory": "Failed Transfer" }
      }
    ]
  }
}
```

Error example (404):
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Dispute with id 99999 not found",
    "status": 404
  }
}
```

**Requirements:** REQ-018, REQ-020

---

## POST /api/disputes

Create a new dispute, run the triage engine, and return the created dispute with its triage recommendation.

**Request body:**
- customerId (number, required) — ID of an existing customer
- paymentType (string, required) — one of "Card Payment", "EFT", "Internal Transfer"
- issueCategory (string, required) — must be valid for the selected paymentType
- transactionAmount (number, required) — positive number representing the transaction value in ZAR (South African Rand)
- transactionDate (string, required) — ISO 8601 date string (e.g. "2026-06-20")
- transactionStatus (string, required) — one of "Completed", "Failed", "Pending"

**Success response (201):**
- id (number) — unique dispute identifier
- customer (object) — { id, name, accountNumber }
- paymentType (string) — the submitted payment type
- issueCategory (string) — the submitted issue category
- transaction (object) — { amount, date, status, reference }
- status (string) — "Open"
- createdAt (string) — ISO 8601 timestamp
- triageRecommendation (object) — { routingAction, priorityLevel, reasoning }

**Error responses:**
- 400 — validation failed (missing required fields, invalid paymentType, issueCategory not valid for paymentType, negative amount, invalid date format, invalid transactionStatus)

**Example:**

Request:
```json
{
  "customerId": 1,
  "paymentType": "Card Payment",
  "issueCategory": "Duplicate Debit",
  "transactionAmount": 200,
  "transactionDate": "2026-06-20",
  "transactionStatus": "Completed"
}
```

Response (201):
```json
{
  "id": 16,
  "customer": { "id": 1, "name": "Jane Smith", "accountNumber": "ACC-001" },
  "paymentType": "Card Payment",
  "issueCategory": "Duplicate Debit",
  "transaction": {
    "amount": 200,
    "date": "2026-06-20T00:00:00.000Z",
    "status": "Completed",
    "reference": "TXN-REF-016"
  },
  "status": "Open",
  "createdAt": "2026-06-22T10:15:00.000Z",
  "triageRecommendation": {
    "routingAction": "Resolve Immediately",
    "priorityLevel": "Low",
    "reasoning": [
      {
        "ruleName": "Amount Priority Rule",
        "description": "Transaction amount determines base priority",
        "triggeredBy": { "amount": 200, "result": "Low" }
      },
      {
        "ruleName": "Low-Value Duplicate Rule",
        "description": "Low-value duplicate debits can be resolved immediately",
        "triggeredBy": { "amount": 200, "issueCategory": "Duplicate Debit", "transactionStatus": "Completed" }
      }
    ]
  }
}
```

Error example (400):
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "status": 400,
    "details": {
      "paymentType": "paymentType is required",
      "transactionAmount": "transactionAmount must be a positive number"
    }
  }
}
```

**Validation rules:**
- customerId: required, must be a positive integer referencing an existing customer
- paymentType: required, must be one of "Card Payment", "EFT", "Internal Transfer"
- issueCategory: required, must be a valid category for the selected paymentType
- transactionAmount: required, must be a positive number
- transactionDate: required, must be a valid ISO 8601 date string
- transactionStatus: required, must be one of "Completed", "Failed", "Pending"

**Requirements:** REQ-019, REQ-020

---

## GET /api/payment-types

Retrieve all supported payment types with their valid issue categories.

**Request body:** None

**Success response (200):**
- Array of PaymentTypeEntry objects, each containing:
  - type (string) — the payment type name
  - issueCategories (string[]) — valid issue categories for this type

**Error responses:**
- 500 — internal server error

**Example:**

Request: `GET /api/payment-types`

Response:
```json
[
  {
    "type": "Card Payment",
    "issueCategories": [
      "Duplicate Debit",
      "Unauthorized Transaction",
      "Failed Transaction",
      "Incorrect Amount"
    ]
  },
  {
    "type": "EFT",
    "issueCategories": [
      "Failed Transfer",
      "Duplicate Debit",
      "Missing Payment"
    ]
  },
  {
    "type": "Internal Transfer",
    "issueCategories": [
      "Failed Transfer",
      "Duplicate Debit",
      "Missing Payment",
      "Unauthorized Transaction"
    ]
  }
]
```

**Requirements:** REQ-021

---

## GET /api/customers

List all customers for use in the dispute creation form dropdown.

**Request body:** None

**Success response (200):**
- Array of Customer objects, each containing:
  - id (number) — unique customer identifier
  - name (string) — customer full name
  - accountNumber (string) — unique account reference

**Error responses:**
- 500 — internal server error

**Example:**

Request: `GET /api/customers`

Response:
```json
[
  { "id": 1, "name": "Jane Smith", "accountNumber": "ACC-001" },
  { "id": 2, "name": "John Doe", "accountNumber": "ACC-002" },
  { "id": 3, "name": "Alice Johnson", "accountNumber": "ACC-003" }
]
```

**Requirements:** REQ-003

---

## Error Response Format

All error responses follow a consistent structure:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable description",
    "status": 400,
    "details": { "fieldName": "Field-specific error message" }
  }
}
```

| Status | Code | When |
|--------|------|------|
| 400 | VALIDATION_ERROR | Request body fails validation (missing fields, invalid values, mismatched payment type/issue category) |
| 404 | NOT_FOUND | Requested resource does not exist (e.g. dispute ID not in database) |
| 500 | INTERNAL_ERROR | Unexpected server error |

The `details` field is present only for 400 responses and contains field-level error messages as key-value pairs.
