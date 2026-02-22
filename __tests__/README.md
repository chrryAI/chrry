# SCSS to TypeScript Converter Tests

This directory contains comprehensive tests for the SCSS to TypeScript converter.

## Test File

**`TestComponent.module.scss`** - A comprehensive SCSS file that tests all features:

### Features Tested:

1. ✅ **Basic Styles** - All CSS properties
2. ✅ **Interactive States** - `:hover`, `:active`, `:focus`, `:disabled`
3. ✅ **CSS Variables** - `var(--accent-6)`, `var(--background)`, etc.
4. ✅ **toRem.toRem()** - SCSS function conversion
5. ✅ **Responsive Fonts** - `4vw` viewport units
6. ✅ **Flexbox** - All flex properties
7. ✅ **Colors** - Hex, RGB, CSS vars
8. ✅ **Positioning** - Absolute, relative
9. ✅ **Typography** - Font sizes, weights, line-height
10. ✅ **Borders & Shadows** - Border radius, box-shadow

## Running Tests

```bash
# Run all tests
npm test

# Run only converter tests
npm test scss-converter

# Watch mode
npm test -- --watch

# Generate test output manually
node ../../../scripts/scss-to-universal.js TestComponent.module.scss TestComponent.styles.ts
```

## Expected Output

The converter should generate:

```typescript
export const TestComponentStyleDefs = {
  container: {
    display: "flex",
    flexDirection: "column",
    // ... more styles
  },
  button: {
    base: {
      padding: 8,
      backgroundColor: "__CSS_VAR__--accent-6",
      // ... base styles
    },
    hover: {
      backgroundColor: "__CSS_VAR__--accent-5",
      transform: "translateY(-1px)",
    },
    active: {
      transform: "translateY(1px)",
    },
    // ... more states
  },
  // ... more components
}

// Interactive hook for styles with pseudo-classes
export const useTestComponentStyles = () => {
  // ... generated hook
}
```

## What Gets Tested

### ✅ Conversion Accuracy

- Property names (kebab-case → camelCase)
- Values (numbers, strings, CSS vars)
- toRem.toRem() → numbers
- CSS variables → `__CSS_VAR__` markers

### ✅ Interactive States

- Detection of `:hover`, `:active`, `:focus`, `:disabled`
- Proper `base` / `hover` / `active` structure
- Hook generation with `useInteractiveStyles`

### ✅ Type Safety

- TypeScript types generated
- Proper imports
- Hook return types

### ✅ Edge Cases

- Mixed interactive and non-interactive styles
- Multiple pseudo-classes on same element
- Nested selectors (should be handled)
- Media queries (should be removed)

## Adding New Tests

1. Add new SCSS patterns to `TestComponent.module.scss`
2. Add corresponding test cases to `scss-converter.test.js`
3. Run tests to verify
4. Update this README

## Troubleshooting

If tests fail:

1. Check the generated `TestComponent.styles.ts` file
2. Compare with expected output
3. Check script at `../../../scripts/scss-to-universal.js`
4. Run converter manually to see errors

## CI/CD

These tests should run on every commit to ensure the converter doesn't break.

Add to your CI pipeline:

```yaml
- name: Test SCSS Converter
  run: npm test scss-converter
```
