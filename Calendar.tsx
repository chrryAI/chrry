/**
 * Calendar Component - Platform Abstraction
 *
 * This file serves as the base entry point for TypeScript.
 * The actual implementation is in:
 * - Calendar.web.tsx (for web platforms)
 * - Calendar.native.tsx (for React Native)
 *
 * Your bundler will automatically resolve to the correct platform-specific file.
 */

export { default } from "./Calendar.web"
