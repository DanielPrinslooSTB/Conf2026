---
inclusion: manual
filename: create-express-endpoint.md
---

# Create Express Endpoint from API Spec

## Purpose

Generate a fully structured, production-ready Express route handler from the API specification defined in `docs/api_spec.md`, ensuring consistency, correctness, and adherence to project architecture.

---

## High-Level Workflow

When creating an endpoint, follow this pipeline strictly:

1. Locate endpoint definition in API spec
2. Define request/response contracts
3. Create validator
4. Implement service logic
5. Implement route handler
6. Register route
7. Verify behavior against spec

---

## Step-by-Step Instructions

### 1. Read the API Specification

- Open `docs/api_spec.md`
- Identify the endpoint using:
  - HTTP method (GET, POST, PUT, DELETE)
  - Route path (e.g. `/users/:id`)
  - Operation name / description

✅ Extract ALL details:

- Path parameters
- Query parameters
- Request body schema
- Response structure
- Status codes
- Error cases

⚠️ Do NOT infer missing fields — only implement what is defined.

---

### 2. Define Contracts (Types)

Create or reuse TypeScript interfaces in:

`server/src/types/`

```ts
export interface CreateUserRequest {
  email: string;
  name: string;
}

export interface CreateUserResponse {
  id: string;
  email: string;
  name: string;
}
```

Rules:

- Types must exactly match API spec
- Avoid `any`
- Use optional fields only if specified

---

### 3. Create Validator

Location:

`server/src/validators/<resource>.validator.ts`

Responsibilities:

- Validate shape
- Validate required fields
- Validate primitive formats (string, number, etc.)

```ts
import { ApiError } from '../middleware/ApiError';

export function validateCreateUser(body: any) {
  if (!body.email) {
    throw new ApiError(400, 'Email is required');
  }

  if (typeof body.email !== 'string') {
    throw new ApiError(400, 'Email must be a string');
  }
}
```

Rules:

- No external libraries (e.g. Joi, Zod)
- Keep validators reusable
- Throw `ApiError` only

---

### 4. Implement Service Layer

Location:

`server/src/services/<resource>.service.ts`

Responsibilities:

- Business logic
- Database interaction via Prisma
- Data transformation

```ts
import { prisma } from '../prisma/client';

export async function createUser(data: CreateUserRequest) {
  return prisma.user.create({ data });
}
```

Rules:

- No Express objects (`req`, `res`)
- Pure functions preferred
- Handle domain-level errors

---

### 5. Create Route Handler

Location:

`server/src/routes/<resource>.ts`

```ts
import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../middleware/ApiError';
import { validateCreateUser } from '../validators/user.validator';
import { createUser } from '../services/user.service';

export async function createUserHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const body = req.body;

    validateCreateUser(body);

    const result = await createUser(body);

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}
```

Rules:

- Keep handlers thin
- No business logic inside handler
- Always wrap in try/catch
- Always call `next(error)`

---

### 6. Register Route

File:

`server/src/routes/api.ts`

```ts
import { Router } from 'express';
import { createUserHandler } from './user';

const router = Router();

router.post('/users', createUserHandler);

export default router;
```

Rules:

- Match method and path EXACTLY
- Maintain grouping by resource

---

### 7. Response Handling Rules

- Use correct HTTP status codes:
  - `200` OK
  - `201` Created
  - `204` No Content
  - `400` Bad Request
  - `404` Not Found
  - `500` Internal Server Error
- Match response schema exactly
- Do not include extra fields

---

### 8. Error Handling

```ts
throw new ApiError(404, 'User not found');
```

Guidelines:

- Validation errors → 400
- Missing resources → 404
- Unexpected failures → 500

Never:

- Return raw errors
- Leak stack traces

---

### 9. File Naming Conventions

| Type | Pattern |
|------|---------|
| Route | `<resource>.ts` |
| Service | `<resource>.service.ts` |
| Validator | `<resource>.validator.ts` |
| Types | `<resource>.types.ts` |

---

### 10. Checklist (Before Completion)

✅ Endpoint matches API spec exactly  
✅ Validator implemented  
✅ Service abstraction used  
✅ Types defined and used  
✅ Error handling consistent  
✅ Route registered  
✅ No business logic in route handler  
✅ Prisma used only in service layer  

---

## Anti-Patterns (Avoid)

❌ Writing DB queries inside route handler  
❌ Skipping validation  
❌ Using `any` types  
❌ Returning inconsistent responses  
❌ Hardcoding values not in spec  
❌ Not handling errors  

---

## References

- API Spec: `docs/api_spec.md`
- Routes: `server/src/routes/`
- Services: `server/src/services/`
- Validators: `server/src/validators/`
- Types: `server/src/types/`
- Error Handling: `server/src/middleware/ApiError.ts`

---

## Summary

**Route → Validator → Service → Prisma**

Follow each step to ensure:

- Predictable API behavior
- Maintainable codebase
- Strong type safety
- Clean separation of concerns
