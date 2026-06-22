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

| Pattern       | Structure                                               | Use When                                      |
|---------------|---------------------------------------------------------|-----------------------------------------------|
| Ubiquitous    | The system shall [action].                              | Requirement always applies                    |
| Event-driven  | When [trigger], the system shall [action].              | Something happens that triggers behaviour     |
| State-driven  | While [state], the system shall [behaviour].            | Behaviour depends on system state             |
| Optional      | Where [feature is enabled], the system shall [action].  | Feature may or may not be present             |
| Unwanted      | If [condition], then the system shall [action].         | Handling error/edge cases                     |
| Complex       | While [state], when [trigger], the system shall [action]. | Combines state + event                      |

Guidelines to follow:
- One requirement per statement. Do not combine multiple behaviours.
- Be specific about quantities, times, and formats.
- Avoid vague words: “quickly”, “user-friendly”, “robust”, “seamless”.
- Every requirement must be testable — if you cannot write a test case for it, rewrite it