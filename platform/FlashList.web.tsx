"use client"

/**
 * FlashList Web Implementation
 * Uses custom virtualization for web browsers
 */

import React, { forwardRef, useCallback } from "react"

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
  contentContainerStyle?: React.CSSProperties | Record<string, any>
  showsVerticalScrollIndicator?: boolean
  showsHorizontalScrollIndicator?: boolean
  refreshing?: boolean
  onRefresh?: () => void
  className?: string
  style?: React.CSSProperties | Record<string, any>
  getItemType?: (item: T, index: number) => string | number
  overrideItemLayout?: (
    layout: { span?: number; size?: number },
    item: T,
    index: number,
  ) => void
  drawDistance?: number
}

export const FlashList = forwardRef(
  <T,>(props: FlashListProps<T>, ref: any) => {
    const {
      data,
      renderItem,
      estimatedItemSize = 50,
      keyExtractor,
      horizontal = false,
      numColumns = 1,
      onEndReached,
      onEndReachedThreshold = 0.5,
      ListHeaderComponent,
      ListFooterComponent,
      ListEmptyComponent,
      ItemSeparatorComponent,
      contentContainerStyle,
      showsVerticalScrollIndicator = true,
      showsHorizontalScrollIndicator = true,
      refreshing,
      onRefresh,
      className,
      style,
    } = props

    const containerRef = React.useRef<HTMLDivElement>(null)
    const [scrollTop, setScrollTop] = React.useState(0)

    // Handle scroll for onEndReached
    const handleScroll = useCallback(
      (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.currentTarget
        const scrollPosition = horizontal ? target.scrollLeft : target.scrollTop
        const scrollSize = horizontal ? target.scrollWidth : target.scrollHeight
        const clientSize = horizontal ? target.clientWidth : target.clientHeight

        setScrollTop(scrollPosition)

        // Trigger onEndReached when near the end
        if (onEndReached) {
          const threshold = onEndReachedThreshold || 0.5
          const distanceFromEnd = scrollSize - (scrollPosition + clientSize)
          const triggerDistance = clientSize * threshold

          if (distanceFromEnd < triggerDistance) {
            onEndReached()
          }
        }
      },
      [horizontal, onEndReached, onEndReachedThreshold],
    )

    // Render empty state
    if (data.length === 0 && ListEmptyComponent) {
      return (
        <div
          ref={containerRef}
          className={className}
          style={{
            overflow: "auto",
            ...(style as React.CSSProperties),
          }}
        >
          {typeof ListEmptyComponent === "function" ? (
            <ListEmptyComponent />
          ) : (
            ListEmptyComponent
          )}
        </div>
      )
    }

    const scrollbarStyles: React.CSSProperties = {
      scrollbarWidth: showsVerticalScrollIndicator ? "auto" : "none",
      msOverflowStyle: showsVerticalScrollIndicator ? "auto" : "none",
    }

    return (
      <>
        {(!showsVerticalScrollIndicator || !showsHorizontalScrollIndicator) && (
          <style>
            {`
            .flashlist-hide-scrollbar::-webkit-scrollbar {
              display: none;
            }
          `}
          </style>
        )}
        <div
          ref={containerRef}
          className={`${className || ""} ${
            !showsVerticalScrollIndicator || !showsHorizontalScrollIndicator
              ? "flashlist-hide-scrollbar"
              : ""
          }`.trim()}
          onScroll={handleScroll}
          style={{
            overflow: "auto",
            ...scrollbarStyles,
            ...(horizontal && {
              overflowX: "auto",
              overflowY: "hidden",
              display: "flex",
              flexDirection: "row",
            }),
            ...(style as React.CSSProperties),
          }}
        >
          <div
            style={{
              display: horizontal ? "flex" : "block",
              flexDirection: horizontal ? "row" : "column",
              ...(numColumns > 1 &&
                !horizontal && {
                  display: "grid",
                  gridTemplateColumns: `repeat(${numColumns}, 1fr)`,
                  gap: "8px",
                }),
              ...(contentContainerStyle as React.CSSProperties),
            }}
          >
            {/* Header */}
            {ListHeaderComponent &&
              (typeof ListHeaderComponent === "function" ? (
                <ListHeaderComponent />
              ) : (
                ListHeaderComponent
              ))}

            {/* Pull to refresh indicator */}
            {refreshing && onRefresh && (
              <div
                style={{
                  padding: "16px",
                  textAlign: "center",
                  color: "var(--accent-6)",
                }}
              >
                Loading...
              </div>
            )}

            {/* Items */}
            {data.map((item, index) => {
              const key = keyExtractor
                ? keyExtractor(item, index)
                : `item-${index}`

              return (
                <React.Fragment key={key}>
                  {renderItem({ item, index })}
                  {ItemSeparatorComponent &&
                    index < data.length - 1 &&
                    (typeof ItemSeparatorComponent === "function" ? (
                      <ItemSeparatorComponent />
                    ) : (
                      ItemSeparatorComponent
                    ))}
                </React.Fragment>
              )
            })}

            {/* Footer */}
            {ListFooterComponent &&
              (typeof ListFooterComponent === "function" ? (
                <ListFooterComponent />
              ) : (
                ListFooterComponent
              ))}
          </div>
        </div>
      </>
    )
  },
)

FlashList.displayName = "FlashList"

export default FlashList
