// packages/ui/src/hooks/useUnifiedStyles.ts
import { useClsx } from "../platform/clsx"
import type { UnifiedStyles } from "../styles/createUnifiedStyles"

type ClassValue =
  | string
  | number
  | boolean
  | undefined
  | null
  | { [key: string]: boolean | undefined | null }
  | ClassValue[]

/**
 * Hook to use unified styles with clsx
 *
 * Automatically detects platform and returns appropriate styles
 * - Web: returns className string
 * - Native: returns style object
 * - Web with EXPO_PUBLIC_TEST_NATIVE_WEB=true: returns style object
 *
 * Usage:
 *   const clsx = useUnifiedStyles(buttonStyles)
 *   <Button className={clsx("container", "active")} />
 */
export function useUnifiedStyles<T extends Record<string, Record<string, any>>>(
  styles: UnifiedStyles<T>,
): (...args: ClassValue[]) => string | Record<string, any> {
  return useClsx(styles.web, styles.all)
}

/**
 * Hook to get raw style object for a single class
 *
 * Useful when you need the actual style object instead of className
 *
 * Usage:
 *   const buttonStyle = useStyle(buttonStyles, 'container')
 *   <div style={buttonStyle}>Button</div>
 */
export function useStyle<T extends Record<string, Record<string, any>>>(
  styles: UnifiedStyles<T>,
  className: keyof T,
): Record<string, any> {
  const testNativeOnWeb =
    typeof process !== "undefined" &&
    process.env.EXPO_PUBLIC_TEST_NATIVE_WEB === "true"

  const isWeb = typeof window !== "undefined"

  if (isWeb && !testNativeOnWeb) {
    // On web: return the class name
    return { className: styles.web[className] } as any
  }

  // On native or testing native on web: return the style object
  return styles.all[className] || {}
}

/**
 * Hook for conditional styling
 *
 * Usage:
 *   const buttonClasses = useConditionalStyle(
 *     buttonStyles,
 *     'button',
 *     isActive,
 *     'active'
 *   )
 */
export function useConditionalStyle<
  T extends Record<string, Record<string, any>>,
>(
  styles: UnifiedStyles<T>,
  baseClass: keyof T,
  condition: boolean,
  conditionalClass: keyof T,
): string | Record<string, any> {
  const clsx = useUnifiedStyles(styles)
  return clsx(baseClass as any, condition && (conditionalClass as any))
}

/**
 * Hook to merge multiple style classes
 *
 * Usage:
 *   const mergedClasses = useMergedStyles(buttonStyles, 'button', 'large', 'primary')
 */
export function useMergedStyles<T extends Record<string, Record<string, any>>>(
  styles: UnifiedStyles<T>,
  ...classNames: (keyof T)[]
): string | Record<string, any> {
  const clsx = useUnifiedStyles(styles)
  return clsx(...(classNames as any))
}

/**
 * Hook to create style composition
 *
 * Usage:
 *   const composed = useComposedStyles(buttonStyles, {
 *     container: true,
 *     large: isLarge,
 *     primary: isPrimary,
 *   })
 */
export function useComposedStyles<
  T extends Record<string, Record<string, any>>,
>(
  styles: UnifiedStyles<T>,
  classMap: Partial<Record<keyof T, boolean>>,
): string | Record<string, any> {
  const clsx = useUnifiedStyles(styles)
  const classes = Object.entries(classMap)
    .filter(([_, include]) => include)
    .map(([name]) => name as keyof T)

  return clsx(...(classes as any))
}
