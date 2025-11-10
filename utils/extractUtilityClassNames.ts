import { UtilsStyleDefs } from "../utils.styles"
import { AppStyleDefs } from "../App.styles"

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

    // Check all known utilities to see if their properties are present
    for (const [utilityName, utilityDef] of Object.entries(UtilsStyleDefs)) {
      const utilityStyles =
        "base" in utilityDef ? (utilityDef as any).base : utilityDef

      // Check if this utility's properties are present in the merged style
      let matchCount = 0
      let totalProps = 0

      for (const [key, value] of Object.entries(utilityStyles)) {
        if (key === "className") continue
        totalProps++

        // Check if this property exists in the merged style with the same value
        if (key in style && style[key] === value) {
          matchCount++
        }
      }

      // If most properties match, this utility was likely spread
      if (totalProps > 0 && matchCount >= Math.ceil(totalProps * 0.5)) {
        classNames.add(utilityName)
      }
    }

    // Check all known app styles
    for (const [styleName, styleDef] of Object.entries(AppStyleDefs)) {
      const styleProps = "base" in styleDef ? (styleDef as any).base : styleDef

      let matchCount = 0
      let totalProps = 0

      for (const [key, value] of Object.entries(styleProps)) {
        if (key === "className") continue
        totalProps++

        if (key in style && style[key] === value) {
          matchCount++
        }
      }

      if (totalProps > 0 && matchCount >= Math.ceil(totalProps * 0.5)) {
        classNames.add(styleName)
      }
    }

    // Also check for explicit className property
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
