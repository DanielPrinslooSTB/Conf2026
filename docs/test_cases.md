# Test Cases

## Dispute List Dashboard

### TC-001: Display dispute list on dashboard navigation (REQ-001)
- GIVEN the database contains disputes with associated customers and triage recommendations
- WHEN the Operations_User navigates to the dashboard
- THEN the system displays a list of all Disputes
- AND each entry shows the customer name, Payment_Type, Issue_Category, Priority_Level, dispute creation date, and current status

### TC-002: Dispute list sorted by creation date descending (REQ-002)
- GIVEN the database contains disputes created on 2026-06-01, 2026-06-10, and 2026-06-15
- WHEN the Operations_User views the dispute list
- THEN the dispute created on 2026-06-15 appears first
- AND the dispute created on 2026-06-10 appears second
- AND the dispute created on 2026-06-01 appears last

### TC-003: Navigate to dispute detail from list (REQ-003)
- GIVEN the dispute list is displayed with a dispute having ID 5
- WHEN the Operations_User selects the dispute with ID 5
- THEN the system navigates to the detail view for dispute ID 5

## Create New Dispute

### TC-004: Display dispute creation form (REQ-004)
- GIVEN the Operations_User is on the dashboard
- WHEN the Operations_User initiates dispute creation
- THEN the system presents a form with fields for customer selection, Payment_Type selection, Issue_Category selection, transaction amount, transaction date, and transaction status

### TC-005: Filter issue categories for Card Payment (REQ-005)
- GIVEN the dispute creation form is displayed
- WHEN the Operations_User selects Payment_Type "Card Payment"
- THEN the Issue_Category dropdown displays only "Duplicate Debit", "Unauthorized Transaction", "Failed Transaction", and "Incorrect Amount"

### TC-006: Filter issue categories for EFT (REQ-005)
- GIVEN the dispute creation form is displayed
- WHEN the Operations_User selects Payment_Type "EFT"
- THEN the Issue_Category dropdown displays only "Failed Transfer", "Duplicate Debit", and "Missing Payment"

### TC-007: Filter issue categories for Internal Transfer (REQ-005)
- GIVEN the dispute creation form is displayed
- WHEN the Operations_User selects Payment_Type "Internal Transfer"
- THEN the Issue_Category dropdown displays only "Failed Transfer", "Duplicate Debit", "Missing Payment", and "Unauthorized Transaction"

### TC-008: Successful dispute creation triggers triage (REQ-006)
- GIVEN the dispute creation form is displayed
- WHEN the Operations_User submits the form with customerId=1, Payment_Type="Card Payment", Issue_Category="Duplicate Debit", amount=200, date="2026-06-20", status="Completed"
- THEN the system persists the Dispute record to the database
- AND the system triggers triage evaluation by the Triage_Engine
- AND the created dispute has an associated Triage_Recommendation

### TC-009: Validation error on missing customer field (REQ-007)
- GIVEN the dispute creation form is displayed
- WHEN the Operations_User submits the form without selecting a customer
- THEN the system displays a validation message identifying the customer field as incomplete

### TC-010: Validation error on multiple missing fields (REQ-007)
- GIVEN the dispute creation form is displayed
- WHEN the Operations_User submits the form without Payment_Type, transaction amount, or transaction date
- THEN the system displays field-level validation messages for Payment_Type, transaction amount, and transaction date

## Triage Rules Engine — Priority Assignment

### TC-011: Triage produces complete recommendation (REQ-008)
- GIVEN a dispute with amount=5000, status="Completed", Issue_Category="Duplicate Debit", age=3 days
- WHEN the Triage_Engine evaluates the dispute
- THEN the result contains exactly one Routing_Action
- AND the result contains exactly one Priority_Level
- AND the result contains a non-empty reasoning explanation

### TC-012: High priority for amount above 10000 (REQ-009)
- GIVEN a dispute with transaction amount=15000
- WHEN the Triage_Engine evaluates the dispute
- THEN the base Priority_Level is "High"

