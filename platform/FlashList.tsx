/**
 * Universal FlashList Component
 *
 * Platform-specific implementations:
 * - FlashList.web.tsx: Web implementation (Next.js will use this)
 * - FlashList.native.tsx: React Native implementation (Metro will use this)
 *
 * This file serves as the default export for web builds.
 */

export * from "./FlashList.web"
export { default } from "./FlashList.web"
