/**
 * SkiaLineChart - Platform Resolver
 * Auto-resolves to .web.tsx or .native.tsx based on platform
 */

// Platform-specific exports are handled by bundler (.web.tsx or .native.tsx)
// This file should not exist or should be empty - the bundler will resolve
// to SkiaLineChart.web.tsx or SkiaLineChart.native.tsx automatically

// Re-export the types from the web version (they're the same for both platforms)
export type { SkiaLineChartProps } from "./SkiaLineChart.web"
