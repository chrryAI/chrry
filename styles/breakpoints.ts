/**
 * Breakpoint definitions matching breakpoints.scss
 */

export const BREAKPOINTS = {
  mobileSmallMax: 320,
  mobileSmall: 430,
  mobileMax: 599,
  mobile: 600,
  tablet: 800,
  desktop: 960,
} as const

export type Breakpoint = keyof typeof BREAKPOINTS

/**
 * Check if current width matches a breakpoint
 */
export function matchesBreakpoint(
  width: number,
  breakpoint: Breakpoint,
): boolean {
  return width >= BREAKPOINTS[breakpoint]
}

/**
 * Get responsive value based on current width
 * Returns the value for the largest matching breakpoint
 */
export function getResponsiveValue<T>(
  width: number,
  values: Partial<Record<Breakpoint | "base", T>>,
): T | undefined {
  // Start with base value
  let result = values.base

  // Check breakpoints from smallest to largest
  const breakpointOrder: Breakpoint[] = [
    "mobileSmallMax",
    "mobileSmall",
    "mobileMax",
    "mobile",
    "tablet",
    "desktop",
  ]

  for (const bp of breakpointOrder) {
    if (matchesBreakpoint(width, bp) && values[bp] !== undefined) {
      result = values[bp]
    }
  }

  return result
}

/**
 * Type for responsive style values
 */
export type ResponsiveValue<T> = T | Partial<Record<Breakpoint | "base", T>>

/**
 * Check if a value is responsive
 */
export function isResponsiveValue<T>(
  value: any,
): value is Partial<Record<Breakpoint | "base", T>> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    ("base" in value ||
      "mobile" in value ||
      "tablet" in value ||
      "desktop" in value)
  )
}
