# Tech Stack

## Architecture
- Monorepo with separate `client/` and `server/` workspaces
- REST API consumed by React SPA
- SQLite database via Prisma ORM

## Server
- **Runtime**: Node.js with TypeScript
- **Framework**: Express
- **ORM**: Prisma (SQLite provider)
- **Validation**: Custom validators (no external validation library)
- **Testing**: Vitest + fast-check (property-based testing)

## Client
- **Framework**: React
- **Build tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: react-router-dom
- **Language**: TypeScript

## Common Commands

```bash
# Server
cd server
npx prisma migrate dev      # Run database migrations
npx prisma generate         # Regenerate Prisma client
npx prisma db seed          # Seed mock data
npm run dev                  # Start dev server (port 3001)
npm run test                 # Run tests with Vitest

# Client
cd client
npm run dev                  # Start Vite dev server
npm run build                # Production build

# Database
npx prisma studio           # Visual database browser
```

## Key Patterns
- Triage engine is a **pure function** with no side effects or DB dependencies
- Error handling via custom `ApiError` class + global `errorHandler` middleware
- Payment type/issue category mapping is static reference data (not in DB)
- Vite proxies `/api` requests to the Express server during development
