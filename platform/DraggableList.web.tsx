"use client"

import React, { useMemo } from "react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  TouchSensor,
  MouseSensor,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

// Type definitions
export interface RenderItemParams<T> {
  item: T
  index: number
  drag: (event?: any) => void
  isActive: boolean
}

export interface DraggableListProps<T> {
  data: T[]
  renderItem: (params: RenderItemParams<T>) => React.ReactElement
  keyExtractor: (item: T, index: number) => string
  onDragEnd: (params: { data: T[]; from: number; to: number }) => void
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null
  ListFooterComponent?: React.ComponentType<any> | React.ReactElement | null
  contentContainerStyle?: any
  style?: any
  testID?: string
  // Native-specific props (ignored on web)
  activationDistance?: number
  dragItemOverflow?: boolean
  dragHitSlop?: { top: number; bottom: number; left: number; right: number }
}

// Sortable Item Wrapper
function SortableItem<T>({
  id,
  item,
  index,
  renderItem,
}: {
  id: string
  item: T
  index: number
  renderItem: DraggableListProps<T>["renderItem"]
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 999 : "auto",
    position: "relative" as const,
    // Don't block touch events on the entire item - let scrolling work
    // touchAction is set to "none" only on the drag handle itself
  }

  // Map dnd-kit listeners to the 'drag' function expected by the consumer
  // The consumer uses <Pressable onPressIn={drag} /> or <Pressable onLongPress={drag} />
  // We'll expose the primary listener (onPointerDown) as 'drag'
  const drag = listeners?.onPointerDown as any

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      {renderItem({
        item,
        index,
        drag, // Pass the listener as the drag trigger
        isActive: isDragging,
      })}
    </div>
  )
}

export default function DraggableList<T>({
  data,
  renderItem,
  keyExtractor,
  onDragEnd,
  ListHeaderComponent,
  ListFooterComponent,
  contentContainerStyle,
  style,
  testID,
}: DraggableListProps<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Require 5px movement before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        distance: 5, // Require 5px movement before drag starts
      },
    }),
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5, // Require 5px movement before drag starts
      },
    }),
  )

  const items = useMemo(
    () => data.map((item, index) => keyExtractor(item, index)),
    [data, keyExtractor],
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = items.indexOf(active.id as string)
      const newIndex = items.indexOf(over.id as string)

      const newData = arrayMove(data, oldIndex, newIndex)

      onDragEnd({
        data: newData,
        from: oldIndex,
        to: newIndex,
      })
    }
  }

  return (
    <div
      style={{ ...style, display: "flex", flexDirection: "column" }}
      data-testid={testID}
    >
      <div style={contentContainerStyle}>
        {ListHeaderComponent && <>{ListHeaderComponent}</>}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={items} strategy={verticalListSortingStrategy}>
            {data.map((item, index) => (
              <SortableItem
                key={keyExtractor(item, index)}
                id={keyExtractor(item, index)}
                item={item}
                index={index}
                renderItem={renderItem}
              />
            ))}
          </SortableContext>
        </DndContext>

        {ListFooterComponent && <>{ListFooterComponent}</>}
      </div>
    </div>
  )
}
