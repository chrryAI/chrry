/**
 * Cross-platform storage utilities
 *
 * Platform-specific implementations:
 * - storage.web.ts: localStorage (web builds)
 * - storage.native.ts: MMKV (React Native builds)
 *
 * This file serves as the default export for web builds.
 */

export * from "./storage.web"
export { default } from "./storage.web"
