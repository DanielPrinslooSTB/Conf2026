---
inclusion: manual
---

# Create React Page from UI Spec

## Purpose
Generate a fully structured React page component from the UI specification in `docs/ui_spec.md`.

## Instructions

When asked to create a React page:

1. **Read the UI spec** — Open `docs/ui_spec.md` and locate the page definition matching the user's request.

2. **Create the page component** — Place it in `client/src/pages/` using PascalCase naming (e.g., `DisputeDetailPage.tsx`).

3. **Follow MVVM pattern:**

```typescript
// ViewModel hook — client/src/hooks/usePageName.ts
import { useState, useEffect } from 'react';
import { apiFunction } from '../services/api';

export function usePageName() {
  // State management
  // Side effects (API calls)
  // Data transformation
  // Return state + actions for the view
}
```

```typescript
// View component — client/src/pages/PageName.tsx
import { usePageName } from '../hooks/usePageName';

export function PageName() {
  const { data, loading, error, actions } = usePageName();

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;

  return (
    // Pure rendering — no business logic here
  );
}
```

4. **Create reusable components** — Extract repeated UI patterns into `client/src/components/`.

5. **Register the route** — Add the route in `client/src/main.tsx` using react-router-dom.

6. **Match the UI spec exactly:**
   - Page layout and sections
   - Interactive elements and their behaviours
   - Loading, empty, and error states
   - Navigation flows

7. **Apply project conventions:**
   - Tailwind CSS for styling (no CSS files)
   - TypeScript interfaces from `client/src/types/`
   - API calls through `client/src/services/api.ts`
   - Accessibility: semantic HTML, ARIA labels, keyboard navigation

## References
- UI Spec: #[[file:docs/ui_spec.md]]
- Existing pages: `client/src/pages/`
- API service: `client/src/services/api.ts`
- Shared types: `client/src/types/index.ts`
