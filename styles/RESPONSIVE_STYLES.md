# Responsive Styles System

Automatic responsive breakpoint support for unified styles that work on both web and native.

## Features

- ✅ **Automatic breakpoint resolution** - Styles adapt based on screen width
- ✅ **Type-safe** - Full TypeScript support with autocomplete
- ✅ **Cross-platform** - Works on web and React Native
- ✅ **Performance optimized** - Cached style resolution with debounced resize
- ✅ **SSR compatible** - No hydration mismatches

## Breakpoints

```typescript
const BREAKPOINTS = {
  mobileSmallMax: 320, // Very small phones
  mobileSmall: 430, // Small phones
  mobileMax: 599, // Max mobile width
  mobile: 600, // Tablet portrait
  tablet: 800, // Tablet landscape
  desktop: 960, // Desktop
}
```

## Usage

### 1. Define Responsive Styles

```typescript
// MyComponent.styles.ts
export const MyComponentStyleDefs = {
  title: {
    // Base value (mobile-first)
    fontSize: { base: 20, mobile: 24, desktop: 28 },

    // Single value (no breakpoints)
    fontWeight: 600,

    // Multiple responsive properties
    padding: { base: 10, tablet: 15, desktop: 20 },
    gap: { base: 5, mobile: 10 },
  },

  container: {
    maxWidth: { base: "100%", tablet: 800, desktop: 1200 },
    margin: "0 auto",
  },
} as const

import { createUnifiedStyles } from "./styles/createUnifiedStyles"
import { createStyleHook } from "./styles/createStyleHook"

export const MyComponentStyles = createUnifiedStyles(MyComponentStyleDefs)

type MyComponentStylesHook = {
  [K in keyof typeof MyComponentStyleDefs]: {
    className?: string
    style?: Record<string, any>
  }
}

export const useMyComponentStyles =
  createStyleHook<MyComponentStylesHook>(MyComponentStyles)
```

### 2. Use in Components

```tsx
import { useMyComponentStyles } from "./MyComponent.styles"
import { Div, H1 } from "./platform"

export default function MyComponent() {
  const styles = useMyComponentStyles()

  return (
    <Div style={styles.container.style}>
      <H1 style={styles.title.style}>Responsive Title</H1>
    </Div>
  )
}
```

### 3. Convert SCSS with Media Queries

Use the automated script to convert existing SCSS:

```bash
node packages/ui/scripts/scss-to-responsive-styles.js MyComponent.module.scss
```

**Input SCSS:**

```scss
.title {
  font-size: 20px;

  @media (min-width: 600px) {
    font-size: 24px;
  }

  @media (min-width: 960px) {
    font-size: 28px;
  }
}
```

**Output:**

```typescript
title: {
  fontSize: { base: 20, mobile: 24, desktop: 28 }
}
```

## How It Works

1. **Style Definition** - Define styles with responsive breakpoint objects
2. **Hook Creation** - `createStyleHook` creates a hook that tracks window dimensions
3. **Resolution** - `createStyleProxy` resolves responsive values based on current width
4. **Caching** - Resolved styles are cached per breakpoint for performance
5. **Updates** - Debounced resize listener updates styles when breakpoints change

## Responsive Value Format

```typescript
type ResponsiveValue<T> =
  | T
  | {
      base?: T // Default value (required if using breakpoints)
      mobileSmallMax?: T // 320px+
      mobileSmall?: T // 430px+
      mobileMax?: T // 599px+
      mobile?: T // 600px+
      tablet?: T // 800px+
      desktop?: T // 960px+
    }
```

## Examples

### Font Sizes

```typescript
fontSize: { base: 14, mobile: 16, desktop: 18 }
```

### Spacing

```typescript
padding: { base: 10, tablet: 15, desktop: 20 },
gap: { base: 5, mobile: 10, desktop: 15 }
```

### Layout

```typescript
flexDirection: { base: "column", tablet: "row" },
maxWidth: { base: "100%", desktop: 1200 }
```

### Visibility

```typescript
display: { base: "none", tablet: "flex" }
```

## Best Practices

1. **Mobile-first** - Always provide a `base` value
2. **Progressive enhancement** - Add larger breakpoints as needed
3. **Consistent units** - Use numbers for px values (converted automatically)
4. **Cache-friendly** - Avoid inline objects, define styles at module level
5. **Type safety** - Use `as const` for style definitions

## Performance

- ✅ Styles cached per breakpoint
- ✅ Resize events debounced (150ms)
- ✅ Uses `startTransition` to prevent Suspense triggers
- ✅ Only re-renders when breakpoint actually changes
- ✅ Minimal runtime overhead

## Migration from SCSS

1. Run the conversion script on your SCSS file
2. Review generated responsive values
3. Import and use the generated hook
4. Replace `className` with `style` prop
5. Test across different screen sizes

## TypeScript Support

Full type inference and autocomplete:

```typescript
const styles = useMyComponentStyles()

// ✅ Autocomplete for all style keys
styles.title.style
styles.container.style

// ✅ Type-safe style objects
const titleStyle: Record<string, any> = styles.title.style
```
