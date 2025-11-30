import React from "react"
import DragList from "react-native-draglist"
import { DraggableListProps, RenderItemParams } from "./DraggableList.d"

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
  }) => {
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
      renderItem={renderItemWrapper}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={ListFooterComponent}
      contentContainerStyle={contentContainerStyle}
      style={style}
      testID={testID}
    />
  )
}
