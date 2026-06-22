---
inclusion: manual
---

# Generate Prisma Migration from Data Model

## Purpose
Create and apply a Prisma schema migration based on data model changes described by the user or derived from the architecture/design docs.

## Instructions

When asked to generate a Prisma migration:

1. **Read current schema** — Open `server/prisma/schema.prisma` to understand existing models and relations.

2. **Determine the change** — Based on the user's request or design docs, identify what models, fields, or relations need to be added/modified.

3. **Update the schema** — Edit `server/prisma/schema.prisma` following these patterns:

```prisma
// Use SQLite provider
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// Model conventions
model ModelName {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Fields with explicit types
  fieldName String
  optional  String?
  
  // Relations
  relation  RelatedModel @relation(fields: [relationId], references: [id])
  relationId String
}
```

4. **Apply naming conventions:**
   - Models: PascalCase singular (e.g., `Dispute`, `PaymentType`)
   - Fields: camelCase (e.g., `transactionAmount`, `createdAt`)
   - Always include `id`, `createdAt`, `updatedAt` on new models
   - Use `@default(cuid())` for IDs

5. **Generate and run the migration:**

```bash
cd server
npx prisma migrate dev --name descriptive-migration-name
npx prisma generate
```

6. **Update seed data if needed** — If the new model requires reference data, update `server/prisma/seed.ts`.

7. **Update TypeScript types** — Ensure `server/src/types/` interfaces reflect the schema change.

8. **Validate:**
   - Migration applies cleanly
   - `npx prisma generate` succeeds
   - Existing tests still pass (`npm run test`)

## References
- Schema: `server/prisma/schema.prisma`
- Seed data: `server/prisma/seed.ts`
- Architecture: #[[file:docs/architecture.md]]
- Server types: `server/src/types/`
