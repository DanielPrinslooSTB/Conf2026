---
marp: true
theme: default
paginate: true
style: |
  :root {
    --color-primary: #0033A1;
    --color-primary-light: #1A5FC9;
    --color-primary-lighter: #4D8FE8;
    --color-secondary-blue: #E8F0FE;
    --color-dark-grey: #1F2937;
    --color-medium-grey: #6B7280;
    --color-white: #FFFFFF;
  }
  section {
    background: linear-gradient(135deg, #FFFFFF 0%, #E8F0FE 50%, #0033A1 100%);
    color: var(--color-dark-grey);
    font-family: "Inter", system-ui, sans-serif;
    font-size: 24px;
    padding-top: 80px;
  }
  section::before {
    content: "";
    position: absolute;
    top: 16px;
    left: 20px;
    width: 48px;
    height: 48px;
    background: url("client/src/assets/SB Logo.png") no-repeat center center;
    background-size: contain;
  }
  h1 {
    color: var(--color-primary);
    font-size: 36px;
    font-weight: 700;
  }
  h2 {
    color: var(--color-primary-light);
    font-size: 30px;
    font-weight: 600;
  }
  ul {
    font-size: 24px;
  }
  li {
    margin-bottom: 8px;
  }
  p {
    font-size: 24px;
  }
  section.title {
    background: linear-gradient(270deg, #0033A1 0%, #1A5FC9 50%, #4D8FE8 100%);
    color: var(--color-white);
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  section.title h1 {
    color: var(--color-white);
    font-size: 42px;
  }
  section.title h2 {
    color: var(--color-secondary-blue);
    font-size: 28px;
  }
  section.celebrate {
    background: linear-gradient(270deg, #0033A1 0%, #1A5FC9 40%, #059669 100%);
    color: var(--color-white);
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  section.celebrate h1 {
    color: var(--color-white);
    font-size: 48px;
  }
  section.celebrate p {
    font-size: 28px;
    color: var(--color-secondary-blue);
  }
  table {
    font-size: 22px;
    width: 100%;
  }
  th {
    background: var(--color-primary);
    color: var(--color-white);
    padding: 8px 12px;
  }
  td {
    padding: 8px 12px;
    border-bottom: 1px solid #E5E7EB;
  }
  strong {
    color: var(--color-primary);
  }
  footer {
    color: var(--color-medium-grey);
    font-size: 20px;
  }
---

<!-- _class: title -->

# Payment Dispute Triage
## Conference Demo 2026

---

# Our Team

| Role | Members |
|------|---------|
| **Kiro Engineer** | Dersio Khumalo |
| **Architects** | Taroon Lakha, Niek Claasen |
| **Software Engineers** | Choene Maitisa, Randell Naidoo, Phumelela Mjoli, Neo Chokolo |
| **Feature Analyst** | Daniel Prinsloo |
| **UI/UX Designer** | Thulani Mindi |
| **Delivery Manager** | Yaza Kara |
| **Quality Engineer** | Thandeka Ndlovu |

---

# Use Case Selection

- We chose **Use Case 1: Payment Dispute System**
- Internal banking operations tool for staff
- Deterministic rules engine with full reasoning transparency
- Three payment types, four routing actions, three priority levels

---

# Where Do We Start?

- At first, we had **no idea** how to begin
- Typical architect muscle flexing said:
  - _"Use Kiro to help us start this process"_
- Turned out to be the best decision we made

---

# Generating Requirements

- Took the use case description and asked Kiro to create `initial_requirements.md`
- Kiro generated a great set of requirements out of the box
- Manual review confirmed quality — minimal changes needed
- Asked Kiro for suggestions on other artifacts:
  - Design, UI Spec, API Spec, Architecture

---

# EARS Format Requirements

- Focused heavily on reworking requirements into **EARS format**
- Multiple passes and checks to ensure correctness
- The requirements file became the **cornerstone** of all reviews
- Added an example template file for future requirement files
- **Next step:** Include as a steering rule for automatic enforcement

---

# Test Cases

- Generated all test cases in the correct **GIVEN/WHEN/THEN** format
- Reviewed for correctness against our EARS requirements
- Added a template file for future test case files
- **Next step:** Include as a steering rule for consistent formatting

---

# Reconciling Documentation

- Reconciled all efforts into the conference-required format
- Applied the same iterative process to all required files:
  - Requirements → Test Cases → API Spec → Architecture → UI Spec
- Template-first approach ensured consistency across docs

---

# Trimming Requirements

- Judging rules required us to lower from **38 to 21** requirements
- Kiro suggested intelligent merging and removal strategies
- Lost very little in terms of the original set
- Still covered the full dispute triage journey
- Impressed with the quality of the suggestions

---

# Cross-Verification

- Multiple iterations of syncing requirement changes to other documents
- Cross-verification checks between:
  - Requirements ↔ Test Cases
  - Requirements ↔ API Spec
  - Requirements ↔ UI Spec
- Ensured full traceability across all artifacts

---

# UI Styling

- Updated `ui_spec.md` with styles "borrowed" from standardbank.co.za
- Scraped color palette, typography, spacing, and component styles
- Eventually yielded great results — felt like a real banking app
- Standard Bank Blue (#0033A1) became our signature

---

# Wireframes & Pre-Hook Checks

- Generated wireframes to visually verify the user journey
- Great way to build confidence in what we'd created so far
- First **pre-hook check** added:
  - Always check if wireframes can be generated before UI code
- **Future priority:** Immediate feedback via hooks at every step

---

# Confidence Check

- Got a tip: ask Kiro its **confidence level** to generate a working project
- Scored **92–95%** confidence
- Gave us the green light to proceed with implementation
- This should be a hook or standard practice for future projects

---

# Building the Solution

- Submitted docs and specs
- Started building and playing with the solution
- Kiro took our specifications and generated the full stack:
  - Express API + Prisma + SQLite
  - React SPA + Vite + Tailwind
  - Triage engine with deterministic rules

---

<!-- _class: celebrate -->

# 🎉 It Worked First Time!

We were blown away by the quality and faultless operation.

Zero errors. Full triage pipeline. Beautiful UI.

---

# First Pass — Enhancements

- Added Standard Bank logo to the navbar
- Combo search select for customer list
- Paginated disputes table (10 / 15 / 20 per page)
- Column sorting (all columns, asc/desc)
- Multi-select filtering (Payment Type, Category, Priority, Status)
- Date range filter (from/to)

---

# Second Pass — More Features

- Ability to resolve and update disputes
- Filter between resolved and open disputes
- Unit tests and automation testing via integration tests
- Full coverage report generated automatically via hooks
- **97 tests passing, 96.5% coverage**

---

<!-- _class: title -->

# Thank You!

## We had a lot of fun and this really is scarily exciting!

Please give everyone Kiro licenses — we will build awesome stuff for you, promise! 🚀
