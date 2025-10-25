# Complete Drag-and-Drop Integration Guide

## 🎯 Overview

Complete system for reordering apps with drag-and-drop, including:

- Frontend components (React DnD)
- Backend API endpoint
- Database function
- React hook for state management

---

## 📦 Installation

```bash
npm install react-dnd react-dnd-html5-backend
```

---

## 🏗️ Architecture

```
User drags app
    ↓
DraggableAppItem (UI component)
    ↓
useAppReorder hook (State management)
    ↓
POST /api/apps/reorder (API endpoint)
    ↓
updateInstallOrder (Database function)
    ↓
installs table updated
```

---

## 🔧 Backend Setup

### 1. Database Function

Already added to `/packages/db/index.ts`:

```typescript
export const updateInstallOrder = async ({
  appId,
  userId,
  guestId,
  order,
}: {
  appId: string
  userId?: string
  guestId?: string
  order: number
}) => {
  const conditions = [eq(installs.appId, appId)]

  if (userId) {
    conditions.push(eq(installs.userId, userId))
  }

  if (guestId) {
    conditions.push(eq(installs.guestId, guestId))
  }

  const [updated] = await db
    .update(installs)
    .set({ order })
    .where(and(...conditions))
    .returning()

  return updated
}
```

### 2. API Endpoint

Created at `/apps/web/app/api/apps/reorder/route.ts`:

```typescript
export async function POST(request: NextRequest) {
  const member = await getMember()
  const guest = await getGuest()

  if (!member && !guest) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()

  // Update all app orders in parallel
  const updatePromises = body.apps.map((item) =>
    updateInstallOrder({
      appId: item.appId,
      userId: member?.id,
      guestId: guest?.id,
      order: item.order,
    }),
  )

  await Promise.all(updatePromises)

  return NextResponse.json({ success: true }, { status: 200 })
}
```

**Request Format:**

```json
{
  "apps": [
    { "appId": "uuid-1", "order": 0 },
    { "appId": "uuid-2", "order": 1 },
    { "appId": "uuid-3", "order": 2 }
  ]
}
```

---

## 🎨 Frontend Setup

### 1. Import Components

```tsx
import { DraggableAppList } from "./DraggableAppList"
import { DraggableAppItem } from "./DraggableAppItem"
import { useAppReorder } from "./hooks/useAppReorder"
```

### 2. Use the Hook

```tsx
function MyApps() {
  const [apps, setApps] = useState(session?.apps || [])

  const { moveApp, handleDrop, handleDragStart, handleDragEnd } = useAppReorder(
    {
      apps,
      setApps,
      // Optional: custom save function
      onSave: async (apps) => {
        await customSaveFunction(apps)
      },
    },
  )

  return (
    <DraggableAppList className={styles.apps}>
      {apps.map((app, index) => (
        <DraggableAppItem
          key={app.id}
          id={app.id}
          index={index}
          onMove={moveApp}
          onDrop={handleDrop}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <a href={`/${app.slug}`}>
            <img src={app.icon} alt={app.name} />
            <span>{app.name}</span>
          </a>
        </DraggableAppItem>
      ))}
    </DraggableAppList>
  )
}
```

---

## 🔄 Complete Integration Example

```tsx
import { useState, useCallback } from "react"
import { DraggableAppList } from "chrry/DraggableAppList"
import { DraggableAppItem } from "chrry/DraggableAppItem"
import { useAppReorder } from "chrry/hooks/useAppReorder"
import { useAppContext } from "chrry/context/AppContext"

export default function App() {
  const { apps: initialApps } = useAppContext()
  const [apps, setApps] = useState(initialApps)

  const { moveApp, handleDrop, handleDragStart, handleDragEnd } = useAppReorder(
    {
      apps,
      setApps,
    },
  )

  return (
    <div className={styles.appsGrid}>
      <DraggableAppList className={styles.apps}>
        {apps?.map((app, index) => (
          <DraggableAppItem
            key={app.id}
            id={app.id}
            index={index}
            onMove={moveApp}
            onDrop={handleDrop}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            className={styles.appItem}
          >
            <a
              href={`/${app.slug}`}
              className="button small inverted"
              onClick={(e) => {
                e.preventDefault()
                // Your navigation logic
              }}
            >
              <img src={app.icon} alt={app.name} width={24} height={24} />
              <span>{app.name}</span>
            </a>
          </DraggableAppItem>
        ))}
      </DraggableAppList>
    </div>
  )
}
```

---

## 🎭 Event Flow

### 1. User Starts Dragging

```
User clicks and holds app
  ↓
onDragStart(index) called
  ↓
Console: "Started dragging app at index: 2"
  ↓
App opacity changes to 0.4
  ↓
Cursor changes to "move"
```

