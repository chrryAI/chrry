/**
 * Calendar Component - Platform Abstraction
 *
 * This file serves as the base entry point for TypeScript.
 * The actual implementation is in:
 * - CalendarWrapper.tsx (wrapper for lazy loading)
 * - Calendar.web.tsx (for web platforms)
 * - Calendar.native.tsx (for React Native)
 *
 * Using a wrapper to avoid production build issues with react-big-calendar
 */

export { default } from "./CalendarWrapper"
