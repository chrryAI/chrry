/**
 * Web Icon Exports
 * Uses lucide-react for web/browser environments
 */

// AI Brand Icons - explicitly re-export to avoid conflicts with lucide-react
export * from "@lobehub/icons"
export type { LucideProps as IconProps } from "lucide-react"
export * from "lucide-react"
// Resolve icon conflicts by preferring lucide-react's version
export { Apple, Figma, Github, Snowflake } from "lucide-react"

// Custom icons
export { WannathisIcon } from "./WannathisIcon"
