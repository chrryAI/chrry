/**
 * Cross-platform navigation utilities
 *
 * Platform-specific implementations:
 * - navigation.web.ts: Next.js router (web builds)
 * - navigation.native.ts: Solito router (React Native builds)
 *
 * This file serves as the default export for web builds.
 */

export * from "./navigation.web"