### 2. User Drags Over Other Apps

```
User moves mouse over another app
  ↓
onMove(dragIndex, hoverIndex) called
  ↓
Apps array reordered in state
  ↓
UI updates immediately (live preview)
  ↓
Smooth reordering animation
```

### 3. User Drops App

```
User releases mouse
  ↓
onDragEnd(index) called
  ↓
onDrop(dragIndex, hoverIndex) called
  ↓
POST /api/apps/reorder
  ↓
Database updated
  ↓
Console: "✅ App order saved successfully"
```

---

## 🎨 Styling

### CSS Grid Layout

```scss
.appsGrid {
  position: relative;
}

.apps {
  position: relative;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  width: 100%;
  max-width: 500px;
}

.appItem {
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.05);
  }
}
```

### Dragging State

```scss
// Automatically applied by DraggableAppItem
[data-handler-id] {
  opacity: 0.4;
  cursor: move;
}
```

---

## 🔒 Security

### Authorization

```typescript
// API checks for authenticated user
const member = await getMember()
const guest = await getGuest()

if (!member && !guest) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
}
```

### Ownership Validation

```typescript
// Database function only updates installs for the authenticated user
const conditions = [
  eq(installs.appId, appId),
  eq(installs.userId, userId), // Only user's installs
]
```

---

## 📊 Database Schema

```sql
CREATE TABLE installs (
  id UUID PRIMARY KEY,
  app_id UUID NOT NULL REFERENCES apps(id),
  user_id UUID REFERENCES users(id),
  guest_id UUID REFERENCES guests(id),
  "order" INTEGER NOT NULL DEFAULT 0,  -- Position on home screen
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  installed_at TIMESTAMP NOT NULL DEFAULT NOW(),
  uninstalled_at TIMESTAMP
);

CREATE INDEX installs_user_idx ON installs(user_id);
CREATE INDEX installs_app_idx ON installs(app_id);
```

---

## 🧪 Testing

### Manual Testing

1. Open app
2. Drag an app to a new position
3. Check console for logs
4. Refresh page
5. Verify order persists

### API Testing

```bash
curl -X POST http://localhost:3000/api/apps/reorder \
  -H "Content-Type: application/json" \
  -d '{
    "apps": [
      {"appId": "uuid-1", "order": 0},
      {"appId": "uuid-2", "order": 1}
    ]
  }'
```

---

## 🐛 Troubleshooting

### Apps Not Reordering

```typescript
// Check if apps state is updating
console.log("Apps after move:", apps)

// Check if setApps is being called
const moveApp = useCallback(
  (dragIndex, hoverIndex) => {
    console.log("moveApp called:", { dragIndex, hoverIndex })
    setApps(/* ... */)
  },
  [setApps],
)
```

### Order Not Persisting

```typescript
// Check API response
const handleDrop = async () => {
  const response = await apiFetch("/api/apps/reorder", {
    method: "POST",
    body: JSON.stringify({ apps }),
  })
  console.log("API response:", await response.json())
}
```

### Drag Not Working

```typescript
// Check if DndProvider is wrapping components
<DndProvider backend={HTML5Backend}>
  <DraggableAppItem>...</DraggableAppItem>
</DndProvider>
```

---

## ✅ Checklist

- [ ] Install `react-dnd` and `react-dnd-html5-backend`
- [ ] Database function `updateInstallOrder` added
- [ ] API endpoint `/api/apps/reorder` created
- [ ] Components `DraggableAppList` and `DraggableAppItem` created
- [ ] Hook `useAppReorder` created
- [ ] Integrated into your app component
- [ ] CSS styling added
- [ ] Tested drag-and-drop
- [ ] Tested persistence after refresh
- [ ] Console logs removed (optional)

---

## 🚀 Next Steps

### Optional Enhancements

1. **Add Loading State**

```typescript
const [isSaving, setIsSaving] = useState(false)

const handleDrop = async () => {
  setIsSaving(true)
  await saveOrder()
  setIsSaving(false)
}
```

2. **Add Error Handling**

```typescript
const handleDrop = async () => {
  try {
    await saveOrder()
    showToast("Order saved!")
  } catch (error) {
    showToast("Failed to save order")
    // Revert to previous order
    setApps(previousApps)
  }
}
```

3. **Add Animations**

```scss
.appItem {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```

4. **Add Haptic Feedback**

```typescript
const handleDragStart = () => {
  if (navigator.vibrate) {
    navigator.vibrate(10)
  }
}
```

---

**COMPLETE SYSTEM READY!** 🎯✨
