import { useCallback } from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"

interface DraggableAppListProps {
  children: React.ReactNode
  onReorder?: (dragIndex: number, hoverIndex: number) => void
  className?: string
}

export function DraggableAppList({
  children,
  onReorder,
  className,
}: DraggableAppListProps): React.ReactElement {
  const handleDrop = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      if (onReorder) {
        onReorder(dragIndex, hoverIndex)
      }
    },
    [onReorder],
  )

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={className} data-dnd-list>
        {children}
      </div>
    </DndProvider>
  )
}