### TC-013: Medium priority for amount of 1000 (REQ-010)
- GIVEN a dispute with transaction amount=1000
- WHEN the Triage_Engine evaluates the dispute
- THEN the base Priority_Level is "Medium"

### TC-014: Medium priority for amount of 10000 (REQ-010)
- GIVEN a dispute with transaction amount=10000
- WHEN the Triage_Engine evaluates the dispute
- THEN the base Priority_Level is "Medium"

### TC-015: Medium priority for amount of 5000 (REQ-010)
- GIVEN a dispute with transaction amount=5000
- WHEN the Triage_Engine evaluates the dispute
- THEN the base Priority_Level is "Medium"

### TC-016: Low priority for amount below 1000 (REQ-011)
- GIVEN a dispute with transaction amount=500
- WHEN the Triage_Engine evaluates the dispute
- THEN the base Priority_Level is "Low"

### TC-017: Age escalation from Low to Medium (REQ-012)
- GIVEN a dispute with transaction amount=500 and dispute age=10 days
- WHEN the Triage_Engine evaluates the dispute
- THEN the final Priority_Level is "Medium"

### TC-018: Age escalation from Medium to High (REQ-013)
- GIVEN a dispute with transaction amount=5000 and dispute age=10 days
- WHEN the Triage_Engine evaluates the dispute
- THEN the final Priority_Level is "High"

### TC-019: High priority remains High after age escalation (REQ-014)
- GIVEN a dispute with transaction amount=15000 and dispute age=10 days
- WHEN the Triage_Engine evaluates the dispute
- THEN the final Priority_Level is "High"

### TC-020: No age escalation when dispute age is 7 days or less (REQ-012, REQ-013, REQ-014)
- GIVEN a dispute with transaction amount=500 and dispute age=7 days
- WHEN the Triage_Engine evaluates the dispute
- THEN the final Priority_Level is "Low"

## Triage Rules Engine — Routing Action

### TC-021: Unauthorized Transaction always routes to Escalate (REQ-015)
- GIVEN a dispute with Issue_Category="Unauthorized Transaction", amount=200, status="Completed", age=2 days
- WHEN the Triage_Engine evaluates the dispute
- THEN the Routing_Action is "Escalate"

### TC-022: Unauthorized Transaction escalates regardless of Failed status (REQ-015)
- GIVEN a dispute with Issue_Category="Unauthorized Transaction", amount=15000, status="Failed", age=10 days
- WHEN the Triage_Engine evaluates the dispute
- THEN the Routing_Action is "Escalate"

### TC-023: Failed status routes to Investigate Further (REQ-016)
- GIVEN a dispute with transaction status="Failed", Issue_Category="Duplicate Debit", amount=5000
- WHEN the Triage_Engine evaluates the dispute
- THEN the Routing_Action is "Investigate Further"

### TC-024: Failed status with low amount still routes to Investigate Further (REQ-016)
- GIVEN a dispute with transaction status="Failed", Issue_Category="Duplicate Debit", amount=200
- WHEN the Triage_Engine evaluates the dispute
- THEN the Routing_Action is "Investigate Further"

### TC-025: Low-value duplicate debit routes to Resolve Immediately (REQ-017)
- GIVEN a dispute with amount=300, Issue_Category="Duplicate Debit", status="Completed"
- WHEN the Triage_Engine evaluates the dispute
- THEN the Routing_Action is "Resolve Immediately"

### TC-026: Duplicate Debit at exactly 500 does not match low-value rule (REQ-017, REQ-018)
- GIVEN a dispute with amount=500, Issue_Category="Duplicate Debit", status="Completed"
- WHEN the Triage_Engine evaluates the dispute
- THEN the Routing_Action is "Refer to Another Team"

### TC-027: Default routing when no specific rule matches (REQ-018)
- GIVEN a dispute with amount=2000, Issue_Category="Incorrect Amount", status="Completed"
- WHEN the Triage_Engine evaluates the dispute
- THEN the Routing_Action is "Refer to Another Team"

