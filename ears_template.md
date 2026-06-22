EARS Requirements Template
# Requirements (EARS Format)
## [Functional Area Name]
- REQ-XXX: When [trigger], the system shall [action] [constraint].
- REQ-XXX: While [state], the system shall [behaviour].
- REQ-XXX: Where [condition], the system shall [action].
- REQ-XXX: If [condition], then the system shall [action].
- REQ-XXX: The system shall [action]. (ubiquitous — always applies)
## Example
- REQ-001: When a merchant submits a payment request with valid amount, 
  reason, and customer phone number, the system shall create a request 
  record with status PENDING and return the request ID within 2 seconds.
- REQ-002: When a merchant submits a payment request without an amount, 
  the system shall reject the request and return an error message 
  indicating "Amount is required."
- REQ-003: While a payment request has status PENDING, the system shall 
  accept payment attempts against that request.
- REQ-004: Where the payment request has expired, the system shall reject 
  payment attempts and return status EXPIRED.