Intelligent Triage of Customer Payment Disputes

Problem Statement
Bank customers expect payment issues to be resolved quickly and accurately, whether the problem relates to a duplicate debit, failed transfer, missing payment, or card transaction dispute. In many cases, frontline staff must manually gather information from multiple sources, interpret the issue, and decide what action should be taken next. This can slow down resolution, create inconsistent handling, and frustrate both customers and support teams.
Your challenge is to design and build a lightweight internal prototype that helps a banking operations user triage and route customer payment disputes more effectively. The user should be able to capture a dispute, record the payment type and issue category, and receive a recommended next action based on simple business rules such as transaction status, amount, age of the dispute, and issue type.
The prototype should answer one practical question: given this payment dispute, what is the most appropriate next step right now?
Why this problem matters
In a banking environment, payment disputes are a high-volume operational reality with direct impact on customer trust, service costs, and regulatory handling standards. Improving the triage process can reduce turnaround times, improve consistency of decisions, and help operations teams focus their effort where it is most needed.
What teams should build
Teams should produce a working prototype that supports a single, focused journey: an operations user captures a customer payment dispute and receives a recommended route or action. The prototype should clearly show why the case was classified in a certain way and whether it should be resolved immediately, investigated further, escalated, or referred to another team.
Constraints
Use mock dispute, customer, and transaction data only.
Use a simple rules-based decision approach rather than AI or machine learning.
Limit the solution to a small set of payment types such as card payments, EFTs, or internal transfers.
Represent case priority and age using a few simple indicators only.
Avoid real integrations with core banking, card processing, case management, or customer platforms.
Expected outcome
The best solutions will demonstrate a clear understanding of a realistic banking operations problem, a practical and intuitive user flow, and a sensible way to guide dispute handling using transparent rules. Teams should focus on clarity, usability, and a well-scoped working prototype rather than trying to solve the full end-to-end disputes process.