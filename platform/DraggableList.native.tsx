import type React from "react"
import DragList from "react-native-draglist"
import type { DraggableListProps, RenderItemParams } from "./DraggableList.web"

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
  const renderItemWrapper = ({
    item,
    onStartDrag,
    isActive,
    index,
  }: {
    item: T
    onStartDrag: () => void
    isActive: boolean
    index: number
  }): React.ReactElement | null => {
    // Map native params to our shared interface
    const params: RenderItemParams<T> = {
      item,
      drag: onStartDrag,
      isActive,
      index,
    }
    return renderItem(params)
  }

  return (
    <DragList
      data={data}
      keyExtractor={keyExtractor}
      onReordered={(fromIndex, toIndex) => {
        const newData = [...data]
        const [removed] = newData.splice(fromIndex, 1)
        newData.splice(toIndex, 0, removed!)
        onDragEnd({ data: newData, from: fromIndex, to: toIndex })
      }}
      renderItem={renderItemWrapper as any}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={ListFooterComponent}
      contentContainerStyle={contentContainerStyle}
      style={style}
      testID={testID}
    />
  )
}
