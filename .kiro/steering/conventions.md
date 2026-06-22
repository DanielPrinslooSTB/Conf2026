# Conventions

## Architecture
- Follow **CLEAN Architecture** — strict separation of concerns with dependencies pointing inward (Entities → Use Cases → Interface Adapters → Frameworks/Drivers)
- Use the **MVVM (Model-View-ViewModel)** pattern on the client side — Views (React components) bind to ViewModels (hooks/state logic) which interact with Models (API/domain types)

## Layers (Server)
- **Entities/Domain**: Pure business logic (e.g., triage engine) with no framework dependencies
- **Use Cases/Services**: Application-specific orchestration (e.g., create dispute + run triage)
- **Interface Adapters**: Route handlers, validators, response mappers
- **Frameworks**: Express, Prisma, external I/O

## Layers (Client)
- **Model**: TypeScript interfaces and API service functions
- **ViewModel**: Custom hooks managing state, side effects, and data transformation
- **View**: React components focused purely on rendering and user interaction

## Design Principles
- Follow **SOLID** principles:
  - **S** — Single Responsibility: Each class/module has one reason to change
  - **O** — Open/Closed: Extend behaviour without modifying existing code (e.g., add new triage rules without rewriting the engine)
  - **L** — Liskov Substitution: Subtypes must be substitutable for their base types
  - **I** — Interface Segregation: Prefer small, focused interfaces over large monolithic ones
  - **D** — Dependency Inversion: Depend on abstractions (interfaces/types), not concrete implementations
- Use **Object-Oriented Programming** where appropriate — encapsulate state and behaviour in classes (e.g., `ApiError`), leverage inheritance for shared patterns, and use interfaces to define contracts between layers
