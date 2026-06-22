# Project Structure

```
Conf2026/
├── client/                          # React SPA (Vite + Tailwind)
│   └── src/
│       ├── components/              # Reusable UI components
│       ├── pages/                   # Route-level page components
│       │   ├── DisputeListPage.tsx
│       │   ├── CreateDisputePage.tsx
│       │   └── DisputeDetailPage.tsx
│       ├── services/                # API client functions
│       │   └── api.ts
│       ├── types/                   # Shared TypeScript interfaces
│       │   └── index.ts
│       └── main.tsx                 # App entry with BrowserRouter
│
├── server/                          # Express REST API
│   ├── src/
│   │   ├── routes/                  # Express route handlers
│   │   │   ├── api.ts              # Router registry
│   │   │   └── disputes.ts        # Dispute CRUD + triage
│   │   ├── services/               # Business logic
│   │   │   ├── triageEngine.ts     # Pure triage rules function
│   │   │   └── paymentTypes.ts     # Static reference data
│   │   ├── validators/             # Input validation
│   │   │   └── disputeValidator.ts
│   │   ├── middleware/             # Error handling
│   │   │   └── ApiError.ts
│   │   └── types/                  # Shared TS interfaces
│   │       └── dispute.ts
│   └── prisma/
│       ├── schema.prisma           # Data models
│       └── seed.ts                 # Mock data seeder
│
├── docs/                            # Project documentation
│   ├── api_spec.md                 # Full API specification
│   ├── architecture.md
│   ├── requirements.md             # EARS-format requirements
│   ├── test_cases.md               # GIVEN/WHEN/THEN test cases
│   └── ui_spec.md
│
├── design.md                        # System design document
├── initial_requirements.md          # User-story format requirements
├── tasks.md                         # Implementation task list
├── use_case.md                      # Problem statement / brief
│
├── ears_template.md                 # EARS requirements template
├── api_template.md                  # API spec template
└── test_case_template.md            # Test case template
```

## Key Conventions
- Templates (`*_template.md`) define the format for documentation artifacts
- Requirements use EARS notation (When/While/Where/If/The system shall...)
- Test cases use GIVEN/WHEN/THEN structure
- API specs follow a consistent METHOD/path format with examples
- The `docs/` folder holds the canonical refined documentation
- Root-level `.md` files are working drafts or templates
