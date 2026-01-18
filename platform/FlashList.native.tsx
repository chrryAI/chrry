/**
 * FlashList Native Implementation
 * Uses @shopify/flash-list for optimal performance on React Native
 */

import React, { forwardRef } from "react"

export interface FlashListProps<T> {
  data: T[]
  renderItem: (info: { item: T; index: number }) => React.ReactElement | null
  estimatedItemSize?: number
  keyExtractor?: (item: T, index: number) => string
  horizontal?: boolean
  numColumns?: number
  onEndReached?: () => void
  onEndReachedThreshold?: number
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null
  ListFooterComponent?: React.ComponentType<any> | React.ReactElement | null
  ListEmptyComponent?: React.ComponentType<any> | React.ReactElement | null
  ItemSeparatorComponent?: React.ComponentType<any> | null
  contentContainerStyle?: any
  showsVerticalScrollIndicator?: boolean
  showsHorizontalScrollIndicator?: boolean
  refreshing?: boolean
  onRefresh?: () => void
  className?: string
  style?: any
  getItemType?: (item: T, index: number) => string | number
  overrideItemLayout?: (
    layout: { span?: number; size?: number },
    item: T,
    index: number,
  ) => void
  drawDistance?: number
}

let NativeFlashList: any

try {
  const { FlashList: ImportedFlashList } = require("@shopify/flash-list")
  NativeFlashList = ImportedFlashList
} catch (error) {
  console.warn(
    "[chrry/platform/FlashList] @shopify/flash-list not found. Using ScrollView fallback.",
  )
  // Fallback to ScrollView
  const { ScrollView, View } = require("react-native")

  NativeFlashList = forwardRef((props: any, ref: any) => {
    const {
      data,
      renderItem,
      horizontal,
      ListHeaderComponent,
      ListFooterComponent,
      ListEmptyComponent,
      contentContainerStyle,
      style,
      keyExtractor,
    } = props

    if (data.length === 0 && ListEmptyComponent) {
      return (
        <View style={style}>
          {typeof ListEmptyComponent === "function" ? (
            <ListEmptyComponent />
          ) : (
            ListEmptyComponent
          )}
        </View>
      )
    }

    return (
      <ScrollView
        ref={ref}
        horizontal={horizontal}
        contentContainerStyle={contentContainerStyle}
        style={style}
      >
        {ListHeaderComponent &&
          (typeof ListHeaderComponent === "function" ? (
            <ListHeaderComponent />
          ) : (
            ListHeaderComponent
          ))}
        {data.map((item: any, index: number) => {
          const key = keyExtractor ? keyExtractor(item, index) : `item-${index}`
          return <View key={key}>{renderItem({ item, index })}</View>
        })}
        {ListFooterComponent &&
          (typeof ListFooterComponent === "function" ? (
            <ListFooterComponent />
          ) : (
            ListFooterComponent
          ))}
      </ScrollView>
    )
  })
}

export const FlashList = NativeFlashList

export default FlashList