### TC-028: Default routing for high-amount non-matching dispute (REQ-018)
- GIVEN a dispute with amount=12000, Issue_Category="Missing Payment", status="Completed"
- WHEN the Triage_Engine evaluates the dispute
- THEN the Routing_Action is "Refer to Another Team"

## Triage Rules Engine — Reasoning

### TC-029: Reasoning includes fired rule names (REQ-019)
- GIVEN a dispute with Issue_Category="Unauthorized Transaction", amount=5000, age=3 days
- WHEN the Triage_Engine evaluates the dispute
- THEN the reasoning explanation includes the rule name "Unauthorized Transaction Rule"
- AND the reasoning explanation includes the rule name "Amount Priority Rule"

### TC-030: Reasoning includes triggering attribute values (REQ-020)
- GIVEN a dispute with amount=15000, Issue_Category="Duplicate Debit", status="Completed", age=10 days
- WHEN the Triage_Engine evaluates the dispute
- THEN the reasoning explanation includes the transaction amount 15000 as a triggering attribute
- AND the reasoning explanation includes the dispute age as a triggering attribute

## Dispute Detail View

### TC-031: Display dispute detail fields (REQ-021)
- GIVEN a dispute exists with customer "Jane Smith", Payment_Type="EFT", Issue_Category="Failed Transfer", amount=3000, date="2026-06-10", status="Completed", created="2026-06-12"
- WHEN the Operations_User views the dispute detail
- THEN the system displays customer name "Jane Smith"
- AND displays Payment_Type "EFT"
- AND displays Issue_Category "Failed Transfer"
- AND displays transaction amount 3000
- AND displays transaction date "2026-06-10"
- AND displays transaction status "Completed"
- AND displays dispute creation date "2026-06-12"

### TC-032: Display triage recommendation on detail view (REQ-022)
- GIVEN a dispute exists with Routing_Action="Escalate", Priority_Level="High", and reasoning containing two fired rules
- WHEN the Operations_User views the dispute detail
- THEN the system displays "Escalate" as a prominent label
- AND displays Priority_Level "High" as a colour-coded indicator
- AND displays the reasoning listing two fired rules

### TC-033: Priority High displayed in red (REQ-023)
- GIVEN a dispute detail view shows Priority_Level="High"
- WHEN the Operations_User views the detail
- THEN the Priority_Level indicator is displayed in red

### TC-034: Priority Medium displayed in amber (REQ-023)
- GIVEN a dispute detail view shows Priority_Level="Medium"
- WHEN the Operations_User views the detail
- THEN the Priority_Level indicator is displayed in amber

### TC-035: Priority Low displayed in green (REQ-023)
- GIVEN a dispute detail view shows Priority_Level="Low"
- WHEN the Operations_User views the detail
- THEN the Priority_Level indicator is displayed in green

### TC-036: Routing actions visually distinguishable (REQ-024)
- GIVEN disputes exist with each of the four Routing_Action values
- WHEN the Operations_User views each dispute detail
- THEN each Routing_Action value is visually distinct from the others

## Mock Data and Seeding

### TC-037: Seed script populates minimum record counts (REQ-025)
- GIVEN an empty database
- WHEN the seed script is executed
- THEN the database contains at least 10 customer records
- AND at least 20 transaction records
- AND at least 15 dispute records

### TC-038: Seed data covers all payment types and issue categories (REQ-026)
- GIVEN the seed script has been executed
- WHEN the disputes are queried
- THEN disputes exist for Payment_Type "Card Payment", "EFT", and "Internal Transfer"
- AND disputes exist covering all Issue_Category values defined for each Payment_Type

### TC-039: Seed data produces all four routing actions (REQ-027)
- GIVEN the seed script has been executed
- WHEN the Triage_Engine evaluates all seeded disputes
- THEN at least one dispute produces Routing_Action "Resolve Immediately"
- AND at least one produces "Investigate Further"
- AND at least one produces "Escalate"
- AND at least one produces "Refer to Another Team"

