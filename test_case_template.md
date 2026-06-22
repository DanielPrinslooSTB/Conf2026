Test Cases Template
# Test Cases
## TC-XXX: [Test Name]
- GIVEN [precondition]
- WHEN [action]
- THEN [expected outcome]
- AND [additional assertion]
## Example
## TC-001: Successful Payment Request Creation
- GIVEN a merchant is authenticated
- WHEN they submit a request with amount=150.00, reason="Invoice #123", 
  customerPhone="0821234567", expiresInHours=24
- THEN the system creates a request with status PENDING
- AND returns the request ID
- AND the response time is under 2 seconds
## TC-002: Reject Request Without Amount
- GIVEN a merchant is authenticated
- WHEN they submit a request without an amount field
- THEN the system returns HTTP 400
- AND the error message contains "Amount is required"
 