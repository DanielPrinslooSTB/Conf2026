# API Specification
## [METHOD] [PATH]
[Brief description of what this endpoint does]
**Request body:**
- fieldName (type, required/optional) — description
**Success response (status code):**
- fieldName — description
**Error responses:**
- [status code] — [when this occurs]
**Example:**
Request: { ... }
Response: { ... }
---
## Example
## POST /api/requests
Create a new payment request.
**Request body:**
- amount (number, required) — payment amount in ZAR
- reason (string, required) — description or invoice reference
- customerPhone (string, required) — SA mobile format (08x xxx xxxx)
- expiresInHours (number, optional, default: 24) — hours until expiry
**Success response (201):**
- id — unique request identifier
- status — "PENDING"
- createdAt — ISO timestamp
- expiresAt — ISO timestamp
**Error responses:**
- 400 — validation failed (missing required fields, invalid phone format)
- 401 — not authenticated
**Example:**
Request: { "amount": 250.00, "reason": "Haircut", "customerPhone": "0821234567" }
Response: { "id": "req_abc123", "status": "PENDING", "createdAt": "...", "expiresAt": "..." }