# Context Migration Guide

## Overview

This guide helps you migrate logic from the monolithic `AppContext` to the new modular providers.

## Migration Checklist

### ✅ Step 1: ErrorProvider

**File:** `providers/ErrorProvider.tsx`

**What to move:**

- [ ] `captureException` implementation from AppContext
- [ ] Any error tracking/logging logic (Sentry, etc.)

**Find in AppContext:**

```tsx
const captureException = (
  error: Error | unknown,
  context?: Record<string, any>,
) => {
  // Move this logic to ErrorProvider
}
```

---

### ✅ Step 2: NavigationProvider

**File:** `providers/NavigationProvider.tsx`

**What to move:**

- [ ] `slug` state and logic
- [ ] `addParam` implementation
- [ ] `removeParam` implementation
- [ ] `goToThreads` implementation
- [ ] Any URL/routing logic

**Find in AppContext:**

```tsx
const [slug, setSlug] = useState(...)
const addParam = (key, value) => { ... }
const removeParam = (key) => { ... }
const goToThreads = () => { ... }
```

---

### ✅ Step 3: AuthProvider

**File:** `providers/AuthProvider.tsx`

**What to move:**

- [ ] `signInPart` state (already done ✅)
- [ ] `setSignInPart` (already done ✅)
- [ ] Any auth-related UI state

**Status:** Mostly complete, just verify the logic

---

### ✅ Step 4: InputProvider

**File:** `providers/InputProvider.tsx`

**What to move:**

- [ ] `input` state (already done ✅)
- [ ] `setInput` (already done ✅)
- [ ] `placeHolder` state and logic
- [ ] Define proper `placeHolder` type

**Find in AppContext:**

```tsx
const [placeHolder, setPlaceHolder] = useState<placeHolder | undefined>(...)
```

---

### ✅ Step 5: FeatureProvider

**File:** `providers/FeatureProvider.tsx`

**What to move:**

- [ ] `showAddToHomeScreen` state (already done ✅)
- [ ] `setShowAddToHomeScreen` (already done ✅)
- [ ] `memoriesEnabled` logic
- [ ] Any other feature flags

**Find in AppContext:**

```tsx
const memoriesEnabled = useMemo(() => { ... }, [...])
```

---

### ✅ Step 6: DataProvider

**File:** `providers/DataProvider.tsx`

**What to move:**

- [ ] `instructions` state and fetching logic
- [ ] `affiliateStats` state
- [ ] `affiliateCode` state
- [ ] `loadingAffiliateStats` state
- [ ] `refetchAffiliateData` implementation
- [ ] `refetchWeather` implementation
- [ ] Define proper types for `instruction` and `affiliateStats`

**Find in AppContext:**

```tsx
const [instructions, setInstructions] = useState(...)
const [affiliateStats, setAffiliateStats] = useState(...)
const refetchAffiliateData = async () => { ... }
const refetchWeather = () => { ... }
```

---

### ✅ Step 7: AppProvider

**File:** `providers/AppProvider.tsx`

**What to move:**

- [ ] `appStatus` state
- [ ] `setAppStatus` implementation (with path handling)
- [ ] `app` state
- [ ] `setApp` implementation
- [ ] `apps` state and fetching logic
- [ ] Define proper `app` type

**Find in AppContext:**

```tsx
const [appStatus, setAppStatus] = useState(...)
const setAppStatus = (status, path) => {
  // Move path handling logic
  ...
}
const [app, setApp] = useState(...)
const [apps, setApps] = useState(...)
```

---

## Type Definitions to Update

### TODO: Define these types properly

1. **placeHolder** - Currently `{ [key: string]: any }`
2. **instruction** - Currently `{ [key: string]: any }`
3. **affiliateStats** - Currently `{ [key: string]: any }`
4. **app** - Currently `{ [key: string]: any }`

**Where to find types:**

- Check existing type definitions in AppContext
- Look for imports from `packages/db` or shared types

---

## Usage After Migration

### Before (AppContext):

```tsx
import { useAppContext } from "./context/AppContext"

function MyComponent() {
  const { input, setInput, captureException } = useAppContext()
}
```

### After (Modular):

```tsx
import { useInput, useError } from "./context/providers"

function MyComponent() {
  const { input, setInput } = useInput()
  const { captureException } = useError()
}
```

---

## Testing Strategy

1. **Keep AppContext temporarily** - Don't delete it yet
2. **Migrate one provider at a time** - Start with ErrorProvider
3. **Test each provider** - Ensure it works before moving to next
4. **Update imports gradually** - Component by component
5. **Remove AppContext last** - Once all logic is migrated

---

## Benefits After Migration

✅ **Smaller bundle sizes** - Only import what you need  
✅ **Better performance** - Fewer re-renders (isolated contexts)  
✅ **Easier testing** - Test providers independently  
✅ **Better code organization** - Single responsibility  
✅ **Easier debugging** - Clear separation of concerns  
✅ **Better TypeScript** - More specific types per context

---

## Questions?

- Each provider has a `// TODO:` comment where logic needs to be moved
- Types are defined but may need refinement
- All hooks follow the same pattern: `useProviderName()`
