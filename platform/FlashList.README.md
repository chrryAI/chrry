# Universal FlashList Component

A cross-platform high-performance list component that works seamlessly on web and native platforms.

## 🎯 Features

- **Native**: Uses `@shopify/flash-list` for optimal performance
- **Web**: Custom virtualized implementation with FlashList-compatible API
- **Consistent API**: Same props work across all platforms
- **TypeScript**: Full type safety
- **Performance**: Optimized rendering for large lists

## 📦 Installation

### For Native Apps

```bash
npm install @shopify/flash-list
```

### For Web

No additional dependencies needed! Uses built-in virtualization.

## 🚀 Usage

### Basic Example

```typescript
import { FlashList } from 'chrry/platform/FlashList'

interface Item {
  id: string
  title: string
}

function MyList() {
  const data: Item[] = [
    { id: '1', title: 'Item 1' },
    { id: '2', title: 'Item 2' },
    { id: '3', title: 'Item 3' },
  ]

  return (
    <FlashList
      data={data}
      renderItem={({ item }) => (
        <div style={{ padding: 16 }}>
          <h3>{item.title}</h3>
        </div>
      )}
      estimatedItemSize={60}
      keyExtractor={(item) => item.id}
    />
  )
}
```

### Horizontal List

```typescript
<FlashList
  data={items}
  renderItem={({ item }) => <ItemCard item={item} />}
  horizontal
  estimatedItemSize={200}
  showsHorizontalScrollIndicator={false}
/>
```

### Grid Layout

```typescript
<FlashList
  data={items}
  renderItem={({ item }) => <GridItem item={item} />}
  numColumns={3}
  estimatedItemSize={150}
/>
```

### With Header & Footer

```typescript
<FlashList
  data={items}
  renderItem={({ item }) => <Item data={item} />}
  ListHeaderComponent={() => (
    <div style={{ padding: 16 }}>
      <h1>My List</h1>
    </div>
  )}
  ListFooterComponent={() => (
    <div style={{ padding: 16, textAlign: 'center' }}>
      End of list
    </div>
  )}
  estimatedItemSize={80}
/>
```

### Empty State

```typescript
<FlashList
  data={[]}
  renderItem={({ item }) => <Item data={item} />}
  ListEmptyComponent={() => (
    <div style={{ padding: 32, textAlign: 'center' }}>
      <p>No items found</p>
    </div>
  )}
  estimatedItemSize={80}
/>
```

### Infinite Scroll

```typescript
function InfiniteList() {
  const [page, setPage] = useState(1)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)

  const loadMore = async () => {
    if (loading) return
    setLoading(true)
    const newItems = await fetchItems(page)
    setItems([...items, ...newItems])
    setPage(page + 1)
    setLoading(false)
  }

  return (
    <FlashList
      data={items}
      renderItem={({ item }) => <Item data={item} />}
      onEndReached={loadMore}
      onEndReachedThreshold={0.5}
      ListFooterComponent={() =>
        loading ? <div>Loading more...</div> : null
      }
      estimatedItemSize={100}
    />
  )
}
```

### Pull to Refresh

```typescript
function RefreshableList() {
  const [refreshing, setRefreshing] = useState(false)
  const [items, setItems] = useState([])

  const handleRefresh = async () => {
    setRefreshing(true)
    const newItems = await fetchItems()
    setItems(newItems)
    setRefreshing(false)
  }

  return (
    <FlashList
      data={items}
      renderItem={({ item }) => <Item data={item} />}
      refreshing={refreshing}
      onRefresh={handleRefresh}
      estimatedItemSize={80}
    />
  )
}
```

### Item Separators

```typescript
<FlashList
  data={items}
  renderItem={({ item }) => <Item data={item} />}
  ItemSeparatorComponent={() => (
    <div style={{ height: 1, backgroundColor: '#e0e0e0' }} />
  )}
  estimatedItemSize={80}
/>
```

## 📋 Props

