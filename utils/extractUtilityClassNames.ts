/**
 * Extract utility class names from a merged style object
 * Detects which utilities were spread by checking for their unique properties
 *
 * @example
 * const style = { ...utilities.button, ...utilities.transparent, padding: "3px" }
 * extractUtilityClassNames(style) // Returns: "button transparent"
 */
export function extractUtilityClassNames(
  ...styles: Array<Record<string, any> | undefined>
): string {
  if (styles.length === 0) return ""

  const classNames: Set<string> = new Set()

  for (const style of styles) {
    if (!style) continue

    // ONLY extract explicit className properties
    // Do NOT auto-detect utilities from CSS properties to avoid false positives
    // (e.g., detecting "column" when spreading styles with flexDirection: "column")
    if ("className" in style && typeof style.className === "string") {
      style.className.split(" ").forEach((cn: string) => {
        if (cn) classNames.add(cn)
      })
    }
  }

  return Array.from(classNames).join(" ")
}

/**
 * Extract utility class names from multiple style objects
 */
export function extractUtilityClassNamesFromMultiple(
  ...styles: Array<Record<string, any> | undefined>
): string {
  const classNames: string[] = []

  for (const style of styles) {
    if (!style) continue

    if ("className" in style && typeof style.className === "string") {
      classNames.push(style.className)
    }
  }

  return classNames.join(" ")
}
