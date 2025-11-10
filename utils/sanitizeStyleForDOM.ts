/**
 * Sanitize style object for DOM elements
 * Removes properties that React doesn't recognize on DOM elements
 * (like className property that gets added by utilities)
 */
export function sanitizeStyleForDOM(
  style?: Record<string, any>,
): Record<string, any> {
  if (!style) return {}

  const sanitized: Record<string, any> = {}

  for (const [key, value] of Object.entries(style)) {
    // Skip className property (it's handled separately)
    if (key === "className") continue

    // Skip undefined/null values
    if (value === undefined || value === null) continue

    sanitized[key] = value
  }

  return sanitized
}
