# Draggable Apps Components

Reusable drag-and-drop components for app lists using `react-dnd`.

## Installation

```bash
npm install react-dnd react-dnd-html5-backend
```

## Components

### `DraggableAppList`

Wrapper component that provides the DnD context.

**Props:**

- `children`: React nodes (DraggableAppItem components)
- `onReorder?: (dragIndex: number, hoverIndex: number) => void` - Called when items are reordered
- `className?: string` - CSS class for the list container

### `DraggableAppItem`

Individual draggable item component.

**Props:**

- `id: string` - Unique identifier for the item
- `index: number` - Current position in the list
- `children: React.ReactNode` - Content to render
- `onMove?: (dragIndex: number, hoverIndex: number) => void` - Called during drag (for live updates)
- `onDragStart?: (index: number) => void` - Called when drag starts
- `onDragEnd?: (index: number) => void` - Called when drag ends
- `onDrop?: (dragIndex: number, hoverIndex: number) => void` - Called when item is dropped
- `className?: string` - CSS class for the item
- `disabled?: boolean` - Disable dragging for this item

## Usage Example

```tsx
import { useState, useCallback } from "react"
import { DraggableAppList } from "./DraggableAppList"
import { DraggableAppItem } from "./DraggableAppItem"

function MyApps() {
  const [apps, setApps] = useState([
    { id: "1", name: "Atlas" },
    { id: "2", name: "Peach" },
    { id: "3", name: "Bloom" },
  ])

  // Update state during drag for smooth reordering
  const moveApp = useCallback((dragIndex: number, hoverIndex: number) => {
    setApps((prevApps) => {
      const newApps = [...prevApps]
      const [draggedApp] = newApps.splice(dragIndex, 1)
      newApps.splice(hoverIndex, 0, draggedApp)
      return newApps
    })
  }, [])

  // Save to database when drop completes
  const handleDrop = useCallback(
    async (dragIndex: number, hoverIndex: number) => {
      console.log(`Moved from ${dragIndex} to ${hoverIndex}`)
      // await saveAppOrder(apps)
    },
    [apps],
  )

  return (
    <DraggableAppList className="apps-grid">
      {apps.map((app, index) => (
        <DraggableAppItem
          key={app.id}
          id={app.id}
          index={index}
          onMove={moveApp}
          onDrop={handleDrop}
        >
          <div className="app-button">{app.name}</div>
        </DraggableAppItem>
      ))}
    </DraggableAppList>
  )
}
```

## Event Flow

1. **onDragStart** - User starts dragging
2. **onMove** - Called repeatedly as user drags over other items (use for live preview)
3. **onDragEnd** - User releases the drag
4. **onDrop** - Item is dropped in new position (use for saving to database)

## Styling

The dragging item automatically gets `opacity: 0.4` and `cursor: move`.

You can add custom styles:

```scss
.app-item {
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.05);
  }
}
```

## Integration with Your App Grid

```tsx
<div className={styles.apps}>
  <DraggableAppList>
    {apps?.map((app, index) => (
      <DraggableAppItem
        key={app.id}
        id={app.id}
        index={index}
        onMove={moveApp}
        onDrop={handleSaveOrder}
      >
        <a href={`/${app.slug}`} className="button small inverted">
          <img src={app.icon} alt={app.name} />
          <span>{app.name}</span>
        </a>
      </DraggableAppItem>
    ))}
  </DraggableAppList>
</div>
```

## Features

✅ Smooth drag-and-drop
✅ Live reordering preview
✅ Touch support (via HTML5Backend)
✅ Customizable callbacks
✅ TypeScript support
✅ Accessible (keyboard support)
✅ Performance optimized