### TC-040: Seed data demonstrates all priority levels (REQ-028)
- GIVEN the seed script has been executed
- WHEN the Triage_Engine evaluates all seeded disputes
- THEN at least one dispute has Priority_Level "High"
- AND at least one has Priority_Level "Medium"
- AND at least one has Priority_Level "Low"

## REST API — Disputes

### TC-041: GET /api/disputes returns all disputes with triage (REQ-029)
- GIVEN the database contains 5 disputes with triage recommendations
- WHEN a GET request is made to /api/disputes
- THEN the response status is 200
- AND the response body contains 5 dispute objects each with a triageRecommendation field

### TC-042: GET /api/disputes/:id returns single dispute (REQ-030)
- GIVEN a dispute with ID 3 exists in the database
- WHEN a GET request is made to /api/disputes/3
- THEN the response status is 200
- AND the response body contains the full dispute details including customer, transaction, and triageRecommendation

### TC-043: POST /api/disputes creates dispute and returns triage (REQ-031)
- GIVEN a valid request body with customerId=1, paymentType="Card Payment", issueCategory="Duplicate Debit", transactionAmount=200, transactionDate="2026-06-20", transactionStatus="Completed"
- WHEN a POST request is made to /api/disputes
- THEN the response status is 201
- AND the response body contains the created dispute with an ID
- AND the response body contains a triageRecommendation with routingAction, priorityLevel, and reasoning

### TC-044: GET /api/disputes/:id returns 404 for non-existent dispute (REQ-032)
- GIVEN no dispute with ID 99999 exists in the database
- WHEN a GET request is made to /api/disputes/99999
- THEN the response status is 404
- AND the response body contains a descriptive error message

### TC-045: POST /api/disputes returns 400 for missing fields (REQ-033)
- GIVEN a request body missing the paymentType and transactionAmount fields
- WHEN a POST request is made to /api/disputes
- THEN the response status is 400
- AND the response body contains field-level error details for paymentType and transactionAmount

### TC-046: POST /api/disputes returns 400 for invalid payment type (REQ-033)
- GIVEN a request body with paymentType="Invalid Type"
- WHEN a POST request is made to /api/disputes
- THEN the response status is 400
- AND the response body contains an error detail for the paymentType field

### TC-047: POST /api/disputes returns 400 for invalid issue category (REQ-033)
- GIVEN a request body with paymentType="Card Payment" and issueCategory="Failed Transfer"
- WHEN a POST request is made to /api/disputes
- THEN the response status is 400
- AND the response body contains an error detail indicating the issue category is not valid for the selected payment type

## REST API — Payment Types

### TC-048: GET /api/payment-types returns all types with categories (REQ-034)
- GIVEN the system is running
- WHEN a GET request is made to /api/payment-types
- THEN the response status is 200
- AND the response body contains payment types with their associated issue categories

### TC-049: Exactly three payment types supported (REQ-035)
- GIVEN the system is running
- WHEN a GET request is made to /api/payment-types
- THEN the response contains exactly 3 payment type entries
- AND the types are "Card Payment", "EFT", and "Internal Transfer"

### TC-050: Card Payment has correct issue categories (REQ-036)
- GIVEN the system is running
- WHEN a GET request is made to /api/payment-types
- THEN "Card Payment" is associated with exactly "Duplicate Debit", "Unauthorized Transaction", "Failed Transaction", and "Incorrect Amount"

### TC-051: EFT has correct issue categories (REQ-037)
- GIVEN the system is running
- WHEN a GET request is made to /api/payment-types
- THEN "EFT" is associated with exactly "Failed Transfer", "Duplicate Debit", and "Missing Payment"

### TC-052: Internal Transfer has correct issue categories (REQ-038)
- GIVEN the system is running
- WHEN a GET request is made to /api/payment-types
- THEN "Internal Transfer" is associated with exactly "Failed Transfer", "Duplicate Debit", "Missing Payment", and "Unauthorized Transaction"
