"use client"

/**
 * DraggableList Component - Platform Abstraction
 *
 * This file serves as the base entry point for TypeScript.
 * The actual implementation is in:
 * - DraggableList.web.tsx (for web platforms)
 * - DraggableList.native.tsx (for React Native)
 *
 * Your bundler will automatically resolve to the correct platform-specific file.
 */

export type { DraggableListProps, RenderItemParams } from "./DraggableList.web"
export { default } from "./DraggableList.web"
