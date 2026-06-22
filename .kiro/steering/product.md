# Product Summary

Payment Dispute Triage is an internal banking operations prototype that helps staff capture customer payment disputes and receive automated triage recommendations.

## Core Functionality
- Operations users log payment disputes (Card Payment, EFT, Internal Transfer)
- A deterministic rules engine evaluates each dispute and recommends a next action
- Four possible routing actions: Resolve Immediately, Investigate Further, Escalate, Refer to Another Team
- Priority levels (High/Medium/Low) are assigned based on transaction amount and dispute age
- Full reasoning transparency — the system explains which rules fired and why

## Key Constraints
- Mock data only — no real banking integrations
- Rules-based decisions only — no AI/ML
- Limited to three payment types with predefined issue categories
- Prototype scope — single triage journey, not full end-to-end dispute lifecycle

## Users
- Banking operations staff (internal tool)
- Single user role: Operations_User
