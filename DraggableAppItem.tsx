import { useRef } from "react"
import { useDrag, useDrop } from "react-dnd"
import type { Identifier, XYCoord } from "dnd-core"

const ITEM_TYPE = "APP_ITEM"

interface DragItem {
  index: number
  id: string
  type: string
}

interface DraggableAppItemProps {
  id: string
  index: number
  children: React.ReactNode
  onMove?: (dragIndex: number, hoverIndex: number) => void
  onDragStart?: (index: number) => void
  onDragEnd?: (index: number) => void
  onDrop?: (dragIndex: number, hoverIndex: number) => void
  className?: string
  disabled?: boolean
  style?: React.CSSProperties
}

export function DraggableAppItem({
  id,
  index,
  children,
  onMove,
  onDragStart,
  onDragEnd,
  onDrop,
  className,
  disabled = false,
  style,
}: DraggableAppItemProps): React.ReactElement {
  const ref = useRef<HTMLDivElement>(null)

  const [{ handlerId }, drop] = useDrop<
    DragItem,
    void,
    { handlerId: Identifier | null }
  >({
    accept: ITEM_TYPE,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      }
    },
    hover(item: DragItem, monitor) {
      if (!ref.current) {
        return
      }
      const dragIndex = item.index
      const hoverIndex = index

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect()

      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2

      // Determine mouse position
      const clientOffset = monitor.getClientOffset()

      // Get pixels to the top
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return
      }

      // Time to actually perform the action
      if (onMove) {
        onMove(dragIndex, hoverIndex)
      }

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex
    },
    drop(item: DragItem) {
      if (onDrop) {
        onDrop(item.index, index)
      }
    },
  })

  const [{ isDragging }, drag] = useDrag({
    type: ITEM_TYPE,
    item: () => {
      if (onDragStart) {
        onDragStart(index)
      }
      return { id, index }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: () => {
      if (onDragEnd) {
        onDragEnd(index)
      }
    },
    canDrag: !disabled,
  })

  const opacity = isDragging ? 0.4 : 1

  if (disabled) {
    return (
      <div ref={ref} className={className} style={{ opacity }}>
        {children}
      </div>
    )
  }

  drag(drop(ref))

  return (
    <div
      ref={ref}
      className={className}
      style={{ opacity, cursor: "move", ...style }}
      data-handler-id={handlerId}
    >
      {children}
    </div>
  )
}
