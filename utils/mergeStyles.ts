/**
 * Merge multiple style objects and extract classNames
 * This is the RECOMMENDED way to combine utilities
 *
 * @example
 * const merged = mergeStyles(
 *   utilities.button,
 *   utilities.transparent,
 *   appStyles.editImageButton,
 *   { padding: "3px" } // Override
 * )
 *
 * <Span {...merged}>...</Span>
 * // or
 * <Span style={merged} className={merged.className}>...</Span>
 */
export function mergeStyles(
  ...styleObjects: Array<Record<string, any> | undefined>
): Record<string, any> & { className: string } {
  const mergedStyle: Record<string, any> = {}
  const classNames: Set<string> = new Set()

  for (const obj of styleObjects) {
    if (!obj) continue

    // Collect className before merging
    if ("className" in obj && typeof obj.className === "string") {
      obj.className.split(" ").forEach((cn: string) => {
        if (cn) classNames.add(cn)
      })
    }

    // Merge all properties (including styles)
    Object.assign(mergedStyle, obj)
  }

  // Set the combined className
  mergedStyle.className = Array.from(classNames).join(" ")

  return mergedStyle as Record<string, any> & { className: string }
}
