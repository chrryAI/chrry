import { UtilsStyleDefs } from "../utils.styles"

/**
 * Parse className string and return merged inline styles
 * Supports both CSS module classes and utility class names
 *
 * @example
 * parseClassName("small transparent")
 * // Returns: { padding: '4px 7px', fontSize: 12, backgroundColor: 'var(--background)', ... }
 */
export function parseClassName(className?: string): Record<string, any> {
  if (!className) return {}

  const classNames = className.split(" ").filter(Boolean)
  let mergedStyles: Record<string, any> = {}

  for (const name of classNames) {
    const trimmedName = name.trim()

    // Check if it's a utility style
    if (trimmedName in UtilsStyleDefs) {
      const styleDef =
        UtilsStyleDefs[trimmedName as keyof typeof UtilsStyleDefs]

      // Handle interactive styles (with base/hover/etc)
      if (typeof styleDef === "object" && "base" in styleDef) {
        mergedStyles = { ...mergedStyles, ...(styleDef as any).base }
      } else {
        // Handle flat styles
        mergedStyles = { ...mergedStyles, ...styleDef }
      }
    }
  }

  return mergedStyles
}
