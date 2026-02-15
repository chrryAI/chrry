/**
 * Web Icon Exports
 * Uses lucide-react for web/browser environments
 */

export * from "lucide-react"
export type { LucideProps as IconProps } from "lucide-react"

// AI Brand Icons - explicitly re-export to avoid conflicts with lucide-react
export * from "@lobehub/icons"
// Resolve icon conflicts by preferring lucide-react's version
export { Figma, Snowflake, Github, Apple } from "lucide-react"

// Custom icons
export { WannathisIcon } from "./WannathisIcon"