| Prop                             | Type                           | Default      | Description                           |
| -------------------------------- | ------------------------------ | ------------ | ------------------------------------- |
| `data`                           | `T[]`                          | **required** | Array of items to render              |
| `renderItem`                     | `({ item, index }) => Element` | **required** | Function to render each item          |
| `estimatedItemSize`              | `number`                       | `50`         | Estimated height/width of each item   |
| `keyExtractor`                   | `(item, index) => string`      | `undefined`  | Function to extract unique key        |
| `horizontal`                     | `boolean`                      | `false`      | Render list horizontally              |
| `numColumns`                     | `number`                       | `1`          | Number of columns (grid layout)       |
| `onEndReached`                   | `() => void`                   | `undefined`  | Called when scrolled near end         |
| `onEndReachedThreshold`          | `number`                       | `0.5`        | Threshold for triggering onEndReached |
| `ListHeaderComponent`            | `Component \| Element`         | `undefined`  | Component rendered at top             |
| `ListFooterComponent`            | `Component \| Element`         | `undefined`  | Component rendered at bottom          |
| `ListEmptyComponent`             | `Component \| Element`         | `undefined`  | Component when data is empty          |
| `ItemSeparatorComponent`         | `Component`                    | `undefined`  | Component between items               |
| `contentContainerStyle`          | `CSSProperties`                | `undefined`  | Style for content container           |
| `showsVerticalScrollIndicator`   | `boolean`                      | `true`       | Show vertical scrollbar               |
| `showsHorizontalScrollIndicator` | `boolean`                      | `true`       | Show horizontal scrollbar             |
| `refreshing`                     | `boolean`                      | `false`      | Show refresh indicator                |
| `onRefresh`                      | `() => void`                   | `undefined`  | Pull to refresh handler               |
| `className`                      | `string`                       | `undefined`  | CSS class name (web only)             |
| `style`                          | `CSSProperties`                | `undefined`  | Container style                       |

## 🎨 Styling

### Web

Use `className` and `style` props:

```typescript
<FlashList
  data={items}
  renderItem={({ item }) => <Item data={item} />}
  className="my-list"
  style={{ height: '100vh', backgroundColor: '#f5f5f5' }}
  contentContainerStyle={{ padding: 16 }}
/>
```

### Native

Use `style` and `contentContainerStyle`:

```typescript
<FlashList
  data={items}
  renderItem={({ item }) => <Item data={item} />}
  style={{ flex: 1 }}
  contentContainerStyle={{ padding: 16 }}
/>
```

## ⚡ Performance Tips

1. **Use `keyExtractor`**: Provide stable unique keys for better performance
2. **Set `estimatedItemSize`**: Accurate estimates improve scrolling
3. **Memoize `renderItem`**: Use `React.memo` for item components
4. **Avoid inline functions**: Define handlers outside render
5. **Use `getItemType`**: For heterogeneous lists (native only)

## 🔄 Migration from FlatList

FlashList is mostly compatible with FlatList. Main differences:

```typescript
// FlatList
<FlatList
  data={items}
  renderItem={({ item }) => <Item data={item} />}
  keyExtractor={(item) => item.id}
/>

// FlashList (add estimatedItemSize)
<FlashList
  data={items}
  renderItem={({ item }) => <Item data={item} />}
  keyExtractor={(item) => item.id}
  estimatedItemSize={80} // Add this!
/>
```

## 🐛 Troubleshooting

### Items not rendering on web

- Check that `data` array is not empty
- Verify `renderItem` returns valid JSX
- Set appropriate `estimatedItemSize`

### Scrolling issues

- Ensure container has fixed height
- Check `horizontal` prop matches your layout
- Verify `contentContainerStyle` doesn't conflict

### Performance issues on web

- Reduce number of items rendered initially
- Use `React.memo` for item components
- Optimize `renderItem` function

## 📚 Examples

See the examples directory for complete working examples:

- Basic list
- Horizontal carousel
- Grid layout
- Infinite scroll
- Pull to refresh
- Mixed item types

## 🤝 Contributing

Contributions welcome! Please follow the existing code style and add tests for new features.

## 📄 License

MIT
